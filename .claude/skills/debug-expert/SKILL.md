---
name: debug-expert
description: Debug and fix code issues systematically. Use when user says debug, fix bug, error, exception, not working, broken, troubleshoot, issue, problem, crash, or shares error messages.
---

# Debug Expert Skill

> 버그를 체계적으로 분석하고 수정합니다.

## Purpose

- **에러 분석**: 에러 메시지, 스택 트레이스 분석
- **원인 파악**: 근본 원인 식별
- **수정 제안**: 구체적인 수정 방안 제시
- **예방책**: 재발 방지를 위한 제안

## Workflow

### Step 1: 정보 수집

필요한 정보:
1. **에러 메시지**: 정확한 에러 텍스트
2. **스택 트레이스**: 전체 traceback
3. **재현 단계**: 어떻게 발생하는지
4. **환경**: 언어, 버전, OS
5. **최근 변경**: 언제부터 발생했는지

### Step 2: 에러 유형 분류

```yaml
syntax_errors:
  - SyntaxError
  - IndentationError
  - Invalid syntax

runtime_errors:
  - TypeError
  - ValueError
  - AttributeError
  - KeyError
  - IndexError

logic_errors:
  - Wrong output
  - Unexpected behavior
  - Infinite loop

environment_errors:
  - ImportError
  - ModuleNotFoundError
  - FileNotFoundError
  - PermissionError
```

### Step 3: 언어별 쿡북 로드

Python 에러 → `cookbook/python-debug.md`
JavaScript 에러 → `cookbook/js-debug.md`

### Step 4: 분석 및 수정

1. 스택 트레이스 분석
2. 관련 코드 확인
3. 원인 파악
4. 수정 방안 제시
5. 수정 후 검증

## Common Patterns

### Null/None 체크

```
에러: AttributeError: 'NoneType' has no attribute 'X'
원인: 객체가 None인데 속성 접근 시도
해결: None 체크 추가 또는 Optional 처리
```

### 인덱스 범위

```
에러: IndexError: list index out of range
원인: 리스트 크기보다 큰 인덱스 접근
해결: 인덱스 범위 확인, 빈 리스트 처리
```

### 타입 불일치

```
에러: TypeError: unsupported operand type(s)
원인: 호환되지 않는 타입 간 연산
해결: 타입 변환 또는 타입 체크 추가
```

## Output Format

```markdown
## 🐛 버그 분석 리포트

### 에러 요약
- **에러 유형**: [TypeError / ValueError / etc.]
- **발생 위치**: `file.py:42`
- **심각도**: [Critical / High / Medium / Low]

### 원인 분석
[근본 원인 설명]

### 스택 트레이스 분석
```
[핵심 부분 하이라이트]
```

### 수정 방안

**Before:**
```python
[버그 있는 코드]
```

**After:**
```python
[수정된 코드]
```

### 수정 이유
[왜 이 수정이 문제를 해결하는지]

### 예방책
- [ ] 타입 힌트 추가
- [ ] 단위 테스트 추가
- [ ] 방어적 코딩 적용
```

## Examples

### 예시 1: NoneType Error

```
User: "AttributeError: 'NoneType' object has no attribute 'name'"

Claude:
## 🐛 버그 분석

### 에러 요약
- **에러 유형**: AttributeError
- **원인**: None 객체의 속성 접근 시도

### 수정 방안

**Before:**
```python
user = get_user(user_id)
print(user.name)
```

**After:**
```python
user = get_user(user_id)
if user is not None:
    print(user.name)
else:
    print("User not found")
```

또는 (Python 3.10+):
```python
user = get_user(user_id)
print(user.name if user else "User not found")
```
```

### 예시 2: Import Error

```
User: "ModuleNotFoundError: No module named 'requests'"

Claude:
## 🐛 버그 분석

### 에러 요약
- **에러 유형**: ModuleNotFoundError
- **원인**: 'requests' 패키지 미설치

### 해결 방법

```bash
pip install requests
```

또는 requirements.txt에 추가:
```
requests>=2.28.0
```

### 확인
```bash
pip list | grep requests
```
```

## Debugging Checklist

```
□ 에러 메시지를 정확히 읽었는가?
□ 스택 트레이스의 마지막 라인을 확인했는가?
□ 문제의 변수 값을 확인했는가?
□ 최근 변경 사항을 확인했는가?
□ 동일한 에러가 다른 곳에서도 발생하는가?
□ 재현 가능한가?
```
