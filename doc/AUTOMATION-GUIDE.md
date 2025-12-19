# Self-Evolving Agent System - 실전 자동화 가이드북

> Oh-My-OpenCode + MDFlow + Claude Code 통합 자동화 시스템
> **현실적이고 실질적으로 작동하는 완전 가이드**

---

## 목차

1. [시스템 개요](#1-시스템-개요)
2. [도구별 실제 명령어](#2-도구별-실제-명령어)
3. [실전 시나리오 예시](#3-실전-시나리오-예시)
4. [자동화 파이프라인](#4-자동화-파이프라인)
5. [학습 시스템 활용](#5-학습-시스템-활용)
6. [트러블슈팅](#6-트러블슈팅)

---

## 1. 시스템 개요

### 1.1 전체 아키텍처

```
┌─────────────────────────────────────────────────────────────────────┐
│                         사용자 요청                                  │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│  Claude Code  │      │   MDFlow      │      │  OpenCode     │
│  (Interactive)│      │  (Workflow)   │      │  (Multi-Agent)│
│               │      │               │      │               │
│ - /evolve     │      │ - evolve.md   │      │ - @OmO        │
│ - skills      │      │ - research.md │      │ - @researcher │
│ - rules       │      │ - build.md    │      │ - @main-builder│
└───────┬───────┘      └───────┬───────┘      └───────┬───────┘
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Brain Memory Layer                                │
│                 .opencode/brain/project_brain.yaml                  │
│                                                                      │
│   - learned_patterns (SUCCESS/FAILURE)                              │
│   - workflow_history                                                 │
│   - metrics                                                          │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Automation Layer                                  │
│                                                                      │
│   - Git Hooks (자동 학습)                                           │
│   - File Watcher (파일 변경 감지)                                   │
│   - evolve-runner.sh (파이프라인 오케스트레이터)                    │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 역할 분담

| 도구 | 용도 | 언제 사용? |
|------|------|-----------|
| **Claude Code** | 인터랙티브 개발 | 대화하며 개발할 때 (권장) |
| **MDFlow** | 워크플로우 자동화 | 정형화된 작업 흐름 실행 |
| **OpenCode** | 멀티 에이전트 | 복잡한 작업을 분산 처리 |
| **Scripts** | 완전 자동화 | CI/CD, Git Hook, 데몬 |

---

## 2. 도구별 실제 명령어

### 2.1 Claude Code (가장 간단)

```bash
# 프로젝트 폴더에서 시작
cd /home/cafe99/agent-system-project/self-evolving-agent-system
claude

# Claude Code 안에서 바로 작업 요청
> JWT 인증 기능 구현해줘

# /evolve 커맨드로 학습 기반 실행
> /evolve 사용자 프로필 API 만들어줘

# 스킬 활용
> 이 코드 리팩토링해줘        # → refactor-expert 활성화
> git commit하고 PR 만들어줘  # → git-expert 활성화
> 이 에러 디버깅해줘          # → debug-expert 활성화
```

### 2.2 MDFlow 워크플로우

```bash
# 기본 실행 (인터랙티브)
md .mdflow/evolve.claude.md
# → 터미널에서 프롬프트 입력

# 파이프로 실행 (논인터랙티브)
echo "로그인 기능 구현해줘" | md .mdflow/evolve.claude.md

# 특정 워크플로우 실행
echo "React best practices 검색해줘" | md .mdflow/research.gemini.md
echo "유저 모델 만들어줘" | md .mdflow/build.codex.md
echo "auth.ts 파일 리뷰해줘" | md .mdflow/review.claude.md

# Ad-hoc 실행 (워크플로우 파일 없이)
md.claude "이 함수 설명해줘"
md.gemini "Next.js 14 라우팅 검색해줘"
md.codex "간단한 CRUD API 만들어줘"

# 인터랙티브 Ad-hoc
md.i.claude "대화하면서 설계하자"
```

### 2.3 OpenCode 멀티 에이전트

```bash
# 방법 1: CLI 직접 호출 (권장)
opencode run --agent OmO "전체 작업 계획 세워줘"
opencode run --agent researcher "Next.js 14 Server Actions 문서 찾아줘"
opencode run --agent main-builder "찾은 내용 기반으로 구현해줘"
opencode run --agent oracle "이 코드 아키텍처 리뷰해줘"

# 방법 2: TUI 모드 (인터랙티브)
opencode
# TUI에서 에이전트 선택 후 작업

# 에이전트 연속 호출 (순차 실행)
opencode run --agent researcher "검색" && \
opencode run --agent main-builder "구현" && \
opencode run --agent oracle "리뷰"
```

### 2.4 자동화 스크립트

```bash
# 전체 파이프라인 실행
./scripts/evolve-runner.sh -t "JWT 인증 시스템 구현" -e claude

# 특정 실행기 지정
./scripts/evolve-runner.sh -t "API 엔드포인트 추가" -e mdflow
./scripts/evolve-runner.sh -t "코드 리팩토링" -e opencode

# 태그 지정 (관련 패턴 검색)
./scripts/evolve-runner.sh -t "로그인 버그 수정" --tags "authentication,bugfix"

# 학습 비활성화
./scripts/evolve-runner.sh -t "테스트 작업" --no-learn

# 파일 감시 데몬
./scripts/file-watcher.sh start    # 시작
./scripts/file-watcher.sh status   # 상태 확인
./scripts/file-watcher.sh stop     # 중지
```

---

## 3. 실전 시나리오 예시

### 시나리오 1: 새 기능 개발 (처음부터 끝까지)

**요청**: "사용자 프로필 페이지 기능 만들어줘"

#### 방법 A: Claude Code (권장 - 가장 쉬움)

```bash
cd /home/cafe99/agent-system-project/self-evolving-agent-system
claude
```

```
You: /evolve 사용자 프로필 페이지 기능 만들어줘

Claude:
🧠 [Brain Sync] 관련 패턴 검색 중...
✅ LP-001 (JWT 인증) 적용 가능
⚠️ LP-002 (API 타임아웃) 회피 필요

📋 작업 계획:
1. 프로필 API 엔드포인트 설계
2. 데이터 모델 정의
3. API 구현 (타임아웃 설정 포함)
4. 프론트엔드 컴포넌트 작성
5. 테스트 코드 작성

시작하겠습니다...
[구현 진행]

📝 새로 학습한 패턴:
- LP-003: 프로필 API는 캐싱을 적용하면 성능 향상
```

#### 방법 B: MDFlow 워크플로우

```bash
# 1단계: 리서치
echo "사용자 프로필 페이지 구현 방법 조사해줘. React + Node.js 기준" \
  | md .mdflow/research.gemini.md > research_result.md

# 2단계: 구현
echo "research_result.md 내용 기반으로 프로필 API와 컴포넌트 구현해줘" \
  | md .mdflow/build.codex.md

# 3단계: 리뷰
echo "방금 생성한 프로필 관련 코드 리뷰해줘" \
  | md .mdflow/review.claude.md
```

#### 방법 C: OpenCode 멀티 에이전트

```bash
# 1. 계획 수립
opencode run --agent OmO "사용자 프로필 페이지 기능 개발 계획 세워줘"

# OmO 응답:
# 📋 계획:
# 1. researcher - 프로필 구현 베스트 프랙티스 조사
# 2. main-builder - 백엔드 API 구현
# 3. frontend-ui-ux-engineer - 프론트엔드 컴포넌트
# 4. oracle - 코드 리뷰

# 2. 리서치
opencode run --agent researcher "React 프로필 페이지 구현 예제 찾아줘"

# 3. API 구현
opencode run --agent main-builder "검색 결과 기반으로 API 구현해줘"

# 4. 코드 리뷰
opencode run --agent oracle "구현된 코드 리뷰해줘"
```

#### 방법 D: 완전 자동화

```bash
# 한 줄로 전체 파이프라인 실행
./scripts/evolve-runner.sh \
  -t "사용자 프로필 페이지 기능 구현. API, 컴포넌트, 테스트 포함" \
  -e claude \
  --tags "feature,profile,api"

# 결과 확인
cat .opencode/logs/report_*.md
```

---

### 시나리오 2: 버그 수정

**요청**: "로그인 후 토큰이 갱신되지 않는 버그 수정"

#### Claude Code 방식

```bash
claude
```

```
You: 로그인 후 토큰이 갱신되지 않는 버그 수정해줘. auth/token-manager.ts 파일 확인해봐

Claude:
🧠 [Brain Sync] 관련 패턴 검색...
✅ LP-001 발견: "JWT 토큰 관리는 Singleton 패턴으로 구현"
⚠️ LP-002 발견: "axios 요청에 타임아웃 설정 필수"

🔍 [분석 중] auth/token-manager.ts 확인...

문제 발견: refreshToken() 함수에서 타임아웃 미설정
해결: axios 요청에 timeout: 5000 추가

[수정 완료]

📝 새로 학습한 패턴:
- LP-004: 토큰 갱신 실패 시 자동 로그아웃 처리 필요
  confidence: 0.85
  tags: [authentication, jwt, error-handling]
```

#### 자동화 스크립트 방식

```bash
./scripts/evolve-runner.sh \
  -t "auth/token-manager.ts에서 토큰 갱신 버그 수정. 타임아웃 및 에러 처리 확인" \
  -e claude \
  --tags "bugfix,authentication,jwt"
```

---

### 시나리오 3: 코드 리팩토링

**요청**: "utils 폴더의 중복 코드 정리"

```bash
claude
```

```
You: utils 폴더의 중복 코드 정리해줘

Claude: [refactor-expert 스킬 활성화]

🔍 utils/ 폴더 분석 중...

발견된 중복:
1. formatDate() - 3개 파일에서 유사 구현
2. validateEmail() - 2개 파일에서 동일 코드
3. handleError() - 4개 파일에서 다른 방식으로 구현

리팩토링 계획:
1. utils/date.ts 생성 → formatDate 통합
2. utils/validation.ts 생성 → validateEmail 통합
3. utils/error.ts 생성 → handleError 표준화

진행하시겠습니까?

You: 진행해줘

Claude: [리팩토링 진행...]
✅ 완료

📝 새로 학습한 패턴:
- LP-005: 유틸리티 함수는 도메인별로 분리 (date, validation, error)
  confidence: 0.9
```

---

### 시나리오 4: Git 커밋 후 자동 학습

**상황**: 기능 구현 후 커밋 시 자동으로 패턴 학습

```bash
# 1. 코드 변경 (Claude Code로 작업 완료 후)

# 2. 커밋 (자동으로 학습 트리거)
git add .
git commit -m "feat: add user profile API with caching"

# 콘솔 출력:
# 🧠 [Pre-Commit] Checking brain patterns...
#    Changed files:
#      - src/api/profile.ts
#      - src/components/Profile.tsx
# ✅ [Pre-Commit] All checks passed
#
# 🧠 [Post-Commit] Starting auto-learning process...
#    Commit: a1b2c3d4
#    Author: cafe99
#    Files changed: 2
#    Auto-learning started in background (PID: 12345)
# ✅ [Post-Commit] Learning process initiated

# 3. 학습 결과 확인
cat .opencode/brain/project_brain.yaml | grep -A 10 "LP-006"
```

---

### 시나리오 5: 파일 감시 자동화

**상황**: 코드 변경 시 자동으로 lint, 테스트, 학습 실행

```bash
# 1. 파일 감시 데몬 시작
./scripts/file-watcher.sh start

# 출력:
# Starting file watcher daemon...
# Watcher started (PID: 12345)

# 2. 코드 수정 (에디터에서)
# src/api/profile.ts 수정...

# 3. 자동 실행됨:
# [02:30:15] Change detected: src/api/profile.ts (MODIFY)
# [02:30:15] Running ESLint on src/api/profile.ts...
# [02:30:16] Triggering evolution cycle...

# 4. 상태 확인
./scripts/file-watcher.sh status
# Watcher running (PID: 12345)
# Log file: .opencode/logs/watcher.log

# 5. 로그 확인
tail -f .opencode/logs/watcher.log
```

---

## 4. 자동화 파이프라인

### 4.1 전체 파이프라인 흐름

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   TRIGGER    │────▶│  ORCHESTRATE │────▶│    LEARN     │
│              │     │              │     │              │
│ - Git commit │     │ - Brain load │     │ - 분석       │
│ - File change│     │ - Execute    │     │ - 패턴 추출  │
│ - Manual     │     │ - Validate   │     │ - Brain 저장 │
└──────────────┘     └──────────────┘     └──────────────┘
```

### 4.2 파이프라인 설정

`.opencode/automation-config.yaml` 수정:

```yaml
# Git 커밋 시 자동 학습
git_hooks:
  post_commit:
    auto_learn_on_commit: true      # 커밋마다 학습
    trigger_evolution: false         # true면 매 커밋마다 전체 진화 사이클

# 파일 감시 설정
file_watcher:
  watch_paths: "src lib app"        # 감시할 폴더
  watch_extensions: "ts,tsx,js,py"  # 감시할 확장자
  debounce_seconds: 3               # 연속 변경 대기 시간
  auto_run_lint: true               # 자동 lint
  auto_run_tests: false             # 자동 테스트
  auto_trigger_evolve: true         # 자동 진화 트리거

# 자동 학습 설정
auto_learning:
  default_confidence: 0.8           # 기본 신뢰도
  use_ai_analysis: false            # Claude로 패턴 분석
  max_patterns: 100                 # 최대 패턴 수
```

### 4.3 사용 예시: CI/CD 통합

```bash
# .github/workflows/evolve.yml (예시)
name: Evolve on Push

on:
  push:
    branches: [main]

jobs:
  evolve:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Evolution Cycle
        run: |
          ./scripts/evolve-runner.sh \
            -t "CI에서 자동 진화 사이클 실행" \
            -e claude \
            --tags "ci,auto"

      - name: Upload Brain
        uses: actions/upload-artifact@v4
        with:
          name: brain-snapshot
          path: .opencode/brain/
```

---

## 5. 학습 시스템 활용

### 5.1 학습된 패턴 확인

```bash
# 전체 패턴 보기
cat .opencode/brain/project_brain.yaml | grep -A 15 "learned_patterns:"

# 성공 패턴만 보기
grep -A 10 "SUCCESS_PATTERN" .opencode/brain/project_brain.yaml

# 실패 패턴만 보기
grep -A 10 "FAILURE_PATTERN" .opencode/brain/project_brain.yaml

# 특정 태그 패턴 검색
grep -B 5 -A 10 "authentication" .opencode/brain/project_brain.yaml
```

### 5.2 수동으로 패턴 추가

```yaml
# .opencode/brain/project_brain.yaml에 추가
learned_patterns:
  # 기존 패턴들...

  - id: "LP-010"
    context: "대용량 파일 업로드 구현"
    status: "SUCCESS_PATTERN"
    content: |
      청크 업로드 방식 사용 (5MB 단위).
      진행률 콜백으로 UX 개선.
      실패 시 재시도 로직 필수 (최대 3회).
    learned_at: "2025-12-17T10:00:00+09:00"
    confidence: 0.85
    tags:
      - file-upload
      - performance
      - error-handling
    related_files:
      - "utils/upload.ts"
      - "components/FileUploader.tsx"
```

### 5.3 패턴 신뢰도 조정

작업 결과에 따라 신뢰도 수정:

```yaml
# 성공적으로 적용된 패턴: confidence 증가
- id: "LP-001"
  confidence: 0.95  # 0.9에서 증가

# 실패한 패턴: confidence 감소
- id: "LP-002"
  confidence: 0.7   # 0.95에서 감소
```

### 5.4 패턴 정리 (오래된 것 제거)

```bash
# 90일 이상 된 낮은 신뢰도 패턴 확인
# (수동 정리 또는 설정에서 auto_archive_after_days 사용)

# 패턴 백업
cp .opencode/brain/project_brain.yaml .opencode/brain/project_brain.backup.yaml

# 필요 없는 패턴 수동 제거 후
# 메트릭 재계산
./scripts/auto-learn.sh --recalculate-metrics
```

---

## 6. 트러블슈팅

### 6.1 일반적인 문제

#### MDFlow 실행 안 됨

```bash
# 확인
which md
md --help

# 설정
md setup
source ~/.bashrc
```

#### OpenCode 에이전트 응답 없음

```bash
# 인증 확인
opencode auth list

# 재인증
opencode auth login google
opencode auth login anthropic
```

#### Claude Code에서 /evolve 안 됨

```bash
# 커맨드 파일 확인
cat .claude/commands/evolve.md

# 프로젝트 폴더에서 실행 확인
pwd  # /home/cafe99/agent-system-project/self-evolving-agent-system
```

### 6.2 자동화 문제

#### Git Hook 실행 안 됨

```bash
# 권한 확인
ls -la .git/hooks/pre-commit
ls -la .git/hooks/post-commit

# 심볼릭 링크 확인
file .git/hooks/post-commit
# 출력: symbolic link to .../scripts/hooks/post-commit

# 수동 테스트
.git/hooks/post-commit
```

#### 파일 감시 데몬 안 됨

```bash
# inotify-tools 설치 확인
which inotifywait

# 없으면 설치
sudo apt-get install inotify-tools

# 수동 시작
./scripts/file-watcher.sh --watch
```

#### Brain 업데이트 안 됨

```bash
# 파일 권한 확인
ls -la .opencode/brain/project_brain.yaml

# YAML 문법 검증
python3 -c "import yaml; yaml.safe_load(open('.opencode/brain/project_brain.yaml'))"

# 백업에서 복원
cp .opencode/brain/project_brain.backup.yaml .opencode/brain/project_brain.yaml
```

### 6.3 성능 문제

#### 학습이 너무 느림

```yaml
# automation-config.yaml 수정
auto_learning:
  use_ai_analysis: false  # AI 분석 비활성화 (빠름)
```

#### 파일 감시가 CPU를 많이 사용

```yaml
# automation-config.yaml 수정
file_watcher:
  debounce_seconds: 5      # 대기 시간 증가
  min_trigger_interval: 120  # 트리거 간격 증가
```

---

## Quick Reference Card

### 가장 많이 사용하는 명령어

```bash
# 인터랙티브 개발 (권장)
claude

# 워크플로우 실행
echo "작업내용" | md .mdflow/evolve.claude.md

# Ad-hoc 질문
md.claude "질문"

# 멀티 에이전트
opencode run --agent OmO "작업 내용"
opencode run --agent researcher "검색 내용"
opencode run --agent main-builder "구현 내용"

# 자동화 실행
./scripts/evolve-runner.sh -t "작업" -e claude

# 파일 감시 시작
./scripts/file-watcher.sh start

# 패턴 확인
cat .opencode/brain/project_brain.yaml
```

### 스킬 트리거 키워드

| 키워드 | 활성화 스킬 |
|--------|------------|
| commit, branch, pr | git-expert |
| refactor, clean up | refactor-expert |
| debug, fix, error | debug-expert |
| api, endpoint, route | api-expert |
| analyze, learn, sync | project-expert |
| test, serve, format | quick-commands |

---

*이 가이드북은 실제 작동하는 명령어와 시나리오로 구성되었습니다.*
*문제 발생 시 트러블슈팅 섹션을 참고하세요.*
