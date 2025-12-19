# Feature Specification: Self-Evolving Agent Expert System

**Feature ID**: `001-self-evolving-system`
**Created**: 2025-12-17
**Status**: Draft
**Version**: 1.0.0

---

## Overview

MDFlow, Oh-My-OpenCode, 그리고 claude-code-skills를 통합하여 **자기 진화형 에이전트 전문가 시스템**을 구축합니다. 이 시스템은 작업을 수행하면서 학습하고, 축적된 지식을 활용하여 점점 더 똑똑해지는 에이전트 시스템입니다.

### Core Philosophy

```
일반 에이전트:  요청 → 실행 → [잊음]
진화형 에이전트: 요청 → 지식 로드 → 검증 → 실행 → [학습] → 축적
                        ↑                           │
                        └────────── 진화 ───────────┘
```

---

## User Scenarios & Testing

### User Story 1 - 학습 기반 작업 수행 (Priority: P1)

**사용자 여정**: 개발자가 "로그인 기능 구현해줘"라고 요청하면, 시스템이 과거에 학습한 인증 관련 패턴을 자동으로 로드하고, 성공/실패 패턴을 참고하여 더 나은 구현을 제안합니다.

**Why this priority**: 핵심 가치 제안 - 시스템이 학습하고 진화하는 것이 차별화 포인트

**Independent Test**:
1. `project_brain.yaml`에 테스트 패턴 추가
2. MDFlow 워크플로우 실행
3. 패턴이 로드되고 적용되는지 확인

**Acceptance Scenarios**:
1. **Given** project_brain.yaml에 "JWT 인증" 관련 SUCCESS_PATTERN이 있을 때, **When** 사용자가 "로그인 기능 구현"을 요청하면, **Then** 시스템이 해당 패턴을 참조하여 계획을 수립한다
2. **Given** 작업이 완료되었을 때, **When** 새로운 교훈이 발견되면, **Then** project_brain.yaml의 learned_patterns에 자동으로 추가된다

---

### User Story 2 - 3-LLM 역할 분담 (Priority: P1)

**사용자 여정**: 복잡한 기능 구현 시 Claude Opus가 계획을 수립하고, Gemini가 리서치를 수행하며, GPT가 실제 코드를 작성합니다. 각 모델의 강점을 활용한 최적의 결과물을 생성합니다.

**Why this priority**: 각 LLM의 강점 활용이 시스템 효율성의 핵심

**Independent Test**:
1. MDFlow evolve.claude.md 실행
2. 작업이 research.gemini.md와 build.codex.md로 분배되는지 확인
3. 결과물이 review.claude.md로 검증되는지 확인

**Acceptance Scenarios**:
1. **Given** 사용자가 구현 요청을 하면, **When** MDFlow evolve.claude.md가 실행되면, **Then** Claude Opus가 계획을 수립하고 작업을 분배한다
2. **Given** 리서치가 필요한 작업일 때, **When** research.gemini.md가 포크되면, **Then** Gemini가 최신 문서와 예제를 검색한다
3. **Given** 코딩이 필요한 작업일 때, **When** build.codex.md가 포크되면, **Then** GPT-5.2가 프로덕션급 코드를 작성한다

---

### User Story 3 - 스킬 통합 활용 (Priority: P2)

**사용자 여정**: 기존 claude-code-skills (git-expert, refactor-expert, debug-expert 등)이 자기 진화 시스템과 연동되어, 각 전문 영역에서 축적된 지식을 활용합니다.

**Why this priority**: 기존 자산 활용으로 즉각적인 가치 제공

**Independent Test**:
1. git-expert 스킬로 커밋 수행
2. project_brain.yaml에 Git 관련 학습이 기록되는지 확인

**Acceptance Scenarios**:
1. **Given** 사용자가 "commit my changes"라고 요청하면, **When** git-expert 스킬이 활성화되면, **Then** 컨벤셔널 커밋 메시지가 자동 생성된다
2. **Given** 스킬 사용 후, **When** 새로운 패턴이 발견되면, **Then** project_brain.yaml에 해당 스킬 관련 학습이 추가된다

---

### User Story 4 - Oh-My-OpenCode 에이전트 오케스트레이션 (Priority: P2)

**사용자 여정**: Oh-My-OpenCode의 에이전트들(OmO, oracle, researcher 등)이 MDFlow 워크플로우와 연동되어 비동기적으로 작업을 처리합니다.

**Why this priority**: 병렬 처리로 효율성 극대화

**Independent Test**:
1. Oh-My-OpenCode 에이전트 설정 확인
2. 병렬 작업 실행 테스트

**Acceptance Scenarios**:
1. **Given** oh-my-opencode.json에 에이전트가 설정되어 있을 때, **When** 병렬 작업이 필요하면, **Then** 여러 에이전트가 동시에 실행된다

---

## Requirements

### Functional Requirements

#### Controller Layer (MDFlow)
- **FR-001**: System MUST load project_brain.yaml at workflow start
- **FR-002**: System MUST distribute tasks to appropriate model-specific workflows
- **FR-003**: System MUST update project_brain.yaml with new learnings after task completion
- **FR-004**: System MUST support parallel workflow execution (fork/join)

#### Memory Layer (project_brain.yaml)
- **FR-005**: System MUST store project context (name, tech_stack, rules)
- **FR-006**: System MUST store learned patterns with status (SUCCESS_PATTERN, FAILURE_PATTERN)
- **FR-007**: System MUST track workflow history and success metrics
- **FR-008**: System MUST integrate skill references for cross-skill learning

#### Executor Layer (Oh-My-OpenCode)
- **FR-009**: System MUST configure multiple agents with different LLM models
- **FR-010**: System MUST support background/parallel agent execution
- **FR-011**: System MUST integrate with Claude Code MCP servers

### Non-Functional Requirements

- **NFR-001**: Pattern lookup from project_brain.yaml < 100ms
- **NFR-002**: Workflow execution timeout configurable (default: 5 minutes)
- **NFR-003**: Brain file size < 100KB to ensure fast loading
- **NFR-004**: Git-compatible (all configuration files in version control)

---

## Success Criteria

- **SC-001**: 동일한 유형의 작업 재요청 시 과거 패턴 자동 적용 확인
- **SC-002**: 3개 이상의 LLM 모델이 역할에 따라 작업 수행 확인
- **SC-003**: project_brain.yaml에 최소 5개의 learned_patterns 축적
- **SC-004**: 5개 claude-code-skills 스킬 통합 완료
- **SC-005**: MDFlow 워크플로우 4개 생성 (evolve, research, build, review)

---

## Out of Scope

- 웹 UI/대시보드 구현
- 클라우드 배포 설정
- 다중 프로젝트 동시 관리
- 실시간 협업 기능

---

## Technical Constraints

- MDFlow v2.35.1 사용
- OpenCode v1.0.163 사용
- Claude Code skills 호환 형식 준수
- YAML/JSON 설정 파일 형식
