#!/bin/bash
# PostToolUse Hook Wrapper
# stdin에서 JSON을 읽어 superclaude-hook.ts에 전달

# 프로젝트 디렉토리
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# stdin에서 JSON 읽기
input=$(cat)

# 결과 상태 (성공/실패)
RESULT="${1:-success}"

# 작업 디렉토리로 이동
cd "$PROJECT_DIR" || exit 0

# JSON을 TypeScript 스크립트에 전달
echo "$input" | SC_RESULT="$RESULT" npx tsx scripts/superclaude-hook.ts 2>&1 || true

exit 0
