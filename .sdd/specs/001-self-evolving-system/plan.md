# Implementation Plan: Self-Evolving Agent Expert System

**Feature ID**: `001-self-evolving-system` | **Date**: 2025-12-17

---

## Summary

MDFlow(Controller) + project_brain.yaml(Memory) + Oh-My-OpenCode(Executor) 3계층 아키텍처로 자기 진화형 에이전트 시스템을 구현합니다. claude-code-skills의 5개 전문가 스킬을 통합하고, 3개의 LLM 모델(Claude Opus, GPT-5.2, Gemini 3 Pro)을 역할별로 최적 배치합니다.

---

## Technical Context

- **Orchestrator**: MDFlow v2.35.1
- **Runtime**: OpenCode v1.0.163
- **Config Format**: YAML, JSON, Markdown
- **LLM Models**:
  - Claude Opus 4.5 (Planner/Reviewer/Archivist)
  - GPT-5.2 (Main Builder/Debugger)
  - Gemini 3 Pro (Researcher/Prototyper)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    [CONTROLLER LAYER]                            │
│                         MDFlow                                   │
│  역할: 워크플로우 오케스트레이션, 학습 루프 강제                 │
│  파일: evolve.claude.md, research.gemini.md,                    │
│        build.codex.md, review.claude.md                         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    [MEMORY LAYER]                                │
│                  project_brain.yaml                              │
│  역할: 학습된 패턴 저장, 프로젝트 지식 축적                     │
│  위치: .opencode/brain/project_brain.yaml                       │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    [EXECUTOR LAYER]                              │
│                    Oh-My-OpenCode                                │
│  역할: MCP 실행, 비동기 서브에이전트, 스킬 호출                 │
│  에이전트: OmO, oracle, researcher, main-builder                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
self-evolving-agent-system/
├── .sdd/                          # SDD 스펙 (현재 위치)
│   └── specs/
│       └── 001-self-evolving-system/
│           ├── spec.md
│           ├── plan.md            # 이 파일
│           └── tasks.md
│
├── .mdflow/                       # MDFlow 워크플로우
│   ├── evolve.claude.md           # 마스터 학습 루프
│   ├── research.gemini.md         # 리서치 전용
│   ├── build.codex.md             # 코딩 전용
│   └── review.claude.md           # 리뷰 전용
│
├── .opencode/                     # Oh-My-OpenCode 설정
│   ├── brain/
│   │   ├── project_brain.yaml     # 핵심 멘탈 모델
│   │   └── patterns/              # 학습된 패턴 상세
│   │       ├── success/           # 성공 패턴
│   │       └── failure/           # 실패 패턴
│   └── oh-my-opencode.json        # 에이전트 설정
│
├── .claude/                       # Claude Code 호환
│   ├── commands/                  # 슬래시 커맨드
│   │   └── evolve.md              # /evolve 커맨드
│   ├── rules/                     # 조건부 규칙
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
└── README.md                      # 시스템 문서
```

---

## Data Model: project_brain.yaml

```yaml
# 프로젝트 기본 컨텍스트
project_context:
  name: "Self-Evolving Agent System"
  version: "1.0.0"
  tech_stack:
    - MDFlow v2.35.1
    - OpenCode v1.0.163
    - Claude Code Skills
  rules:
    - "모든 작업 시작 전 project_brain.yaml 로드 필수"
    - "작업 완료 후 learned_patterns 업데이트"
    - "역할별 최적 LLM 모델 사용"

# 학습된 패턴 (에이전트가 자동 업데이트)
learned_patterns:
  - id: "LP-001"
    context: "인증 시스템 구현"
    status: "SUCCESS_PATTERN"
    content: "JWT 토큰은 Singleton 패턴으로 관리하면 안정적"
    model_used: "gpt-5.2"
    learned_at: "2025-12-17T10:00:00Z"
    confidence: 0.9

  - id: "LP-002"
    context: "API Rate Limiting"
    status: "FAILURE_PATTERN"
    content: "axios 타임아웃 미설정 시 무한 로딩 발생"
    model_used: "claude-opus-4-5"
    learned_at: "2025-12-16T15:30:00Z"
    confidence: 0.95

# 스킬 통합 참조
skill_integration:
  git-expert:
    path: ".claude/skills/git-expert/"
    triggers: ["commit", "branch", "pr", "merge"]
  refactor-expert:
    path: ".claude/skills/refactor-expert/"
    triggers: ["refactor", "clean up", "simplify"]
  debug-expert:
    path: ".claude/skills/debug-expert/"
    triggers: ["debug", "fix", "error"]
  api-expert:
    path: ".claude/skills/api-expert/"
    triggers: ["api", "endpoint", "route"]
  project-expert:
    path: ".claude/skills/project-expert/"
    triggers: ["analyze", "learn", "sync"]

# 워크플로우 기록
workflow_history:
  last_sync: "2025-12-17T10:00:00Z"
  total_tasks: 0
  success_rate: 0.0
  model_usage:
    claude-opus-4-5: 0
    gpt-5.2: 0
    gemini-3-pro: 0

# 메트릭스
metrics:
  patterns_learned: 0
  patterns_applied: 0
  evolution_cycles: 0
  confidence_average: 0.0
```

---

## LLM Model Assignment

| Phase | Model | Role | Allocation |
|-------|-------|------|------------|
| Planning | Claude Opus 4.5 | Planner/Validator | 20% |
| Research | Gemini 3 Pro | Researcher | 20% |
| Building | GPT-5.2 | Main Builder | 45% |
| Review | Claude Opus 4.5 | Reviewer | 10% |
| Learning | Claude Opus 4.5 | Archivist | 5% |

---

## Implementation Phases

### Phase 1: Project Foundation
**Purpose**: 프로젝트 디렉토리 구조 및 핵심 설정 파일 생성
**Files Affected**: 8 files
**Risk Level**: Low

### Phase 2: MDFlow Workflows
**Purpose**: 4개의 역할별 MDFlow 워크플로우 파일 생성
**Files Affected**: 4 files
**Dependencies**: Phase 1 완료
**Risk Level**: Medium

### Phase 3: Memory Layer
**Purpose**: project_brain.yaml 및 패턴 저장소 구조 생성
**Files Affected**: 3 files
**Dependencies**: Phase 1 완료
**Risk Level**: Low

### Phase 4: Skills Integration
**Purpose**: claude-code-skills 복사 및 통합 설정
**Files Affected**: 15+ files (복사)
**Dependencies**: Phase 1 완료
**Risk Level**: Low

### Phase 5: Agent Configuration
**Purpose**: Oh-My-OpenCode 에이전트 설정 및 Claude Code 연동
**Files Affected**: 4 files
**Dependencies**: Phase 1, 3 완료
**Risk Level**: Medium

### Phase 6: Documentation
**Purpose**: README.md 및 사용 가이드 작성
**Files Affected**: 2 files
**Dependencies**: All phases
**Risk Level**: Low

---

## API Contracts

### MDFlow Workflow Interface

```markdown
---
model: opus | codex | gemini
mcp-config: ./mcp.json (optional)
dangerously-skip-permissions: true | false
_interactive: true | false
---

# Workflow Title

## Phase N: Phase Name
[Instructions for this phase]

---
User input: {{ _stdin }}
```

### project_brain.yaml Schema

```yaml
# Required fields
project_context:
  name: string (required)
  version: string (required)
  tech_stack: string[] (required)
  rules: string[] (optional)

learned_patterns:
  - id: string (auto-generated: LP-NNN)
    context: string (required)
    status: "SUCCESS_PATTERN" | "FAILURE_PATTERN" (required)
    content: string (required)
    model_used: string (optional)
    learned_at: ISO8601 timestamp (auto-generated)
    confidence: float 0.0-1.0 (optional, default: 0.8)

skill_integration:
  [skill-name]:
    path: string (required)
    triggers: string[] (required)

workflow_history:
  last_sync: ISO8601 timestamp
  total_tasks: integer
  success_rate: float 0.0-1.0
  model_usage: object

metrics:
  patterns_learned: integer
  patterns_applied: integer
  evolution_cycles: integer
  confidence_average: float
```

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| MDFlow 버전 호환성 | Low | High | v2.35.1 고정 |
| LLM API 가용성 | Medium | High | 폴백 모델 설정 |
| Brain 파일 손상 | Low | Medium | Git 버전 관리 |
| 스킬 충돌 | Low | Low | 네임스페이스 분리 |

---

## Verification Plan

- **V-001**: MDFlow 워크플로우 단독 실행 테스트
- **V-002**: project_brain.yaml 로드/저장 검증
- **V-003**: 스킬 트리거 동작 확인
- **V-004**: 3-LLM 역할 분담 검증
- **V-005**: 학습 루프 완전 사이클 테스트
