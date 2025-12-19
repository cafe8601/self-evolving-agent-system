---
name: quick-commands
description: Quick shortcuts for common development tasks. Use when user says run tests, start server, format code, lint, build, deploy, install deps, or any quick development command.
---

# Quick Commands Skill

> 자주 사용하는 개발 명령어를 빠르게 실행합니다.

## Purpose

- **빠른 실행**: 복잡한 명령을 단축어로 실행
- **프로젝트 감지**: 프로젝트 유형 자동 감지
- **표준화**: 팀 전체 일관된 명령 사용

## Commands

### 테스트 실행

```yaml
trigger: "run tests", "test", "pytest", "jest"

detect_and_run:
  python:
    - pytest            # pytest 있으면
    - python -m pytest  # 대체
    - python -m unittest discover  # unittest
    
  javascript:
    - npm test
    - yarn test
    - npx jest
    
  go:
    - go test ./...
```

### 서버 시작

```yaml
trigger: "start server", "run server", "dev", "serve"

detect_and_run:
  python_fastapi:
    - uvicorn main:app --reload
    
  python_django:
    - python manage.py runserver
    
  python_flask:
    - flask run --debug
    
  node:
    - npm run dev
    - npm start
    - yarn dev
    
  go:
    - go run main.go
```

### 코드 포맷팅

```yaml
trigger: "format", "format code", "prettier", "black"

detect_and_run:
  python:
    - black .
    - ruff format .
    
  javascript:
    - npx prettier --write .
    - npm run format
    
  go:
    - go fmt ./...
```

### 린팅

```yaml
trigger: "lint", "check code", "eslint", "ruff"

detect_and_run:
  python:
    - ruff check .
    - flake8 .
    - pylint **/*.py
    
  javascript:
    - npx eslint .
    - npm run lint
```

### 의존성 설치

```yaml
trigger: "install", "install deps", "npm install", "pip install"

detect_and_run:
  python:
    - pip install -r requirements.txt
    - pip install -e .
    - poetry install
    
  javascript:
    - npm install
    - yarn install
    - pnpm install
```

### 빌드

```yaml
trigger: "build", "compile", "make"

detect_and_run:
  javascript:
    - npm run build
    - yarn build
    
  typescript:
    - npx tsc
    - npm run build
    
  go:
    - go build -o bin/app .
    
  rust:
    - cargo build --release
```

### 타입 체크

```yaml
trigger: "typecheck", "type check", "mypy", "tsc"

detect_and_run:
  python:
    - mypy .
    - pyright .
    
  typescript:
    - npx tsc --noEmit
```

## Workflow

### Step 1: 프로젝트 감지

```bash
# 설정 파일로 프로젝트 유형 감지
ls package.json    # Node.js
ls pyproject.toml  # Python (modern)
ls requirements.txt # Python
ls go.mod          # Go
ls Cargo.toml      # Rust
```

### Step 2: 명령 결정

1. 프로젝트 유형에 맞는 명령 선택
2. 사용 가능한 도구 확인
3. 실행

### Step 3: 실행 및 결과

```markdown
## ⚡ Quick Command

**명령**: pytest
**프로젝트**: Python (FastAPI)

### 실행 결과
[명령 출력]

### 요약
- ✅ 테스트 통과: 42
- ❌ 실패: 0
- ⏭️ 스킵: 2
```

## Examples

### 테스트 실행

```
User: "run tests"

Claude:
프로젝트 감지: Python (pytest)
실행: pytest -v

===== test session starts =====
collected 42 items
...
===== 42 passed in 2.34s =====
```

### 서버 시작

```
User: "start server"

Claude:
프로젝트 감지: Python (FastAPI)
실행: uvicorn main:app --reload

INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Started reloader process
```

### 복합 명령

```
User: "format and lint"

Claude:
1. black . (완료)
2. ruff check . (완료)

모든 검사 통과! ✅
```

## Custom Commands

프로젝트별 커스텀 명령은 `commands.yaml`에 정의 가능:

```yaml
# .claude/commands.yaml
commands:
  db-migrate:
    run: "alembic upgrade head"
    description: "데이터베이스 마이그레이션"
    
  docker-up:
    run: "docker-compose up -d"
    description: "Docker 컨테이너 시작"
    
  clean:
    run: "rm -rf __pycache__ .pytest_cache dist build"
    description: "빌드 아티팩트 정리"
```

## Safety

```yaml
dangerous_commands:
  - rm -rf
  - drop database
  - git push --force
  
action: 실행 전 확인 요청
```
