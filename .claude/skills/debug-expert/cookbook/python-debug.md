# Python Debugging Cookbook

## 흔한 에러와 해결책

### 1. AttributeError

```python
# 에러
AttributeError: 'NoneType' object has no attribute 'xxx'

# 원인
obj = None
obj.some_method()  # None에서 메서드 호출

# 해결
if obj is not None:
    obj.some_method()

# 또는
obj = obj or default_value
```

---

### 2. TypeError

```python
# 에러
TypeError: can only concatenate str (not "int") to str

# 원인
result = "Value: " + 42

# 해결
result = "Value: " + str(42)
result = f"Value: {42}"
```

```python
# 에러
TypeError: 'NoneType' object is not iterable

# 원인
for item in None:
    print(item)

# 해결
items = get_items() or []
for item in items:
    print(item)
```

---

### 3. KeyError

```python
# 에러
KeyError: 'missing_key'

# 원인
data = {"name": "John"}
value = data["age"]  # 없는 키

# 해결
value = data.get("age")  # None 반환
value = data.get("age", 0)  # 기본값 0

# 또는
if "age" in data:
    value = data["age"]
```

---

### 4. IndexError

```python
# 에러
IndexError: list index out of range

# 원인
items = [1, 2, 3]
value = items[5]  # 인덱스 초과

# 해결
if len(items) > 5:
    value = items[5]

# 또는
value = items[5] if len(items) > 5 else None
```

---

### 5. ImportError / ModuleNotFoundError

```python
# 에러
ModuleNotFoundError: No module named 'xxx'

# 원인
# 1. 패키지 미설치
# 2. 가상환경 미활성화
# 3. 잘못된 패키지 이름

# 해결
pip install xxx
# 또는
pip install -r requirements.txt

# 가상환경 확인
which python
pip list
```

---

### 6. FileNotFoundError

```python
# 에러
FileNotFoundError: [Errno 2] No such file or directory: 'xxx'

# 원인
open("nonexistent.txt", "r")

# 해결
from pathlib import Path

path = Path("file.txt")
if path.exists():
    with open(path, "r") as f:
        content = f.read()
else:
    print(f"File not found: {path}")
```

---

### 7. ValueError

```python
# 에러
ValueError: invalid literal for int() with base 10: 'abc'

# 원인
value = int("abc")

# 해결
try:
    value = int(user_input)
except ValueError:
    print("Please enter a valid number")
    value = 0
```

---

### 8. RecursionError

```python
# 에러
RecursionError: maximum recursion depth exceeded

# 원인
def infinite():
    return infinite()  # 종료 조건 없음

# 해결
def factorial(n):
    if n <= 1:  # 기저 조건 추가
        return 1
    return n * factorial(n - 1)
```

---

## 디버깅 도구

### print 디버깅

```python
def debug_func(data):
    print(f"DEBUG: data = {data}")
    print(f"DEBUG: type = {type(data)}")
    print(f"DEBUG: len = {len(data) if hasattr(data, '__len__') else 'N/A'}")
```

### logging 사용

```python
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def process(data):
    logger.debug(f"Processing: {data}")
    try:
        result = do_something(data)
        logger.info(f"Success: {result}")
        return result
    except Exception as e:
        logger.error(f"Error: {e}", exc_info=True)
        raise
```

### breakpoint() 사용

```python
def complex_function(data):
    intermediate = step1(data)
    breakpoint()  # 여기서 중단, pdb 시작
    result = step2(intermediate)
    return result
```

### traceback 출력

```python
import traceback

try:
    risky_operation()
except Exception as e:
    traceback.print_exc()
    # 또는
    error_details = traceback.format_exc()
    logger.error(error_details)
```

---

## 스택 트레이스 읽기

```
Traceback (most recent call last):      ← 가장 오래된 호출
  File "main.py", line 10, in <module>
    result = process_data(data)
  File "processor.py", line 25, in process_data
    return transform(cleaned)
  File "utils.py", line 42, in transform  ← 가장 최근 호출
    return data.split(",")                ← 에러 발생 라인
AttributeError: 'NoneType' object has no attribute 'split'
                                          ↑ 에러 메시지
```

**읽는 순서:**
1. 맨 아래 에러 메시지 먼저
2. 바로 위 라인 (에러 발생 코드)
3. 위로 올라가며 호출 경로 추적

---

## Quick Reference

| 에러 | 일반적 원인 | 빠른 해결 |
|------|------------|----------|
| AttributeError | None 객체 | None 체크 |
| TypeError | 타입 불일치 | 타입 변환 |
| KeyError | 없는 키 | .get() 사용 |
| IndexError | 범위 초과 | 길이 체크 |
| ImportError | 미설치 | pip install |
| FileNotFoundError | 경로 오류 | 경로 확인 |
| ValueError | 잘못된 값 | try/except |
| RecursionError | 무한 재귀 | 기저 조건 |
