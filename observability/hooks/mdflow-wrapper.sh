#!/bin/bash
# MDFlow Workflow Observability Wrapper
# Sends workflow events to observability server

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"
OBSERVABILITY_URL="${OBSERVABILITY_URL:-http://localhost:4100/events}"

EVENT_TYPE="${1:-WorkflowStart}"
WORKFLOW_NAME="${2:-unknown}"
PHASE_NAME="${3:-}"
EXTRA_DATA="${4:-}"

# Generate session ID based on timestamp
SESSION_ID="${MDFLOW_SESSION_ID:-mdflow-$(date +%s)}"

# Build JSON payload
TIMESTAMP=$(date +%s%3N)

if [ -n "$PHASE_NAME" ]; then
  PAYLOAD=$(cat <<EOF
{
  "source_app": "mdflow",
  "session_id": "$SESSION_ID",
  "event_type": "$EVENT_TYPE",
  "event_category": "workflow",
  "payload": {
    "workflow_name": "$WORKFLOW_NAME",
    "phase_name": "$PHASE_NAME",
    "extra": "$EXTRA_DATA"
  },
  "timestamp": $TIMESTAMP
}
EOF
)
else
  PAYLOAD=$(cat <<EOF
{
  "source_app": "mdflow",
  "session_id": "$SESSION_ID",
  "event_type": "$EVENT_TYPE",
  "event_category": "workflow",
  "payload": {
    "workflow_name": "$WORKFLOW_NAME",
    "extra": "$EXTRA_DATA"
  },
  "timestamp": $TIMESTAMP
}
EOF
)
fi

# Send to observability server
curl -s -X POST "$OBSERVABILITY_URL" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  --connect-timeout 2 \
  --max-time 5 \
  > /dev/null 2>&1 || true

# Export session ID for subsequent calls
export MDFLOW_SESSION_ID="$SESSION_ID"
echo "$SESSION_ID"
