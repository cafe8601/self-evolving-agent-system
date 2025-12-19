# Self-Evolving Agent Expert System

> 자기 진화형 에이전트 전문가 시스템 - MDFlow + Oh-My-OpenCode + claude-code-skills 통합

## System Architecture

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

## Core Principles

1. **학습 우선**: 모든 작업 시작 전 `project_brain.yaml` 로드 필수
2. **패턴 축적**: 작업 완료 후 새로운 교훈을 `learned_patterns`에 기록
3. **역할 분담**: 각 LLM 모델의 강점을 활용한 최적 배치
4. **스킬 활용**: 전문 영역별 스킬로 정확한 작업 수행

## LLM Model Roles

| Model | Role | Usage |
|-------|------|-------|
| Claude Opus 4.5 | Planner/Reviewer/Archivist | 계획, 검증, 학습 기록 |
| GPT-5.2 | Main Builder | 프로덕션 코드 작성 |
| Gemini 3 Pro | Researcher | 문서 검색, 프로토타입 |

## Quick Commands

```bash
# 학습 기반 작업 실행 (MDFlow)
echo "작업 내용" | md .mdflow/evolve.claude.md

# 리서치만 실행 (Gemini)
echo "검색할 내용" | md .mdflow/research.gemini.md

# 코드 빌드만 실행 (Codex/GPT)
echo "구현할 내용" | md .mdflow/build.codex.md

# Claude Code에서 (권장)
claude
# → 프롬프트 입력 또는 /evolve 사용
```

## Brain Sync Protocol

작업 시작 전:
1. `.opencode/brain/project_brain.yaml` 파일 읽기
2. 현재 요청과 `learned_patterns` 대조
3. 적용 가능한 SUCCESS_PATTERN 또는 회피할 FAILURE_PATTERN 확인

작업 완료 후:
1. 이번 작업의 결과 분석
2. 새로운 패턴이나 교훈 추출
3. `project_brain.yaml`의 `learned_patterns`에 추가

## Available Skills

| Skill | Triggers | Purpose |
|-------|----------|---------|
| git-expert | commit, branch, pr | Git 워크플로우 자동화 |
| refactor-expert | refactor, clean up | 코드 리팩토링 |
| debug-expert | debug, fix, error | 버그 분석 및 수정 |
| api-expert | api, endpoint, route | REST API 개발 |
| project-expert | analyze, learn, sync | 프로젝트 학습 |
| quick-commands | test, serve, format | 빠른 개발 명령 |

## File Structure

```
.
├── .mdflow/                    # MDFlow 워크플로우
│   ├── evolve.claude.md        # 마스터 학습 루프
│   ├── research.gemini.md      # 리서치 전용
│   ├── build.codex.md          # 코딩 전용
│   └── review.claude.md        # 리뷰 전용
│
├── .opencode/                  # Oh-My-OpenCode 설정
│   ├── brain/
│   │   ├── project_brain.yaml  # 핵심 멘탈 모델
│   │   └── patterns/           # 학습된 패턴 상세
│   └── oh-my-opencode.json     # 에이전트 설정
│
├── .claude/                    # Claude Code 호환
│   ├── commands/               # 슬래시 커맨드
│   ├── rules/                  # 조건부 규칙
│   └── skills/                 # 통합된 스킬
│
└── .sdd/                       # SDD 스펙 문서
    └── specs/
        └── 001-self-evolving-system/
```

## Configuration Reference

### project_brain.yaml

핵심 메모리 파일 - 프로젝트 컨텍스트와 학습된 패턴 저장

### oh-my-opencode.json

에이전트 설정 - 각 LLM 모델별 에이전트 정의

### evolve.claude.md

마스터 워크플로우 - 학습 루프 오케스트레이션
