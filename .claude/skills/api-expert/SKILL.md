---
name: api-expert
description: Design and implement REST APIs with best practices. Use when user says create API, endpoint, route, REST, HTTP, request, response, CRUD, or wants to build web services.
---

# API Expert Skill

> REST API를 설계하고 구현합니다.

## Purpose

- **API 설계**: RESTful 엔드포인트 설계
- **CRUD 생성**: 리소스별 CRUD 엔드포인트 자동 생성
- **문서화**: OpenAPI/Swagger 문서 생성
- **검증**: 요청/응답 검증 로직 추가

## REST Principles

```yaml
resources:
  - 리소스는 명사 사용 (users, products)
  - 복수형 사용 (/users, not /user)
  - 계층 관계 표현 (/users/{id}/orders)

methods:
  GET:    읽기 (목록, 단일)
  POST:   생성
  PUT:    전체 수정
  PATCH:  부분 수정
  DELETE: 삭제

status_codes:
  200: OK (성공)
  201: Created (생성 성공)
  204: No Content (삭제 성공)
  400: Bad Request (잘못된 요청)
  401: Unauthorized (인증 필요)
  403: Forbidden (권한 없음)
  404: Not Found (리소스 없음)
  422: Unprocessable Entity (검증 실패)
  500: Internal Server Error (서버 오류)
```

## Workflow

### Step 1: 리소스 정의

사용자 요청에서 리소스 파악:
- "유저 API 만들어줘" → users 리소스
- "상품 관리 API" → products 리소스

### Step 2: 프레임워크 결정

Python:
- FastAPI → `cookbook/fastapi-guide.md`
- Flask → `cookbook/flask-guide.md`

JavaScript:
- Express → `cookbook/express-guide.md`

### Step 3: 엔드포인트 생성

```
GET    /resources        → 목록 조회
GET    /resources/{id}   → 단일 조회
POST   /resources        → 생성
PUT    /resources/{id}   → 전체 수정
PATCH  /resources/{id}   → 부분 수정
DELETE /resources/{id}   → 삭제
```

### Step 4: 코드 생성

1. 모델/스키마 정의
2. 라우트 핸들러 생성
3. 검증 로직 추가
4. 에러 처리 추가

## Examples

### CRUD API 생성

```
User: "users API 만들어줘"

Claude: FastAPI로 Users CRUD API를 생성합니다.

# models/user.py
from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    name: str
    email: EmailStr

class UserResponse(BaseModel):
    id: int
    name: str
    email: str

# routes/users.py
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/")
async def list_users():
    ...

@router.get("/{user_id}")
async def get_user(user_id: int):
    ...

@router.post("/", status_code=201)
async def create_user(user: UserCreate):
    ...

@router.put("/{user_id}")
async def update_user(user_id: int, user: UserCreate):
    ...

@router.delete("/{user_id}", status_code=204)
async def delete_user(user_id: int):
    ...
```

### 인증 추가

```
User: "JWT 인증 추가해줘"

Claude: → cookbook/auth-guide.md 참조하여 JWT 인증 추가
```

## Output Format

```markdown
## API 생성 완료

### 엔드포인트
| Method | Path | Description |
|--------|------|-------------|
| GET | /users | 유저 목록 |
| GET | /users/{id} | 유저 상세 |
| POST | /users | 유저 생성 |
| PUT | /users/{id} | 유저 수정 |
| DELETE | /users/{id} | 유저 삭제 |

### 생성된 파일
- `models/user.py` - 스키마 정의
- `routes/users.py` - 라우트 핸들러

### 사용 예시
```bash
# 목록 조회
curl http://localhost:8000/users

# 생성
curl -X POST http://localhost:8000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "email": "john@example.com"}'
```
```

## Best Practices

```yaml
versioning:
  - /api/v1/users (URL 버저닝)

pagination:
  - ?page=1&limit=20
  - 응답에 total, page, limit 포함

filtering:
  - ?status=active
  - ?created_after=2024-01-01

sorting:
  - ?sort=created_at
  - ?sort=-created_at (내림차순)

error_response:
  {
    "error": "Validation Error",
    "detail": "Email is required",
    "code": "VALIDATION_ERROR"
  }
```
