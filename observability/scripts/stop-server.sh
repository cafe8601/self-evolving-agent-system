#!/bin/bash
# Stop Observability Server

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"
PID_FILE="$PROJECT_DIR/.observability.pid"

if [ ! -f "$PID_FILE" ]; then
  echo "⚠️  No PID file found. Server may not be running."

  # Try to find and kill by process name
  PIDS=$(pgrep -f "bun.*observability.*index.ts")
  if [ -n "$PIDS" ]; then
    echo "Found server processes: $PIDS"
    echo "Stopping..."
    echo "$PIDS" | xargs kill 2>/dev/null
    echo "✅ Server stopped"
  else
    echo "No server process found."
  fi
  exit 0
fi

PID=$(cat "$PID_FILE")

if kill -0 "$PID" 2>/dev/null; then
  echo "🛑 Stopping Observability Server (PID: $PID)..."
  kill "$PID"

  # Wait for graceful shutdown
  for i in {1..10}; do
    if ! kill -0 "$PID" 2>/dev/null; then
      break
    fi
    sleep 0.5
  done

  # Force kill if still running
  if kill -0 "$PID" 2>/dev/null; then
    echo "   Force killing..."
    kill -9 "$PID" 2>/dev/null
  fi

  rm -f "$PID_FILE"
  echo "✅ Server stopped"
else
  echo "⚠️  Process $PID not running. Cleaning up PID file."
  rm -f "$PID_FILE"
fi
