#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# opencode-agents.sh
# OpenCode 에이전트 개별 실행 스크립트
#
# 사용법:
#   ./scripts/opencode-agents.sh omo "작업 내용"
#   ./scripts/opencode-agents.sh research "조사할 내용"
#   ./scripts/opencode-agents.sh build "구현할 내용"
#   ./scripts/opencode-agents.sh review "리뷰할 내용"
# ═══════════════════════════════════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

show_help() {
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║              OpenCode 에이전트 실행 도구                       ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo ""
    echo "사용법: $0 <agent> \"작업 내용\""
    echo ""
    echo "에이전트 목록:"
    echo "  plan      - 플래너 (계획 수립, 아키텍처 설계)"
    echo "  explore   - 탐색 전문가 (코드베이스 분석)"
    echo "  build     - 코드 빌더 (코드 작성)"
    echo "  general   - 일반 에이전트 (리뷰, 질문 답변)"
    echo ""
    echo "예시:"
    echo "  $0 plan \"JWT 인증 시스템 설계\""
    echo "  $0 explore \"인증 관련 코드 찾기\""
    echo "  $0 build \"Prisma User 모델 구현\""
    echo "  $0 general \"결제 로직 보안 점검\""
    exit 0
}

if [ -z "$1" ] || [ "$1" == "-h" ] || [ "$1" == "--help" ]; then
    show_help
fi

if [ -z "$2" ]; then
    echo "❌ 작업 내용을 입력하세요."
    echo "   사용법: $0 <agent> \"작업 내용\""
    exit 1
fi

AGENT_TYPE="$1"
TASK="$2"

case "$AGENT_TYPE" in
    omo|OmO|master|plan)
        AGENT="plan"
        EMOJI="🧠"
        DESC="플래너 (계획 수립)"
        ;;
    research|researcher|explore)
        AGENT="explore"
        EMOJI="🔍"
        DESC="탐색 전문가"
        ;;
    build|builder|main-builder)
        AGENT="build"
        EMOJI="🔨"
        DESC="코드 빌더"
        ;;
    review|oracle|reviewer|general)
        AGENT="general"
        EMOJI="✅"
        DESC="일반 에이전트"
        ;;
    *)
        echo "❌ 알 수 없는 에이전트: $AGENT_TYPE"
        echo "   사용 가능: omo, research, build, review"
        exit 1
        ;;
esac

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║              $EMOJI $DESC ($AGENT)                    "
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Task: $TASK"
echo ""

opencode run --agent "$AGENT" "$TASK"

echo ""
echo "✅ 에이전트 실행 완료!"
