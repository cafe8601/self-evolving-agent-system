#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# File Watcher Daemon - 파일 변경 감시 및 자동 처리
# ═══════════════════════════════════════════════════════════════

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPTS_DIR="$PROJECT_ROOT/scripts"
CONFIG_FILE="$PROJECT_ROOT/.opencode/automation-config.yaml"
LOG_DIR="$PROJECT_ROOT/.opencode/logs"
PID_FILE="$PROJECT_ROOT/.opencode/watcher.pid"

# 색상
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

mkdir -p "$LOG_DIR"

log() {
    echo -e "${CYAN}[$(date +%H:%M:%S)]${NC} $1"
}

# ═══════════════════════════════════════════════════════════════
# 설정 로드
# ═══════════════════════════════════════════════════════════════

# 기본 설정
WATCH_PATHS="src lib app components"
WATCH_EXTENSIONS="ts,tsx,js,jsx,py,md"
DEBOUNCE_SECONDS=3
AUTO_RUN_TESTS=false
AUTO_RUN_LINT=false
AUTO_TRIGGER_EVOLVE=true
EXCLUDE_PATTERNS="node_modules,.git,dist,build,__pycache__"

# 설정 파일에서 로드
if [[ -f "$CONFIG_FILE" ]]; then
    WATCH_PATHS=$(grep "watch_paths:" "$CONFIG_FILE" | cut -d'"' -f2 2>/dev/null || echo "$WATCH_PATHS")
    WATCH_EXTENSIONS=$(grep "watch_extensions:" "$CONFIG_FILE" | cut -d'"' -f2 2>/dev/null || echo "$WATCH_EXTENSIONS")
    DEBOUNCE_SECONDS=$(grep "debounce_seconds:" "$CONFIG_FILE" | awk '{print $2}' 2>/dev/null || echo "$DEBOUNCE_SECONDS")
fi

# ═══════════════════════════════════════════════════════════════
# 데몬 제어
# ═══════════════════════════════════════════════════════════════

start_daemon() {
    if [[ -f "$PID_FILE" ]]; then
        local old_pid=$(cat "$PID_FILE")
        if ps -p "$old_pid" > /dev/null 2>&1; then
            echo -e "${YELLOW}Watcher already running (PID: $old_pid)${NC}"
            exit 1
        fi
    fi

    echo -e "${GREEN}Starting file watcher daemon...${NC}"
    nohup "$0" --watch > "$LOG_DIR/watcher.log" 2>&1 &
    echo $! > "$PID_FILE"
    echo -e "${GREEN}Watcher started (PID: $!)${NC}"
}

stop_daemon() {
    if [[ -f "$PID_FILE" ]]; then
        local pid=$(cat "$PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            echo -e "${YELLOW}Stopping watcher (PID: $pid)...${NC}"
            kill "$pid"
            rm -f "$PID_FILE"
            echo -e "${GREEN}Watcher stopped${NC}"
        else
            echo -e "${YELLOW}Watcher not running${NC}"
            rm -f "$PID_FILE"
        fi
    else
        echo -e "${YELLOW}No PID file found${NC}"
    fi
}

status_daemon() {
    if [[ -f "$PID_FILE" ]]; then
        local pid=$(cat "$PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            echo -e "${GREEN}Watcher running (PID: $pid)${NC}"
            echo "Log file: $LOG_DIR/watcher.log"
        else
            echo -e "${RED}Watcher not running (stale PID file)${NC}"
        fi
    else
        echo -e "${YELLOW}Watcher not running${NC}"
    fi
}

# ═══════════════════════════════════════════════════════════════
# 파일 변경 처리
# ═══════════════════════════════════════════════════════════════

handle_change() {
    local file="$1"
    local event="$2"

    log "Change detected: $file ($event)"

    # 파일 확장자 체크
    local ext="${file##*.}"
    if [[ ! "$WATCH_EXTENSIONS" == *"$ext"* ]]; then
        return
    fi

    # 태그 추출
    local tags=""
    case "$ext" in
        ts|tsx|js|jsx) tags="javascript typescript" ;;
        py) tags="python" ;;
        md) tags="documentation" ;;
    esac

    # 파일 경로에서 추가 태그
    if [[ "$file" == *"test"* ]]; then
        tags="$tags testing"
    fi
    if [[ "$file" == *"auth"* ]]; then
        tags="$tags authentication"
    fi
    if [[ "$file" == *"api"* ]]; then
        tags="$tags api"
    fi

    # 자동 처리 트리거
    local timestamp=$(date +"%Y-%m-%d_%H-%M-%S")

    # 변경 로그 기록
    cat >> "$LOG_DIR/changes.jsonl" << EOF
{"timestamp":"$(date -Iseconds)","file":"$file","event":"$event","tags":"$tags"}
EOF

    # 자동 lint 실행
    if [[ "$AUTO_RUN_LINT" == "true" ]]; then
        case "$ext" in
            ts|tsx|js|jsx)
                if command -v eslint &> /dev/null; then
                    log "Running ESLint on $file..."
                    eslint "$PROJECT_ROOT/$file" --fix 2>/dev/null || true
                fi
                ;;
            py)
                if command -v ruff &> /dev/null; then
                    log "Running Ruff on $file..."
                    ruff check "$PROJECT_ROOT/$file" --fix 2>/dev/null || true
                fi
                ;;
        esac
    fi

    # 자동 테스트 실행
    if [[ "$AUTO_RUN_TESTS" == "true" ]]; then
        local test_file=""
        case "$ext" in
            ts|tsx|js|jsx)
                test_file="${file%.${ext}}.test.${ext}"
                if [[ -f "$PROJECT_ROOT/$test_file" ]]; then
                    log "Running tests for $file..."
                    npm test -- --testPathPattern="$test_file" 2>/dev/null || true
                fi
                ;;
            py)
                test_file="test_${file##*/}"
                if [[ -f "$PROJECT_ROOT/tests/$test_file" ]]; then
                    log "Running pytest for $file..."
                    pytest "$PROJECT_ROOT/tests/$test_file" 2>/dev/null || true
                fi
                ;;
        esac
    fi

    # evolve-runner 트리거 (중요 변경 시)
    if [[ "$AUTO_TRIGGER_EVOLVE" == "true" ]]; then
        # 디바운싱: 마지막 트리거 후 일정 시간 경과 확인
        local last_trigger_file="$LOG_DIR/.last_evolve_trigger"
        local now=$(date +%s)

        if [[ -f "$last_trigger_file" ]]; then
            local last_trigger=$(cat "$last_trigger_file")
            local diff=$((now - last_trigger))
            if [[ $diff -lt 60 ]]; then
                # 60초 이내 재트리거 방지
                return
            fi
        fi

        echo "$now" > "$last_trigger_file"
        log "Triggering evolution cycle for $file..."

        # 백그라운드로 실행
        "$SCRIPTS_DIR/evolve-runner.sh" \
            --task "File changed: $file - Analyze and learn from this change" \
            --tags "$tags" \
            --no-learn &
    fi
}

# ═══════════════════════════════════════════════════════════════
# 메인 감시 루프
# ═══════════════════════════════════════════════════════════════

watch_files() {
    log "Starting file watcher..."
    log "Watching: $WATCH_PATHS"
    log "Extensions: $WATCH_EXTENSIONS"
    log "Debounce: ${DEBOUNCE_SECONDS}s"

    # inotifywait 사용 가능 여부 체크
    if ! command -v inotifywait &> /dev/null; then
        echo -e "${RED}Error: inotifywait not found${NC}"
        echo "Install with: sudo apt-get install inotify-tools"
        exit 1
    fi

    cd "$PROJECT_ROOT"

    # 감시 경로 구성
    local watch_args=""
    for path in $WATCH_PATHS; do
        if [[ -d "$path" ]]; then
            watch_args="$watch_args $path"
        fi
    done

    if [[ -z "$watch_args" ]]; then
        watch_args="."
    fi

    # 제외 패턴 구성
    local exclude_regex=$(echo "$EXCLUDE_PATTERNS" | tr ',' '|')

    # 디바운싱을 위한 변수
    declare -A last_change

    # inotifywait 실행
    inotifywait -m -r \
        --exclude "($exclude_regex)" \
        -e modify,create,delete,move \
        $watch_args 2>/dev/null |
    while read -r directory event filename; do
        local filepath="${directory}${filename}"
        local now=$(date +%s)

        # 디바운싱
        if [[ -n "${last_change[$filepath]}" ]]; then
            local diff=$((now - ${last_change[$filepath]}))
            if [[ $diff -lt $DEBOUNCE_SECONDS ]]; then
                continue
            fi
        fi
        last_change[$filepath]=$now

        handle_change "$filepath" "$event"
    done
}

# ═══════════════════════════════════════════════════════════════
# 메인
# ═══════════════════════════════════════════════════════════════

case "${1:-}" in
    start)
        start_daemon
        ;;
    stop)
        stop_daemon
        ;;
    status)
        status_daemon
        ;;
    restart)
        stop_daemon
        sleep 1
        start_daemon
        ;;
    --watch)
        watch_files
        ;;
    *)
        echo "Usage: $0 {start|stop|status|restart}"
        echo ""
        echo "Commands:"
        echo "  start    Start the file watcher daemon"
        echo "  stop     Stop the file watcher daemon"
        echo "  status   Check if watcher is running"
        echo "  restart  Restart the watcher daemon"
        exit 1
        ;;
esac
