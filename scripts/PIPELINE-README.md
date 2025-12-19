# 🚀 Self-Evolving Agent System - 파이프라인 스크립트 가이드

## 📁 스크립트 목록

| 스크립트 | 용도 | 사용 시나리오 |
|----------|------|--------------|
| `ecommerce-full-pipeline.sh` | E-commerce 전체 파이프라인 | 완전한 프로젝트 예시 실행 |
| `run-pipeline.sh` | 에이전트 체인 실행 | RESEARCH→BUILD→REVIEW→LEARN |
| `batch-features.sh` | 배치 기능 처리 | 여러 기능 순차 실행 |
| `opencode-agents.sh` | OpenCode 에이전트 | 개별 에이전트 실행 |
| `mdflow-workflows.sh` | MDFlow 워크플로우 | 개별 워크플로우 실행 |
| `hybrid-pipeline.sh` | 하이브리드 접근 | 수동+자동 혼합 파이프라인 |
| `crud-generator.sh` | CRUD 자동 생성 | 엔티티별 API 자동 생성 |

---

## 🔧 사용법

### 1. E-commerce 전체 파이프라인

```bash
# 완전한 E-commerce 프로젝트 파이프라인 실행
./scripts/ecommerce-full-pipeline.sh
```

**실행 순서:**
1. 📚 Brain 상태 확인
2. 🔐 JWT 인증 시스템
3. 📦 상품 카탈로그 API
4. 🛒 장바구니 시스템
5. 📋 실시간 주문 처리
6. 📊 재고 동기화
7. 🔒 보안 리뷰
8. 📚 최종 Brain 상태

---

### 2. 에이전트 체인 파이프라인

```bash
# 단일 작업에 대해 RESEARCH → BUILD → REVIEW → LEARN 실행
./scripts/run-pipeline.sh "작업 내용"

# 예시
./scripts/run-pipeline.sh "실시간 재고 동기화 구현 방법 조사"
./scripts/run-pipeline.sh "JWT 토큰 갱신 로직 구현"
```

---

### 3. OpenCode 에이전트 개별 실행

```bash
# 도움말
./scripts/opencode-agents.sh --help

# OmO 마스터 오케스트레이터 (Claude Opus)
./scripts/opencode-agents.sh omo "JWT 인증 시스템 구현"

# Researcher 리서치 전문가 (Gemini 3 Pro)
./scripts/opencode-agents.sh research "2024년 결제 보안 트렌드 조사"

# Main Builder 코드 작성 (GPT-5.2)
./scripts/opencode-agents.sh build "Prisma User 모델 구현"

# Oracle 코드 리뷰어 (Claude Opus)
./scripts/opencode-agents.sh review "결제 로직 보안 점검"
```

---

### 4. MDFlow 워크플로우 개별 실행

```bash
# 도움말
./scripts/mdflow-workflows.sh --help

# 전체 학습 루프 (RESEARCH→PLAN→BUILD→REVIEW→LEARN)
./scripts/mdflow-workflows.sh evolve "JWT 인증 시스템 구현"

# 리서치만 (Gemini 3 Pro)
./scripts/mdflow-workflows.sh research "2024년 결제 보안 트렌드"

# 빌드만 (GPT via Codex)
./scripts/mdflow-workflows.sh build "Next.js 결제 페이지 구현"

# 리뷰만 (Claude Opus)
./scripts/mdflow-workflows.sh review "결제 로직 OWASP 점검"
```

---

### 5. 배치 기능 처리

```bash
# 기본 기능 목록 순차 실행
./scripts/batch-features.sh
```

**기본 기능 목록 (수정 가능):**
- 사용자 인증 시스템
- 상품 카탈로그 API
- 장바구니 시스템
- 주문 처리
- 재고 동기화
- 알림 시스템
- 관리자 대시보드

스크립트 내 `FEATURES` 배열 수정으로 커스터마이징 가능

---

### 6. CRUD 자동 생성

```bash
# 도움말
./scripts/crud-generator.sh --help

# 특정 엔티티만 생성
./scripts/crud-generator.sh User Product Category

# 모든 기본 엔티티 생성
./scripts/crud-generator.sh --all

# 기본 엔티티 목록 확인
./scripts/crud-generator.sh --list
```

**기본 엔티티:** User, Product, Category, Cart, CartItem, Order, OrderItem, Payment, Review, Wishlist

---

### 7. 하이브리드 파이프라인

```bash
# 대화형(복잡한 기능) + 자동화(반복 기능) 혼합
./scripts/hybrid-pipeline.sh
```

**실행 순서:**
1. 📐 아키텍처 설계 (Claude Code - 수동 대화형)
2. 🔨 CRUD 기능 자동 생성 (OpenCode - 자동화)
3. 💳 결제 로직 구현 (Claude Code - 수동 대화형)
4. 🔒 보안 리뷰 (MDFlow - 워크플로우)
5. 🧪 테스트 생성 (OpenCode - 자동화)
6. 📚 학습 캡처 (Brain 동기화)

---

## 📊 도구별 권장 시나리오

| 시나리오 | 권장 도구 | 스크립트 |
|----------|-----------|----------|
| 복잡한 기능 설계 (대화 필요) | Claude Code | `claude` → `/evolve ...` |
| 반복적 CRUD 생성 | OpenCode | `crud-generator.sh` |
| 리서치/조사 | OpenCode | `opencode-agents.sh research` |
| 전체 학습 루프 | MDFlow | `mdflow-workflows.sh evolve` |
| 코드 리뷰 | MDFlow | `mdflow-workflows.sh review` |
| 배치 파이프라인 | Shell Script | `batch-features.sh` |
| 완전한 프로젝트 | Shell Script | `ecommerce-full-pipeline.sh` |

---

## 🧠 Brain 관련 명령어

```bash
# 학습 기록
npm run learn:success "컨텍스트" "학습 내용"
npm run learn:failure "컨텍스트" "실패 원인"
npm run learn:warning "컨텍스트" "경고 내용"
npm run learn:discovery "컨텍스트" "발견 내용"

# Brain 동기화
npm run brain:sync
npm run brain:status
```

---

## 📂 파일 위치

```
scripts/
├── PIPELINE-README.md      # 이 문서
├── ecommerce-full-pipeline.sh   # E-commerce 전체 파이프라인
├── run-pipeline.sh              # 에이전트 체인 파이프라인
├── batch-features.sh            # 배치 기능 처리
├── opencode-agents.sh           # OpenCode 에이전트 도구
├── mdflow-workflows.sh          # MDFlow 워크플로우 도구
├── hybrid-pipeline.sh           # 하이브리드 파이프라인
└── crud-generator.sh            # CRUD 자동 생성
```

---

## ⚡ 빠른 시작

```bash
cd /home/cafe99/agent-system-project/self-evolving-agent-system

# 1. 간단한 작업 (에이전트 체인)
./scripts/run-pipeline.sh "원하는 작업"

# 2. 완전한 프로젝트 (E-commerce 예시)
./scripts/ecommerce-full-pipeline.sh

# 3. CRUD 빠른 생성
./scripts/crud-generator.sh User Product Order
```
