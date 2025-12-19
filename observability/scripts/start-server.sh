#!/bin/bash
# Start Observability Server
# Runs the Bun server for the Self-Evolving Agent Observability System

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$(dirname "$SCRIPT_DIR")/server"
PROJECT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"
PID_FILE="$PROJECT_DIR/.observability.pid"
LOG_FILE="$PROJECT_DIR/.observability.log"

# Check if already running
if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE")
  if kill -0 "$PID" 2>/dev/null; then
    echo "⚠️  Observability server is already running (PID: $PID)"
    echo "   Use: ./stop-server.sh to stop it first"
    exit 1
  fi
  rm -f "$PID_FILE"
fi

# Install dependencies if needed
if [ ! -d "$SERVER_DIR/node_modules" ]; then
  echo "📦 Installing server dependencies..."
  cd "$SERVER_DIR" && bun install
fi

# Start the server
echo "🚀 Starting Self-Evolving Agent Observability Server..."
cd "$SERVER_DIR"

if [ "$1" = "--foreground" ] || [ "$1" = "-f" ]; then
  # Foreground mode
  bun run index.ts
else
  # Background mode
  nohup bun run index.ts > "$LOG_FILE" 2>&1 &
  PID=$!
  echo "$PID" > "$PID_FILE"

  # Wait a moment and check if it started
  sleep 1
  if kill -0 "$PID" 2>/dev/null; then
    echo "✅ Server started successfully (PID: $PID)"
    echo "   📊 HTTP:      http://localhost:4100"
    echo "   📡 WebSocket: ws://localhost:4100/stream"
    echo "   📝 Logs:      $LOG_FILE"
  else
    echo "❌ Server failed to start. Check logs:"
    cat "$LOG_FILE"
    rm -f "$PID_FILE"
    exit 1
  fi
fi
