# Tasks: Self-Evolving Agent Expert System

**Feature ID**: `001-self-evolving-system`
**Total Tasks**: 32
**Estimated Time**: 2-3 hours

---

## Legend

- `[ ]` Pending
- `[P]` Parallel-safe (can run simultaneously)
- `[B]` Blocked by previous task
- `[US1]` User Story 1 related
- `[US2]` User Story 2 related
- `[US3]` User Story 3 related
- `[US4]` User Story 4 related

---

## Phase 1: Project Foundation (8 tasks)

**Purpose**: 프로젝트 디렉토리 구조 및 핵심 설정 파일 생성
**Estimated**: 20 minutes

- [ ] T001 [P] Create .mdflow/ directory
- [ ] T002 [P] Create .opencode/brain/patterns/success/ directory structure
- [ ] T003 [P] Create .opencode/brain/patterns/failure/ directory structure
- [ ] T004 [P] Create .claude/commands/ directory
- [ ] T005 [P] Create .claude/rules/ directory
- [ ] T006 [P] Create .claude/skills/ directory
- [ ] T007 [B:T001-T006] Create CLAUDE.md project root configuration
- [ ] T008 [B:T007] Verify directory structure with `tree` command

**Checkpoint**: 디렉토리 구조 완성

---

## Phase 2: MDFlow Workflows (8 tasks) [US2]

**Purpose**: 4개의 역할별 MDFlow 워크플로우 파일 생성
**Estimated**: 40 minutes
**Dependencies**: Phase 1 완료

- [ ] T009 [B:Phase1] Create .mdflow/evolve.claude.md - Master orchestrator workflow
  - Phase 1: Brain sync (load project_brain.yaml)
  - Phase 2: Task distribution (fork to other workflows)
  - Phase 3: Self-improve (update learnings)

- [ ] T010 [P:T009] Create .mdflow/research.gemini.md - Research workflow
  - Search latest documentation
  - Find implementation examples
  - Quick prototyping

- [ ] T011 [P:T009] Create .mdflow/build.codex.md - Building workflow
  - Production-grade code writing
  - Test generation
  - Bug fixing

- [ ] T012 [P:T009] Create .mdflow/review.claude.md - Review workflow
  - Code review
  - Quality checks
  - Constitutional AI compliance

- [ ] T013 [B:T009-T012] Create mcp.json for MCP server configuration (optional)

- [ ] T014 [B:T009] Test evolve.claude.md standalone execution
- [ ] T015 [B:T010] Test research.gemini.md standalone execution
- [ ] T016 [B:T011-T012] Test build.codex.md and review.claude.md

**Checkpoint**: MDFlow 워크플로우 4개 작동 확인

---

## Phase 3: Memory Layer (6 tasks) [US1]

**Purpose**: project_brain.yaml 및 패턴 저장소 구조 생성
**Estimated**: 25 minutes
**Dependencies**: Phase 1 완료

- [ ] T017 [B:Phase1] Create .opencode/brain/project_brain.yaml with initial structure
  - project_context section
  - learned_patterns section (2 sample patterns)
  - skill_integration section
  - workflow_history section
  - metrics section

- [ ] T018 [P:T017] Create .opencode/brain/patterns/success/.gitkeep
- [ ] T019 [P:T017] Create .opencode/brain/patterns/failure/.gitkeep

- [ ] T020 [B:T017] Create sample success pattern file
  - .opencode/brain/patterns/success/LP-001-jwt-singleton.md

- [ ] T021 [B:T017] Create sample failure pattern file
  - .opencode/brain/patterns/failure/LP-002-axios-timeout.md

- [ ] T022 [B:T017-T021] Verify YAML syntax and structure

**Checkpoint**: Brain 메모리 레이어 완성

---

## Phase 4: Skills Integration (5 tasks) [US3]

**Purpose**: claude-code-skills 복사 및 통합 설정
**Estimated**: 15 minutes
**Dependencies**: Phase 1 완료

- [ ] T023 [B:Phase1] Copy git-expert skill to .claude/skills/
- [ ] T024 [P:T023] Copy refactor-expert skill to .claude/skills/
- [ ] T025 [P:T023] Copy debug-expert skill to .claude/skills/
- [ ] T026 [P:T023] Copy api-expert skill to .claude/skills/
- [ ] T027 [P:T023] Copy project-expert and quick-commands skills to .claude/skills/

**Checkpoint**: 6개 스킬 통합 완료

---

## Phase 5: Agent Configuration (3 tasks) [US4]

**Purpose**: Oh-My-OpenCode 에이전트 설정 및 Claude Code 연동
**Estimated**: 20 minutes
**Dependencies**: Phase 1, 3 완료

- [ ] T028 [B:Phase3] Create .opencode/oh-my-opencode.json agent configuration
  - OmO agent (Claude Opus 4.5)
  - oracle agent (GPT-5.2)
  - researcher agent (Gemini 3 Pro)
  - main-builder agent (GPT-5.2)
  - frontend-ui-ux-engineer agent (Gemini 3 Pro)

- [ ] T029 [B:T028] Create .claude/commands/evolve.md slash command
  - Triggers MDFlow evolve.claude.md workflow

- [ ] T030 [B:T028] Create .claude/rules/learning-loop.md conditional rule
  - Enforces brain sync before tasks
  - Enforces learning update after tasks

**Checkpoint**: 에이전트 및 커맨드 설정 완료

---

## Phase 6: Documentation (2 tasks)

**Purpose**: README.md 및 사용 가이드 작성
**Estimated**: 15 minutes
**Dependencies**: All phases

- [ ] T031 [B:Phase1-5] Create README.md with:
  - System overview
  - Architecture diagram
  - Quick start guide
  - Configuration reference
  - Usage examples

- [ ] T032 [B:T031] Final verification and cleanup
  - Verify all files created
  - Test complete workflow
  - Remove any temporary files

**Checkpoint**: 시스템 완성 및 문서화

---

## Verification Tasks

| ID | Description | Type | Command |
|----|-------------|------|---------|
| V-001 | Directory structure | auto | `tree -a -I 'node_modules\|.git'` |
| V-002 | YAML syntax valid | auto | `python -c "import yaml; yaml.safe_load(open('.opencode/brain/project_brain.yaml'))"` |
| V-003 | MDFlow workflow syntax | manual | `mdflow .mdflow/evolve.claude.md --dry-run` |
| V-004 | Skills accessible | manual | Check skills load in Claude Code |
| V-005 | Full cycle test | manual | Run complete evolution workflow |

---

## Dependency Graph

```
Phase 1 (Foundation)
    │
    ├──────────────────┬──────────────────┬─────────────────┐
    ▼                  ▼                  ▼                 ▼
Phase 2 (MDFlow)   Phase 3 (Memory)   Phase 4 (Skills)    │
    │                  │                  │                 │
    └──────────────────┴──────────────────┘                 │
                       │                                    │
                       ▼                                    │
               Phase 5 (Agent Config) ◄─────────────────────┘
                       │
                       ▼
               Phase 6 (Documentation)
```

---

## Execution Order (Optimized for Parallelism)

```
Batch 1 (Parallel): T001, T002, T003, T004, T005, T006
Batch 2 (Sequential): T007
Batch 3 (Sequential): T008

Batch 4 (Parallel): T009 (start), T017, T023, T024, T025, T026, T027
Batch 5 (Parallel): T010, T011, T012, T018, T019
Batch 6 (Parallel): T013, T020, T021
Batch 7 (Parallel): T014, T015, T016, T022

Batch 8 (Sequential): T028
Batch 9 (Parallel): T029, T030

Batch 10 (Sequential): T031
Batch 11 (Sequential): T032
```

**Estimated Total Time with Parallelism**: 1.5 - 2 hours
