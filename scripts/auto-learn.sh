#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Auto-Learn Script - 자동 패턴 추출 및 Brain 업데이트
# ═══════════════════════════════════════════════════════════════

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BRAIN_FILE="$PROJECT_ROOT/.opencode/brain/project_brain.yaml"
PATTERNS_DIR="$PROJECT_ROOT/.opencode/brain/patterns"
LOG_DIR="$PROJECT_ROOT/.opencode/logs"

# 색상
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
NC='\033[0m'

mkdir -p "$LOG_DIR"
mkdir -p "$PATTERNS_DIR/success"
mkdir -p "$PATTERNS_DIR/failure"

log() {
    echo -e "${PURPLE}[AUTO-LEARN]${NC} $1"
}

# ═══════════════════════════════════════════════════════════════
# 인자 파싱
# ═══════════════════════════════════════════════════════════════

PATTERN_ID=""
TASK_DESCRIPTION=""
TASK_RESULT="success"
OUTPUT_FILE=""
TAGS=""
COMMIT_HASH=""
COMMIT_MESSAGE=""
CHANGED_FILES=""
CONFIDENCE=0.8

while [[ $# -gt 0 ]]; do
    case $1 in
        --id)
            PATTERN_ID="$2"
            shift 2
            ;;
        --task)
            TASK_DESCRIPTION="$2"
            shift 2
            ;;
        --result)
            TASK_RESULT="$2"
            shift 2
            ;;
        --output)
            OUTPUT_FILE="$2"
            shift 2
            ;;
        --tags)
            TAGS="$2"
            shift 2
            ;;
        --commit)
            COMMIT_HASH="$2"
            shift 2
            ;;
        --message)
            COMMIT_MESSAGE="$2"
            shift 2
            ;;
        --files)
            CHANGED_FILES="$2"
            shift 2
            ;;
        --confidence)
            CONFIDENCE="$2"
            shift 2
            ;;
        *)
            shift
            ;;
    esac
done

# ═══════════════════════════════════════════════════════════════
# 패턴 ID 생성
# ═══════════════════════════════════════════════════════════════

generate_pattern_id() {
    local last_id=$(grep "id: \"LP-" "$BRAIN_FILE" 2>/dev/null | tail -1 | sed 's/.*LP-\([0-9]*\).*/\1/' || echo "0")
    local new_num=$((last_id + 1))
    printf "LP-%03d" $new_num
}

if [[ -z "$PATTERN_ID" ]]; then
    PATTERN_ID=$(generate_pattern_id)
fi

log "Pattern ID: $PATTERN_ID"

# ═══════════════════════════════════════════════════════════════
# 컨텍스트 분석 및 패턴 추출
# ═══════════════════════════════════════════════════════════════

analyze_context() {
    local context=""

    # 커밋 기반 분석
    if [[ -n "$COMMIT_MESSAGE" ]]; then
        context="Git Commit: $COMMIT_MESSAGE"

        # 커밋 메시지에서 컨텍스트 추출
        if [[ "$COMMIT_MESSAGE" == *"fix"* ]]; then
            context="버그 수정: ${COMMIT_MESSAGE#*fix}"
        elif [[ "$COMMIT_MESSAGE" == *"feat"* ]]; then
            context="기능 추가: ${COMMIT_MESSAGE#*feat}"
        elif [[ "$COMMIT_MESSAGE" == *"refactor"* ]]; then
            context="코드 리팩토링: ${COMMIT_MESSAGE#*refactor}"
        fi
    fi

    # 작업 설명 기반
    if [[ -n "$TASK_DESCRIPTION" ]]; then
        context="$TASK_DESCRIPTION"
    fi

    # 기본값
    if [[ -z "$context" ]]; then
        context="Auto-detected change at $(date)"
    fi

    echo "$context"
}

extract_content() {
    local content=""

    # 출력 파일에서 핵심 내용 추출
    if [[ -f "$OUTPUT_FILE" ]]; then
        # 오류 메시지 추출 (실패 시)
        if [[ "$TASK_RESULT" == "failure" ]]; then
            content=$(grep -i "error\|fail\|exception" "$OUTPUT_FILE" | head -5)
        else
            # 성공 시 요약 추출
            content=$(tail -20 "$OUTPUT_FILE" | head -10)
        fi
    fi

    # 커밋 정보에서 추출
    if [[ -n "$CHANGED_FILES" ]] && [[ -z "$content" ]]; then
        local file_count=$(echo "$CHANGED_FILES" | wc -w)
        content="Changed $file_count file(s): $(echo $CHANGED_FILES | tr '\n' ', ' | head -c 100)"
    fi

    # 기본값
    if [[ -z "$content" ]]; then
        content="Automatically recorded pattern from system activity"
    fi

    echo "$content"
}

extract_tags() {
    local tags_array=()

    # 전달된 태그
    if [[ -n "$TAGS" ]]; then
        IFS=',' read -ra ADDR <<< "$TAGS"
        for tag in "${ADDR[@]}"; do
            tags_array+=("$(echo $tag | xargs)")
        done
    fi

    # 파일에서 태그 추출
    if [[ -n "$CHANGED_FILES" ]]; then
        for file in $CHANGED_FILES; do
            case "$file" in
                *auth*) tags_array+=("authentication") ;;
                *api*) tags_array+=("api") ;;
                *test*) tags_array+=("testing") ;;
                *config*) tags_array+=("configuration") ;;
                *db*|*database*) tags_array+=("database") ;;
                *ui*|*component*) tags_array+=("ui") ;;
            esac
        done
    fi

    # 중복 제거
    printf '%s\n' "${tags_array[@]}" | sort -u | tr '\n' ' '
}

extract_related_files() {
    if [[ -n "$CHANGED_FILES" ]]; then
        echo "$CHANGED_FILES" | head -5 | tr '\n' ' '
    else
        echo ""
    fi
}

# ═══════════════════════════════════════════════════════════════
# 패턴 생성 및 저장
# ═══════════════════════════════════════════════════════════════

create_pattern() {
    local context=$(analyze_context)
    local content=$(extract_content)
    local tags=$(extract_tags)
    local related_files=$(extract_related_files)
    local timestamp=$(date -Iseconds)
    local status="SUCCESS_PATTERN"

    if [[ "$TASK_RESULT" == "failure" ]]; then
        status="FAILURE_PATTERN"
    fi

    log "Creating pattern: $status"
    log "Context: $context"

    # 상세 패턴 파일 생성
    local pattern_dir="$PATTERNS_DIR/success"
    if [[ "$status" == "FAILURE_PATTERN" ]]; then
        pattern_dir="$PATTERNS_DIR/failure"
    fi

    local pattern_file="$pattern_dir/${PATTERN_ID}-$(echo "$context" | tr ' ' '-' | tr -cd '[:alnum:]-' | head -c 30).md"

    cat > "$pattern_file" << EOF
# Pattern: $PATTERN_ID

## Metadata
- **ID**: $PATTERN_ID
- **Status**: $status
- **Learned At**: $timestamp
- **Confidence**: $CONFIDENCE

## Context
$context

## Content
$content

## Tags
$(for tag in $tags; do echo "- $tag"; done)

## Related Files
$(for file in $related_files; do echo "- $file"; done)

## Commit Info
$(if [[ -n "$COMMIT_HASH" ]]; then echo "- Hash: $COMMIT_HASH"; fi)
$(if [[ -n "$COMMIT_MESSAGE" ]]; then echo "- Message: $COMMIT_MESSAGE"; fi)
EOF

    log "Pattern file created: $pattern_file"

    # Brain 파일에 패턴 추가
    add_to_brain "$PATTERN_ID" "$context" "$status" "$content" "$tags" "$related_files" "$timestamp"
}

add_to_brain() {
    local id="$1"
    local context="$2"
    local status="$3"
    local content="$4"
    local tags="$5"
    local related_files="$6"
    local timestamp="$7"

    log "Adding pattern to brain..."

    # YAML 형식으로 패턴 생성
    local pattern_yaml=$(cat << EOF

  - id: "$id"
    context: "$context"
    status: "$status"
    content: |
      $content
    learned_at: "$timestamp"
    confidence: $CONFIDENCE
    tags:
$(for tag in $tags; do echo "      - $tag"; done)
    related_files:
$(for file in $related_files; do echo "      - \"$file\""; done)
EOF
)

    # learned_patterns 섹션 끝에 추가
    # 마지막 패턴 다음에 새 패턴 추가
    local insert_line=$(grep -n "^skill_integration:" "$BRAIN_FILE" | head -1 | cut -d: -f1)

    if [[ -n "$insert_line" ]]; then
        insert_line=$((insert_line - 1))
        head -n "$insert_line" "$BRAIN_FILE" > "$BRAIN_FILE.tmp"
        echo "$pattern_yaml" >> "$BRAIN_FILE.tmp"
        tail -n +$((insert_line + 1)) "$BRAIN_FILE" >> "$BRAIN_FILE.tmp"
        mv "$BRAIN_FILE.tmp" "$BRAIN_FILE"
    else
        # 파일 끝에 추가
        echo "$pattern_yaml" >> "$BRAIN_FILE"
    fi

    # 메트릭 업데이트
    update_brain_metrics
}

update_brain_metrics() {
    log "Updating brain metrics..."

    # patterns_learned 증가
    local current=$(grep "patterns_learned:" "$BRAIN_FILE" | head -1 | awk '{print $2}')
    local new=$((current + 1))
    sed -i "s/patterns_learned: $current/patterns_learned: $new/" "$BRAIN_FILE"

    # by_status 업데이트
    if [[ "$TASK_RESULT" == "failure" ]]; then
        current=$(grep "failure_patterns:" "$BRAIN_FILE" | head -1 | awk '{print $2}')
        new=$((current + 1))
        sed -i "s/failure_patterns: $current/failure_patterns: $new/" "$BRAIN_FILE"
    else
        current=$(grep "success_patterns:" "$BRAIN_FILE" | head -1 | awk '{print $2}')
        new=$((current + 1))
        sed -i "s/success_patterns: $current/success_patterns: $new/" "$BRAIN_FILE"
    fi

    # confidence_average 재계산 (간단히 현재값과 새값의 평균)
    local avg=$(grep "confidence_average:" "$BRAIN_FILE" | head -1 | awk '{print $2}')
    local new_avg=$(echo "scale=3; ($avg + $CONFIDENCE) / 2" | bc)
    sed -i "s/confidence_average: $avg/confidence_average: $new_avg/" "$BRAIN_FILE"

    log "Metrics updated: patterns=$new, confidence=$new_avg"
}

# ═══════════════════════════════════════════════════════════════
# AI 기반 패턴 분석 (선택적)
# ═══════════════════════════════════════════════════════════════

ai_analyze_pattern() {
    # Claude를 사용한 고급 패턴 분석 (선택적)
    if command -v claude &> /dev/null && [[ -f "$OUTPUT_FILE" ]]; then
        log "Running AI analysis..."

        local prompt="Analyze this task output and extract a learning pattern:

Task: $TASK_DESCRIPTION
Result: $TASK_RESULT
Files: $CHANGED_FILES

Output (last 50 lines):
$(tail -50 "$OUTPUT_FILE" 2>/dev/null || echo "No output")

Provide:
1. Key insight (1-2 sentences)
2. Recommended pattern type (SUCCESS or FAILURE)
3. Confidence score (0.0-1.0)
4. Tags (comma-separated)

Format as YAML."

        local ai_response=$(echo "$prompt" | claude --print 2>/dev/null || echo "")

        if [[ -n "$ai_response" ]]; then
            log "AI analysis complete"
            # AI 응답을 로그에 저장
            echo "$ai_response" > "$LOG_DIR/ai_analysis_${PATTERN_ID}.yaml"
        fi
    fi
}

# ═══════════════════════════════════════════════════════════════
# 메인 실행
# ═══════════════════════════════════════════════════════════════

main() {
    log "Starting auto-learning process..."

    # Brain 파일 존재 확인
    if [[ ! -f "$BRAIN_FILE" ]]; then
        log "Error: Brain file not found: $BRAIN_FILE"
        exit 1
    fi

    # 패턴 생성
    create_pattern

    # AI 분석 (선택적)
    # ai_analyze_pattern

    log "Auto-learning complete!"
    log "New pattern: $PATTERN_ID"
}

main
