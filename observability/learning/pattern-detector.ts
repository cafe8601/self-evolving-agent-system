#!/usr/bin/env bun
/**
 * Automatic Pattern Detector for Self-Evolving Agent
 * Analyzes observability events and detects learning patterns
 *
 * Patterns detected:
 * - Repeated tool failures → FAILURE_PATTERN
 * - Successful workflows → SUCCESS_PATTERN
 * - Performance anomalies → WARNING
 * - New tool combinations → DISCOVERY
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { fileURLToPath } from 'url';

// Dynamic path resolution for portability
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_DIR = path.resolve(__dirname, '../..');
const BRAIN_FILE = path.join(PROJECT_DIR, '.opencode/brain/project_brain.yaml');
const PENDING_FILE = path.join(PROJECT_DIR, '.opencode/brain/pending_patterns.yaml');
const SERVER_URL = process.env.OBSERVABILITY_URL || 'http://localhost:4100';

interface Pattern {
  id: string;
  context: string;
  status: 'SUCCESS_PATTERN' | 'FAILURE_PATTERN' | 'WARNING' | 'DISCOVERY';
  content: string;
  learned_at: string;
  confidence: number;
  tags: string[];
  source: string;
}

interface EventSummary {
  tool_name: string;
  success_count: number;
  failure_count: number;
  avg_duration_ms: number;
  last_error?: string;
}

// Fetch recent events from observability server
async function fetchRecentEvents(hours: number = 1): Promise<any[]> {
  try {
    const response = await fetch(`${SERVER_URL}/events/recent?limit=500`);
    if (!response.ok) return [];

    const data = await response.json();
    const events = data.data || [];

    // Filter to recent hours
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    return events.filter((e: any) => e.timestamp >= cutoff);
  } catch {
    console.error('Failed to fetch events from server');
    return [];
  }
}

// Analyze tool usage patterns
function analyzeToolPatterns(events: any[]): EventSummary[] {
  const toolStats: Record<string, EventSummary> = {};

  for (const event of events) {
    if (!['PreToolUse', 'PostToolUse', 'PostToolUseFailure'].includes(event.event_type)) {
      continue;
    }

    const toolName = event.payload?.tool_name;
    if (!toolName) continue;

    if (!toolStats[toolName]) {
      toolStats[toolName] = {
        tool_name: toolName,
        success_count: 0,
        failure_count: 0,
        avg_duration_ms: 0
      };
    }

    if (event.event_type === 'PostToolUse') {
      toolStats[toolName].success_count++;
      if (event.duration_ms) {
        const current = toolStats[toolName].avg_duration_ms;
        const count = toolStats[toolName].success_count;
        toolStats[toolName].avg_duration_ms = (current * (count - 1) + event.duration_ms) / count;
      }
    } else if (event.event_type === 'PostToolUseFailure') {
      toolStats[toolName].failure_count++;
      toolStats[toolName].last_error = event.payload?.error || 'Unknown error';
    }
  }

  return Object.values(toolStats);
}

// Detect patterns from analysis
function detectPatterns(toolStats: EventSummary[], events: any[]): Pattern[] {
  const patterns: Pattern[] = [];
  const timestamp = new Date().toISOString();

  // Pattern 1: High failure rate tools
  for (const stat of toolStats) {
    const total = stat.success_count + stat.failure_count;
    if (total >= 3 && stat.failure_count / total > 0.5) {
      patterns.push({
        id: `LP-AUTO-${Date.now()}-1`,
        context: `${stat.tool_name} tool usage`,
        status: 'FAILURE_PATTERN',
        content: `${stat.tool_name} has ${Math.round(stat.failure_count / total * 100)}% failure rate. Last error: ${stat.last_error || 'Unknown'}`,
        learned_at: timestamp,
        confidence: 0.7,
        tags: ['tool-failure', 'auto-detected', stat.tool_name],
        source: 'observability-pattern-detector'
      });
    }
  }

  // Pattern 2: Successful workflow sequences
  const workflowEvents = events.filter(e =>
    ['WorkflowStart', 'WorkflowComplete'].includes(e.event_type)
  );

  const workflows: Record<string, { started: boolean; completed: boolean }> = {};
  for (const e of workflowEvents) {
    const name = e.payload?.workflow_name;
    if (!name) continue;

    if (!workflows[name]) {
      workflows[name] = { started: false, completed: false };
    }

    if (e.event_type === 'WorkflowStart') workflows[name].started = true;
    if (e.event_type === 'WorkflowComplete') workflows[name].completed = true;
  }

  for (const [name, status] of Object.entries(workflows)) {
    if (status.started && status.completed) {
      patterns.push({
        id: `LP-AUTO-${Date.now()}-2`,
        context: `${name} workflow`,
        status: 'SUCCESS_PATTERN',
        content: `${name} workflow completed successfully`,
        learned_at: timestamp,
        confidence: 0.8,
        tags: ['workflow-success', 'auto-detected', name],
        source: 'observability-pattern-detector'
      });
    }
  }

  // Pattern 3: Performance anomalies (tools taking > 10 seconds)
  for (const stat of toolStats) {
    if (stat.avg_duration_ms > 10000) {
      patterns.push({
        id: `LP-AUTO-${Date.now()}-3`,
        context: `${stat.tool_name} performance`,
        status: 'WARNING',
        content: `${stat.tool_name} average duration is ${Math.round(stat.avg_duration_ms / 1000)}s - consider optimization`,
        learned_at: timestamp,
        confidence: 0.6,
        tags: ['performance', 'auto-detected', stat.tool_name],
        source: 'observability-pattern-detector'
      });
    }
  }

  // Pattern 4: Discover new tool combinations
  const sessions: Record<string, Set<string>> = {};
  for (const e of events) {
    const toolName = e.payload?.tool_name;
    if (!toolName) continue;

    const sessionId = e.session_id;
    if (!sessions[sessionId]) {
      sessions[sessionId] = new Set();
    }
    sessions[sessionId].add(toolName);
  }

  // Find sessions with 5+ different tools
  for (const [sessionId, tools] of Object.entries(sessions)) {
    if (tools.size >= 5) {
      patterns.push({
        id: `LP-AUTO-${Date.now()}-4`,
        context: 'Multi-tool session',
        status: 'DISCOVERY',
        content: `Session used ${tools.size} different tools: ${Array.from(tools).slice(0, 5).join(', ')}${tools.size > 5 ? '...' : ''}`,
        learned_at: timestamp,
        confidence: 0.5,
        tags: ['multi-tool', 'auto-detected', 'session-analysis'],
        source: 'observability-pattern-detector'
      });
      break; // Only one discovery per run
    }
  }

  return patterns;
}

// Add patterns to pending file
function addPendingPatterns(patterns: Pattern[]): void {
  if (patterns.length === 0) return;

  let pending: any = { auto_sync: true, patterns: [] };

  if (fs.existsSync(PENDING_FILE)) {
    try {
      const content = fs.readFileSync(PENDING_FILE, 'utf-8');
      pending = yaml.load(content) as any || { auto_sync: true, patterns: [] };
    } catch {
      // Use default
    }
  }

  if (!pending.patterns) {
    pending.patterns = [];
  }

  // Add new patterns
  for (const pattern of patterns) {
    // Check for duplicates (same context and content)
    const exists = pending.patterns.some((p: any) =>
      p.context === pattern.context && p.content === pattern.content
    );

    if (!exists) {
      pending.patterns.push(pattern);
      console.log(`✨ New pattern detected: ${pattern.status} - ${pattern.context}`);
    }
  }

  // Write back
  fs.writeFileSync(PENDING_FILE, yaml.dump(pending));
}

// Main
async function main(): Promise<void> {
  console.log('🔍 Self-Evolving Agent Pattern Detector');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Fetch recent events
  console.log('📥 Fetching recent events...');
  const events = await fetchRecentEvents(1);
  console.log(`   Found ${events.length} events in the last hour`);

  if (events.length === 0) {
    console.log('⚠️  No events to analyze');
    return;
  }

  // Analyze patterns
  console.log('📊 Analyzing tool patterns...');
  const toolStats = analyzeToolPatterns(events);
  console.log(`   Analyzed ${toolStats.length} tools`);

  // Detect patterns
  console.log('🔎 Detecting learning patterns...');
  const patterns = detectPatterns(toolStats, events);
  console.log(`   Detected ${patterns.length} potential patterns`);

  // Save to pending
  if (patterns.length > 0) {
    addPendingPatterns(patterns);
    console.log('✅ Patterns added to pending queue');
    console.log('   Run "npm run brain:sync" to merge into project brain');
  } else {
    console.log('📝 No new patterns to add');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main().catch(console.error);
