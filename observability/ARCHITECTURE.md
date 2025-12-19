# Self-Evolving Agent Observability System

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           OBSERVABILITY LAYER                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐                     │
│  │ Claude Code  │   │   OpenCode   │   │   MDFlow     │                     │
│  │    Hooks     │   │   Agents     │   │  Workflows   │                     │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘                     │
│         │                  │                  │                              │
│         └────────────┬─────┴──────────────────┘                              │
│                      │                                                       │
│                      ▼                                                       │
│         ┌────────────────────────┐                                          │
│         │    Event Collector     │ ◄── HTTP POST :4100/events               │
│         │   (send_event.ts)      │                                          │
│         └───────────┬────────────┘                                          │
│                     │                                                        │
│                     ▼                                                        │
│  ┌───────────────────────────────────────────────────────────────────┐      │
│  │                   Observability Server (Bun)                       │      │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐│      │
│  │  │   SQLite    │  │  WebSocket  │  │     Metrics Aggregator      ││      │
│  │  │  Database   │  │  Broadcast  │  │  (tokens, cost, duration)   ││      │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────────┘│      │
│  └───────────────────────────────────────────────────────────────────┘      │
│                     │                                                        │
│                     ▼                                                        │
│         ┌────────────────────────┐                                          │
│         │   Dashboard Client     │ ◄── WebSocket :4100/stream               │
│         │   (Real-time Vue UI)   │                                          │
│         └────────────────────────┘                                          │
│                     │                                                        │
│                     ▼                                                        │
│  ┌───────────────────────────────────────────────────────────────────┐      │
│  │                   project_brain.yaml Integration                   │      │
│  │  - Workflow Metrics → workflow_history                             │      │
│  │  - Pattern Discovery → learned_patterns                            │      │
│  │  - Performance Stats → metrics                                     │      │
│  └───────────────────────────────────────────────────────────────────┘      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Event Types

### Claude Code Events
| Event Type | Description | Captured Data |
|------------|-------------|---------------|
| SessionStart | Session begins | session_id, source, timestamp |
| SessionEnd | Session ends | session_id, duration, stats |
| UserPromptSubmit | User input | prompt, session_id |
| PreToolUse | Before tool execution | tool_name, input, session_id |
| PostToolUse | After tool execution | tool_name, result, duration |
| PostToolUseFailure | Tool failed | tool_name, error, session_id |
| Notification | User interaction | message, type |
| SubagentStop | Subagent completed | agent_type, result |
| Stop | Response complete | summary, transcript |
| PreCompact | Context compaction | reason, before_tokens |

### OpenCode Events
| Event Type | Description | Captured Data |
|------------|-------------|---------------|
| AgentStart | Agent begins work | agent_name, model, task |
| AgentComplete | Agent finishes | agent_name, result, tokens |
| AgentError | Agent failed | agent_name, error |
| ModelSwitch | Model changed | from_model, to_model |
| ContextTransfer | Context passed | from_agent, to_agent, size |

### MDFlow Events
| Event Type | Description | Captured Data |
|------------|-------------|---------------|
| WorkflowStart | Workflow begins | workflow_name, input |
| PhaseStart | Phase begins | phase_name, workflow |
| PhaseComplete | Phase finishes | phase_name, result |
| WorkflowComplete | Workflow finishes | workflow_name, result |
| BrainSync | Brain updated | patterns_added, patterns_applied |

## Database Schema

```sql
CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_app TEXT NOT NULL,         -- 'claude-code', 'opencode', 'mdflow'
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_category TEXT,              -- 'tool', 'agent', 'workflow', 'learning'
  payload TEXT NOT NULL,            -- JSON
  summary TEXT,
  duration_ms INTEGER,
  token_count INTEGER,
  cost_usd REAL,
  timestamp INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  metric_name TEXT NOT NULL,
  metric_value REAL NOT NULL,
  labels TEXT,                      -- JSON: {"agent": "OmO", "model": "opus"}
  timestamp INTEGER NOT NULL
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  source_app TEXT NOT NULL,
  start_time INTEGER NOT NULL,
  end_time INTEGER,
  status TEXT DEFAULT 'active',
  total_events INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  total_cost REAL DEFAULT 0
);

CREATE INDEX idx_events_session ON events(session_id);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_timestamp ON events(timestamp);
CREATE INDEX idx_metrics_name ON metrics(metric_name);
```

## API Endpoints

### Event Ingestion
```
POST /events
Content-Type: application/json

{
  "source_app": "claude-code",
  "session_id": "abc123",
  "event_type": "PostToolUse",
  "event_category": "tool",
  "payload": {...},
  "duration_ms": 1500,
  "token_count": 250
}
```

### Query Events
```
GET /events/recent?limit=100&source=claude-code
GET /events/session/:session_id
GET /events/filter-options
```

### Metrics
```
GET /metrics/summary
GET /metrics/by-session/:session_id
GET /metrics/tokens-usage?period=1h
GET /metrics/agent-performance
```

### Brain Integration
```
POST /brain/sync           -- Trigger brain sync
GET /brain/patterns        -- Get current patterns
GET /brain/workflow-stats  -- Get workflow statistics
```

### WebSocket
```
WS /stream                 -- Real-time event stream
```

## File Structure

```
observability/
├── ARCHITECTURE.md          # This file
├── server/
│   ├── index.ts             # Main Bun server
│   ├── db.ts                # SQLite database
│   ├── types.ts             # TypeScript interfaces
│   ├── metrics.ts           # Metrics aggregation
│   ├── brain-sync.ts        # Brain integration
│   └── package.json
├── hooks/
│   ├── send-event.ts        # Universal event sender
│   ├── claude-hooks.ts      # Claude Code specific hooks
│   ├── opencode-hooks.ts    # OpenCode specific hooks
│   └── mdflow-hooks.ts      # MDFlow specific hooks
├── client/
│   ├── index.html           # Dashboard UI
│   ├── main.ts              # Vue app entry
│   └── components/
│       ├── EventTimeline.vue
│       ├── MetricsPanel.vue
│       ├── BrainStatus.vue
│       └── AgentFlow.vue
└── scripts/
    ├── start.sh             # Start observability system
    ├── stop.sh              # Stop system
    └── test-events.sh       # Test event pipeline
```

## Integration Points

### 1. Claude Code (.claude/settings.json)
All hooks send events via HTTP POST to observability server.

### 2. OpenCode (.opencode/oh-my-opencode.json)
Agent lifecycle hooks integrated with event collection.

### 3. MDFlow (.mdflow/*.md)
Workflow execution wrapped with observability calls.

### 4. Project Brain (.opencode/brain/project_brain.yaml)
- Metrics → workflow_history section
- Patterns → learned_patterns section
- Stats → metrics section

## Metrics Collected

### Performance Metrics
- `event_latency_ms` - Time from event generation to storage
- `tool_duration_ms` - Tool execution time
- `agent_duration_ms` - Agent completion time
- `workflow_duration_ms` - Workflow completion time

### Cost Metrics
- `tokens_used` - Total tokens consumed
- `estimated_cost_usd` - Estimated API cost
- `tokens_by_model` - Tokens per model

### Quality Metrics
- `success_rate` - Successful operations / total
- `pattern_hit_rate` - Patterns applied / total operations
- `learning_velocity` - New patterns / time period

### System Metrics
- `active_sessions` - Currently active sessions
- `events_per_minute` - Event throughput
- `db_size_mb` - Database size
