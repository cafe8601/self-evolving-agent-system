# Self-Evolving Agent System - 완전한 프로젝트 예시

> **핵심 가이드**: 하나의 프로젝트가 어떻게 3가지 LLM 협업과 도구 결합을 통해 스스로 진화하는지 보여주는 완전한 예시

---

## 이 문서의 차이점

기존 가이드북들은 각 도구(Claude Code, MDFlow, OpenCode)의 **개별 사용법**을 설명합니다.
이 문서는 하나의 프로젝트가 **처음부터 끝까지** 진화하는 과정을 보여줍니다.

| 기존 가이드 | 이 문서 |
|------------|---------|
| "방법 A: Claude Code 사용" | "Step 1에서 Gemini가 조사한 결과를" |
| "방법 B: MDFlow 사용" | "Step 2에서 Claude가 계획에 반영하고" |
| "방법 C: OpenCode 사용" | "Step 3에서 GPT가 구현에 적용" |
| 도구를 **선택**하는 관점 | 도구가 **협업**하는 관점 |

---

## 핵심 개념 정리

### 1. 자가 진화(Self-Evolution)란?

단순 실행이 아닌 **학습 → 적용 → 피드백 → 개선** 사이클입니다.

```
┌─────────────────────────────────────────────────────────────────────┐
│                     일반 AI 에이전트                                 │
│                                                                      │
│   요청 ──────▶ 실행 ──────▶ 결과 ──────▶ [잊음]                     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                   자가 진화 에이전트 시스템                          │
│                                                                      │
│   요청 ──▶ Brain 로드 ──▶ 패턴 적용 ──▶ 실행 ──▶ 학습 기록          │
│              │                                       │               │
│              │            ◀── 진화 ───              │               │
│              └───────────────────────────────────────┘               │
│                                                                      │
│   💡 핵심: 이전 작업의 성공/실패가 다음 작업에 자동 반영             │
└─────────────────────────────────────────────────────────────────────┘
```

### 2. 3 LLM 역할 분담

| LLM | 역할 | 담당 질문 | 언제 호출? |
|-----|------|----------|-----------|
| **Gemini 3 Pro** | Researcher | "무엇을 알아야 하는가?" | 기술 조사, 베스트 프랙티스 검색 |
| **Claude Opus 4.5** | Planner/Reviewer | "무엇을 해야 하는가?" / "잘 했는가?" | 계획 수립, 코드 리뷰, 학습 기록 |
| **GPT-5.2** | Builder | "어떻게 만드는가?" | 실제 프로덕션 코드 작성 |

**핵심**: 3개의 LLM이 **독립적으로** 작동하는 것이 아니라, **파이프라인**으로 연결됩니다.

```
Gemini(조사) ──[context]──▶ Claude(계획) ──[plan]──▶ GPT(구현) ──[code]──▶ Claude(리뷰/학습)
```

### 3. 시스템 아키텍처: 도구들의 관계

**중요**: MDFlow와 OpenCode는 "내부적으로" 각 **CLI 도구(Claude Code, Codex CLI, Gemini CLI)**를 호출합니다. 구독 기반 인증으로 연결되어 있어 API 키 없이 동작합니다.

```
┌─────────────────────────────────────────────────────────────────────┐
│                      사용자 인터페이스 선택                          │
│                                                                      │
│   ┌─────────────────┐         ┌─────────────────┐                   │
│   │  claude         │   또는  │  md / opencode  │                   │
│   │  (직접 대화)    │         │  (자동 워크플로우)│                   │
│   │                 │         │                  │                   │
│   │ /evolve 작업내용│         │ opencode run    │                   │
│   └────────┬────────┘         │ --agent OmO "..." │                  │
│            │                  │                  │                   │
│            │                  │ echo "..." |    │                   │
│            │                  │ md .mdflow/...  │                   │
│            │                  └────────┬────────┘                   │
│            │                           │                             │
│            ▼                           ▼                             │
│   ┌─────────────────┐         ┌─────────────────────────────────┐   │
│   │ Claude Code     │         │ 오케스트레이션 레이어            │   │
│   │ + Skills        │         │                                  │   │
│   │ + Agents        │         │ MDFlow (.mdflow/*.md)            │   │
│   │ + Brain Rules   │         │   ↓ 워크플로우 정의              │   │
│   │                 │         │ OpenCode (oh-my-opencode.json)   │   │
│   │ 스킬 자동 활성화│         │   ↓ 에이전트 라우팅              │   │
│   └────────┬────────┘         └────────┬────────────────────────┘   │
│            │                           │                             │
│            ▼                           ▼                             │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                    CLI 도구 레이어 (구독 기반 인증)          │   │
│   │                                                              │   │
│   │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │   │
│   │   │ Claude Code  │  │  Codex CLI   │  │  Gemini CLI  │      │   │
│   │   │ (Opus/Sonnet)│  │   (GPT)      │  │  (3 Pro)     │      │   │
│   │   └──────────────┘  └──────────────┘  └──────────────┘      │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                    │                                 │
│                                    ▼                                 │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                    Brain Memory (공유)                       │   │
│   │                    project_brain.yaml                        │   │
│   └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 4. 스킬/에이전트 시스템 사용 범위

**중요**: 각 도구는 **자체 설정 시스템**을 사용합니다.

| 리소스 | 사용 도구 | 사용 불가 |
|--------|----------|----------|
| `.claude/skills/` (git-expert 등) | **Claude Code만** | MDFlow, OpenCode |
| `.claude/agents/` (tier1-core 등) | **Claude Code만** | MDFlow, OpenCode |
| `.mdflow/*.md` (워크플로우) | **MDFlow만** | Claude Code, OpenCode |
| `.opencode/oh-my-opencode.json` | **OpenCode만** | Claude Code, MDFlow |
| `.opencode/brain/project_brain.yaml` | **모두 공유** | - |

```
┌─────────────────────────────────────────────────────────────────────┐
│  Claude Code 사용 시                                                 │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ "commit해줘" → git-expert 스킬 자동 활성화                       ││
│  │ "refactor해줘" → refactor-expert 스킬 자동 활성화                ││
│  │ Task tool → .claude/agents/ 에이전트 사용 가능                   ││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  MDFlow/OpenCode 사용 시                                             │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ Claude Code 스킬 사용 불가                                       ││
│  │ 대신 자체 설정 사용:                                             ││
│  │ - MDFlow: .mdflow/*.md 워크플로우 정의                           ││
│  │ - OpenCode: oh-my-opencode.json 에이전트 정의                    ││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  공유되는 것: Brain Memory                                           │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ project_brain.yaml은 모든 도구에서 읽고 쓸 수 있음               ││
│  │ → Claude Code로 작업 후 학습된 패턴이                            ││
│  │ → MDFlow/OpenCode 작업에도 적용 가능                             ││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

### 5. 실제 명령어와 동작 방식

**테스트 완료된 실제 명령어:**

| 도구 | 명령어 | 동작 |
|------|--------|------|
| **Claude Code** | `/evolve 작업내용` | Claude가 직접 처리 |
| **OpenCode** | `opencode run --agent OmO "작업내용"` | 에이전트별 처리 |
| **MDFlow** | `echo "작업내용" \| md .mdflow/evolve.claude.md` | 워크플로우 기반 처리 |

MDFlow가 워크플로우를 정의하고, OpenCode가 각 단계를 실행합니다.

```
┌─────────────────────────────────────────────────────────────────────┐
│   MDFlow 워크플로우 정의 (evolve.claude.md)                          │
│                                                                      │
│   ┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐   │
│   │RESEARCH│ → │  PLAN  │ → │ BUILD  │ → │ REVIEW │ → │ LEARN  │   │
│   │.gemini │   │.claude │   │.codex  │   │.claude │   │.claude │   │
│   └────────┘   └────────┘   └────────┘   └────────┘   └────────┘   │
└────────────────────────────┬────────────────────────────────────────┘
                             │ 각 단계에서 OpenCode 에이전트 호출
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│   OpenCode 에이전트 실행 (oh-my-opencode.json)                       │
│                                                                      │
│   ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐   │
│   │@researcher │  │    @OmO    │  │@main-builder│ │   @oracle  │   │
│   │  (Gemini)  │  │  (Claude)  │  │   (GPT)    │  │  (Claude)  │   │
│   └────────────┘  └────────────┘  └────────────┘  └────────────┘   │
└────────────────────────────┬────────────────────────────────────────┘
                             │ 결과 저장
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│   Brain Memory 업데이트                                              │
│   project_brain.yaml: learned_patterns, metrics                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 완전한 프로젝트 예시: 협업 Todo 앱

**목표**: 실시간 협업이 가능한 Todo 관리 앱
**기술**: Next.js + Prisma + WebSocket
**기간**: 4가지 기능 구현을 통한 진화 과정 시연

---

## Part 1: 첫 기능 구현 - JWT 인증 (빈 Brain에서 시작)

### 상황 설정

```yaml
# project_brain.yaml 초기 상태
learned_patterns: []  # 비어있음 - 아무것도 학습되지 않음
metrics:
  total_tasks: 0
  evolution_cycles: 0
```

### Step 1: 사용자 요청 (3가지 방법)

```bash
# 방법 1: Claude Code에서 실행 (권장 - 대화형)
claude
> /evolve JWT 기반 사용자 인증 시스템 구현해줘

# 방법 2: OpenCode로 실행 (에이전트 선택 가능)
opencode run --agent OmO "JWT 기반 사용자 인증 시스템 구현해줘"

# 방법 3: MDFlow로 실행 (워크플로우 기반)
echo "JWT 기반 사용자 인증 시스템 구현해줘" | md .mdflow/evolve.claude.md
```

### Step 2: 오케스트레이션 시작

선택한 도구에 따라 워크플로우가 실행됩니다:
- **Claude Code**: `.claude/commands/evolve.md` 프롬프트 확장 → Claude가 직접 처리
- **OpenCode**: `oh-my-opencode.json`의 에이전트 설정에 따라 실행
- **MDFlow**: `.mdflow/evolve.claude.md` 워크플로우 실행 → Claude Code CLI 호출

#### Phase 2.1: RESEARCH (Gemini 3 Pro)

```
┌─────────────────────────────────────────────────────────────────────┐
│  🔍 RESEARCH PHASE (@researcher - Gemini 3 Pro)                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Task: "JWT 인증 구현 베스트 프랙티스 2024 조사"                    │
│                                                                      │
│  Gemini가 조사한 내용:                                               │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ 📚 research_context.md                                          │ │
│  │                                                                  │ │
│  │ ## JWT 저장 방식 비교                                           │ │
│  │ - localStorage: XSS 취약, 권장하지 않음                         │ │
│  │ - httpOnly 쿠키: XSS 방어, CSRF 별도 처리 필요 ✅ 권장          │ │
│  │                                                                  │ │
│  │ ## 토큰 전략                                                    │ │
│  │ - Access Token: 15분 만료                                       │ │
│  │ - Refresh Token: 7일 만료, 별도 엔드포인트                      │ │
│  │                                                                  │ │
│  │ ## 보안 고려사항                                                │ │
│  │ - 토큰 페이로드에 민감 정보 금지                                │ │
│  │ - Refresh Token Rotation 권장                                   │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  Output: research_context.md → 다음 단계로 전달                      │
└─────────────────────────────────────────────────────────────────────┘
```

#### Phase 2.2: PLAN (Claude Opus 4.5)

```
┌─────────────────────────────────────────────────────────────────────┐
│  🧠 PLAN PHASE (@OmO - Claude Opus 4.5)                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Input: 요청 + research_context.md                                   │
│                                                                      │
│  🧠 [Brain Sync] 패턴 검색 중...                                    │
│  → learned_patterns: [] (빈 상태)                                    │
│  → 적용할 기존 패턴 없음, 새로 설계 필요                            │
│                                                                      │
│  Claude의 설계:                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ 📋 architecture_plan.md                                         │ │
│  │                                                                  │ │
│  │ ## 아키텍처 결정                                                │ │
│  │ - Gemini 리서치 기반: httpOnly 쿠키 사용 결정                   │ │
│  │ - Access Token 15분, Refresh Token 7일                          │ │
│  │                                                                  │ │
│  │ ## 파일 구조                                                    │ │
│  │ src/                                                            │ │
│  │ ├── api/auth/                                                   │ │
│  │ │   ├── login.ts      # POST /api/auth/login                   │ │
│  │ │   ├── logout.ts     # POST /api/auth/logout                  │ │
│  │ │   └── refresh.ts    # POST /api/auth/refresh                 │ │
│  │ ├── middleware/                                                 │ │
│  │ │   └── auth.ts       # JWT 검증 미들웨어                      │ │
│  │ └── utils/                                                      │ │
│  │     └── jwt.ts        # 토큰 생성/검증 유틸                    │ │
│  │                                                                  │ │
│  │ ## API 설계                                                     │ │
│  │ - POST /api/auth/login    → Set-Cookie (httpOnly)              │ │
│  │ - POST /api/auth/refresh  → 새 토큰 발급                        │ │
│  │ - POST /api/auth/logout   → 쿠키 삭제                           │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  Output: architecture_plan.md → 다음 단계로 전달                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### Phase 2.3: BUILD (GPT-5.2)

```
┌─────────────────────────────────────────────────────────────────────┐
│  🔨 BUILD PHASE (@main-builder - GPT-5.2)                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Input: architecture_plan.md + research_context.md                   │
│                                                                      │
│  GPT가 구현한 코드:                                                  │
│                                                                      │
│  📁 src/utils/jwt.ts                                                │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ import jwt from 'jsonwebtoken';                                 │ │
│  │                                                                  │ │
│  │ const ACCESS_TOKEN_EXPIRY = '15m';                              │ │
│  │ const REFRESH_TOKEN_EXPIRY = '7d';                              │ │
│  │                                                                  │ │
│  │ export function generateTokens(userId: string) {                │ │
│  │   const accessToken = jwt.sign(                                 │ │
│  │     { userId },                                                 │ │
│  │     process.env.JWT_SECRET!,                                    │ │
│  │     { expiresIn: ACCESS_TOKEN_EXPIRY }                          │ │
│  │   );                                                            │ │
│  │   const refreshToken = jwt.sign(                                │ │
│  │     { userId },                                                 │ │
│  │     process.env.JWT_REFRESH_SECRET!,                            │ │
│  │     { expiresIn: REFRESH_TOKEN_EXPIRY }                         │ │
│  │   );                                                            │ │
│  │   return { accessToken, refreshToken };                         │ │
│  │ }                                                               │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  📁 src/api/auth/login.ts                                           │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ // Gemini 리서치 기반: httpOnly 쿠키 사용                       │ │
│  │ export async function POST(req: Request) {                      │ │
│  │   const { email, password } = await req.json();                 │ │
│  │   const user = await verifyCredentials(email, password);        │ │
│  │                                                                  │ │
│  │   const { accessToken, refreshToken } = generateTokens(user.id);│ │
│  │                                                                  │ │
│  │   const response = NextResponse.json({ user });                 │ │
│  │                                                                  │ │
│  │   // httpOnly 쿠키 설정 (XSS 방어)                              │ │
│  │   response.cookies.set('accessToken', accessToken, {            │ │
│  │     httpOnly: true,                                             │ │
│  │     secure: process.env.NODE_ENV === 'production',              │ │
│  │     sameSite: 'strict',                                         │ │
│  │     maxAge: 60 * 15 // 15분                                     │ │
│  │   });                                                           │ │
│  │                                                                  │ │
│  │   return response;                                              │ │
│  │ }                                                               │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  Output: 실제 코드 파일들 생성                                       │
└─────────────────────────────────────────────────────────────────────┘
```

#### Phase 2.4: REVIEW (Claude Opus 4.5)

```
┌─────────────────────────────────────────────────────────────────────┐
│  ✅ REVIEW PHASE (@oracle - Claude Opus 4.5)                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Input: 생성된 코드                                                  │
│                                                                      │
│  Claude의 리뷰:                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ 📝 review_result.md                                             │ │
│  │                                                                  │ │
│  │ ## 보안 검토                                                    │ │
│  │ ✅ httpOnly 쿠키 사용 - XSS 방어 완료                           │ │
│  │ ✅ secure 플래그 - 프로덕션에서 HTTPS 강제                      │ │
│  │ ✅ sameSite strict - CSRF 기본 방어                             │ │
│  │                                                                  │ │
│  │ ## 코드 품질                                                    │ │
│  │ ✅ 타입스크립트 사용                                            │ │
│  │ ✅ 환경변수로 시크릿 관리                                       │ │
│  │                                                                  │ │
│  │ ## 개선 제안                                                    │ │
│  │ - Rate limiting 추가 권장                                       │ │
│  │ - 로그인 실패 횟수 제한 권장                                    │ │
│  │                                                                  │ │
│  │ 결론: ✅ APPROVED                                               │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

#### Phase 2.5: LEARN (Claude Opus 4.5) - 핵심 진화 단계

```
┌─────────────────────────────────────────────────────────────────────┐
│  📚 LEARN PHASE (@OmO - Claude Opus 4.5)                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Task: "이번 작업에서 학습할 패턴 추출"                              │
│                                                                      │
│  Claude의 분석:                                                      │
│  "이번 JWT 구현에서 다음 작업에 재사용할 수 있는 패턴 발견:         │
│   1. JWT 저장 방식 결정 패턴                                        │
│   2. 토큰 엔드포인트 분리 패턴"                                     │
│                                                                      │
│  🧠 Brain Memory 업데이트:                                          │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ # project_brain.yaml 업데이트                                   │ │
│  │                                                                  │ │
│  │ learned_patterns:                                                │ │
│  │   - id: "LP-001"                                                │ │
│  │     context: "JWT 토큰 저장 방식"                               │ │
│  │     status: "SUCCESS_PATTERN"                                   │ │
│  │     content: |                                                  │ │
│  │       JWT는 httpOnly 쿠키에 저장하면 XSS 공격 방지.             │ │
│  │       secure, sameSite 플래그도 함께 설정.                      │ │
│  │     learned_at: "2025-12-17T10:00:00+09:00"                     │ │
│  │     confidence: 0.85                                            │ │
│  │     tags: [authentication, jwt, security, cookie]               │ │
│  │     related_files:                                              │ │
│  │       - "src/api/auth/login.ts"                                 │ │
│  │                                                                  │ │
│  │   - id: "LP-002"                                                │ │
│  │     context: "토큰 갱신 엔드포인트"                             │ │
│  │     status: "SUCCESS_PATTERN"                                   │ │
│  │     content: |                                                  │ │
│  │       refresh token은 /api/auth/refresh 별도 엔드포인트로 분리. │ │
│  │       access token과 분리하여 보안성 향상.                      │ │
│  │     learned_at: "2025-12-17T10:00:00+09:00"                     │ │
│  │     confidence: 0.85                                            │ │
│  │     tags: [authentication, jwt, api]                            │ │
│  │     related_files:                                              │ │
│  │       - "src/api/auth/refresh.ts"                               │ │
│  │                                                                  │ │
│  │ metrics:                                                         │ │
│  │   total_tasks: 1                                                │ │
│  │   successful_tasks: 1                                           │ │
│  │   evolution_cycles: 1                                           │ │
│  │   patterns_learned: 2                                           │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  💡 진화 결과: 0개 패턴 → 2개 패턴 학습                              │
└─────────────────────────────────────────────────────────────────────┘
```

### Part 1 요약: 데이터 흐름

```
┌────────────┐     research_context     ┌────────────┐
│  Gemini    │ ────────────────────────▶│  Claude    │
│ (Research) │                          │  (Plan)    │
└────────────┘                          └─────┬──────┘
                                              │
                                    architecture_plan
                                              │
                                              ▼
                                        ┌────────────┐
                                        │    GPT     │
                                        │  (Build)   │
                                        └─────┬──────┘
                                              │
                                         actual_code
                                              │
                                              ▼
                                        ┌────────────┐
                                        │  Claude    │
                                        │(Review/Learn)
                                        └─────┬──────┘
                                              │
                                         patterns
                                              │
                                              ▼
                                        ┌────────────┐
                                        │   Brain    │
                                        │  Memory    │
                                        │ LP-001,002 │
                                        └────────────┘
```

---

## Part 2: 두 번째 기능 - Todo CRUD (학습된 패턴 적용)

### 상황 설정

```yaml
# project_brain.yaml 현재 상태 (Part 1 이후)
learned_patterns:
  - id: LP-001  # JWT httpOnly 쿠키
  - id: LP-002  # Refresh token 분리

metrics:
  total_tasks: 1
  patterns_learned: 2
```

### Step 1: 사용자 요청

```bash
# Claude Code에서
> /evolve Todo CRUD API 만들어줘. 인증된 사용자만 접근 가능하게.

# 또는 OpenCode에서
opencode run --agent OmO "Todo CRUD API 만들어줘. 인증된 사용자만 접근 가능하게."

# 또는 MDFlow에서
echo "Todo CRUD API 만들어줘. 인증된 사용자만 접근 가능하게." | md .mdflow/evolve.claude.md
```

### Step 2: Brain Sync (자동)

시스템이 자동으로 Brain을 스캔합니다:

```
┌─────────────────────────────────────────────────────────────────────┐
│  🧠 Brain Sync (자동 실행)                                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  요청 분석: "인증된 사용자" → 태그 매칭 시작                        │
│                                                                      │
│  검색 결과:                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ ✅ LP-001 매칭 (confidence: 0.85)                               │ │
│  │    태그: [authentication, jwt, security]                        │ │
│  │    적용: "기존 auth middleware 재사용"                          │ │
│  │                                                                  │ │
│  │ ✅ LP-002 매칭 (confidence: 0.85)                               │ │
│  │    태그: [authentication, api]                                  │ │
│  │    적용: "일관된 API 엔드포인트 구조 유지"                      │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  📋 패턴 컨텍스트가 PLAN 단계에 자동 주입됨                         │
└─────────────────────────────────────────────────────────────────────┘
```

### Step 3: PLAN 단계에서 패턴 적용

```
┌─────────────────────────────────────────────────────────────────────┐
│  🧠 PLAN PHASE (패턴 적용된 상태)                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  🧠 [Brain Pattern Applied]                                         │
│                                                                      │
│  ✅ LP-001 적용:                                                    │
│  "인증 미들웨어에서 httpOnly 쿠키의 accessToken 추출하도록 설계.   │
│   기존 src/middleware/auth.ts 재사용."                              │
│                                                                      │
│  ✅ LP-002 적용:                                                    │
│  "기존 /api/auth/* 구조와 일관되게 /api/todos/* 설계."             │
│                                                                      │
│  Claude의 설계 (패턴이 반영됨):                                      │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ 📋 architecture_plan.md                                         │ │
│  │                                                                  │ │
│  │ ## 패턴 기반 설계                                               │ │
│  │ - 🧠 LP-001: 기존 auth middleware 재사용                        │ │
│  │ - 🧠 LP-002: API 구조 일관성 (/api/todos/*)                     │ │
│  │                                                                  │ │
│  │ ## 파일 구조                                                    │ │
│  │ src/api/todos/                                                  │ │
│  │ ├── route.ts           # GET(list), POST(create)                │ │
│  │ └── [id]/route.ts      # GET(detail), PUT, DELETE               │ │
│  │                                                                  │ │
│  │ ## 미들웨어 적용 (LP-001 기반)                                  │ │
│  │ - 모든 /api/todos/* 라우트에 authMiddleware 적용               │ │
│  │ - 쿠키에서 토큰 추출 (기존 구현 재사용)                         │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  💡 패턴 덕분에 설계 시간 30% 단축 (검증된 방식 재사용)             │
└─────────────────────────────────────────────────────────────────────┘
```

### Step 4: BUILD 단계 - 패턴이 코드에 반영됨

```typescript
// src/api/todos/route.ts
// 🧠 LP-001: 기존 auth middleware 재사용
import { authMiddleware, AuthRequest } from '@/middleware/auth';
// 🧠 LP-002: 일관된 API 구조
import { NextResponse } from 'next/server';

export async function GET(req: AuthRequest) {
  // authMiddleware가 이미 쿠키에서 토큰을 추출하고 userId를 주입함
  const todos = await prisma.todo.findMany({
    where: { userId: req.userId }
  });
  return NextResponse.json({ todos });
}

export async function POST(req: AuthRequest) {
  const { title, description } = await req.json();
  const todo = await prisma.todo.create({
    data: {
      title,
      description,
      userId: req.userId  // LP-001 덕분에 자동으로 사용 가능
    }
  });
  return NextResponse.json({ todo });
}
```

### Step 5: LEARN 단계 - 새로운 패턴 추가

```
┌─────────────────────────────────────────────────────────────────────┐
│  📚 LEARN PHASE - 새로운 패턴 발견                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Claude의 분석:                                                      │
│  "이번 Todo 구현에서 새로운 재사용 가능 패턴 발견:                  │
│   1. 사용자-데이터 관계 설정 패턴                                   │
│   2. 협업 환경 삭제 처리 패턴"                                      │
│                                                                      │
│  🧠 Brain Memory 업데이트:                                          │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ # 기존 패턴 유지 + 새 패턴 추가                                 │ │
│  │                                                                  │ │
│  │ learned_patterns:                                                │ │
│  │   - id: LP-001  # (기존)                                        │ │
│  │   - id: LP-002  # (기존)                                        │ │
│  │                                                                  │ │
│  │   - id: "LP-003"                                                │ │
│  │     context: "CRUD API와 사용자 관계 설정"                      │ │
│  │     status: "SUCCESS_PATTERN"                                   │ │
│  │     content: |                                                  │ │
│  │       사용자별 데이터는 Prisma relation으로 연결.               │ │
│  │       쿼리 시 where: { userId: req.userId } 조건 적용.          │ │
│  │       데이터 소유권 검증 자동화.                                │ │
│  │     confidence: 0.8                                             │ │
│  │     tags: [api, database, prisma, crud, authorization]          │ │
│  │                                                                  │ │
│  │   - id: "LP-004"                                                │ │
│  │     context: "협업 환경의 삭제 처리"                            │ │
│  │     status: "SUCCESS_PATTERN"                                   │ │
│  │     content: |                                                  │ │
│  │       협업 데이터는 hard delete 대신 soft delete 사용.          │ │
│  │       deletedAt 필드로 관리, 복구 가능성 확보.                  │ │
│  │       삭제 요청 시: deletedAt = new Date()                      │ │
│  │     confidence: 0.75                                            │ │
│  │     tags: [api, database, collaboration, undo]                  │ │
│  │                                                                  │ │
│  │ metrics:                                                         │ │
│  │   total_tasks: 2                                                │ │
│  │   successful_tasks: 2                                           │ │
│  │   evolution_cycles: 2                                           │ │
│  │   patterns_learned: 4                                           │ │
│  │   patterns_applied: 2  # 이번 작업에서 적용된 횟수              │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  💡 진화 결과:                                                       │
│  - 기존 2개 패턴 적용 (재사용)                                       │
│  - 새로운 2개 패턴 학습                                              │
│  - 총 4개 패턴 보유                                                  │
└─────────────────────────────────────────────────────────────────────┘
```

### Part 2 요약: 진화의 증거

```
┌─────────────────────────────────────────────────────────────────────┐
│  Part 1 vs Part 2 비교                                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Part 1 (JWT 인증):                                                  │
│  - 적용 패턴: 0개 (빈 Brain)                                        │
│  - 학습 패턴: 2개 (LP-001, LP-002)                                  │
│  - 설계 시간: 기준                                                   │
│                                                                      │
│  Part 2 (Todo CRUD):                                                 │
│  - 적용 패턴: 2개 (LP-001, LP-002 재사용)                           │
│  - 학습 패턴: 2개 (LP-003, LP-004)                                  │
│  - 설계 시간: 30% 단축 (검증된 패턴 재사용)                         │
│                                                                      │
│  📈 누적 진화:                                                       │
│  - 총 패턴: 4개                                                      │
│  - 패턴 재사용: 2회                                                  │
│  - 설계 효율성: 향상                                                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Part 3: 세 번째 기능 - 실시간 동기화 (실패에서 학습)

### 상황 설정

```yaml
# project_brain.yaml 현재 상태 (Part 2 이후)
learned_patterns:
  - LP-001  # JWT httpOnly
  - LP-002  # Refresh 분리
  - LP-003  # 사용자-데이터 관계
  - LP-004  # Soft delete

metrics:
  patterns_learned: 4
  patterns_applied: 2
```

### Step 1: 첫 번째 시도 (실패)

```bash
# Claude Code, OpenCode, MDFlow 중 선택
> /evolve WebSocket으로 실시간 Todo 동기화 구현해줘
# 또는
opencode run --agent OmO "WebSocket으로 실시간 Todo 동기화 구현해줘"
```

```
┌─────────────────────────────────────────────────────────────────────┐
│  첫 번째 구현 시도                                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  🔍 RESEARCH → 기본 WebSocket 구현 방법 조사                        │
│  🧠 PLAN → WebSocket 서버 + 클라이언트 설계                         │
│  🔨 BUILD → 기본 구현 완료                                          │
│                                                                      │
│  ✅ REVIEW 단계에서 테스트:                                          │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ ❌ 테스트 실패                                                   │ │
│  │                                                                  │ │
│  │ 문제 발견:                                                      │ │
│  │ - 네트워크 불안정 시뮬레이션 (10초 후 연결 끊김)                │ │
│  │ - 재연결 로직 없음 → 앱이 동작하지 않음                         │ │
│  │ - Heartbeat 미구현 → 연결 끊김 감지 불가                        │ │
│  │                                                                  │ │
│  │ 결론: ❌ REJECTED - 프로덕션 품질 미달                           │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Step 2: 실패 패턴 기록

```
┌─────────────────────────────────────────────────────────────────────┐
│  📚 LEARN - 실패 패턴 기록 (중요!)                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Claude의 실패 분석:                                                 │
│  "WebSocket 구현에서 치명적인 누락 발견.                            │
│   이 실수를 다시 반복하지 않도록 FAILURE_PATTERN으로 기록."         │
│                                                                      │
│  🧠 Brain Memory 업데이트:                                          │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ learned_patterns:                                                │ │
│  │   - id: LP-001 ~ LP-004  # (기존 유지)                          │ │
│  │                                                                  │ │
│  │   - id: "LP-005"                                                │ │
│  │     context: "WebSocket 연결 관리"                              │ │
│  │     status: "FAILURE_PATTERN"   # ⚠️ 실패 패턴                  │ │
│  │     content: |                                                  │ │
│  │       ❌ WebSocket 구현 시 heartbeat 없이 배포하면              │ │
│  │       네트워크 불안정 환경에서 연결 유지 불가.                  │ │
│  │                                                                  │ │
│  │       필수 구현 요소:                                           │ │
│  │       1. Heartbeat (ping-pong 메커니즘)                         │ │
│  │       2. 자동 재연결 로직                                       │ │
│  │       3. 연결 상태 UI 피드백                                    │ │
│  │     learned_at: "2025-12-17T14:00:00+09:00"                     │ │
│  │     confidence: 0.95  # 높은 확신 (직접 경험)                   │ │
│  │     tags: [websocket, realtime, networking, critical]           │ │
│  │     related_files:                                              │ │
│  │       - "src/lib/websocket.ts"                                  │ │
│  │                                                                  │ │
│  │ metrics:                                                         │ │
│  │   total_tasks: 3                                                │ │
│  │   successful_tasks: 2                                           │ │
│  │   failed_tasks: 1        # 실패 추적                            │ │
│  │   patterns_learned: 5                                           │ │
│  │   failure_patterns: 1    # 실패 패턴 수                         │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Step 3: 재시도 - 실패 패턴 자동 회피

```bash
# 같은 도구로 재시도 - Brain이 실패 패턴을 자동 회피
> /evolve WebSocket 다시 구현해줘
# 또는
opencode run --agent OmO "WebSocket 다시 구현해줘"
```

```
┌─────────────────────────────────────────────────────────────────────┐
│  🧠 Brain Sync - 실패 패턴 회피                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  검색 결과:                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ ⚠️ FAILURE_PATTERN LP-005 발견!                                 │ │
│  │                                                                  │ │
│  │ 컨텍스트: "WebSocket 연결 관리"                                 │ │
│  │ 위험도: CRITICAL                                                │ │
│  │ 신뢰도: 0.95                                                    │ │
│  │                                                                  │ │
│  │ 회피 전략:                                                      │ │
│  │ - Heartbeat 메커니즘 필수 포함                                  │ │
│  │ - 자동 재연결 로직 필수 포함                                    │ │
│  │ - 연결 상태 UI 필수 포함                                        │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  📋 PLAN 단계에 회피 전략 자동 주입                                  │
└─────────────────────────────────────────────────────────────────────┘
```

### Step 4: 수정된 PLAN (회피 전략 반영)

```
┌─────────────────────────────────────────────────────────────────────┐
│  🧠 PLAN PHASE (회피 전략 적용됨)                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ⚠️ [FAILURE AVOIDANCE] LP-005 회피 중...                           │
│                                                                      │
│  "이전에 WebSocket heartbeat 미구현으로 실패한 경험이 있음.         │
│   이번에는 다음 요소를 반드시 포함:"                                │
│                                                                      │
│  수정된 계획:                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ 📋 architecture_plan.md (LP-005 회피 적용)                      │ │
│  │                                                                  │ │
│  │ ## 필수 구현 요소 (LP-005 회피)                                 │ │
│  │ 1. ✅ Heartbeat 메커니즘                                        │ │
│  │    - 30초 간격 ping-pong                                        │ │
│  │    - 3회 연속 실패 시 연결 끊김 처리                            │ │
│  │                                                                  │ │
│  │ 2. ✅ 자동 재연결 로직                                          │ │
│  │    - Exponential backoff: 1s → 2s → 4s → 8s → max 30s          │ │
│  │    - 최대 10회 재시도                                           │ │
│  │                                                                  │ │
│  │ 3. ✅ 연결 상태 UI                                              │ │
│  │    - Connected (녹색)                                           │ │
│  │    - Reconnecting (노란색)                                      │ │
│  │    - Disconnected (빨간색)                                      │ │
│  │                                                                  │ │
│  │ 4. 추가: 오프라인 메시지 큐잉                                   │ │
│  │    - 연결 끊김 시 로컬 버퍼에 저장                              │ │
│  │    - 재연결 시 자동 전송                                        │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  💡 실패 경험 덕분에 더 견고한 설계 가능                             │
└─────────────────────────────────────────────────────────────────────┘
```

### Step 5: BUILD - 개선된 구현

```typescript
// src/lib/websocket.ts
// 🧠 LP-005 회피: 모든 필수 요소 포함

class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 10;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private messageQueue: Message[] = [];

  // ✅ LP-005 회피: 연결 상태 추적
  private connectionState: 'connected' | 'reconnecting' | 'disconnected' = 'disconnected';

  connect() {
    this.ws = new WebSocket(WS_URL);

    this.ws.onopen = () => {
      this.connectionState = 'connected';
      this.reconnectAttempts = 0;
      this.startHeartbeat();  // ✅ LP-005 회피
      this.flushMessageQueue();
      this.onStateChange?.(this.connectionState);
    };

    this.ws.onclose = () => {
      this.connectionState = 'disconnected';
      this.stopHeartbeat();
      this.attemptReconnect();  // ✅ LP-005 회피
    };
  }

  // ✅ LP-005 회피: Heartbeat 메커니즘
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);
  }

  // ✅ LP-005 회피: 자동 재연결 (exponential backoff)
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      this.connectionState = 'disconnected';
      return;
    }

    this.connectionState = 'reconnecting';
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

    setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  // ✅ 추가: 오프라인 메시지 큐잉
  send(message: Message) {
    if (this.connectionState === 'connected') {
      this.ws?.send(JSON.stringify(message));
    } else {
      this.messageQueue.push(message);  // 연결 끊김 시 버퍼에 저장
    }
  }
}
```

### Step 6: REVIEW 통과 및 패턴 업그레이드

```
┌─────────────────────────────────────────────────────────────────────┐
│  ✅ REVIEW PHASE - 통과                                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  테스트 결과:                                                        │
│  ✅ Heartbeat 테스트 - 30초 간격 정상 작동                          │
│  ✅ 재연결 테스트 - 네트워크 끊김 후 자동 복구                      │
│  ✅ 연결 상태 UI - 상태 변화 정상 표시                              │
│  ✅ 메시지 큐잉 - 오프라인 중 메시지 보존 및 재전송                 │
│                                                                      │
│  결론: ✅ APPROVED                                                   │
└─────────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────────────┐
│  📚 LEARN - 패턴 업그레이드                                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  🧠 Brain Memory 업데이트:                                          │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ learned_patterns:                                                │ │
│  │                                                                  │ │
│  │   - id: "LP-005"                                                │ │
│  │     context: "WebSocket 연결 관리"                              │ │
│  │     status: "SUCCESS_PATTERN"  # ⬆️ 업그레이드!                 │ │
│  │     content: |                                                  │ │
│  │       WebSocket 연결 시 필수 구현 요소:                         │ │
│  │       1. Heartbeat (30초 간격 ping-pong)                        │ │
│  │       2. 자동 재연결 (exponential backoff: 1s~30s)              │ │
│  │       3. 연결 상태 UI 피드백                                    │ │
│  │       4. 오프라인 메시지 큐잉                                   │ │
│  │     confidence: 0.95                                            │ │
│  │     tags: [websocket, realtime, networking, production-ready]   │ │
│  │                                                                  │ │
│  │   - id: "LP-006"  # 새로 학습                                   │ │
│  │     context: "실시간 앱의 오프라인 처리"                        │ │
│  │     status: "SUCCESS_PATTERN"                                   │ │
│  │     content: |                                                  │ │
│  │       오프라인 시 로컬 캐시에 변경사항 저장.                    │ │
│  │       재연결 시 서버와 동기화.                                  │ │
│  │       충돌 해결 로직 필요 (last-write-wins 또는 merge).         │ │
│  │     confidence: 0.8                                             │ │
│  │     tags: [offline, sync, realtime, pwa]                        │ │
│  │                                                                  │ │
│  │ metrics:                                                         │ │
│  │   total_tasks: 4  (재시도 포함)                                 │ │
│  │   successful_tasks: 3                                           │ │
│  │   failed_tasks: 1                                               │ │
│  │   failure_recovered: 1  # 실패에서 복구                         │ │
│  │   patterns_learned: 6                                           │ │
│  │   failure_patterns: 0  # LP-005가 SUCCESS로 전환됨              │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  💡 진화 결과:                                                       │
│  - FAILURE_PATTERN → SUCCESS_PATTERN 전환                           │
│  - 실패 경험이 더 강력한 성공 패턴으로 변환됨                       │
│  - 동일 실수 반복 가능성 0%                                         │
└─────────────────────────────────────────────────────────────────────┘
```

### Part 3 요약: 방어적 진화

```
┌─────────────────────────────────────────────────────────────────────┐
│  실패 → 학습 → 회피 → 성공 사이클                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1️⃣ 첫 시도: 실패                                                   │
│     └─ 원인: heartbeat, 재연결 누락                                 │
│                                                                      │
│  2️⃣ FAILURE_PATTERN 기록                                            │
│     └─ LP-005: 실패 원인과 회피 방법 저장                           │
│                                                                      │
│  3️⃣ 재시도: 자동 회피 전략 적용                                     │
│     └─ LP-005 회피 → 필수 요소 자동 포함                            │
│                                                                      │
│  4️⃣ 성공 후: 패턴 업그레이드                                        │
│     └─ FAILURE_PATTERN → SUCCESS_PATTERN                            │
│     └─ 새 패턴 LP-006 추가 학습                                     │
│                                                                      │
│  💡 핵심: 시스템이 "같은 실수를 두 번 하지 않음"                    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Part 4: 진화 완료 - 팀 공유 기능 (6개 패턴 자동 적용)

### 상황 설정

```yaml
# project_brain.yaml 현재 상태 (Part 3 이후)
learned_patterns:
  - LP-001  # JWT httpOnly (SUCCESS)
  - LP-002  # Refresh 분리 (SUCCESS)
  - LP-003  # 사용자-데이터 관계 (SUCCESS)
  - LP-004  # Soft delete (SUCCESS)
  - LP-005  # WebSocket 연결 관리 (SUCCESS) - 업그레이드됨
  - LP-006  # 오프라인 처리 (SUCCESS)

metrics:
  patterns_learned: 6
  patterns_applied: 4  # 누적
  failure_recovered: 1
```

### Step 1: 요청 및 자동 패턴 적용

```bash
# Claude Code에서
> /evolve 팀 공유 기능 추가해줘. 팀 생성 및 초대, 팀원과 Todo 공유, 실시간 동기화

# OpenCode에서
opencode run --agent OmO "팀 공유 기능 추가해줘. 팀 생성 및 초대, 팀원과 Todo 공유, 실시간 동기화"

# MDFlow에서
echo "팀 공유 기능 추가해줘. 팀 생성 및 초대, 팀원과 Todo 공유, 실시간 동기화" | md .mdflow/evolve.claude.md
```

```
┌─────────────────────────────────────────────────────────────────────┐
│  🧠 Brain Sync - 6개 패턴 자동 적용                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  요청 분석: "팀", "인증", "실시간", "동기화"                        │
│                                                                      │
│  매칭된 패턴:                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ ✅ LP-001 (JWT httpOnly)          → 팀 인증에 적용              │ │
│  │ ✅ LP-002 (Refresh 분리)          → 토큰 관리에 적용            │ │
│  │ ✅ LP-003 (사용자-데이터 관계)    → 팀-Todo 관계에 적용         │ │
│  │ ✅ LP-004 (Soft delete)           → 팀원 제거에 적용            │ │
│  │ ✅ LP-005 (WebSocket 관리)        → 팀 실시간 동기화에 적용     │ │
│  │ ✅ LP-006 (오프라인 처리)         → 팀 동기화 오프라인에 적용   │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  📋 6개 패턴 컨텍스트가 PLAN 단계에 주입됨                          │
│                                                                      │
│  💡 이전 프로젝트에서 축적된 모든 학습이 자동 활용됨                 │
└─────────────────────────────────────────────────────────────────────┘
```

### Step 2: 고속 구현 (패턴 기반)

```
┌─────────────────────────────────────────────────────────────────────┐
│  🧠 PLAN - 패턴 기반 고속 설계                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Claude의 설계 (6개 패턴 적용):                                      │
│                                                                      │
│  "이미 검증된 6개 패턴을 기반으로 빠르게 설계 가능:                 │
│   - 인증: LP-001, LP-002 그대로 재사용                              │
│   - 데이터 구조: LP-003 패턴 확장 (Team relation 추가)              │
│   - 삭제 정책: LP-004 팀원 제거에 적용                              │
│   - 실시간: LP-005 팀 채널 구독에 적용                              │
│   - 오프라인: LP-006 팀 동기화에 적용"                              │
│                                                                      │
│  예상 소요 시간:                                                     │
│  - 패턴 없이 설계: 2시간                                            │
│  - 패턴 적용 설계: 45분 (-63%)                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Step 3: 결과 - 무결점 구현

```
┌─────────────────────────────────────────────────────────────────────┐
│  ✅ 구현 완료 - 0 에러                                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  REVIEW 결과:                                                        │
│  ✅ 인증: httpOnly 쿠키 적용 완료 (LP-001)                          │
│  ✅ 토큰: refresh 엔드포인트 분리 (LP-002)                          │
│  ✅ 데이터: Team-User-Todo relation 정상 (LP-003)                   │
│  ✅ 삭제: 팀원 soft delete 적용 (LP-004)                            │
│  ✅ WebSocket: heartbeat, 재연결 완비 (LP-005)                      │
│  ✅ 오프라인: 메시지 큐잉 적용 (LP-006)                             │
│                                                                      │
│  에러: 0건                                                           │
│  리뷰 수정 요청: 0건                                                 │
│  테스트 통과율: 100%                                                 │
│                                                                      │
│  💡 축적된 패턴 덕분에 첫 번째 시도에서 완벽 구현                    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 전체 진화 타임라인

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PROJECT EVOLUTION TIMELINE                          │
│                                                                              │
│ Time ───────────────────────────────────────────────────────────────────────▶│
│                                                                              │
│ Task 1: JWT 인증                                                             │
│ ├─ Brain: 0 patterns                                                        │
│ ├─ Applied: 없음                                                            │
│ ├─ Learned: LP-001, LP-002                                                  │
│ └─ Result: ✅ 성공                                                          │
│     │                                                                        │
│     ▼ [LP-001, LP-002 저장됨]                                                │
│                                                                              │
│ Task 2: Todo CRUD                                                            │
│ ├─ Brain: 2 patterns                                                        │
│ ├─ Applied: LP-001, LP-002 (설계 시간 30% 단축)                             │
│ ├─ Learned: LP-003, LP-004                                                  │
│ └─ Result: ✅ 성공                                                          │
│     │                                                                        │
│     ▼ [4 patterns 보유]                                                      │
│                                                                              │
│ Task 3a: WebSocket (첫 시도)                                                 │
│ ├─ Brain: 4 patterns                                                        │
│ ├─ Applied: LP-003, LP-004                                                  │
│ └─ Result: ❌ 실패 → LP-005 (FAILURE) 기록                                  │
│     │                                                                        │
│     ▼ [LP-005 회피 전략 활성화]                                              │
│                                                                              │
│ Task 3b: WebSocket (재시도)                                                  │
│ ├─ Brain: 5 patterns (1 FAILURE)                                            │
│ ├─ Avoided: LP-005 (회피 전략 적용)                                         │
│ ├─ Learned: LP-006 + LP-005 업그레이드                                      │
│ └─ Result: ✅ 성공                                                          │
│     │                                                                        │
│     ▼ [6 patterns, 0 failures]                                               │
│                                                                              │
│ Task 4: 팀 공유 기능                                                         │
│ ├─ Brain: 6 patterns (ALL SUCCESS)                                          │
│ ├─ Applied: LP-001~006 전체 (설계 시간 63% 단축)                            │
│ └─ Result: ✅ 완벽 (0 에러, 0 수정)                                         │
│                                                                              │
│ ═══════════════════════════════════════════════════════════════════════════ │
│                                                                              │
│ 📊 최종 진화 메트릭:                                                         │
│ ├─ Total Patterns: 6                                                        │
│ ├─ Pattern Applications: 12회 (누적)                                        │
│ ├─ Success Rate: 80% → 100% (진화)                                          │
│ ├─ Failure Recovery: 100%                                                   │
│ ├─ Design Time Reduction: 30% → 63%                                         │
│ └─ Error Rate: 감소 추세 → 0                                                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 핵심 차이점 요약

### Before: 개별 도구 사용 (기존 가이드의 관점)

```
요청 ──▶ [도구 A 또는 B 또는 C 선택] ──▶ 결과 ──▶ 끝
          └── 독립적, 상태 없음, 학습 없음
```

### After: 통합 진화 시스템 (이 문서의 관점)

```
요청 ──▶ Brain 로드 ──▶ 패턴 적용 ──▶ 도구 협업 ──▶ 결과 ──▶ 학습 기록
  │         │              │              │              │         │
  │         │              │              │              │         │
  │    이전 성공/실패    검증된 방식    Gemini→Claude   품질 향상    │
  │    패턴 로드         자동 적용     →GPT 파이프라인  에러 감소    │
  │                                                                  │
  └────────────────────── 진화 사이클 ────────────────────────────────┘
```

---

## 빠른 시작 가이드

```bash
# 1. Claude Code에서 (권장 - 대화형 인터페이스)
claude
> /evolve 원하는 작업 내용

# 2. OpenCode에서 (에이전트 선택 가능)
opencode run --agent OmO "원하는 작업 내용"
opencode run --agent researcher "리서치 작업"
opencode run --agent main-builder "코딩 작업"

# 3. MDFlow에서 (워크플로우 기반)
echo "원하는 작업 내용" | md .mdflow/evolve.claude.md
echo "리서치 작업" | md .mdflow/research.gemini.md
echo "코딩 작업" | md .mdflow/build.codex.md
```

---

## 실전 적용 체크리스트

이 시스템을 제대로 활용하고 있는지 확인하세요:

### 진화 메커니즘 확인

- [ ] 작업 시작 전 Brain에서 관련 패턴을 로드하고 있는가?
- [ ] 작업 완료 후 새로운 패턴을 Brain에 기록하고 있는가?
- [ ] 실패 시 FAILURE_PATTERN으로 기록하고 있는가?
- [ ] 다음 작업에서 이전 학습이 자동 적용되고 있는가?

### 도구 결합 확인

- [ ] MDFlow가 전체 워크플로우를 오케스트레이션하고 있는가?
- [ ] OpenCode 에이전트가 각 단계를 실행하고 있는가?
- [ ] 각 단계의 출력이 다음 단계의 입력으로 전달되는가?
- [ ] 최종 결과가 Brain Memory에 저장되는가?

### LLM 협업 확인

- [ ] Gemini가 리서치/조사를 담당하고 있는가?
- [ ] Claude가 계획/리뷰/학습을 담당하고 있는가?
- [ ] GPT가 실제 코드 구현을 담당하고 있는가?
- [ ] 세 LLM이 순차적으로 협업하고 있는가?

---

## 결론

이 시스템의 핵심은 **"작업을 할수록 똑똑해지는 것"**입니다.

- 첫 번째 작업: 빈 Brain에서 시작, 모든 것을 처음부터
- 두 번째 작업: 이전 학습 적용, 설계 시간 30% 단축
- 세 번째 작업: 실패에서 학습, 같은 실수 방지
- 네 번째 작업: 축적된 모든 학습 적용, 완벽한 결과

**진화는 추상적 개념이 아니라 측정 가능한 변화입니다:**

| 지표 | 시작 | 종료 | 변화 |
|------|------|------|------|
| 패턴 수 | 0 | 6 | +6 |
| 설계 시간 | 기준 | -63% | 개선 |
| 에러율 | 있음 | 0 | 제거 |
| 실패 복구율 | N/A | 100% | 완전 |

---

*이 문서는 Self-Evolving Agent System의 핵심 작동 원리를 하나의 완전한 프로젝트 예시로 보여줍니다.*
