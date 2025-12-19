#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# learn-wrapper.sh
# 터미널 명령어 실행 후 자동 학습 기록 래퍼
#
# 사용법:
#   ./scripts/learn-wrapper.sh opencode build "Prisma User 모델 구현"
#   ./scripts/learn-wrapper.sh mdflow research "결제 보안 트렌드 조사"
#
# 이 스크립트는:
#   1. 지정된 스크립트 실행
#   2. 실행 결과를 capture-learning.ts로 기록
#   3. (선택) 즉시 brain에 병합
# ═══════════════════════════════════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

show_help() {
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║          🧠 학습 래퍼 - 터미널 작업 자동 기록                  ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo ""
    echo "사용법: $0 <script_type> <agent/workflow> \"작업 내용\" [--sync]"
    echo ""
    echo "스크립트 타입:"
    echo "  opencode  - OpenCode 에이전트 실행 (opencode-agents.sh)"
    echo "  mdflow    - MDFlow 워크플로우 실행 (mdflow-workflows.sh)"
    echo ""
    echo "옵션:"
    echo "  --sync    작업 완료 후 즉시 brain에 병합"
    echo ""
    echo "예시:"
    echo "  $0 opencode build \"Prisma User 모델 구현\""
    echo "  $0 mdflow research \"결제 보안 트렌드\" --sync"
    echo "  $0 opencode plan \"JWT 인증 설계\" --sync"
    echo ""
    exit 0
}

if [ -z "$1" ] || [ "$1" == "-h" ] || [ "$1" == "--help" ]; then
    show_help
fi

if [ -z "$2" ] || [ -z "$3" ]; then
    echo -e "${RED}❌ 인자가 부족합니다.${NC}"
    echo "   사용법: $0 <script_type> <agent/workflow> \"작업 내용\""
    exit 1
fi

SCRIPT_TYPE="$1"
AGENT_OR_WORKFLOW="$2"
TASK="$3"
SYNC_NOW=false

# --sync 옵션 확인
if [ "$4" == "--sync" ]; then
    SYNC_NOW=true
fi

# 스크립트 선택
case "$SCRIPT_TYPE" in
    opencode)
        SCRIPT="./scripts/opencode-agents.sh"
        CONTEXT="OpenCode $AGENT_OR_WORKFLOW"
        TAGS="opencode,$AGENT_OR_WORKFLOW,terminal"
        ;;
    mdflow)
        SCRIPT="./scripts/mdflow-workflows.sh"
        CONTEXT="MDFlow $AGENT_OR_WORKFLOW"
        TAGS="mdflow,$AGENT_OR_WORKFLOW,terminal"
        ;;
    *)
        echo -e "${RED}❌ 알 수 없는 스크립트 타입: $SCRIPT_TYPE${NC}"
        echo "   사용 가능: opencode, mdflow"
        exit 1
        ;;
esac

# 스크립트 존재 확인
if [ ! -f "$SCRIPT" ]; then
    echo -e "${RED}❌ 스크립트를 찾을 수 없습니다: $SCRIPT${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          🧠 학습 래퍼 - 자동 기록 모드                        ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "📋 Task: ${YELLOW}$TASK${NC}"
echo -e "🔧 Script: $SCRIPT $AGENT_OR_WORKFLOW"
echo -e "🏷️  Tags: $TAGS"
echo ""

# 시작 시간 기록
START_TIME=$(date +%s)

# 실제 스크립트 실행
echo -e "${BLUE}━━━ 작업 실행 중 ━━━${NC}"
"$SCRIPT" "$AGENT_OR_WORKFLOW" "$TASK"
EXIT_CODE=$?

# 종료 시간 및 소요 시간 계산
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo ""
echo -e "${BLUE}━━━ 학습 기록 중 ━━━${NC}"

# 결과에 따라 학습 기록
if [ $EXIT_CODE -eq 0 ]; then
    LEARN_TYPE="success"
    LEARN_CONTENT="$CONTEXT 작업 완료: $TASK (소요시간: ${DURATION}초)"
    echo -e "${GREEN}✅ 작업 성공 - 성공 패턴 기록${NC}"
else
    LEARN_TYPE="failure"
    LEARN_CONTENT="$CONTEXT 작업 실패: $TASK (종료코드: $EXIT_CODE)"
    echo -e "${RED}❌ 작업 실패 - 실패 패턴 기록${NC}"
fi

# capture-learning.ts 호출
npx tsx scripts/capture-learning.ts "$LEARN_TYPE" "$CONTEXT" "$LEARN_CONTENT" --tags "$TAGS"

# 즉시 병합 옵션
if [ "$SYNC_NOW" = true ]; then
    echo ""
    echo -e "${BLUE}━━━ Brain 동기화 중 ━━━${NC}"
    npx tsx scripts/sync-brain.ts
fi

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          🎉 학습 래퍼 완료!                                   ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "📊 소요시간: ${DURATION}초"
echo -e "📝 학습 타입: $LEARN_TYPE"
echo -e "💾 저장 위치: .opencode/brain/pending_patterns.yaml"

if [ "$SYNC_NOW" = true ]; then
    echo -e "🔄 Brain 동기화: ${GREEN}완료${NC}"
else
    echo -e "💡 Brain 병합: ${YELLOW}npx tsx scripts/sync-brain.ts${NC} 또는 세션 종료 시 자동"
fi
echo ""
