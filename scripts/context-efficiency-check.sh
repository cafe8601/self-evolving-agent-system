#!/bin/bash
# 컨텍스트 사용량 체크 및 --uc 모드 권장
# UserPromptSubmit Hook에서 호출 가능

# context-bar.sh의 출력에서 컨텍스트 비율 추출
CONTEXT_BAR_OUTPUT=$("$HOME/.claude/scripts/context-bar.sh" 2>/dev/null || echo "")

# 컨텍스트 비율 추출 (예: "45%" -> 45)
CONTEXT_PERCENT=$(echo "$CONTEXT_BAR_OUTPUT" | grep -oP '\d+(?=%)' | head -1 || echo "0")

# 75% 이상이면 토큰 효율 모드 권장 메시지 출력
if [ "$CONTEXT_PERCENT" -ge 75 ]; then
    echo ""
    echo "⚠️ [TOKEN-EFFICIENCY] Context usage: ${CONTEXT_PERCENT}%"
    echo "   Recommend: Use --uc flag or symbol compression"
    echo "   Auto-activating Token Efficiency Mode patterns"

    # Brain에 토큰 효율 모드 활성화 기록
    echo "[UC-MODE] $(date -Iseconds) Context at ${CONTEXT_PERCENT}% - efficiency mode recommended" >> /home/cafe99/agent-system-project/self-evolving-agent-system/.opencode/brain/efficiency.log 2>/dev/null || true
fi

# 85% 이상이면 강력 경고
if [ "$CONTEXT_PERCENT" -ge 85 ]; then
    echo ""
    echo "🚨 [CRITICAL] Context usage: ${CONTEXT_PERCENT}%"
    echo "   Essential operations only. Consider summarizing."
fi
