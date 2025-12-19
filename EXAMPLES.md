# Self-Evolving Agent System - 사용 예시 모음

> 실제 개발 시나리오별 사용 예시
> 모든 예시는 실제로 작동하는 명령어입니다

---

## 목차

1. [웹 애플리케이션 개발](#1-웹-애플리케이션-개발)
2. [REST API 개발](#2-rest-api-개발)
3. [버그 수정 및 디버깅](#3-버그-수정-및-디버깅)
4. [코드 리팩토링](#4-코드-리팩토링)
5. [테스트 코드 작성](#5-테스트-코드-작성)
6. [데이터베이스 작업](#6-데이터베이스-작업)
7. [인증/보안 구현](#7-인증보안-구현)
8. [성능 최적화](#8-성능-최적화)
9. [DevOps/배포](#9-devops배포)
10. [문서화](#10-문서화)

---

## 1. 웹 애플리케이션 개발

### 예시 1.1: React 컴포넌트 생성

```bash
# 방법 A: Claude Code (인터랙티브)
claude
```
```
You: /evolve 상품 목록을 보여주는 ProductList 컴포넌트 만들어줘.
     - 그리드 레이아웃
     - 페이지네이션
     - 필터링 기능
     - 로딩 상태 처리
```

```bash
# 방법 B: MDFlow (한 줄 실행)
echo "상품 목록 ProductList 컴포넌트 생성. 그리드, 페이지네이션, 필터, 로딩 상태 포함" \
  | md .mdflow/evolve.claude.md
```

```bash
# 방법 C: OpenCode (멀티 에이전트)
opencode run --agent researcher "React 상품 목록 컴포넌트 베스트 프랙티스 찾아줘"
opencode run --agent main-builder "검색 결과 기반으로 ProductList.tsx 구현해줘"
opencode run --agent oracle "생성된 컴포넌트 코드 리뷰해줘"
```

---

### 예시 1.2: Next.js 페이지 라우팅

```bash
claude
```
```
You: Next.js 14 App Router로 다음 페이지 구조 만들어줘:
     /dashboard - 대시보드 메인
     /dashboard/analytics - 분석 페이지
     /dashboard/settings - 설정 페이지
     레이아웃 공유하고 로딩 상태 처리해줘
```

```bash
# MDFlow로 실행
echo "Next.js 14 App Router 대시보드 페이지 구조 생성. /dashboard, /dashboard/analytics, /dashboard/settings. 공유 레이아웃과 로딩 상태 포함" \
  | md .mdflow/evolve.claude.md
```

---

### 예시 1.3: 폼 유효성 검사

```bash
# 자동화 스크립트
./scripts/evolve-runner.sh \
  -t "회원가입 폼 구현. 이메일, 비밀번호, 비밀번호 확인 필드. React Hook Form + Zod 사용. 실시간 유효성 검사" \
  -e claude \
  --tags "form,validation,react"
```

```bash
# Claude Code에서
claude
```
```
You: 이 코드 리팩토링해줘 - 회원가입 폼에 React Hook Form과 Zod 적용해서 유효성 검사 추가

# → refactor-expert 스킬 자동 활성화
```

---

### 예시 1.4: 상태 관리 (Zustand/Redux)

```bash
# MDFlow 리서치 → 구현
echo "Zustand로 장바구니 상태 관리 구현 방법 조사" | md .mdflow/research.gemini.md
echo "장바구니 Zustand 스토어 구현. 추가, 삭제, 수량 변경, 총액 계산" | md .mdflow/build.codex.md
```

```bash
# OpenCode 멀티 에이전트
opencode run --agent OmO "장바구니 상태 관리 설계해줘. Zustand 사용"
opencode run --agent main-builder "설계대로 store/cartStore.ts 구현해줘"
```

---

## 2. REST API 개발

### 예시 2.1: CRUD API 엔드포인트

```bash
claude
```
```
You: /evolve 사용자 관리 REST API 만들어줘
     - GET /api/users - 목록 조회 (페이지네이션)
     - GET /api/users/:id - 상세 조회
     - POST /api/users - 생성
     - PUT /api/users/:id - 수정
     - DELETE /api/users/:id - 삭제
     Express.js + TypeScript 사용
```

---

### 예시 2.2: API 미들웨어

```bash
# 자동화 스크립트
./scripts/evolve-runner.sh \
  -t "Express 미들웨어 구현: 요청 로깅, 에러 핸들링, 응답 시간 측정, rate limiting" \
  -e claude \
  --tags "api,middleware,express"
```

---

### 예시 2.3: API 문서화 (Swagger/OpenAPI)

```bash
claude
```
```
You: api 폴더의 모든 엔드포인트에 Swagger 문서 추가해줘.
     swagger-jsdoc 사용하고 /api-docs 경로에서 볼 수 있게 설정해줘

# → api-expert 스킬 자동 활성화
```

---

### 예시 2.4: GraphQL API

```bash
# MDFlow 워크플로우
echo "Apollo Server로 GraphQL API 구현. User 타입 정의, Query와 Mutation 리졸버, 타입스크립트 적용" \
  | md .mdflow/evolve.claude.md
```

---

## 3. 버그 수정 및 디버깅

### 예시 3.1: 런타임 에러 수정

```bash
claude
```
```
You: 이 에러 수정해줘:
     TypeError: Cannot read properties of undefined (reading 'map')
     at ProductList.tsx:45

     상품 데이터가 로딩 중일 때 발생하는 것 같아

# → debug-expert 스킬 자동 활성화
```

---

### 예시 3.2: 메모리 누수 디버깅

```bash
./scripts/evolve-runner.sh \
  -t "useEffect cleanup 누락으로 인한 메모리 누수 수정. components/ 폴더 전체 검사" \
  -e claude \
  --tags "bugfix,memory-leak,react"
```

---

### 예시 3.3: API 응답 지연 문제

```bash
claude
```
```
You: /api/products 엔드포인트가 5초 이상 걸려. 원인 분석하고 최적화해줘.
     - 데이터베이스 쿼리 확인
     - N+1 문제 검사
     - 인덱스 추가 필요한지 확인
```

---

### 예시 3.4: 무한 루프 디버깅

```bash
# 자동화 + 태그로 관련 패턴 검색
./scripts/evolve-runner.sh \
  -t "useEffect 무한 루프 수정. Dashboard.tsx에서 데이터 fetch가 계속 반복됨" \
  -e claude \
  --tags "bugfix,react,useEffect"
```

---

## 4. 코드 리팩토링

### 예시 4.1: 컴포넌트 분리

```bash
claude
```
```
You: ProductPage.tsx가 800줄이야. 적절히 분리해줘:
     - 상품 정보 컴포넌트
     - 리뷰 섹션 컴포넌트
     - 관련 상품 컴포넌트
     - 커스텀 훅 분리

# → refactor-expert 스킬 자동 활성화
```

---

### 예시 4.2: 중복 코드 제거

```bash
./scripts/evolve-runner.sh \
  -t "utils/ 폴더의 중복 함수 정리. formatDate, formatCurrency, validateEmail이 여러 파일에 있음" \
  -e claude \
  --tags "refactor,dry,utils"
```

---

### 예시 4.3: TypeScript 마이그레이션

```bash
# MDFlow 단계별 실행
echo "src/components/*.jsx 파일들을 TypeScript로 변환해줘. Props 타입 정의 포함" \
  | md .mdflow/evolve.claude.md
```

---

### 예시 4.4: 아키텍처 개선

```bash
# 1. 분석 및 계획
opencode run --agent OmO "현재 프로젝트 구조 분석하고 클린 아키텍처로 리팩토링 계획 세워줘"

# 2. 아키텍처 리뷰
opencode run --agent oracle "제안된 아키텍처 리뷰하고 개선점 알려줘"

# 3. 구조 재구성
opencode run --agent main-builder "승인된 구조로 폴더 재구성하고 코드 이동해줘"
```

---

## 5. 테스트 코드 작성

### 예시 5.1: 유닛 테스트

```bash
claude
```
```
You: utils/validation.ts 파일의 모든 함수에 Jest 테스트 작성해줘.
     - 정상 케이스
     - 엣지 케이스
     - 에러 케이스
     커버리지 90% 이상 목표
```

---

### 예시 5.2: 컴포넌트 테스트

```bash
./scripts/evolve-runner.sh \
  -t "ProductCard 컴포넌트 테스트 작성. React Testing Library 사용. 렌더링, 클릭 이벤트, props 변경 테스트" \
  -e claude \
  --tags "testing,react,component"
```

---

### 예시 5.3: API 통합 테스트

```bash
echo "Supertest로 /api/users 엔드포인트 통합 테스트 작성. CRUD 전체, 인증, 에러 응답 테스트" \
  | md .mdflow/build.codex.md
```

---

### 예시 5.4: E2E 테스트 (Playwright)

```bash
claude
```
```
You: Playwright로 로그인 플로우 E2E 테스트 작성해줘:
     1. 로그인 페이지 접속
     2. 이메일/비밀번호 입력
     3. 로그인 버튼 클릭
     4. 대시보드로 리다이렉트 확인
     5. 사용자 이름 표시 확인
```

---

## 6. 데이터베이스 작업

### 예시 6.1: Prisma 스키마 정의

```bash
claude
```
```
You: Prisma 스키마로 이커머스 데이터 모델 만들어줘:
     - User (사용자)
     - Product (상품)
     - Order (주문)
     - OrderItem (주문 항목)
     - Review (리뷰)
     관계 설정하고 인덱스도 추가해줘
```

---

### 예시 6.2: 데이터베이스 마이그레이션

```bash
./scripts/evolve-runner.sh \
  -t "User 테이블에 profileImage, phoneNumber 컬럼 추가하는 Prisma 마이그레이션 생성" \
  -e claude \
  --tags "database,migration,prisma"
```

---

### 예시 6.3: 쿼리 최적화

```bash
claude
```
```
You: 이 Prisma 쿼리 최적화해줘:

     const orders = await prisma.order.findMany({
       include: {
         user: true,
         items: {
           include: {
             product: true
           }
         }
       }
     })

     N+1 문제 해결하고 필요한 필드만 선택해줘
```

---

### 예시 6.4: 시드 데이터 생성

```bash
echo "개발용 시드 데이터 스크립트 작성. 사용자 10명, 상품 50개, 주문 100개 생성. Faker 사용" \
  | md .mdflow/build.codex.md
```

---

## 7. 인증/보안 구현

### 예시 7.1: JWT 인증 시스템

```bash
claude
```
```
You: /evolve JWT 인증 시스템 구현해줘:
     - 로그인 (access token + refresh token)
     - 토큰 갱신
     - 로그아웃 (토큰 무효화)
     - 미들웨어로 보호된 라우트

# 🧠 Brain에서 LP-001 (JWT Singleton 패턴) 자동 적용
```

---

### 예시 7.2: OAuth 소셜 로그인

```bash
./scripts/evolve-runner.sh \
  -t "NextAuth.js로 Google, GitHub 소셜 로그인 구현. 기존 이메일 계정과 연동" \
  -e claude \
  --tags "authentication,oauth,nextauth"
```

---

### 예시 7.3: 권한 관리 (RBAC)

```bash
# 1. 베스트 프랙티스 조사
opencode run --agent researcher "RBAC 권한 관리 베스트 프랙티스 조사해줘"

# 2. RBAC 구현
opencode run --agent main-builder "Role-Based Access Control 구현해줘: Admin(모든 권한), Manager(사용자/상품 관리), User(읽기만)"

# 3. 보안 검토
opencode run --agent oracle "보안 취약점 없는지 검토해줘"
```

---

### 예시 7.4: 입력 검증 및 XSS 방지

```bash
claude
```
```
You: 보안 강화해줘:
     - 모든 사용자 입력에 sanitization 적용
     - XSS 방지 미들웨어 추가
     - SQL Injection 방지 확인
     - CSRF 토큰 구현
```

---

## 8. 성능 최적화

### 예시 8.1: React 렌더링 최적화

```bash
claude
```
```
You: ProductList 컴포넌트 렌더링 최적화해줘:
     - React.memo 적용
     - useMemo로 계산 캐싱
     - useCallback으로 함수 메모이제이션
     - 가상화 (react-window) 적용
```

---

### 예시 8.2: 이미지 최적화

```bash
./scripts/evolve-runner.sh \
  -t "Next.js Image 컴포넌트로 이미지 최적화. lazy loading, blur placeholder, 반응형 사이즈 적용" \
  -e claude \
  --tags "performance,image,nextjs"
```

---

### 예시 8.3: API 캐싱

```bash
echo "Redis로 API 응답 캐싱 구현. 상품 목록 5분, 상품 상세 1시간, 캐시 무효화 로직 포함" \
  | md .mdflow/evolve.claude.md
```

---

### 예시 8.4: 번들 사이즈 최적화

```bash
claude
```
```
You: 번들 사이즈 분석하고 최적화해줘:
     - webpack-bundle-analyzer로 분석
     - 코드 스플리팅 적용
     - 동적 임포트로 lazy loading
     - tree shaking 확인
```

---

## 9. DevOps/배포

### 예시 9.1: Docker 컨테이너화

```bash
claude
```
```
You: Next.js 앱 Docker 설정 만들어줘:
     - Dockerfile (multi-stage build)
     - docker-compose.yml (앱 + PostgreSQL + Redis)
     - .dockerignore
     프로덕션 최적화 적용해줘
```

---

### 예시 9.2: CI/CD 파이프라인

```bash
./scripts/evolve-runner.sh \
  -t "GitHub Actions CI/CD 파이프라인: lint, test, build, deploy to Vercel. PR시 프리뷰 배포" \
  -e claude \
  --tags "devops,cicd,github-actions"
```

---

### 예시 9.3: 환경 변수 관리

```bash
claude
```
```
You: 환경 변수 관리 시스템 구현해줘:
     - .env.example 템플릿
     - 환경별 설정 (development, staging, production)
     - Zod로 환경 변수 유효성 검사
     - 타입 안전한 접근
```

---

### 예시 9.4: 모니터링 설정

```bash
# 1. 모니터링 솔루션 비교
opencode run --agent researcher "Next.js 앱 모니터링 솔루션 비교해줘 (Sentry, LogRocket, Datadog)"

# 2. Sentry 설정
opencode run --agent main-builder "Sentry 에러 트래킹 설정해줘. 소스맵 업로드, 릴리즈 추적 포함"
```

---

## 10. 문서화

### 예시 10.1: API 문서

```bash
claude
```
```
You: api/ 폴더의 모든 엔드포인트 문서화해줘:
     - 각 엔드포인트 설명
     - 요청/응답 예시
     - 에러 코드 목록
     - 인증 필요 여부
     docs/API.md 파일로 생성
```

---

### 예시 10.2: 컴포넌트 스토리북

```bash
./scripts/evolve-runner.sh \
  -t "Storybook 설정하고 Button, Input, Card 컴포넌트 스토리 작성. 다양한 variants와 상태 포함" \
  -e claude \
  --tags "documentation,storybook,components"
```

---

### 예시 10.3: README 작성

```bash
echo "프로젝트 README.md 작성. 설치 방법, 실행 방법, 환경 변수, 폴더 구조, 기여 가이드 포함" \
  | md .mdflow/evolve.claude.md
```

---

### 예시 10.4: 코드 주석

```bash
claude
```
```
You: utils/ 폴더의 모든 함수에 JSDoc 주석 추가해줘:
     - 함수 설명
     - @param 타입과 설명
     - @returns 타입과 설명
     - @example 사용 예시
```

---

## 복합 시나리오

### 예시 A: 전체 기능 개발 (처음부터 끝까지)

```bash
# 1. 요구사항 분석
opencode run --agent OmO "'상품 리뷰 기능'을 위한 전체 작업 계획 세워줘"

# 2. 데이터 모델
./scripts/evolve-runner.sh \
  -t "Review 모델 Prisma 스키마 추가. User, Product와 관계 설정" \
  -e claude --tags "database,prisma"

# 3. API 개발
./scripts/evolve-runner.sh \
  -t "리뷰 CRUD API 구현. 평점 평균 계산 포함" \
  -e claude --tags "api,review"

# 4. 컴포넌트 개발
./scripts/evolve-runner.sh \
  -t "ReviewList, ReviewForm, StarRating 컴포넌트 구현" \
  -e claude --tags "react,component"

# 5. 테스트
./scripts/evolve-runner.sh \
  -t "리뷰 기능 테스트 코드 작성. API, 컴포넌트 모두" \
  -e claude --tags "testing"

# 6. 문서화
./scripts/evolve-runner.sh \
  -t "리뷰 API 문서 추가" \
  -e claude --tags "documentation"

# 7. 커밋 (자동 학습)
git add . && git commit -m "feat: add product review feature"
# → 자동으로 패턴 학습 실행
```

---

### 예시 B: 레거시 코드 현대화

```bash
# 1. 분석
claude
```
```
You: src/legacy/ 폴더 분석해줘.
     - 어떤 패턴 사용 중인지
     - 현대화가 필요한 부분
     - 리팩토링 우선순위 제안
```

```bash
# 2. 단계별 현대화
./scripts/evolve-runner.sh -t "Class 컴포넌트를 함수형으로 변환" -e claude
./scripts/evolve-runner.sh -t "PropTypes를 TypeScript로 교체" -e claude
./scripts/evolve-runner.sh -t "Redux를 Zustand로 마이그레이션" -e claude
./scripts/evolve-runner.sh -t "테스트 코드 추가" -e claude
```

---

### 예시 C: 성능 문제 종합 해결

```bash
# 1. 문제 분석
opencode run --agent OmO "앱이 느려요. 전체 성능 분석 계획 세워줘"

# 2. 프론트엔드 최적화
./scripts/evolve-runner.sh \
  -t "React 렌더링 최적화, 코드 스플리팅, 이미지 최적화 적용" \
  -e claude --tags "performance,frontend"

# 3. 백엔드 최적화
./scripts/evolve-runner.sh \
  -t "API 응답 캐싱, 데이터베이스 쿼리 최적화, N+1 문제 해결" \
  -e claude --tags "performance,backend"

# 4. 결과 측정
claude
```
```
You: Lighthouse 점수 측정하고 개선 전후 비교 리포트 만들어줘
```

---

## Git 커밋 후 자동 학습 예시

```bash
# 작업 완료 후 커밋
git add .
git commit -m "feat: implement user authentication with JWT"

# 자동 출력:
# 🧠 [Pre-Commit] Checking brain patterns...
#    ✅ LP-001 (JWT Singleton) 관련 파일 변경 감지
# ✅ [Pre-Commit] All checks passed
#
# 🧠 [Post-Commit] Starting auto-learning process...
#    Commit: feat: implement user authentication with JWT
#    Files: auth/token-manager.ts, middleware/auth.ts, api/auth/login.ts
#    Tags: authentication, jwt, feature
#
#    📝 New pattern extracted:
#    - LP-003: JWT 토큰은 httpOnly 쿠키에 저장하면 XSS 공격 방지
#      confidence: 0.85
#
# ✅ [Post-Commit] Learning complete!

# 학습 결과 확인
cat .opencode/brain/project_brain.yaml | grep -A 10 "LP-003"
```

---

## Quick Reference

### 명령어 치트 시트

```bash
# === Claude Code ===
claude                              # 인터랙티브 시작
/evolve <작업>                      # 학습 기반 실행

# === MDFlow ===
echo "<작업>" | md .mdflow/evolve.claude.md    # 전체 워크플로우
echo "<검색>" | md .mdflow/research.gemini.md  # 리서치만
echo "<구현>" | md .mdflow/build.codex.md      # 구현만
md.claude "<질문>"                             # Ad-hoc 질문

# === OpenCode ===
opencode run --agent OmO "계획 세워줘"          # 오케스트레이터
opencode run --agent researcher "검색해줘"      # 리서처
opencode run --agent main-builder "구현해줘"    # 빌더
opencode run --agent oracle "리뷰해줘"          # 리뷰어

# === Scripts ===
./scripts/evolve-runner.sh -t "<작업>" -e claude
./scripts/evolve-runner.sh -t "<작업>" --tags "tag1,tag2"
./scripts/file-watcher.sh start     # 파일 감시

# === Git (자동 학습) ===
git commit -m "feat: ..."           # 커밋 시 자동 학습
```

### 스킬 트리거

| 키워드 | 스킬 | 예시 |
|--------|------|------|
| commit, branch, pr | git-expert | "PR 만들어줘" |
| refactor, clean | refactor-expert | "이 코드 정리해줘" |
| debug, fix, error | debug-expert | "이 에러 수정해줘" |
| api, endpoint | api-expert | "API 엔드포인트 추가해줘" |
| test | quick-commands | "테스트 실행해줘" |

---

*모든 예시는 실제 프로젝트에서 바로 사용할 수 있습니다.*
