#!/bin/bash
# Check Observability Server Status

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"
PID_FILE="$PROJECT_DIR/.observability.pid"
LOG_FILE="$PROJECT_DIR/.observability.log"
DB_FILE="$PROJECT_DIR/observability/server/observability.db"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     Self-Evolving Agent Observability Status                 ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check server status
if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE")
  if kill -0 "$PID" 2>/dev/null; then
    echo "🟢 Server: RUNNING (PID: $PID)"

    # Check health endpoint
    HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4100/health 2>/dev/null)
    if [ "$HEALTH" = "200" ]; then
      echo "   Health: OK"

      # Get stats
      STATS=$(curl -s http://localhost:4100/system/stats 2>/dev/null)
      if [ -n "$STATS" ]; then
        EVENTS=$(echo "$STATS" | grep -o '"event_count":[0-9]*' | cut -d: -f2)
        SESSIONS=$(echo "$STATS" | grep -o '"session_count":[0-9]*' | cut -d: -f2)
        echo "   Events: ${EVENTS:-0}"
        echo "   Sessions: ${SESSIONS:-0}"
      fi
    else
      echo "   Health: NOT RESPONDING"
    fi
  else
    echo "🔴 Server: NOT RUNNING (stale PID file)"
    rm -f "$PID_FILE"
  fi
else
  echo "🔴 Server: NOT RUNNING"
fi

echo ""

# Check database
if [ -f "$DB_FILE" ]; then
  DB_SIZE=$(du -h "$DB_FILE" | cut -f1)
  echo "📊 Database: $DB_FILE ($DB_SIZE)"
else
  echo "📊 Database: Not created yet"
fi

# Check log file
if [ -f "$LOG_FILE" ]; then
  LOG_SIZE=$(du -h "$LOG_FILE" | cut -f1)
  LOG_LINES=$(wc -l < "$LOG_FILE")
  echo "📝 Logs: $LOG_FILE ($LOG_SIZE, $LOG_LINES lines)"
  echo ""
  echo "   Last 5 log entries:"
  tail -5 "$LOG_FILE" | sed 's/^/   /'
else
  echo "📝 Logs: No log file yet"
fi

echo ""

# Check brain status
BRAIN_FILE="$PROJECT_DIR/.opencode/brain/project_brain.yaml"
if [ -f "$BRAIN_FILE" ]; then
  PATTERNS=$(grep -c "id: LP-" "$BRAIN_FILE" 2>/dev/null || echo "0")
  echo "🧠 Brain: $PATTERNS learned patterns"
else
  echo "🧠 Brain: Not initialized"
fi

echo ""
