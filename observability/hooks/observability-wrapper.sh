#!/bin/bash
# Observability Wrapper Script
# Wraps hook execution and sends events to observability server
#
# Usage: ./observability-wrapper.sh <source> <event_type> [--summarize]

SOURCE="${1:-claude-code}"
EVENT_TYPE="${2:-Unknown}"
SUMMARIZE="${3:-}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"
OBSERVABILITY_URL="${OBSERVABILITY_URL:-http://localhost:4100/events}"

# Read JSON input from stdin
INPUT=$(cat)

# Prepare extra args
EXTRA_ARGS=""
if [ "$SUMMARIZE" = "--summarize" ]; then
  EXTRA_ARGS="--summarize"
fi

# Send to observability server using Bun
cd "$PROJECT_DIR"
echo "$INPUT" | bun run observability/hooks/send-event.ts \
  --source "$SOURCE" \
  --type "$EVENT_TYPE" \
  $EXTRA_ARGS 2>/dev/null || true

# Always exit successfully
exit 0
