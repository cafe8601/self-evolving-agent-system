#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# mdflow-workflows.sh
# MDFlow 워크플로우 개별 실행 스크립트
#
# 사용법:
#   ./scripts/mdflow-workflows.sh evolve "전체 학습 루프 작업"
#   ./scripts/mdflow-workflows.sh research "리서치 작업"
#   ./scripts/mdflow-workflows.sh build "빌드 작업"
#   ./scripts/mdflow-workflows.sh review "리뷰 작업"
# ═══════════════════════════════════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

show_help() {
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║              MDFlow 워크플로우 실행 도구                       ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo ""
    echo "사용법: $0 <workflow> \"작업 내용\""
    echo ""
    echo "워크플로우 목록:"
    echo "  evolve   - 전체 학습 루프 (RESEARCH→PLAN→BUILD→REVIEW→LEARN)"
    echo "  research - 리서치만 실행 (Gemini 3 Pro)"
    echo "  build    - 빌드만 실행 (GPT via Codex)"
    echo "  review   - 리뷰만 실행 (Claude Opus)"
    echo ""
    echo "예시:"
    echo "  $0 evolve \"JWT 인증 시스템 구현\""
    echo "  $0 research \"2024년 결제 보안 트렌드\""
    echo "  $0 build \"Next.js 결제 페이지 구현\""
    echo "  $0 review \"결제 로직 OWASP 점검\""
    exit 0
}

if [ -z "$1" ] || [ "$1" == "-h" ] || [ "$1" == "--help" ]; then
    show_help
fi

if [ -z "$2" ]; then
    echo "❌ 작업 내용을 입력하세요."
    echo "   사용법: $0 <workflow> \"작업 내용\""
    exit 1
fi

WORKFLOW_TYPE="$1"
TASK="$2"

case "$WORKFLOW_TYPE" in
    evolve|master|full)
        WORKFLOW=".mdflow/evolve.claude.md"
        EMOJI="🔄"
        DESC="전체 학습 루프"
        ;;
    research|gemini)
        WORKFLOW=".mdflow/research.gemini.md"
        EMOJI="🔍"
        DESC="리서치 워크플로우"
        ;;
    build|codex|gpt)
        WORKFLOW=".mdflow/build.codex.md"
        EMOJI="🔨"
        DESC="빌드 워크플로우"
        ;;
    review|claude)
        WORKFLOW=".mdflow/review.claude.md"
        EMOJI="✅"
        DESC="리뷰 워크플로우"
        ;;
    *)
        echo "❌ 알 수 없는 워크플로우: $WORKFLOW_TYPE"
        echo "   사용 가능: evolve, research, build, review"
        exit 1
        ;;
esac

# 워크플로우 파일 존재 확인
if [ ! -f "$WORKFLOW" ]; then
    echo "❌ 워크플로우 파일을 찾을 수 없습니다: $WORKFLOW"
    exit 1
fi

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║              $EMOJI $DESC                              "
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Task: $TASK"
echo "📂 Workflow: $WORKFLOW"
echo ""

echo "$TASK" | md "$WORKFLOW"

echo ""
echo "✅ 워크플로우 실행 완료!"
