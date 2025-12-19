#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# run-pipeline.sh
# 에이전트 체인 파이프라인 (RESEARCH → BUILD → REVIEW → LEARN)
#
# 사용법: ./scripts/run-pipeline.sh "작업 내용"
# 예시:   ./scripts/run-pipeline.sh "실시간 재고 동기화 구현 방법 조사"
# ═══════════════════════════════════════════════════════════════════

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

if [ -z "$1" ]; then
    echo "❌ 사용법: $0 \"작업 내용\""
    echo "   예시: $0 \"실시간 재고 동기화 구현 방법 조사\""
    exit 1
fi

TASK="$1"

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║              에이전트 체인 파이프라인 실행                     ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Task: $TASK"
echo ""

# ─────────────────────────────────────────────────────────────────
# RESEARCH PHASE (Gemini 3 Pro)
# ─────────────────────────────────────────────────────────────────
echo "=== 🔍 RESEARCH PHASE (Gemini) ==="
opencode run -m google/gemini-2.0-flash-exp "리서치: $TASK. 최신 기술 동향, 구현 방법, 베스트 프랙티스를 조사해주세요." > /tmp/research_output.txt 2>&1 || true
echo "리서치 결과 저장: /tmp/research_output.txt"
head -50 /tmp/research_output.txt
echo ""

# ─────────────────────────────────────────────────────────────────
# BUILD PHASE (OpenAI)
# ─────────────────────────────────────────────────────────────────
echo "=== 🔨 BUILD PHASE (OpenAI) ==="
RESEARCH_CONTEXT=$(cat /tmp/research_output.txt | head -100)
opencode run -m openai/gpt-4o "다음 리서치 기반으로 구현: $RESEARCH_CONTEXT" > /tmp/build_output.txt 2>&1 || true
echo "빌드 결과 저장: /tmp/build_output.txt"
head -50 /tmp/build_output.txt
echo ""

# ─────────────────────────────────────────────────────────────────
# REVIEW PHASE (Claude)
# ─────────────────────────────────────────────────────────────────
echo "=== ✅ REVIEW PHASE (Claude) ==="
opencode run -m anthropic/claude-sonnet-4-20250514 "구현된 코드 리뷰 및 개선점 제안: $(cat /tmp/build_output.txt | head -100)" > /tmp/review_output.txt 2>&1 || true
echo "리뷰 결과 저장: /tmp/review_output.txt"
head -50 /tmp/review_output.txt
echo ""

# ─────────────────────────────────────────────────────────────────
# LEARN PHASE
# ─────────────────────────────────────────────────────────────────
echo "=== 📚 LEARN PHASE ==="
npm run learn:success "Pipeline Task" "$TASK - 파이프라인 완료" 2>/dev/null || echo "학습 기록 스킵"

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                    ✅ 파이프라인 완료!                         ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "📁 결과 파일:"
echo "   - /tmp/research_output.txt"
echo "   - /tmp/build_output.txt"
echo "   - /tmp/review_output.txt"
