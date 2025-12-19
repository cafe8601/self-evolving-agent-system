// Self-Evolving Agent Observability Types

export type SourceApp = 'claude-code' | 'opencode' | 'mdflow' | 'brain-sync';

export type EventCategory = 'tool' | 'agent' | 'workflow' | 'learning' | 'session' | 'system';

export interface ObservabilityEvent {
  id?: number;
  source_app: SourceApp;
  session_id: string;
  event_type: string;
  event_category?: EventCategory;
  payload: Record<string, any>;
  summary?: string;
  duration_ms?: number;
  token_count?: number;
  cost_usd?: number;
  timestamp?: number;
  created_at?: string;
}

export interface Session {
  id: string;
  source_app: SourceApp;
  start_time: number;
  end_time?: number;
  status: 'active' | 'completed' | 'error';
  total_events: number;
  total_tokens: number;
  total_cost: number;
}

export interface Metric {
  id?: number;
  metric_name: string;
  metric_value: number;
  labels?: Record<string, string>;
  timestamp: number;
}

export interface FilterOptions {
  source_apps: string[];
  session_ids: string[];
  event_types: string[];
  event_categories: string[];
}

export interface MetricsSummary {
  total_events: number;
  total_sessions: number;
  active_sessions: number;
  total_tokens: number;
  estimated_cost_usd: number;
  events_by_source: Record<string, number>;
  events_by_type: Record<string, number>;
  avg_event_latency_ms: number;
  success_rate: number;
}

export interface AgentPerformance {
  agent_name: string;
  total_invocations: number;
  success_count: number;
  failure_count: number;
  avg_duration_ms: number;
  total_tokens: number;
  total_cost: number;
}

export interface WorkflowStats {
  workflow_name: string;
  total_runs: number;
  success_count: number;
  avg_duration_ms: number;
  patterns_applied: number;
  patterns_learned: number;
}

export interface BrainPattern {
  id: string;
  context: string;
  status: string;
  content: string;
  confidence: number;
  learned_at: string;
  tags?: string[];
}

export interface BrainWorkflow {
  workflow: string;
  task: string;
  started_at: string;
  completed_at: string;
  status: string;
  patterns_applied: string[];
  patterns_learned: string[];
}

export interface BrainState {
  total_patterns: number;
  patterns_count: number;  // alias for compatibility
  success_patterns: number;
  failure_patterns: number;
  avg_confidence: number;
  last_sync: string;
  evolution_cycles: number;
  recent_patterns: BrainPattern[];
  recent_workflows: BrainWorkflow[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// WebSocket message types
export interface WSMessage {
  type: 'event' | 'initial' | 'metrics' | 'brain-update' | 'ping' | 'pong';
  data: any;
}

// Event emoji mapping for UI
export const EventEmojis: Record<string, string> = {
  // Claude Code
  'SessionStart': '🚀',
  'SessionEnd': '🏁',
  'UserPromptSubmit': '💬',
  'PreToolUse': '🔧',
  'PostToolUse': '✅',
  'PostToolUseFailure': '❌',
  'Notification': '🔔',
  'SubagentStop': '👥',
  'Stop': '🛑',
  'PreCompact': '📦',
  // OpenCode
  'AgentStart': '🤖',
  'AgentComplete': '🎯',
  'AgentError': '⚠️',
  'ModelSwitch': '🔄',
  'ContextTransfer': '📤',
  // MDFlow
  'WorkflowStart': '▶️',
  'PhaseStart': '📍',
  'PhaseComplete': '✔️',
  'WorkflowComplete': '🏆',
  'BrainSync': '🧠',
  // Learning
  'PatternApplied': '📗',
  'PatternLearned': '💡',
  'PatternAvoided': '🚫',
};

// Source app colors for UI
export const SourceColors: Record<string, string> = {
  'claude-code': '#F97316', // Orange
  'opencode': '#8B5CF6',    // Purple
  'mdflow': '#10B981',      // Emerald
  'brain-sync': '#3B82F6',  // Blue
};
