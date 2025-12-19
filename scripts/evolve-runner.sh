#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Self-Evolving Agent System - Main Orchestrator
# 전체 자동화 파이프라인 실행 스크립트
# ═══════════════════════════════════════════════════════════════

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 프로젝트 루트
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BRAIN_FILE="$PROJECT_ROOT/.opencode/brain/project_brain.yaml"
LOG_DIR="$PROJECT_ROOT/.opencode/logs"
CONFIG_FILE="$PROJECT_ROOT/.opencode/automation-config.yaml"

# 로그 디렉토리 생성
mkdir -p "$LOG_DIR"

# 타임스탬프
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
LOG_FILE="$LOG_DIR/evolve_$TIMESTAMP.log"

# ═══════════════════════════════════════════════════════════════
# 유틸리티 함수
# ═══════════════════════════════════════════════════════════════

log() {
    local level=$1
    local message=$2
    local timestamp=$(date +"%Y-%m-%d %H:%M:%S")

    case $level in
        "INFO")  color=$GREEN ;;
        "WARN")  color=$YELLOW ;;
        "ERROR") color=$RED ;;
        "DEBUG") color=$CYAN ;;
        "BRAIN") color=$PURPLE ;;
        *)       color=$NC ;;
    esac

    echo -e "${color}[$timestamp][$level]${NC} $message" | tee -a "$LOG_FILE"
}

banner() {
    echo -e "${PURPLE}"
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║     🧠 Self-Evolving Agent System - Automation Runner        ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# ═══════════════════════════════════════════════════════════════
# Phase 1: Brain 로드 및 패턴 확인
# ═══════════════════════════════════════════════════════════════

load_brain() {
    log "BRAIN" "Loading project brain..."

    if [[ ! -f "$BRAIN_FILE" ]]; then
        log "ERROR" "Brain file not found: $BRAIN_FILE"
        return 1
    fi

    # 패턴 수 확인
    local pattern_count=$(grep -c "^  - id:" "$BRAIN_FILE" 2>/dev/null || echo "0")
    local success_count=$(grep -c "SUCCESS_PATTERN" "$BRAIN_FILE" 2>/dev/null || echo "0")
    local failure_count=$(grep -c "FAILURE_PATTERN" "$BRAIN_FILE" 2>/dev/null || echo "0")

    log "BRAIN" "Loaded patterns: $pattern_count (✅ $success_count success, ❌ $failure_count failure)"

    # 관련 패턴 검색 (태그 기반)
    if [[ -n "$TASK_TAGS" ]]; then
        log "BRAIN" "Searching relevant patterns for tags: $TASK_TAGS"
        for tag in $TASK_TAGS; do
            local matches=$(grep -A 10 "tags:" "$BRAIN_FILE" | grep -c "$tag" 2>/dev/null || echo "0")
            if [[ $matches -gt 0 ]]; then
                log "BRAIN" "  Found $matches pattern(s) with tag '$tag'"
            fi
        done
    fi

    return 0
}

# ═══════════════════════════════════════════════════════════════
# Phase 2: 작업 실행 (MDFlow / OpenCode / Claude)
# ═══════════════════════════════════════════════════════════════

execute_task() {
    local task="$1"
    local executor="$2"

    log "INFO" "Executing task with $executor..."
    log "INFO" "Task: $task"

    local start_time=$(date +%s)
    local result=0
    local output=""

    case $executor in
        "mdflow")
            # MDFlow 워크플로우 실행
            if command -v md &> /dev/null; then
                output=$(echo "$task" | md "$PROJECT_ROOT/.mdflow/evolve.claude.md" 2>&1) || result=$?
            else
                log "WARN" "MDFlow not found, falling back to claude"
                executor="claude"
            fi
            ;;
        "opencode")
            # OpenCode 에이전트 실행
            if command -v opencode &> /dev/null; then
                output=$(echo "$task" | opencode 2>&1) || result=$?
            else
                log "WARN" "OpenCode not found, falling back to claude"
                executor="claude"
            fi
            ;;
        "claude")
            # Claude Code 실행
            if command -v claude &> /dev/null; then
                output=$(echo "$task" | claude --print 2>&1) || result=$?
            else
                log "ERROR" "Claude not found"
                return 1
            fi
            ;;
        *)
            log "ERROR" "Unknown executor: $executor"
            return 1
            ;;
    esac

    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    # 결과 저장
    echo "$output" > "$LOG_DIR/task_output_$TIMESTAMP.txt"

    if [[ $result -eq 0 ]]; then
        log "INFO" "Task completed successfully in ${duration}s"
        TASK_RESULT="success"
    else
        log "ERROR" "Task failed with exit code $result"
        TASK_RESULT="failure"
    fi

    TASK_OUTPUT="$output"
    TASK_DURATION=$duration

    return $result
}

# ═══════════════════════════════════════════════════════════════
# Phase 3: 학습 및 패턴 추출
# ═══════════════════════════════════════════════════════════════

extract_and_learn() {
    log "BRAIN" "Analyzing task result for learning..."

    # 패턴 ID 생성
    local last_id=$(grep "id: \"LP-" "$BRAIN_FILE" | tail -1 | sed 's/.*LP-\([0-9]*\).*/\1/' 2>/dev/null || echo "0")
    local new_id=$(printf "LP-%03d" $((last_id + 1)))

    # 학습 스크립트 호출
    if [[ -f "$SCRIPT_DIR/auto-learn.sh" ]]; then
        "$SCRIPT_DIR/auto-learn.sh" \
            --id "$new_id" \
            --task "$TASK_DESCRIPTION" \
            --result "$TASK_RESULT" \
            --output "$LOG_DIR/task_output_$TIMESTAMP.txt" \
            --tags "$TASK_TAGS"
    else
        log "WARN" "Auto-learn script not found, skipping pattern extraction"
    fi

    # 메트릭 업데이트
    update_metrics
}

update_metrics() {
    log "BRAIN" "Updating brain metrics..."

    local timestamp=$(date -Iseconds)

    # workflow_history 업데이트 (sed 사용)
    if [[ "$TASK_RESULT" == "success" ]]; then
        # total_tasks 증가
        sed -i 's/total_tasks: \([0-9]*\)/total_tasks: \1/' "$BRAIN_FILE"
        # successful_tasks 증가
        sed -i 's/successful_tasks: \([0-9]*\)/successful_tasks: \1/' "$BRAIN_FILE"
    else
        sed -i 's/total_tasks: \([0-9]*\)/total_tasks: \1/' "$BRAIN_FILE"
        sed -i 's/failed_tasks: \([0-9]*\)/failed_tasks: \1/' "$BRAIN_FILE"
    fi

    # last_sync 업데이트
    sed -i "s/last_sync:.*/last_sync: \"$timestamp\"/" "$BRAIN_FILE"

    log "BRAIN" "Metrics updated at $timestamp"
}

# ═══════════════════════════════════════════════════════════════
# Phase 4: 보고서 생성
# ═══════════════════════════════════════════════════════════════

generate_report() {
    local report_file="$LOG_DIR/report_$TIMESTAMP.md"

    cat > "$report_file" << EOF
# Evolution Cycle Report

**Timestamp**: $TIMESTAMP
**Duration**: ${TASK_DURATION}s
**Result**: $TASK_RESULT

## Task
\`\`\`
$TASK_DESCRIPTION
\`\`\`

## Executor
$EXECUTOR

## Patterns Applied
$PATTERNS_APPLIED

## New Patterns Learned
$PATTERNS_LEARNED

## Metrics After
- Total Tasks: $(grep "total_tasks:" "$BRAIN_FILE" | head -1 | awk '{print $2}')
- Success Rate: $(grep "success_rate:" "$BRAIN_FILE" | head -1 | awk '{print $2}')

---
*Generated by Self-Evolving Agent System*
EOF

    log "INFO" "Report generated: $report_file"
}

# ═══════════════════════════════════════════════════════════════
# 메인 실행
# ═══════════════════════════════════════════════════════════════

main() {
    banner

    # 인자 파싱
    TASK_DESCRIPTION=""
    EXECUTOR="claude"
    TASK_TAGS=""
    AUTO_LEARN=true

    while [[ $# -gt 0 ]]; do
        case $1 in
            -t|--task)
                TASK_DESCRIPTION="$2"
                shift 2
                ;;
            -e|--executor)
                EXECUTOR="$2"
                shift 2
                ;;
            --tags)
                TASK_TAGS="$2"
                shift 2
                ;;
            --no-learn)
                AUTO_LEARN=false
                shift
                ;;
            -h|--help)
                echo "Usage: $0 -t <task> [-e <executor>] [--tags <tags>] [--no-learn]"
                echo ""
                echo "Options:"
                echo "  -t, --task      Task description (required)"
                echo "  -e, --executor  Executor: mdflow|opencode|claude (default: claude)"
                echo "  --tags          Comma-separated tags for pattern matching"
                echo "  --no-learn      Skip automatic learning"
                exit 0
                ;;
            *)
                TASK_DESCRIPTION="$1"
                shift
                ;;
        esac
    done

    if [[ -z "$TASK_DESCRIPTION" ]]; then
        log "ERROR" "Task description required. Use -t or --task"
        exit 1
    fi

    log "INFO" "Starting evolution cycle..."
    log "INFO" "Task: $TASK_DESCRIPTION"
    log "INFO" "Executor: $EXECUTOR"

    # Phase 1: Brain 로드
    load_brain || exit 1

    # Phase 2: 작업 실행
    execute_task "$TASK_DESCRIPTION" "$EXECUTOR"
    local task_exit=$?

    # Phase 3: 학습 (옵션)
    if [[ "$AUTO_LEARN" == true ]]; then
        extract_and_learn
    fi

    # Phase 4: 보고서
    generate_report

    log "INFO" "Evolution cycle completed!"

    return $task_exit
}

# 스크립트 실행
main "$@"
