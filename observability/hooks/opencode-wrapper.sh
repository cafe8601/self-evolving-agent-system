#!/bin/bash
# OpenCode Agent Observability Wrapper
# Sends OpenCode agent events to observability server

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"
OBSERVABILITY_URL="${OBSERVABILITY_URL:-http://localhost:4100/events}"

EVENT_TYPE="${1:-AgentStart}"
AGENT_NAME="${2:-unknown}"
MODEL="${3:-}"
EXTRA_DATA="${4:-}"

# Generate session ID
SESSION_ID="${OPENCODE_SESSION_ID:-opencode-$(date +%s)}"

# Build JSON payload
TIMESTAMP=$(date +%s%3N)

PAYLOAD=$(cat <<EOF
{
  "source_app": "opencode",
  "session_id": "$SESSION_ID",
  "event_type": "$EVENT_TYPE",
  "event_category": "agent",
  "payload": {
    "agent_name": "$AGENT_NAME",
    "model": "$MODEL",
    "extra": "$EXTRA_DATA"
  },
  "timestamp": $TIMESTAMP
}
EOF
)

# Send to observability server
curl -s -X POST "$OBSERVABILITY_URL" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  --connect-timeout 2 \
  --max-time 5 \
  > /dev/null 2>&1 || true

# Export session ID for subsequent calls
export OPENCODE_SESSION_ID="$SESSION_ID"
echo "$SESSION_ID"
