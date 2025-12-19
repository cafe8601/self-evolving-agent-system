# FastAPI Guide

## 프로젝트 구조

```
project/
├── main.py
├── models/
│   ├── __init__.py
│   └── user.py
├── routes/
│   ├── __init__.py
│   └── users.py
├── services/
│   └── user_service.py
├── database.py
└── requirements.txt
```

## 기본 설정

### main.py

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import users

app = FastAPI(
    title="My API",
    description="API Description",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(users.router)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

---

## CRUD 템플릿

### models/user.py

```python
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None

class UserResponse(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
```

### routes/users.py

```python
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from models.user import UserCreate, UserUpdate, UserResponse

router = APIRouter(prefix="/users", tags=["users"])

# 목록 조회 (페이지네이션)
@router.get("/", response_model=List[UserResponse])
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None
):
    # 구현
    pass

# 단일 조회
@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int):
    user = await user_service.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# 생성
@router.post("/", response_model=UserResponse, status_code=201)
async def create_user(user: UserCreate):
    return await user_service.create(user)

# 전체 수정
@router.put("/{user_id}", response_model=UserResponse)
async def update_user(user_id: int, user: UserCreate):
    updated = await user_service.update(user_id, user)
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return updated

# 부분 수정
@router.patch("/{user_id}", response_model=UserResponse)
async def patch_user(user_id: int, user: UserUpdate):
    updated = await user_service.patch(user_id, user)
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return updated

# 삭제
@router.delete("/{user_id}", status_code=204)
async def delete_user(user_id: int):
    deleted = await user_service.delete(user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="User not found")
```

---

## 인증 (JWT)

### auth.py

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from datetime import datetime, timedelta

SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

security = HTTPBearer()

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    try:
        payload = jwt.decode(
            credentials.credentials, 
            SECRET_KEY, 
            algorithms=[ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

### 사용법

```python
@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    user_id: str = Depends(get_current_user)
):
    return await user_service.get(user_id)
```

---

## 에러 처리

```python
from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "detail": str(exc) if DEBUG else "An error occurred"
        }
    )

class APIException(Exception):
    def __init__(self, status_code: int, detail: str, code: str):
        self.status_code = status_code
        self.detail = detail
        self.code = code

@app.exception_handler(APIException)
async def api_exception_handler(request: Request, exc: APIException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.code,
            "detail": exc.detail
        }
    )
```

---

## 실행

```bash
# 개발
uvicorn main:app --reload

# 프로덕션
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API 문서

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
