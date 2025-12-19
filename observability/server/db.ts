// Self-Evolving Agent Observability Database
import { Database } from 'bun:sqlite';
import * as path from 'path';
import type { ObservabilityEvent, Session, Metric, FilterOptions, MetricsSummary, AgentPerformance } from './types';

// Use absolute path based on __dirname
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const DB_PATH = path.join(__dirname, 'observability.db');

let db: Database;

export function initDatabase(): void {
  db = new Database(DB_PATH, { create: true });
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA synchronous = NORMAL');

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_app TEXT NOT NULL,
      session_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      event_category TEXT,
      payload TEXT NOT NULL,
      summary TEXT,
      duration_ms INTEGER,
      token_count INTEGER,
      cost_usd REAL,
      timestamp INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      resolved INTEGER DEFAULT 0,
      resolved_at INTEGER,
      resolved_note TEXT
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      source_app TEXT NOT NULL,
      start_time INTEGER NOT NULL,
      end_time INTEGER,
      status TEXT DEFAULT 'active',
      total_events INTEGER DEFAULT 0,
      total_tokens INTEGER DEFAULT 0,
      total_cost REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      metric_name TEXT NOT NULL,
      metric_value REAL NOT NULL,
      labels TEXT,
      timestamp INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id);
    CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
    CREATE INDEX IF NOT EXISTS idx_events_source ON events(source_app);
    CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_events_category ON events(event_category);
    CREATE INDEX IF NOT EXISTS idx_metrics_name ON metrics(metric_name);
    CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON metrics(timestamp DESC);
  `);

  console.log('📊 Database initialized:', DB_PATH);
}

// Event operations
export function insertEvent(event: ObservabilityEvent): ObservabilityEvent {
  const now = Date.now();
  const timestamp = event.timestamp || now;

  const stmt = db.prepare(`
    INSERT INTO events (source_app, session_id, event_type, event_category, payload, summary, duration_ms, token_count, cost_usd, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    event.source_app,
    event.session_id,
    event.event_type,
    event.event_category || null,
    JSON.stringify(event.payload),
    event.summary || null,
    event.duration_ms || null,
    event.token_count || null,
    event.cost_usd || null,
    timestamp
  );

  // Update session stats
  updateSessionStats(event.session_id, event);

  // Record latency metric (only if timestamp is a number)
  if (typeof event.timestamp === 'number') {
    const latency = now - event.timestamp;
    if (!isNaN(latency) && latency >= 0) {
      insertMetric('event_latency_ms', latency, { source: event.source_app });
    }
  }

  return {
    ...event,
    id: Number(result.lastInsertRowid),
    timestamp
  };
}

export function getRecentEvents(limit: number = 100, source?: string, category?: string): ObservabilityEvent[] {
  let sql = 'SELECT * FROM events';
  const conditions: string[] = [];
  const params: any[] = [];

  if (source) {
    conditions.push('source_app = ?');
    params.push(source);
  }
  if (category) {
    conditions.push('event_category = ?');
    params.push(category);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' ORDER BY timestamp DESC LIMIT ?';
  params.push(limit);

  const rows = db.prepare(sql).all(...params) as any[];

  return rows.map(row => ({
    ...row,
    payload: JSON.parse(row.payload)
  }));
}

export function getEventsBySession(sessionId: string): ObservabilityEvent[] {
  const rows = db.prepare(`
    SELECT * FROM events WHERE session_id = ? ORDER BY timestamp ASC
  `).all(sessionId) as any[];

  return rows.map(row => ({
    ...row,
    payload: JSON.parse(row.payload)
  }));
}

export function getFilterOptions(): FilterOptions {
  const sourceApps = db.prepare('SELECT DISTINCT source_app FROM events').all() as any[];
  const sessionIds = db.prepare('SELECT DISTINCT session_id FROM events ORDER BY session_id DESC LIMIT 50').all() as any[];
  const eventTypes = db.prepare('SELECT DISTINCT event_type FROM events').all() as any[];
  const eventCategories = db.prepare('SELECT DISTINCT event_category FROM events WHERE event_category IS NOT NULL').all() as any[];

  return {
    source_apps: sourceApps.map(r => r.source_app),
    session_ids: sessionIds.map(r => r.session_id),
    event_types: eventTypes.map(r => r.event_type),
    event_categories: eventCategories.map(r => r.event_category)
  };
}

// Session operations
function updateSessionStats(sessionId: string, event: ObservabilityEvent): void {
  // Upsert session
  const existing = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId) as any;

  if (existing) {
    db.prepare(`
      UPDATE sessions SET
        total_events = total_events + 1,
        total_tokens = total_tokens + ?,
        total_cost = total_cost + ?,
        end_time = ?
      WHERE id = ?
    `).run(
      event.token_count || 0,
      event.cost_usd || 0,
      Date.now(),
      sessionId
    );
  } else {
    db.prepare(`
      INSERT INTO sessions (id, source_app, start_time, total_events, total_tokens, total_cost)
      VALUES (?, ?, ?, 1, ?, ?)
    `).run(
      sessionId,
      event.source_app,
      Date.now(),
      event.token_count || 0,
      event.cost_usd || 0
    );
  }

  // Mark session complete on Stop/SessionEnd events
  if (event.event_type === 'Stop' || event.event_type === 'SessionEnd') {
    db.prepare(`
      UPDATE sessions SET status = 'completed', end_time = ? WHERE id = ?
    `).run(Date.now(), sessionId);
  }
}

export function getSession(sessionId: string): Session | null {
  return db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId) as Session | null;
}

export function getActiveSessions(): Session[] {
  return db.prepare('SELECT * FROM sessions WHERE status = ? ORDER BY start_time DESC').all('active') as Session[];
}

// Metrics operations
export function insertMetric(name: string, value: number, labels?: Record<string, string>): void {
  db.prepare(`
    INSERT INTO metrics (metric_name, metric_value, labels, timestamp)
    VALUES (?, ?, ?, ?)
  `).run(name, value, labels ? JSON.stringify(labels) : null, Date.now());
}

export function getMetricsSummary(): MetricsSummary {
  const totalEvents = db.prepare('SELECT COUNT(*) as count FROM events').get() as any;
  const totalSessions = db.prepare('SELECT COUNT(*) as count FROM sessions').get() as any;
  const activeSessions = db.prepare('SELECT COUNT(*) as count FROM sessions WHERE status = ?').get('active') as any;

  const tokenSum = db.prepare('SELECT COALESCE(SUM(token_count), 0) as total FROM events').get() as any;
  const costSum = db.prepare('SELECT COALESCE(SUM(cost_usd), 0) as total FROM events').get() as any;

  const eventsBySource = db.prepare(`
    SELECT source_app, COUNT(*) as count FROM events GROUP BY source_app
  `).all() as any[];

  const eventsByType = db.prepare(`
    SELECT event_type, COUNT(*) as count FROM events GROUP BY event_type ORDER BY count DESC LIMIT 10
  `).all() as any[];

  const avgLatency = db.prepare(`
    SELECT AVG(metric_value) as avg FROM metrics WHERE metric_name = 'event_latency_ms'
  `).get() as any;

  const successEvents = db.prepare(`
    SELECT COUNT(*) as count FROM events WHERE event_type NOT LIKE '%Failure%' AND event_type NOT LIKE '%Error%'
  `).get() as any;

  return {
    total_events: totalEvents.count,
    total_sessions: totalSessions.count,
    active_sessions: activeSessions.count,
    total_tokens: tokenSum.total,
    estimated_cost_usd: costSum.total,
    events_by_source: Object.fromEntries(eventsBySource.map(r => [r.source_app, r.count])),
    events_by_type: Object.fromEntries(eventsByType.map(r => [r.event_type, r.count])),
    avg_event_latency_ms: avgLatency?.avg || 0,
    success_rate: totalEvents.count > 0 ? successEvents.count / totalEvents.count : 1
  };
}

export function getAgentPerformance(): AgentPerformance[] {
  const rows = db.prepare(`
    SELECT
      json_extract(payload, '$.agent_name') as agent_name,
      COUNT(*) as total_invocations,
      SUM(CASE WHEN event_type NOT LIKE '%Error%' AND event_type NOT LIKE '%Failure%' THEN 1 ELSE 0 END) as success_count,
      SUM(CASE WHEN event_type LIKE '%Error%' OR event_type LIKE '%Failure%' THEN 1 ELSE 0 END) as failure_count,
      AVG(duration_ms) as avg_duration_ms,
      COALESCE(SUM(token_count), 0) as total_tokens,
      COALESCE(SUM(cost_usd), 0) as total_cost
    FROM events
    WHERE source_app = 'opencode' AND json_extract(payload, '$.agent_name') IS NOT NULL
    GROUP BY agent_name
  `).all() as any[];

  return rows;
}

export function getTokenUsage(periodMs: number = 3600000): Metric[] {
  const since = Date.now() - periodMs;
  return db.prepare(`
    SELECT * FROM metrics
    WHERE metric_name = 'tokens_used' AND timestamp > ?
    ORDER BY timestamp ASC
  `).all(since) as Metric[];
}

// Cleanup old data
export function cleanupOldData(daysToKeep: number = 7): number {
  const cutoff = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);

  const result = db.prepare('DELETE FROM events WHERE timestamp < ?').run(cutoff);
  db.prepare('DELETE FROM metrics WHERE timestamp < ?').run(cutoff);
  db.prepare('DELETE FROM sessions WHERE end_time IS NOT NULL AND end_time < ?').run(cutoff);

  // Vacuum to reclaim space
  db.exec('VACUUM');

  return result.changes;
}

// Resolve an error event
export function resolveEvent(eventId: number, note?: string): boolean {
  try {
    const result = db.prepare(`
      UPDATE events SET resolved = 1, resolved_at = ?, resolved_note = ?
      WHERE id = ?
    `).run(Date.now(), note || null, eventId);
    return result.changes > 0;
  } catch (error) {
    console.error('Failed to resolve event:', error);
    return false;
  }
}

// Unresolve an error event
export function unresolveEvent(eventId: number): boolean {
  try {
    const result = db.prepare(`
      UPDATE events SET resolved = 0, resolved_at = NULL, resolved_note = NULL
      WHERE id = ?
    `).run(eventId);
    return result.changes > 0;
  } catch (error) {
    console.error('Failed to unresolve event:', error);
    return false;
  }
}

// Get error events with resolution status
export function getErrorEvents(includeResolved: boolean = true): ObservabilityEvent[] {
  const errorTypes = ['PostToolUseFailure', 'AgentError', 'WorkflowError', 'Error'];
  const placeholders = errorTypes.map(() => '?').join(',');

  let sql = `
    SELECT * FROM events
    WHERE event_type IN (${placeholders})
  `;

  if (!includeResolved) {
    sql += ' AND resolved = 0';
  }

  sql += ' ORDER BY timestamp DESC LIMIT 100';

  const rows = db.prepare(sql).all(...errorTypes) as any[];

  return rows.map(row => ({
    ...row,
    payload: JSON.parse(row.payload),
    resolved: row.resolved === 1,
    resolved_at: row.resolved_at,
    resolved_note: row.resolved_note
  }));
}

// Get database stats
export function getDatabaseStats(): { size_bytes: number; event_count: number; session_count: number; metric_count: number } {
  const eventCount = db.prepare('SELECT COUNT(*) as count FROM events').get() as any;
  const sessionCount = db.prepare('SELECT COUNT(*) as count FROM sessions').get() as any;
  const metricCount = db.prepare('SELECT COUNT(*) as count FROM metrics').get() as any;

  let sizeBytes = 0;
  try {
    const file = Bun.file(DB_PATH);
    sizeBytes = file.size;
  } catch {
    // File may not exist yet
  }

  return {
    size_bytes: sizeBytes,
    event_count: eventCount.count,
    session_count: sessionCount.count,
    metric_count: metricCount.count
  };
}
