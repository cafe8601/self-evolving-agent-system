#!/usr/bin/env bun
/**
 * Terminal Dashboard for Self-Evolving Agent Observability
 * Connects to the WebSocket stream and displays real-time events
 *
 * Usage: bun run dashboard.ts [--url ws://localhost:4100/stream]
 */

const DEFAULT_URL = 'ws://localhost:4100/stream';
const HTTP_URL = 'http://localhost:4100';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgBlue: '\x1b[44m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgRed: '\x1b[41m'
};

// Source colors
const sourceColors: Record<string, string> = {
  'claude-code': colors.blue,
  'opencode': colors.green,
  'mdflow': colors.magenta,
  'brain-sync': colors.cyan
};

// Event type emojis
const eventEmojis: Record<string, string> = {
  'SessionStart': '🚀',
  'SessionEnd': '🏁',
  'UserPromptSubmit': '💬',
  'PreToolUse': '⏳',
  'PostToolUse': '✅',
  'PostToolUseFailure': '❌',
  'Stop': '🛑',
  'AgentStart': '🤖',
  'AgentComplete': '✨',
  'AgentError': '💥',
  'AgentDelegate': '📤',
  'WorkflowStart': '📋',
  'PhaseStart': '▶️',
  'PhaseComplete': '☑️',
  'WorkflowComplete': '🎉',
  'BrainSync': '🧠',
  'PatternLearned': '💡',
  'PatternApplied': '🔧'
};

// State
let eventCount = 0;
let sessionCount = 0;
let lastEvents: any[] = [];
const MAX_EVENTS = 20;

// Parse arguments
function parseArgs(): { wsUrl: string; httpUrl: string } {
  const args = process.argv.slice(2);
  let wsUrl = DEFAULT_URL;
  let httpUrl = HTTP_URL;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url' || args[i] === '-u') {
      wsUrl = args[++i] || DEFAULT_URL;
      httpUrl = wsUrl.replace('ws://', 'http://').replace('/stream', '');
    }
  }

  return { wsUrl, httpUrl };
}

// Clear screen and move cursor to top
function clearScreen(): void {
  process.stdout.write('\x1b[2J\x1b[H');
}

// Print header
function printHeader(): void {
  console.log(`${colors.bright}${colors.bgBlue} Self-Evolving Agent Observability Dashboard ${colors.reset}`);
  console.log(`${colors.dim}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
}

// Print metrics summary
function printMetrics(metrics: any): void {
  console.log(`\n${colors.bright}📊 Metrics${colors.reset}`);
  console.log(`   Events: ${colors.cyan}${metrics?.total_events || eventCount}${colors.reset}`);
  console.log(`   Sessions: ${colors.cyan}${metrics?.active_sessions || sessionCount}${colors.reset}`);
  console.log(`   Tools Used: ${colors.cyan}${metrics?.tool_uses || 0}${colors.reset}`);
  console.log(`   Success Rate: ${colors.green}${metrics?.success_rate || 0}%${colors.reset}`);
}

// Print brain status
function printBrainStatus(brain: any): void {
  console.log(`\n${colors.bright}🧠 Brain Status${colors.reset}`);
  console.log(`   Patterns: ${colors.magenta}${brain?.total_patterns || 0}${colors.reset}`);
  console.log(`   Success: ${colors.green}${brain?.success_patterns || 0}${colors.reset} / Failure: ${colors.red}${brain?.failure_patterns || 0}${colors.reset}`);
  console.log(`   Last Sync: ${colors.dim}${brain?.last_sync ? new Date(brain.last_sync).toLocaleTimeString() : 'Never'}${colors.reset}`);
}

// Format event for display
function formatEvent(event: any): string {
  const time = new Date(event.timestamp).toLocaleTimeString();
  const emoji = eventEmojis[event.event_type] || '📌';
  const sourceColor = sourceColors[event.source_app] || colors.white;
  const source = event.source_app.padEnd(12);
  const type = event.event_type.padEnd(20);
  const summary = event.summary || extractSummary(event);

  return `${colors.dim}${time}${colors.reset} ${emoji} ${sourceColor}${source}${colors.reset} ${colors.bright}${type}${colors.reset} ${colors.dim}${summary.substring(0, 40)}${colors.reset}`;
}

// Extract summary from event payload
function extractSummary(event: any): string {
  const payload = event.payload || {};

  if (payload.tool_name) {
    return payload.tool_name;
  }
  if (payload.agent_name) {
    return payload.agent_name;
  }
  if (payload.workflow_name) {
    return payload.workflow_name;
  }
  if (payload.prompt) {
    return payload.prompt.substring(0, 30) + '...';
  }

  return '';
}

// Print recent events
function printEvents(): void {
  console.log(`\n${colors.bright}📡 Recent Events${colors.reset}`);
  console.log(`${colors.dim}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

  if (lastEvents.length === 0) {
    console.log(`   ${colors.dim}No events yet...${colors.reset}`);
  } else {
    lastEvents.slice(-15).forEach(event => {
      console.log(`   ${formatEvent(event)}`);
    });
  }
}

// Print footer
function printFooter(): void {
  console.log(`\n${colors.dim}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.dim}Press Ctrl+C to exit${colors.reset}`);
}

// Refresh display
function refreshDisplay(metrics?: any, brain?: any): void {
  clearScreen();
  printHeader();
  printMetrics(metrics);
  printBrainStatus(brain);
  printEvents();
  printFooter();
}

// Main
async function main(): Promise<void> {
  const { wsUrl, httpUrl } = parseArgs();

  console.log(`${colors.bright}Connecting to ${wsUrl}...${colors.reset}`);

  let metrics: any = null;
  let brain: any = null;

  // Try to fetch initial data
  try {
    const metricsRes = await fetch(`${httpUrl}/metrics/summary`);
    if (metricsRes.ok) {
      const data = await metricsRes.json();
      metrics = data.data;
    }

    const brainRes = await fetch(`${httpUrl}/brain/state`);
    if (brainRes.ok) {
      const data = await brainRes.json();
      brain = data.data;
    }

    const eventsRes = await fetch(`${httpUrl}/events/recent?limit=20`);
    if (eventsRes.ok) {
      const data = await eventsRes.json();
      lastEvents = data.data || [];
      eventCount = lastEvents.length;
    }
  } catch (error) {
    console.log(`${colors.yellow}Warning: Could not fetch initial data${colors.reset}`);
  }

  // Connect to WebSocket
  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log(`${colors.green}Connected!${colors.reset}`);
    refreshDisplay(metrics, brain);
  };

  ws.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data.toString());

      switch (message.type) {
        case 'initial':
          if (message.data) {
            lastEvents = message.data.events || lastEvents;
            metrics = message.data.metrics || metrics;
            brain = message.data.brain || brain;
            eventCount = lastEvents.length;
          }
          break;

        case 'event':
          if (message.data) {
            lastEvents.push(message.data);
            if (lastEvents.length > MAX_EVENTS) {
              lastEvents.shift();
            }
            eventCount++;
          }
          break;

        case 'metrics':
          metrics = message.data;
          break;

        case 'brain-update':
          brain = message.data;
          break;

        case 'pong':
          // Heartbeat response
          break;
      }

      refreshDisplay(metrics, brain);
    } catch {
      // Ignore parse errors
    }
  };

  ws.onerror = (error) => {
    console.error(`${colors.red}WebSocket error:${colors.reset}`, error);
  };

  ws.onclose = () => {
    console.log(`${colors.yellow}Connection closed. Reconnecting in 5 seconds...${colors.reset}`);
    setTimeout(() => main(), 5000);
  };

  // Send heartbeat every 30 seconds
  setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'ping' }));
    }
  }, 30000);

  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log(`\n${colors.yellow}Closing dashboard...${colors.reset}`);
    ws.close();
    process.exit(0);
  });
}

main().catch(console.error);
