#!/usr/bin/env bun
/**
 * Universal Event Sender for Self-Evolving Agent Observability
 * Sends Claude Code hook events to the observability server.
 *
 * Usage:
 *   echo '{"session_id": "abc", ...}' | bun run send-event.ts --source claude-code --type PostToolUse
 */

const SERVER_URL = process.env.OBSERVABILITY_URL || 'http://localhost:4100/events';

interface HookInput {
  session_id: string;
  tool_name?: string;
  tool_input?: any;
  tool_result?: any;
  error?: any;
  prompt?: string;
  stop_reason?: string;
  transcript_path?: string;
  [key: string]: any;
}

interface EventPayload {
  source_app: string;
  session_id: string;
  event_type: string;
  event_category?: string;
  payload: any;
  summary?: string;
  duration_ms?: number;
  token_count?: number;
  cost_usd?: number;
  timestamp: number;
}

// Parse command line arguments
function parseArgs(): { source: string; type: string; category?: string; summarize: boolean } {
  const args = process.argv.slice(2);
  let source = 'claude-code';
  let type = 'Unknown';
  let category: string | undefined;
  let summarize = false;

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--source':
      case '-s':
        source = args[++i] || 'claude-code';
        break;
      case '--type':
      case '-t':
        type = args[++i] || 'Unknown';
        break;
      case '--category':
      case '-c':
        category = args[++i];
        break;
      case '--summarize':
        summarize = true;
        break;
    }
  }

  return { source, type, category, summarize };
}

// Determine event category based on event type
function getEventCategory(eventType: string): string {
  if (['PreToolUse', 'PostToolUse', 'PostToolUseFailure'].includes(eventType)) {
    return 'tool';
  }
  if (['AgentStart', 'AgentComplete', 'AgentError', 'SubagentStop'].includes(eventType)) {
    return 'agent';
  }
  if (['WorkflowStart', 'PhaseStart', 'PhaseComplete', 'WorkflowComplete'].includes(eventType)) {
    return 'workflow';
  }
  if (['BrainSync', 'PatternApplied', 'PatternLearned'].includes(eventType)) {
    return 'learning';
  }
  if (['SessionStart', 'SessionEnd', 'Stop'].includes(eventType)) {
    return 'session';
  }
  return 'system';
}

// Generate simple summary
function generateSummary(input: HookInput, eventType: string): string | undefined {
  if (eventType === 'PreToolUse' && input.tool_name) {
    return `Preparing to use ${input.tool_name}`;
  }
  if (eventType === 'PostToolUse' && input.tool_name) {
    const success = !input.error;
    return `${input.tool_name} ${success ? 'completed' : 'failed'}`;
  }
  if (eventType === 'UserPromptSubmit' && input.prompt) {
    const truncated = input.prompt.substring(0, 100);
    return truncated.length < input.prompt.length ? truncated + '...' : truncated;
  }
  if (eventType === 'Stop') {
    return input.stop_reason || 'Response completed';
  }
  return undefined;
}

// Send event to server
async function sendEvent(event: EventPayload): Promise<boolean> {
  try {
    const response = await fetch(SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Self-Evolving-Agent-Hook/1.0'
      },
      body: JSON.stringify(event),
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`Server returned ${response.status}: ${text}`);
      return false;
    }

    return true;
  } catch (error) {
    // Don't log errors to avoid cluttering output - server might be down
    return false;
  }
}

// Main
async function main(): Promise<void> {
  const { source, type, category, summarize } = parseArgs();

  // Read input from stdin
  let inputText = '';
  for await (const chunk of Bun.stdin.stream()) {
    inputText += new TextDecoder().decode(chunk);
  }

  let input: HookInput;
  try {
    input = JSON.parse(inputText);
  } catch {
    // If no valid JSON input, create minimal event
    input = { session_id: 'unknown' };
  }

  // Build event payload
  const event: EventPayload = {
    source_app: source,
    session_id: input.session_id || 'unknown',
    event_type: type,
    event_category: category || getEventCategory(type),
    payload: input,
    timestamp: Date.now()
  };

  // Add summary if requested
  if (summarize) {
    event.summary = generateSummary(input, type);
  }

  // Extract duration if available
  if (input.duration_ms) {
    event.duration_ms = input.duration_ms;
  }

  // Extract token count if available
  if (input.token_count || input.tokens) {
    event.token_count = input.token_count || input.tokens;
  }

  // Send to server (fire and forget)
  await sendEvent(event);

  // Always exit successfully to not block Claude Code
  process.exit(0);
}

main().catch(() => process.exit(0));
