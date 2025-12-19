#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Self-Evolving Agent System - Installation Script
# 전체 자동화 시스템 설치 스크립트
# ═══════════════════════════════════════════════════════════════

set -e

# 색상
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${PURPLE}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║   🧠 Self-Evolving Agent System - Installation Wizard        ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ───────────────────────────────────────────────────────────────
# 의존성 체크
# ───────────────────────────────────────────────────────────────

check_dependencies() {
    echo -e "${CYAN}[1/6]${NC} Checking dependencies..."

    local missing=()

    # 필수 도구
    if ! command -v git &> /dev/null; then
        missing+=("git")
    fi

    if ! command -v bash &> /dev/null; then
        missing+=("bash")
    fi

    # 선택적 도구
    local optional_missing=()

    if ! command -v inotifywait &> /dev/null; then
        optional_missing+=("inotify-tools (for file watcher)")
    fi

    if ! command -v jq &> /dev/null; then
        optional_missing+=("jq (for JSON processing)")
    fi

    if ! command -v bc &> /dev/null; then
        optional_missing+=("bc (for calculations)")
    fi

    # 에이전트 도구
    local agents_missing=()

    if ! command -v claude &> /dev/null; then
        agents_missing+=("claude (Claude Code CLI)")
    fi

    if ! command -v md &> /dev/null; then
        agents_missing+=("md (MDFlow)")
    fi

    if ! command -v opencode &> /dev/null; then
        agents_missing+=("opencode (Oh-My-OpenCode)")
    fi

    # 결과 출력
    if [[ ${#missing[@]} -gt 0 ]]; then
        echo -e "${RED}Missing required dependencies:${NC}"
        for dep in "${missing[@]}"; do
            echo -e "  ${RED}✗${NC} $dep"
        done
        exit 1
    fi

    echo -e "  ${GREEN}✓${NC} All required dependencies installed"

    if [[ ${#optional_missing[@]} -gt 0 ]]; then
        echo -e "${YELLOW}Optional dependencies (recommended):${NC}"
        for dep in "${optional_missing[@]}"; do
            echo -e "  ${YELLOW}○${NC} $dep"
        done
        echo ""
        echo -e "  Install with: ${CYAN}sudo apt-get install inotify-tools jq bc${NC}"
    fi

    if [[ ${#agents_missing[@]} -gt 0 ]]; then
        echo -e "${YELLOW}Agent tools (at least one recommended):${NC}"
        for dep in "${agents_missing[@]}"; do
            echo -e "  ${YELLOW}○${NC} $dep"
        done
    fi

    echo ""
}

# ───────────────────────────────────────────────────────────────
# 디렉토리 구조 생성
# ───────────────────────────────────────────────────────────────

setup_directories() {
    echo -e "${CYAN}[2/6]${NC} Setting up directories..."

    mkdir -p "$PROJECT_ROOT/.opencode/logs"
    mkdir -p "$PROJECT_ROOT/.opencode/brain/patterns/success"
    mkdir -p "$PROJECT_ROOT/.opencode/brain/patterns/failure"

    echo -e "  ${GREEN}✓${NC} Directories created"
}

# ───────────────────────────────────────────────────────────────
# 스크립트 권한 설정
# ───────────────────────────────────────────────────────────────

set_permissions() {
    echo -e "${CYAN}[3/6]${NC} Setting script permissions..."

    chmod +x "$SCRIPT_DIR/evolve-runner.sh"
    chmod +x "$SCRIPT_DIR/file-watcher.sh"
    chmod +x "$SCRIPT_DIR/auto-learn.sh"
    chmod +x "$SCRIPT_DIR/hooks/pre-commit"
    chmod +x "$SCRIPT_DIR/hooks/post-commit"

    echo -e "  ${GREEN}✓${NC} Permissions set"
}

# ───────────────────────────────────────────────────────────────
# Git Hooks 설치
# ───────────────────────────────────────────────────────────────

install_git_hooks() {
    echo -e "${CYAN}[4/6]${NC} Installing Git hooks..."

    # Git 저장소 확인
    if [[ ! -d "$PROJECT_ROOT/.git" ]]; then
        echo -e "  ${YELLOW}!${NC} Not a Git repository, initializing..."
        cd "$PROJECT_ROOT" && git init
    fi

    local hooks_dir="$PROJECT_ROOT/.git/hooks"

    # 기존 훅 백업
    if [[ -f "$hooks_dir/pre-commit" ]]; then
        mv "$hooks_dir/pre-commit" "$hooks_dir/pre-commit.backup"
        echo -e "  ${YELLOW}!${NC} Existing pre-commit hook backed up"
    fi

    if [[ -f "$hooks_dir/post-commit" ]]; then
        mv "$hooks_dir/post-commit" "$hooks_dir/post-commit.backup"
        echo -e "  ${YELLOW}!${NC} Existing post-commit hook backed up"
    fi

    # 심볼릭 링크 생성
    ln -sf "$SCRIPT_DIR/hooks/pre-commit" "$hooks_dir/pre-commit"
    ln -sf "$SCRIPT_DIR/hooks/post-commit" "$hooks_dir/post-commit"

    echo -e "  ${GREEN}✓${NC} Git hooks installed"
}

# ───────────────────────────────────────────────────────────────
# Systemd 서비스 설치 (선택적)
# ───────────────────────────────────────────────────────────────

install_systemd_service() {
    echo -e "${CYAN}[5/6]${NC} Systemd service setup..."

    read -p "  Install as systemd user service? (y/N): " install_service

    if [[ "$install_service" =~ ^[Yy]$ ]]; then
        local user_service_dir="$HOME/.config/systemd/user"
        mkdir -p "$user_service_dir"

        # 서비스 파일 수정 및 복사
        sed "s|/home/cafe99/agent-system-project/self-evolving-agent-system|$PROJECT_ROOT|g" \
            "$SCRIPT_DIR/evolve-agent.service" > "$user_service_dir/evolve-agent.service"

        systemctl --user daemon-reload

        read -p "  Enable and start service now? (y/N): " start_service
        if [[ "$start_service" =~ ^[Yy]$ ]]; then
            systemctl --user enable evolve-agent
            systemctl --user start evolve-agent
            echo -e "  ${GREEN}✓${NC} Service installed and started"
        else
            echo -e "  ${GREEN}✓${NC} Service installed (not started)"
            echo -e "  ${CYAN}   Start with: systemctl --user start evolve-agent${NC}"
        fi
    else
        echo -e "  ${YELLOW}○${NC} Skipped systemd service installation"
        echo -e "  ${CYAN}   Start watcher manually: ./scripts/file-watcher.sh start${NC}"
    fi
}

# ───────────────────────────────────────────────────────────────
# 설치 완료
# ───────────────────────────────────────────────────────────────

finish_installation() {
    echo -e "${CYAN}[6/6]${NC} Finishing installation..."

    # Claude Code settings.json 생성 (경로 치환)
    if [[ -f "$PROJECT_ROOT/.claude/settings.json.template" ]]; then
        echo -e "  ${CYAN}→${NC} Generating .claude/settings.json with project paths..."
        sed "s|{{PROJECT_ROOT}}|$PROJECT_ROOT|g" \
            "$PROJECT_ROOT/.claude/settings.json.template" > "$PROJECT_ROOT/.claude/settings.json"
        echo -e "  ${GREEN}✓${NC} Claude Code settings configured"
    fi

    # 초기 brain 동기화
    if [[ -f "$PROJECT_ROOT/.opencode/brain/project_brain.yaml" ]]; then
        sed -i "s/last_sync:.*/last_sync: \"$(date -Iseconds)\"/" \
            "$PROJECT_ROOT/.opencode/brain/project_brain.yaml"
    fi

    echo -e "  ${GREEN}✓${NC} Installation complete!"
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                    Installation Complete!                      ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}Quick Start:${NC}"
    echo ""
    echo -e "  1. Run a task with auto-learning:"
    echo -e "     ${YELLOW}./scripts/evolve-runner.sh -t \"your task here\"${NC}"
    echo ""
    echo -e "  2. Start file watcher:"
    echo -e "     ${YELLOW}./scripts/file-watcher.sh start${NC}"
    echo ""
    echo -e "  3. Check learned patterns:"
    echo -e "     ${YELLOW}cat .opencode/brain/project_brain.yaml${NC}"
    echo ""
    echo -e "  4. Git commits will now auto-learn!"
    echo ""
    echo -e "${CYAN}Configuration:${NC}"
    echo -e "  Edit: ${YELLOW}.opencode/automation-config.yaml${NC}"
    echo ""
}

# ───────────────────────────────────────────────────────────────
# 제거 기능
# ───────────────────────────────────────────────────────────────

uninstall() {
    echo -e "${YELLOW}Uninstalling Self-Evolving Agent System...${NC}"

    # Systemd 서비스 중지 및 제거
    if systemctl --user is-active evolve-agent &> /dev/null; then
        systemctl --user stop evolve-agent
        systemctl --user disable evolve-agent
    fi
    rm -f "$HOME/.config/systemd/user/evolve-agent.service"

    # Git hooks 제거
    rm -f "$PROJECT_ROOT/.git/hooks/pre-commit"
    rm -f "$PROJECT_ROOT/.git/hooks/post-commit"

    # 백업 복원
    if [[ -f "$PROJECT_ROOT/.git/hooks/pre-commit.backup" ]]; then
        mv "$PROJECT_ROOT/.git/hooks/pre-commit.backup" "$PROJECT_ROOT/.git/hooks/pre-commit"
    fi
    if [[ -f "$PROJECT_ROOT/.git/hooks/post-commit.backup" ]]; then
        mv "$PROJECT_ROOT/.git/hooks/post-commit.backup" "$PROJECT_ROOT/.git/hooks/post-commit"
    fi

    # PID 파일 제거
    rm -f "$PROJECT_ROOT/.opencode/watcher.pid"

    echo -e "${GREEN}Uninstallation complete!${NC}"
    echo -e "${YELLOW}Note: Logs and learned patterns preserved in .opencode/${NC}"
}

# ───────────────────────────────────────────────────────────────
# 메인
# ───────────────────────────────────────────────────────────────

case "${1:-}" in
    uninstall)
        uninstall
        ;;
    *)
        check_dependencies
        setup_directories
        set_permissions
        install_git_hooks
        install_systemd_service
        finish_installation
        ;;
esac
