// Self-Evolving Agent Observability Server
import {
  initDatabase,
  insertEvent,
  getRecentEvents,
  getEventsBySession,
  getFilterOptions,
  getMetricsSummary,
  getAgentPerformance,
  getSession,
  getActiveSessions,
  cleanupOldData,
  getDatabaseStats,
  resolveEvent,
  unresolveEvent,
  getErrorEvents
} from './db';
import {
  getBrainState,
  getWorkflowStats,
  getRecentPatterns,
  recordObservabilityPattern
} from './brain-sync';
import type { ObservabilityEvent, ApiResponse, WSMessage } from './types';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get current directory for static file serving
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CLIENT_DIR = join(__dirname, '..', 'client');

// MIME types for static files
const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

// Initialize database
initDatabase();

// WebSocket clients
const wsClients = new Set<any>();

// Broadcast to all WebSocket clients
function broadcast(message: WSMessage): void {
  const data = JSON.stringify(message);
  wsClients.forEach(client => {
    try {
      client.send(data);
    } catch {
      wsClients.delete(client);
    }
  });
}

// Create Bun server
const server = Bun.serve({
  port: 4100,

  async fetch(req: Request) {
    const url = new URL(req.url);

    // CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    // Preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    try {
      // ============================================
      // EVENT ENDPOINTS
      // ============================================

      // POST /events - Receive new event
      if (url.pathname === '/events' && req.method === 'POST') {
        const event: ObservabilityEvent = await req.json();

        // Validate required fields
        if (!event.source_app || !event.session_id || !event.event_type || !event.payload) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Missing required fields: source_app, session_id, event_type, payload'
          } as ApiResponse), { status: 400, headers });
        }

        // Insert event
        const savedEvent = insertEvent(event);

        // Broadcast to WebSocket clients
        broadcast({ type: 'event', data: savedEvent });

        return new Response(JSON.stringify({
          success: true,
          data: savedEvent
        } as ApiResponse), { headers });
      }

      // GET /events/recent - Get recent events
      if (url.pathname === '/events/recent' && req.method === 'GET') {
        const limit = parseInt(url.searchParams.get('limit') || '100');
        const source = url.searchParams.get('source') || undefined;
        const category = url.searchParams.get('category') || undefined;

        const events = getRecentEvents(limit, source, category);
        return new Response(JSON.stringify({
          success: true,
          data: events
        } as ApiResponse), { headers });
      }

      // GET /events/session/:id - Get events by session
      if (url.pathname.startsWith('/events/session/') && req.method === 'GET') {
        const sessionId = url.pathname.split('/')[3];
        const events = getEventsBySession(sessionId);
        return new Response(JSON.stringify({
          success: true,
          data: events
        } as ApiResponse), { headers });
      }

      // GET /events/filter-options - Get filter options
      if (url.pathname === '/events/filter-options' && req.method === 'GET') {
        const options = getFilterOptions();
        return new Response(JSON.stringify({
          success: true,
          data: options
        } as ApiResponse), { headers });
      }

      // ============================================
      // METRICS ENDPOINTS
      // ============================================

      // GET /metrics/summary - Get overall metrics summary
      if (url.pathname === '/metrics/summary' && req.method === 'GET') {
        const summary = getMetricsSummary();
        return new Response(JSON.stringify({
          success: true,
          data: summary
        } as ApiResponse), { headers });
      }

      // GET /metrics/agents - Get agent performance metrics
      if (url.pathname === '/metrics/agents' && req.method === 'GET') {
        const performance = getAgentPerformance();
        return new Response(JSON.stringify({
          success: true,
          data: performance
        } as ApiResponse), { headers });
      }

      // ============================================
      // SESSION ENDPOINTS
      // ============================================

      // GET /sessions/active - Get active sessions
      if (url.pathname === '/sessions/active' && req.method === 'GET') {
        const sessions = getActiveSessions();
        return new Response(JSON.stringify({
          success: true,
          data: sessions
        } as ApiResponse), { headers });
      }

      // GET /sessions/:id - Get session details
      if (url.pathname.startsWith('/sessions/') && req.method === 'GET') {
        const sessionId = url.pathname.split('/')[2];
        const session = getSession(sessionId);
        if (!session) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Session not found'
          } as ApiResponse), { status: 404, headers });
        }
        return new Response(JSON.stringify({
          success: true,
          data: session
        } as ApiResponse), { headers });
      }

      // ============================================
      // BRAIN ENDPOINTS
      // ============================================

      // GET /brain/state - Get brain state
      if (url.pathname === '/brain/state' && req.method === 'GET') {
        const state = getBrainState();
        return new Response(JSON.stringify({
          success: true,
          data: state
        } as ApiResponse), { headers });
      }

      // GET /brain/workflows - Get workflow stats
      if (url.pathname === '/brain/workflows' && req.method === 'GET') {
        const stats = getWorkflowStats();
        return new Response(JSON.stringify({
          success: true,
          data: stats
        } as ApiResponse), { headers });
      }

      // GET /brain/patterns - Get recent patterns
      if (url.pathname === '/brain/patterns' && req.method === 'GET') {
        const limit = parseInt(url.searchParams.get('limit') || '10');
        const patterns = getRecentPatterns(limit);
        return new Response(JSON.stringify({
          success: true,
          data: patterns
        } as ApiResponse), { headers });
      }

      // POST /brain/patterns - Record new pattern from observability
      if (url.pathname === '/brain/patterns' && req.method === 'POST') {
        const pattern = await req.json();
        const patternId = recordObservabilityPattern(pattern);
        if (!patternId) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Failed to record pattern'
          } as ApiResponse), { status: 500, headers });
        }

        // Broadcast brain update
        broadcast({ type: 'brain-update', data: getBrainState() });

        return new Response(JSON.stringify({
          success: true,
          data: { id: patternId }
        } as ApiResponse), { headers });
      }

      // ============================================
      // ERROR RESOLUTION ENDPOINTS
      // ============================================

      // GET /errors - Get all error events
      if (url.pathname === '/errors' && req.method === 'GET') {
        const includeResolved = url.searchParams.get('includeResolved') !== 'false';
        const errors = getErrorEvents(includeResolved);
        return new Response(JSON.stringify({
          success: true,
          data: errors
        } as ApiResponse), { headers });
      }

      // POST /events/:id/resolve - Mark error as resolved
      const resolveMatch = url.pathname.match(/^\/events\/(\d+)\/resolve$/);
      if (resolveMatch && req.method === 'POST') {
        const eventId = parseInt(resolveMatch[1], 10);
        const body = await req.json().catch(() => ({}));
        const success = resolveEvent(eventId, body.note);

        if (success) {
          // Broadcast event update
          broadcast({ type: 'event-resolved', data: { eventId, resolved: true, note: body.note } });
        }

        return new Response(JSON.stringify({
          success,
          data: { eventId, resolved: true }
        } as ApiResponse), { headers });
      }

      // POST /events/:id/unresolve - Mark error as unresolved
      const unresolveMatch = url.pathname.match(/^\/events\/(\d+)\/unresolve$/);
      if (unresolveMatch && req.method === 'POST') {
        const eventId = parseInt(unresolveMatch[1], 10);
        const success = unresolveEvent(eventId);

        if (success) {
          // Broadcast event update
          broadcast({ type: 'event-resolved', data: { eventId, resolved: false } });
        }

        return new Response(JSON.stringify({
          success,
          data: { eventId, resolved: false }
        } as ApiResponse), { headers });
      }

      // ============================================
      // SYSTEM ENDPOINTS
      // ============================================

      // GET /system/stats - Get database stats
      if (url.pathname === '/system/stats' && req.method === 'GET') {
        const stats = getDatabaseStats();
        return new Response(JSON.stringify({
          success: true,
          data: stats
        } as ApiResponse), { headers });
      }

      // POST /system/cleanup - Cleanup old data
      if (url.pathname === '/system/cleanup' && req.method === 'POST') {
        const days = parseInt(url.searchParams.get('days') || '7');
        const deleted = cleanupOldData(days);
        return new Response(JSON.stringify({
          success: true,
          data: { deleted_events: deleted }
        } as ApiResponse), { headers });
      }

      // GET /health - Health check
      if (url.pathname === '/health' && req.method === 'GET') {
        return new Response(JSON.stringify({
          success: true,
          data: {
            status: 'healthy',
            timestamp: Date.now(),
            uptime: process.uptime(),
            clients: wsClients.size
          }
        } as ApiResponse), { headers });
      }

      // WebSocket upgrade
      if (url.pathname === '/stream') {
        const success = server.upgrade(req);
        if (success) return undefined;
      }

      // ============================================
      // STATIC FILE SERVING (Dashboard UI)
      // ============================================

      // Serve index.html for root path
      if (url.pathname === '/' || url.pathname === '/dashboard') {
        const indexPath = join(CLIENT_DIR, 'index.html');
        const file = Bun.file(indexPath);
        if (await file.exists()) {
          return new Response(file, {
            headers: { 'Content-Type': 'text/html' }
          });
        }
      }

      // Serve static files from client directory
      if (url.pathname.startsWith('/static/') || url.pathname.match(/\.(html|css|js|png|jpg|svg|ico)$/)) {
        const filePath = url.pathname.startsWith('/static/')
          ? join(CLIENT_DIR, url.pathname.replace('/static/', ''))
          : join(CLIENT_DIR, url.pathname);

        const file = Bun.file(filePath);
        if (await file.exists()) {
          const ext = filePath.substring(filePath.lastIndexOf('.'));
          const contentType = MIME_TYPES[ext] || 'application/octet-stream';
          return new Response(file, {
            headers: { 'Content-Type': contentType }
          });
        }
      }

      // API documentation endpoint
      if (url.pathname === '/api') {
        return new Response(JSON.stringify({
          success: true,
          message: 'Self-Evolving Agent Observability Server API',
          dashboard: 'http://localhost:' + server.port + '/',
          endpoints: {
            events: '/events (POST), /events/recent (GET)',
            metrics: '/metrics/summary (GET), /metrics/agents (GET)',
            sessions: '/sessions/active (GET), /sessions/:id (GET)',
            brain: '/brain/state (GET), /brain/workflows (GET), /brain/patterns (GET/POST)',
            system: '/health (GET), /system/stats (GET), /system/cleanup (POST)',
            websocket: '/stream (WS)'
          }
        } as ApiResponse), { headers });
      }

      // Default: redirect to dashboard
      return Response.redirect(`http://localhost:${server.port}/`, 302);

    } catch (error) {
      console.error('Request error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: 'Internal server error'
      } as ApiResponse), { status: 500, headers });
    }
  },

  websocket: {
    open(ws) {
      console.log('🔌 WebSocket client connected');
      wsClients.add(ws);

      // Send initial data
      const initialData = {
        events: getRecentEvents(50),
        metrics: getMetricsSummary(),
        brain: getBrainState()
      };
      ws.send(JSON.stringify({ type: 'initial', data: initialData }));
    },

    message(ws, message) {
      // Handle ping/pong
      try {
        const msg = JSON.parse(message.toString());
        if (msg.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong', data: Date.now() }));
        }
      } catch {}
    },

    close(ws) {
      console.log('🔌 WebSocket client disconnected');
      wsClients.delete(ws);
    },

    error(ws, error) {
      console.error('WebSocket error:', error);
      wsClients.delete(ws);
    }
  }
});

console.log(`
╔══════════════════════════════════════════════════════════════╗
║     Self-Evolving Agent Observability Server                 ║
╠══════════════════════════════════════════════════════════════╣
║  🖥️  Dashboard: http://localhost:${server.port}/                       ║
║  📊 WebSocket: ws://localhost:${server.port}/stream                  ║
║  📮 Events:    POST http://localhost:${server.port}/events           ║
║  🧠 Brain:     GET http://localhost:${server.port}/brain/state       ║
║  📖 API Docs:  GET http://localhost:${server.port}/api               ║
╚══════════════════════════════════════════════════════════════╝
`);

// Periodic brain state broadcast
setInterval(() => {
  if (wsClients.size > 0) {
    broadcast({ type: 'brain-update', data: getBrainState() });
    broadcast({ type: 'metrics', data: getMetricsSummary() });
  }
}, 30000); // Every 30 seconds
