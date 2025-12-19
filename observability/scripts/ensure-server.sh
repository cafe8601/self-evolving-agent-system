#!/bin/bash
# Ensure Observability Server is Running (Silent)
# Used by SessionStart hook to auto-start server if not running

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"
PID_FILE="$PROJECT_DIR/.observability.pid"

# Quick health check first (fastest)
if curl -s --connect-timeout 1 http://localhost:4100/health >/dev/null 2>&1; then
  exit 0  # Server is running, nothing to do
fi

# Check PID file
if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE")
  if kill -0 "$PID" 2>/dev/null; then
    # Process exists but not responding, wait a bit and retry
    sleep 1
    if curl -s --connect-timeout 1 http://localhost:4100/health >/dev/null 2>&1; then
      exit 0
    fi
    # Still not responding, kill and restart
    kill "$PID" 2>/dev/null
    rm -f "$PID_FILE"
  else
    rm -f "$PID_FILE"
  fi
fi

# Start the server silently
"$SCRIPT_DIR/start-server.sh" >/dev/null 2>&1 &

# Brief wait to let server initialize
sleep 2

# Verify it started
if curl -s --connect-timeout 2 http://localhost:4100/health >/dev/null 2>&1; then
  echo "Observability server auto-started"
  exit 0
else
  # Failed to start, but don't block the session
  exit 0
fi
