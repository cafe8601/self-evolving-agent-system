# Self-Evolving Agent System - 실전 가이드북

> 이 가이드는 실제로 작동하는 명령어와 워크플로우만 담고 있습니다.

---

## 목차

1. [빠른 시작 (3분)](#1-빠른-시작-3분)
2. [시스템 개요](#2-시스템-개요)
3. [도구별 사용법](#3-도구별-사용법)
4. [실전 시나리오](#4-실전-시나리오)
5. [Brain 메모리 활용](#5-brain-메모리-활용)
6. [스킬 활용법](#6-스킬-활용법)
7. [트러블슈팅](#7-트러블슈팅)

---

## 1. 빠른 시작 (3분)

### Step 1: 프로젝트 폴더로 이동

```bash
cd /home/cafe99/agent-system-project/self-evolving-agent-system
```

### Step 2: Claude Code 실행

```bash
claude
```

### Step 3: 첫 번째 작업 요청

Claude Code 안에서:
```
간단한 할일 목록 함수를 만들어줘
```

**끝!** Claude가 `.opencode/brain/project_brain.yaml`의 패턴을 참고하여 작업합니다.

---

## 2. 시스템 개요

### 핵심 개념: 학습하는 에이전트

```
일반 에이전트:  요청 → 실행 → 잊음
이 시스템:      요청 → Brain 로드 → 패턴 적용 → 실행 → 학습 기록
```

### 3가지 도구

| 도구 | 명령어 | 언제 사용? |
|------|--------|-----------|
| **Claude Code** | `claude` | 일반적인 개발 작업 (권장) |
| **MDFlow** | `md` | 정형화된 워크플로우 실행 |
| **OpenCode** | `opencode` | 여러 AI 모델 에이전트 활용 |

### 핵심 파일

| 파일 | 역할 |
|------|------|
| `.opencode/brain/project_brain.yaml` | 학습된 패턴 저장소 |
| `.mdflow/evolve.claude.md` | 마스터 워크플로우 |
| `.claude/skills/*` | 전문가 스킬들 |

---

## 3. 도구별 사용법

### 3.1 Claude Code (가장 간단)

#### 기본 사용

```bash
# 1. 프로젝트 폴더에서 실행
cd /home/cafe99/agent-system-project/self-evolving-agent-system
claude
```

#### Claude Code 안에서 작업

```
# 일반 요청
로그인 폼 컴포넌트 만들어줘

# 스킬 트리거 (자동 감지)
commit my changes          # → git-expert 스킬 활성화
refactor this function     # → refactor-expert 스킬 활성화
debug this error           # → debug-expert 스킬 활성화

# Brain 패턴 확인 요청
현재 학습된 패턴들 보여줘
```

#### /evolve 커맨드 사용

```
# 학습 기반 진화 워크플로우
/evolve 사용자 인증 기능 구현해줘
```

이 커맨드는:
1. `project_brain.yaml` 로드
2. 관련 패턴 검색 및 적용
3. 작업 수행
4. 새로운 패턴 학습 및 기록

---

### 3.2 MDFlow (워크플로우 실행)

#### 명령어 형식

```bash
# 기본 형식
md <워크플로우파일.md>

# 프롬프트와 함께
echo "요청 내용" | md <워크플로우파일.md>
```

#### 워크플로우별 사용법

**마스터 워크플로우 (학습 루프)**
```bash
# 인터랙티브 모드
md .mdflow/evolve.claude.md

# 프롬프트 전달
echo "JWT 인증 구현해줘" | md .mdflow/evolve.claude.md
```

**리서치 전용 (Gemini)**
```bash
echo "Next.js 15 새 기능 조사해줘" | md .mdflow/research.gemini.md
```

**코딩 전용 (Codex/GPT)**
```bash
echo "REST API 엔드포인트 만들어줘" | md .mdflow/build.codex.md
```

**리뷰 전용 (Claude)**
```bash
echo "src/auth.ts 코드 리뷰해줘" | md .mdflow/review.claude.md
```

#### Ad-hoc 실행 (파일 없이)

```bash
# Claude에게 빠른 질문
md.claude "TypeScript에서 제네릭 사용법 알려줘"

# Gemini에게 리서치
md.gemini "최신 React 서버 컴포넌트 트렌드"

# 인터랙티브 채팅
md.i.claude
```

---

### 3.3 OpenCode (멀티 에이전트)

#### 기본 사용

```bash
# 프로젝트 폴더에서 실행
cd /home/cafe99/agent-system-project/self-evolving-agent-system
opencode
```

#### 에이전트 호출

**방법 1: CLI 직접 호출 (권장)**
```bash
# 마스터 오케스트레이터 (Claude Opus)
opencode run --agent OmO "대시보드 기능 설계해줘"

# 리서처 (Gemini)
opencode run --agent researcher "Supabase 실시간 구독 문서 찾아줘"

# 메인 빌더 (GPT)
opencode run --agent main-builder "사용자 CRUD API 구현해줘"

# 아키텍트 (GPT)
opencode run --agent oracle "이 아키텍처 리뷰해줘"

# 프론트엔드 (Gemini)
opencode run --agent frontend-ui-ux-engineer "로그인 페이지 디자인해줘"
```

**방법 2: TUI 모드 (인터랙티브)**
```bash
opencode
# TUI에서 에이전트 선택 후 작업
```

#### 에이전트 조합 예시

```bash
# 리서치 → 구현 순차 실행
opencode run --agent researcher "Prisma ORM 사용법 조사해줘"
# (결과 확인 후)
opencode run --agent main-builder "조사한 내용 바탕으로 User 모델 만들어줘"

# 설계 → 구현 → 리뷰
opencode run --agent OmO "결제 시스템 설계해줘"
opencode run --agent main-builder "설계대로 구현해줘"
opencode run --agent oracle "구현 결과 리뷰해줘"
```

---

## 4. 실전 시나리오

### 시나리오 1: 새 기능 구현

**상황**: "사용자 프로필 페이지 만들어줘"

#### 방법 A: Claude Code (권장)

```bash
cd /home/cafe99/agent-system-project/self-evolving-agent-system
claude
```

```
/evolve 사용자 프로필 페이지 만들어줘.
프로필 사진, 이름, 이메일, 가입일을 표시하고
수정 기능도 있어야 해.
```

#### 방법 B: MDFlow

```bash
cd /home/cafe99/agent-system-project/self-evolving-agent-system

# 마스터 워크플로우로 전체 과정 진행
echo "사용자 프로필 페이지 만들어줘" | md .mdflow/evolve.claude.md
```

#### 방법 C: OpenCode 에이전트 조합

```bash
# 계획 수립
opencode run --agent OmO "사용자 프로필 페이지 구현 계획 세워줘"

# (계획 확인 후) 구현
opencode run --agent main-builder "프로필 페이지 컴포넌트 구현해줘"

# 코드 리뷰
opencode run --agent oracle "코드 리뷰해줘"
```

---

### 시나리오 2: 버그 수정

**상황**: "로그인이 안 돼요. 에러 메시지: 'Invalid token'"

#### Claude Code 사용

```bash
claude
```

```
로그인 시 'Invalid token' 에러가 발생해.
debug해서 원인 찾고 수정해줘.
```

`debug` 키워드가 **debug-expert** 스킬을 자동 활성화합니다.

#### Brain 패턴 활용

만약 비슷한 문제를 이전에 해결했다면:

```
# 먼저 관련 패턴 검색
project_brain.yaml에서 token 관련 패턴 찾아줘
```

시스템이 자동으로 `LP-001` (JWT 싱글톤 패턴) 같은 관련 패턴을 적용합니다.

---

### 시나리오 3: 코드 리팩토링

**상황**: "이 함수가 너무 길어. 정리해줘"

#### Claude Code 사용

```bash
claude
```

```
src/utils/dataProcessor.ts의 processData 함수를 refactor해줘.
너무 길고 복잡해.
```

`refactor` 키워드가 **refactor-expert** 스킬을 활성화합니다.

#### MDFlow 리뷰 워크플로우

```bash
echo "src/utils/dataProcessor.ts 리팩토링 검토해줘" | md .mdflow/review.claude.md
```

---

### 시나리오 4: REST API 개발

**상황**: "상품 CRUD API 만들어줘"

#### Claude Code 사용

```bash
claude
```

```
상품(Product) CRUD API 만들어줘.
필드: id, name, price, description, createdAt
api 엔드포인트로 구현해줘.
```

`api` 키워드가 **api-expert** 스킬을 활성화합니다.

#### MDFlow 빌드 워크플로우

```bash
echo "Product CRUD API 엔드포인트 구현해줘" | md .mdflow/build.codex.md
```

---

### 시나리오 5: 프로젝트 분석

**상황**: "이 프로젝트 구조 분석해줘"

#### Claude Code 사용

```bash
claude
```

```
analyze this project
```

`analyze` 키워드가 **project-expert** 스킬을 활성화합니다.
분석 결과는 `.claude/skills/project-expert/expertise.yaml`에 저장됩니다.

---

## 5. Brain 메모리 활용

### 5.1 현재 패턴 확인

```bash
# 직접 파일 확인
cat .opencode/brain/project_brain.yaml

# 또는 Claude Code에서
claude
```

```
project_brain.yaml의 learned_patterns 보여줘
```

### 5.2 패턴 검색

```bash
# 특정 키워드로 패턴 검색
grep -A 10 "authentication" .opencode/brain/project_brain.yaml
grep -A 10 "SUCCESS_PATTERN" .opencode/brain/project_brain.yaml
grep -A 10 "FAILURE_PATTERN" .opencode/brain/project_brain.yaml
```

### 5.3 수동으로 패턴 추가

`.opencode/brain/project_brain.yaml` 파일의 `learned_patterns` 섹션에 추가:

```yaml
learned_patterns:
  # 기존 패턴들...

  - id: "LP-003"  # 다음 번호로
    context: "React 상태 관리"
    status: "SUCCESS_PATTERN"
    content: |
      복잡한 상태는 useReducer 사용.
      단순한 상태는 useState로 충분.
      전역 상태는 Context API나 Zustand 활용.
    learned_at: "2025-12-17T12:00:00Z"
    confidence: 0.85
    tags:
      - react
      - state-management
```

### 5.4 패턴 상세 파일 추가

성공 패턴:
```bash
# .opencode/brain/patterns/success/LP-003-react-state.md 생성
```

실패 패턴:
```bash
# .opencode/brain/patterns/failure/LP-004-xxx.md 생성
```

---

## 6. 스킬 활용법

### 사용 가능한 스킬

| 스킬 | 트리거 키워드 | 용도 |
|------|-------------|------|
| git-expert | commit, branch, pr, merge | Git 작업 자동화 |
| refactor-expert | refactor, clean up, simplify | 코드 정리 |
| debug-expert | debug, fix, error | 버그 수정 |
| api-expert | api, endpoint, route, crud | API 개발 |
| project-expert | analyze, learn, sync | 프로젝트 분석 |
| quick-commands | test, serve, format, lint | 빠른 명령 |

### 스킬 자동 활성화

Claude Code에서 트리거 키워드를 사용하면 해당 스킬이 자동으로 활성화됩니다:

```
# git-expert 활성화
commit my changes with a good message

# refactor-expert 활성화
clean up this messy function

# debug-expert 활성화
fix this TypeError: Cannot read property 'x' of undefined

# api-expert 활성화
create a REST endpoint for user registration
```

### 스킬 파일 위치

```
.claude/skills/
├── git-expert/SKILL.md
├── refactor-expert/SKILL.md
├── debug-expert/SKILL.md
├── api-expert/SKILL.md
├── project-expert/SKILL.md
└── quick-commands/SKILL.md
```

---

## 7. 트러블슈팅

### 문제: Claude Code가 패턴을 무시함

**해결**:
```
project_brain.yaml을 먼저 읽고 관련 패턴을 적용해서 작업해줘
```

### 문제: MDFlow 명령어가 안 됨

**확인**:
```bash
# MDFlow 설치 확인
md --help

# 버전 확인
which md
```

**해결**:
```bash
# 셸 설정
md setup
source ~/.zshrc  # 또는 ~/.bashrc
```

### 문제: OpenCode 인증 오류

**확인**:
```bash
opencode auth list
```

**해결**:
```bash
# 재인증
opencode auth login
```

### 문제: 스킬이 활성화 안 됨

**확인**:
```bash
# 스킬 파일 존재 확인
ls -la .claude/skills/
```

**해결**: 프로젝트 폴더에서 Claude Code를 실행했는지 확인
```bash
cd /home/cafe99/agent-system-project/self-evolving-agent-system
claude
```

### 문제: YAML 구문 오류

**확인**:
```bash
python3 -c "import yaml; yaml.safe_load(open('.opencode/brain/project_brain.yaml'))"
```

**해결**: YAML 들여쓰기 확인 (스페이스 2칸, 탭 사용 금지)

---

## 빠른 참조 카드

### 가장 많이 쓰는 명령어

```bash
# Claude Code 시작
cd /home/cafe99/agent-system-project/self-evolving-agent-system && claude

# 학습 기반 작업 (Claude Code 안에서)
/evolve 작업 내용

# MDFlow 마스터 워크플로우
echo "작업 내용" | md .mdflow/evolve.claude.md

# 패턴 확인
cat .opencode/brain/project_brain.yaml | grep -A 5 "learned_patterns"

# OpenCode 에이전트
opencode run --agent OmO "작업 내용"
```

### 스킬 트리거 치트시트

```
commit → git-expert
refactor, clean up → refactor-expert
debug, fix, error → debug-expert
api, endpoint → api-expert
analyze, sync → project-expert
test, serve → quick-commands
```

---

*이 가이드는 실제 작동하는 명령어만 포함합니다. 문제가 있으면 트러블슈팅 섹션을 참고하세요.*
