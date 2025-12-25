#!/bin/bash
# Serena 세션 종료 시 컨텍스트 저장
# Stop Hook에서 호출됨

# 현재 세션 정보를 last_session_context로 저장
CONTEXT_SUMMARY="${CLAUDE_LAST_RESPONSE:-Session completed}"
TRUNCATED_SUMMARY="${CONTEXT_SUMMARY:0:500}"

mcp-cli call serena/write_memory "{\"name\": \"last_session_context\", \"content\": \"Last session: $(date -Iseconds). Summary: $TRUNCATED_SUMMARY\"}" 2>/dev/null || true

# 현재 세션 메모리 정리
mcp-cli call serena/delete_memory '{"name": "current_session"}' 2>/dev/null || true

echo "[SERENA] Session context saved"
