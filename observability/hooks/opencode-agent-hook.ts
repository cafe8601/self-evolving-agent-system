#!/usr/bin/env bun
/**
 * OpenCode Agent Observability Hook
 * Integrates with OpenCode's agent system to track agent lifecycle and performance
 *
 * Usage:
 *   bun run opencode-agent-hook.ts --event AgentStart --agent OmO --model gemini-2.5-pro
 */

const SERVER_URL = process.env.OBSERVABILITY_URL || 'http://localhost:4100/events';

interface AgentEvent {
  source_app: 'opencode';
  session_id: string;
  event_type: string;
  event_category: 'agent';
  payload: {
    agent_name: string;
    model?: string;
    task?: string;
    result?: string;
    tokens_used?: number;
    duration_ms?: number;
    error?: string;
  };
  summary?: string;
  duration_ms?: number;
  token_count?: number;
  timestamp: number;
}

// Parse command line arguments
function parseArgs(): {
  event: string;
  agent: string;
  model?: string;
  task?: string;
  result?: string;
  tokens?: number;
  duration?: number;
  error?: string;
} {
  const args = process.argv.slice(2);
  let event = 'AgentStart';
  let agent = 'unknown';
  let model: string | undefined;
  let task: string | undefined;
  let result: string | undefined;
  let tokens: number | undefined;
  let duration: number | undefined;
  let error: string | undefined;

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--event':
      case '-e':
        event = args[++i] || 'AgentStart';
        break;
      case '--agent':
      case '-a':
        agent = args[++i] || 'unknown';
        break;
      case '--model':
      case '-m':
        model = args[++i];
        break;
      case '--task':
      case '-t':
        task = args[++i];
        break;
      case '--result':
      case '-r':
        result = args[++i];
        break;
      case '--tokens':
        tokens = parseInt(args[++i]) || undefined;
        break;
      case '--duration':
        duration = parseInt(args[++i]) || undefined;
        break;
      case '--error':
        error = args[++i];
        break;
    }
  }

  return { event, agent, model, task, result, tokens, duration, error };
}

// Generate session ID
function getSessionId(): string {
  return process.env.OPENCODE_SESSION_ID || `opencode-${Date.now()}`;
}

// Generate summary based on event type
function generateSummary(event: string, agent: string, task?: string): string {
  switch (event) {
    case 'AgentStart':
      return `${agent} agent started${task ? `: ${task.substring(0, 50)}` : ''}`;
    case 'AgentComplete':
      return `${agent} agent completed successfully`;
    case 'AgentError':
      return `${agent} agent encountered an error`;
    case 'AgentDelegate':
      return `${agent} delegating task`;
    case 'AgentReceive':
      return `${agent} received task`;
    default:
      return `${agent}: ${event}`;
  }
}

// Send event to server
async function sendEvent(event: AgentEvent): Promise<boolean> {
  try {
    const response = await fetch(SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'OpenCode-Agent-Hook/1.0'
      },
      body: JSON.stringify(event),
      signal: AbortSignal.timeout(5000)
    });

    return response.ok;
  } catch {
    return false;
  }
}

// Main
async function main(): Promise<void> {
  const { event, agent, model, task, result, tokens, duration, error } = parseArgs();
  const sessionId = getSessionId();

  const agentEvent: AgentEvent = {
    source_app: 'opencode',
    session_id: sessionId,
    event_type: event,
    event_category: 'agent',
    payload: {
      agent_name: agent,
      model,
      task,
      result,
      tokens_used: tokens,
      duration_ms: duration,
      error
    },
    summary: generateSummary(event, agent, task),
    duration_ms: duration,
    token_count: tokens,
    timestamp: Date.now()
  };

  await sendEvent(agentEvent);
  process.exit(0);
}

main().catch(() => process.exit(0));
