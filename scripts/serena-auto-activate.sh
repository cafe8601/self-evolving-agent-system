#!/bin/bash
# Serena 프로젝트 자동 활성화 및 세션 컨텍스트 저장
# SessionStart Hook에서 호출됨

PROJECT_NAME="self-evolving-agent-system"
PROJECT_PATH="/home/cafe99/agent-system-project/self-evolving-agent-system"
SESSION_ID=$(date +%Y%m%d_%H%M%S)

# Serena 프로젝트 활성화
mcp-cli call serena/activate_project "{\"project\": \"$PROJECT_NAME\"}" 2>/dev/null || true

# 이전 세션 컨텍스트가 있으면 로드
LAST_CONTEXT=$(mcp-cli call serena/read_memory '{"name": "last_session_context"}' 2>/dev/null | grep -v "Error" || echo "")

if [ -n "$LAST_CONTEXT" ]; then
    echo "[SERENA] Previous session context loaded"
fi

# 현재 세션 시작 기록
mcp-cli call serena/write_memory "{\"name\": \"current_session\", \"content\": \"Session started at $(date -Iseconds)\"}" 2>/dev/null || true

echo "[SERENA] Project '$PROJECT_NAME' activated, session $SESSION_ID started"
