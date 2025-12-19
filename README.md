# Self-Evolving Agent Expert System

> 🧠 자기 진화형 에이전트 전문가 시스템
> MDFlow + Oh-My-OpenCode + Claude Code Skills 통합

---

## Overview

이 시스템은 작업을 수행하면서 **학습하고 진화**하는 AI 에이전트 시스템입니다.

```
일반 에이전트:  요청 → 실행 → [잊음]
진화형 에이전트: 요청 → 지식 로드 → 검증 → 실행 → [학습] → 축적
                        ↑                           │
                        └────────── 진화 ───────────┘
```

### Key Features

- **학습 기반 작업**: 과거 성공/실패 패턴을 자동으로 적용
- **3-LLM 역할 분담**: Claude Opus(계획), GPT-5.2(코딩), Gemini(리서치)
- **지식 축적**: `project_brain.yaml`에 모든 학습 내용 저장
- **스킬 통합**: 6개 전문가 스킬 내장

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    [CONTROLLER LAYER]                            │
│                         MDFlow                                   │
│  워크플로우: evolve.claude.md → research/build/review           │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    [MEMORY LAYER]                                │
│                  project_brain.yaml                              │
│  학습된 패턴 저장, 프로젝트 지식 축적                           │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    [EXECUTOR LAYER]                              │
│                    Oh-My-OpenCode                                │
│  에이전트: OmO, oracle, researcher, main-builder                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### 1. Prerequisites

```bash
# MDFlow 설치 확인
md --help  # md 명령어 사용

# OpenCode 설치 확인
opencode --version  # v1.0.163+

# 인증 확인
opencode auth list
```

### 2. 가장 간단한 사용법 (권장)

```bash
# 프로젝트 폴더에서 Claude Code 실행
cd /home/cafe99/agent-system-project/self-evolving-agent-system
claude

# Claude Code 안에서 작업 요청
# → Brain 패턴이 자동으로 적용됨
```

### 3. MDFlow 워크플로우 실행

```bash
# 마스터 학습 루프
echo "로그인 기능 구현해줘" | md .mdflow/evolve.claude.md

# 또는 인터랙티브 모드
md .mdflow/evolve.claude.md
```

### 4. /evolve 커맨드 (Claude Code 안에서)

```
/evolve 사용자 프로필 페이지 만들어줘
```

---

## LLM Model Roles

| Model | Role | Allocation | Use Case |
|-------|------|------------|----------|
| Claude Opus 4.5 | Planner/Reviewer | 35% | 계획 수립, 코드 리뷰, 학습 기록 |
| GPT-5.2 | Main Builder | 45% | 프로덕션 코드 작성, 버그 수정 |
| Gemini 3 Pro | Researcher | 20% | 문서 검색, 프로토타입, UI/UX |

---

## File Structure

```
self-evolving-agent-system/
├── .sdd/                          # SDD 스펙 문서
│   └── specs/
│       └── 001-self-evolving-system/
│           ├── spec.md            # 기능 명세
│           ├── plan.md            # 구현 계획
│           └── tasks.md           # 작업 분해
│
├── .mdflow/                       # MDFlow 워크플로우
│   ├── evolve.claude.md           # 🧠 마스터 학습 루프
│   ├── research.gemini.md         # 🔍 리서치 전용
│   ├── build.codex.md             # 🔨 코딩 전용
│   └── review.claude.md           # ✅ 리뷰 전용
│
├── .opencode/                     # Oh-My-OpenCode 설정
│   ├── brain/
│   │   ├── project_brain.yaml     # 💾 핵심 메모리
│   │   └── patterns/
│   │       ├── success/           # ✅ 성공 패턴
│   │       └── failure/           # ❌ 실패 패턴
│   └── oh-my-opencode.json        # 에이전트 설정
│
├── .claude/                       # Claude Code 호환
│   ├── commands/
│   │   └── evolve.md              # /evolve 커맨드
│   ├── rules/
│   │   └── learning-loop.md       # 학습 루프 규칙
│   └── skills/                    # 통합된 스킬
│       ├── git-expert/
│       ├── refactor-expert/
│       ├── debug-expert/
│       ├── api-expert/
│       ├── project-expert/
│       └── quick-commands/
│
├── CLAUDE.md                      # 프로젝트 설정
└── README.md                      # 이 파일
```

---

## Available Skills

| Skill | Triggers | Description |
|-------|----------|-------------|
| **git-expert** | commit, branch, pr, merge | Git 워크플로우 자동화 |
| **refactor-expert** | refactor, clean up, simplify | 코드 리팩토링 |
| **debug-expert** | debug, fix, error | 버그 분석 및 수정 |
| **api-expert** | api, endpoint, route, crud | REST API 개발 |
| **project-expert** | analyze, learn, sync | 프로젝트 학습 |
| **quick-commands** | test, serve, format, lint | 빠른 개발 명령 |

---

## Brain Memory (project_brain.yaml)

### Structure

```yaml
project_context:     # 프로젝트 기본 정보
learned_patterns:    # 학습된 패턴 (SUCCESS/FAILURE)
skill_integration:   # 스킬 연동 설정
workflow_history:    # 워크플로우 기록
metrics:            # 진화 메트릭
```

### Pattern Example

```yaml
learned_patterns:
  - id: "LP-001"
    context: "JWT 인증 시스템 구현"
    status: "SUCCESS_PATTERN"
    content: "JWT 토큰 관리는 Singleton 패턴으로 구현하면 안정적"
    confidence: 0.9
    tags: [authentication, jwt, security]
```

---

## Workflow Commands

### MDFlow Direct

```bash
# 마스터 학습 루프
echo "작업 내용" | md .mdflow/evolve.claude.md

# 리서치만 (Gemini)
echo "검색할 내용" | md .mdflow/research.gemini.md

# 코딩만 (Codex/GPT)
echo "구현할 내용" | md .mdflow/build.codex.md

# 리뷰만 (Claude)
echo "리뷰할 코드" | md .mdflow/review.claude.md

# Ad-hoc 실행 (워크플로우 파일 없이)
md.claude "빠른 질문"
md.gemini "리서치 요청"
```

### Claude Code Slash Commands

```
/evolve <작업 내용>     # 학습 기반 진화 워크플로우
```

### OpenCode 에이전트

```bash
# 방법 1: 직접 에이전트 호출 (권장)
opencode run --agent OmO "계획 세워줘"
opencode run --agent researcher "문서 찾아줘"
opencode run --agent main-builder "구현해줘"

# 방법 2: TUI 모드에서 사용
opencode
# OpenCode TUI 안에서 에이전트 선택 후 작업
```

---

## How It Evolves

### 1. Brain Sync (작업 전)

```
1. project_brain.yaml 로드
2. 현재 요청과 learned_patterns 대조
3. SUCCESS_PATTERN → 적용 계획
4. FAILURE_PATTERN → 회피 전략
```

### 2. Execute (작업 수행)

```
1. 적절한 LLM 모델 선택
2. 관련 스킬 활용
3. 패턴 기반 구현
```

### 3. Learn (작업 후)

```
1. 결과 분석
2. 새로운 패턴 추출
3. project_brain.yaml 업데이트
4. 메트릭 갱신
```

---

## Configuration Reference

### oh-my-opencode.json

에이전트별 LLM 모델 및 설정 정의

### project_brain.yaml

- `project_context`: 프로젝트 메타데이터
- `learned_patterns`: 학습된 패턴 저장
- `skill_integration`: 스킬 트리거 매핑
- `workflow_history`: 실행 기록
- `metrics`: 진화 통계

### learning-loop.md

모든 작업에 적용되는 학습 루프 규칙

---

## Automation System

### Overview

전체 시스템을 자동으로 운영하는 자동화 파이프라인:

```
┌─────────────────────────────────────────────────────────────────┐
│                    [TRIGGER LAYER]                              │
│  Git Hooks / File Watcher / Manual                              │
└──────────────────────────┬──────────────────────────────────────┘
                           │ 자동 트리거
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    [ORCHESTRATOR]                               │
│              evolve-runner.sh                                   │
│  1. Brain 로드 → 2. 작업 실행 → 3. 학습 기록                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
            ┌──────────────┼──────────────┐
            ▼              ▼              ▼
       [MDFlow]      [Claude/OpenCode]  [Brain Update]
       워크플로우     에이전트 실행      패턴 자동 추출
```

### Quick Install

```bash
# 전체 자동화 시스템 설치
./scripts/install.sh
```

### Components

| Component | File | Description |
|-----------|------|-------------|
| **Orchestrator** | `scripts/evolve-runner.sh` | 메인 파이프라인 실행기 |
| **Git Hooks** | `scripts/hooks/` | 커밋 시 자동 학습 |
| **File Watcher** | `scripts/file-watcher.sh` | 파일 변경 감시 데몬 |
| **Auto-Learn** | `scripts/auto-learn.sh` | 패턴 자동 추출 |
| **Config** | `.opencode/automation-config.yaml` | 설정 파일 |

### Usage

```bash
# 1. 수동 실행
./scripts/evolve-runner.sh -t "JWT 인증 구현해줘" -e claude

# 2. 파일 감시 데몬 시작
./scripts/file-watcher.sh start

# 3. Git 커밋 시 자동 학습 (hooks 설치 후)
git commit -m "feat: add login feature"
# → 자동으로 패턴 분석 및 brain 업데이트

# 4. 데몬 상태 확인
./scripts/file-watcher.sh status

# 5. 제거
./scripts/install.sh uninstall
```

### Configuration

`.opencode/automation-config.yaml`에서 설정:

```yaml
git_hooks:
  auto_learn_on_commit: true    # 커밋 시 자동 학습

file_watcher:
  enabled: true
  watch_paths: "src lib app"
  auto_trigger_evolve: true     # 파일 변경 시 진화 트리거

auto_learning:
  default_confidence: 0.8
  use_ai_analysis: false        # Claude 분석 사용
```

---

## Contributing

1. 새로운 패턴 발견 시 `project_brain.yaml`에 추가
2. 스킬 개선 시 `.claude/skills/` 수정
3. 워크플로우 개선 시 `.mdflow/` 수정

---

## License

MIT

---

*Built with MDFlow, Oh-My-OpenCode, and Claude Code Skills*
