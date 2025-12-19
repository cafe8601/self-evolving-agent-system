---
name: project-expert
description: Self-improving agent that learns about your codebase. Use when user says analyze project, understand codebase, project structure, learn about this code, sync knowledge, or wants an expert that remembers the project.
---

# Project Expert Skill

> 프로젝트에 대해 학습하고 기억하는 자기 개선형 전문가 에이전트

## Purpose

- **프로젝트 분석**: 코드베이스 구조와 패턴 학습
- **지식 축적**: 분석 결과를 expertise 파일에 저장
- **빠른 응답**: 축적된 지식으로 즉시 답변
- **자동 업데이트**: 변경 사항 감지 및 지식 갱신

## What Makes This Different

```
일반 에이전트:
  요청 → 탐색 → 답변 → [잊음]
  
Project Expert:
  요청 → 지식 로드 → 검증 → 답변 → [학습]
         ↑                          │
         └────────── 축적 ──────────┘
```

## Files

```
project-expert/
├── SKILL.md              # 이 파일
└── expertise.yaml        # 프로젝트 지식 (자동 생성/업데이트)
```

## Workflow

### Question 처리

```
1. expertise.yaml 읽기 (있으면)
2. 기존 지식으로 빠르게 파악
3. 실제 코드와 검증
4. 답변
5. 새로 배운 것 있으면 expertise 업데이트
```

### Self-Improve 트리거

다음 상황에서 자동 또는 수동 실행:
- "sync project knowledge"
- "update project expertise"
- "learn about this project"
- 대규모 변경 후

## Expertise File Structure

```yaml
# expertise.yaml (자동 생성됨)
project:
  name: "project-name"
  type: "web-app"  # web-app, cli, library, etc.
  language: "python"
  framework: "fastapi"

structure:
  directories:
    - path: "src/"
      purpose: "소스 코드"
    - path: "tests/"
      purpose: "테스트"
      
  key_files:
    - path: "src/main.py"
      purpose: "앱 진입점"
    - path: "src/models/"
      purpose: "데이터 모델"

patterns:
  - name: "Repository Pattern"
    locations: ["src/repositories/"]
  - name: "Dependency Injection"
    locations: ["src/dependencies.py"]

learnings:
  - date: "2024-12-09"
    topic: "인증 시스템"
    details: "JWT 기반 인증, src/auth/"
    
metrics:
  files_known: 25
  functions_known: 120
  confidence: 0.8
  last_sync: "2024-12-09T10:00:00Z"
```

## Commands

### 1. 프로젝트 분석 (최초 또는 전체 동기화)

```
User: "analyze this project" 또는 "learn about this codebase"

Claude:
1. 프로젝트 구조 스캔
2. 주요 파일 분석
3. 패턴 식별
4. expertise.yaml 생성/업데이트
5. 요약 리포트 제공
```

### 2. 질문 답변

```
User: "where is the authentication logic?"

Claude:
1. expertise.yaml 로드
2. knowledge.key_files에서 auth 관련 검색
3. 실제 파일 존재 확인
4. 답변: "인증 로직은 src/auth/에 있습니다..."
```

### 3. 지식 업데이트

```
User: "sync knowledge" 또는 "update expertise"

Claude:
1. git diff 또는 파일 변경 감지
2. 변경된 부분만 재분석
3. expertise.yaml 부분 업데이트
4. 변경 요약 제공
```

## Output Formats

### 분석 리포트

```markdown
## 📊 Project Analysis Complete

### Project Overview
- **Name**: my-project
- **Type**: Web Application
- **Language**: Python 3.11
- **Framework**: FastAPI

### Structure
```
src/
├── main.py          # 앱 진입점
├── models/          # Pydantic 모델
├── routes/          # API 라우트
├── services/        # 비즈니스 로직
└── utils/           # 유틸리티
```

### Key Components
| Component | Location | Purpose |
|-----------|----------|---------|
| API Routes | src/routes/ | HTTP 엔드포인트 |
| Models | src/models/ | 데이터 스키마 |
| Services | src/services/ | 비즈니스 로직 |

### Patterns Identified
- ✅ Repository Pattern
- ✅ Dependency Injection
- ✅ Service Layer

### Metrics
- Files Analyzed: 45
- Functions Found: 230
- Confidence Score: 0.85

📁 Knowledge saved to: expertise.yaml
```

### 질문 답변

```markdown
## 답변

[직접적인 답변]

### 관련 파일
- `src/auth/jwt.py` - JWT 토큰 처리
- `src/auth/dependencies.py` - 인증 의존성

### 상세
[추가 설명]

---
📚 Source: expertise.yaml (confidence: 0.85)
```

## Best Practices

```yaml
1. 첫 분석:
   - 프로젝트 시작 시 "analyze project" 실행
   - 전체 구조 파악

2. 정기 동기화:
   - 큰 변경 후 "sync knowledge" 실행
   - expertise 최신 상태 유지

3. 질문 활용:
   - 탐색 대신 질문으로 빠르게 파악
   - "where is X?", "how does Y work?"

4. 신뢰도 확인:
   - confidence 낮으면 재분석 권장
   - 오래된 지식은 검증 필요
```

## Integration

이 스킬은 다른 스킬과 연동됩니다:

```
project-expert → git-expert (변경 감지)
              → refactor-expert (구조 이해)
              → debug-expert (파일 위치)
              → api-expert (엔드포인트 파악)
```
