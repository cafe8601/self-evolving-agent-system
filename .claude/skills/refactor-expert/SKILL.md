---
name: refactor-expert
description: Code refactoring with best practices. Use when user says refactor, clean up code, improve code, simplify, extract function, rename, restructure, reduce complexity, or DRY.
---

# Refactor Expert Skill

> 코드 품질을 개선하고 유지보수성을 높이는 리팩토링을 수행합니다.

## Purpose

- **코드 정리**: 중복 제거, 복잡도 감소
- **구조 개선**: 함수/클래스 추출, 모듈화
- **가독성 향상**: 명명 개선, 주석 추가
- **패턴 적용**: 디자인 패턴, 베스트 프랙티스

## Refactoring Types

```yaml
extract:
  - extract_function    # 함수 추출
  - extract_class       # 클래스 추출
  - extract_variable    # 변수 추출
  - extract_constant    # 상수 추출

rename:
  - rename_variable
  - rename_function
  - rename_class
  - rename_file

restructure:
  - move_function
  - move_class
  - split_file
  - merge_files

simplify:
  - inline_variable
  - inline_function
  - remove_dead_code
  - simplify_conditional
```

## Workflow

### Step 1: 코드 분석

1. 대상 파일/함수 읽기
2. 코드 스멜(Code Smell) 감지
3. 리팩토링 기회 식별

### Step 2: 리팩토링 유형 결정

사용자 요청 또는 분석 결과에 따라:
- "함수가 너무 길다" → Extract Function
- "중복 코드" → Extract & Reuse
- "복잡한 조건문" → Simplify Conditional
- "이름이 불명확" → Rename

### Step 3: 언어별 쿡북 로드

Python → `cookbook/python-refactor.md`
JavaScript → `cookbook/js-refactor.md`

### Step 4: 리팩토링 수행

1. 변경 전 코드 백업 (주석 또는 git)
2. 단계별 리팩토링 적용
3. 각 단계 후 검증

## Code Smells to Detect

| Code Smell | 설명 | 해결책 |
|------------|------|--------|
| Long Function | 20줄 이상 함수 | Extract Function |
| Duplicate Code | 중복 코드 | Extract & Reuse |
| Deep Nesting | 3단계 이상 중첩 | Early Return, Extract |
| Long Parameter List | 4개 이상 파라미터 | Parameter Object |
| Magic Numbers | 의미 없는 숫자 | Extract Constant |
| Dead Code | 사용 안 되는 코드 | Remove |
| God Class | 너무 많은 책임 | Split Class |

## Examples

### 함수 추출

```
User: "이 함수가 너무 길어, 리팩토링 해줘"

Claude:
분석 결과:
- 함수 길이: 45줄
- 책임: 3가지 (검증, 처리, 저장)

제안:
1. validate_input() 추출 (10줄)
2. process_data() 추출 (20줄)  
3. save_result() 추출 (10줄)

진행할까요?
```

### 중복 제거

```
User: "중복 코드 정리해줘"

Claude:
발견된 중복:
- file1.py:20-35 ↔ file2.py:45-60 (90% 유사)

제안:
utils.py에 공통 함수 추출:
  def common_operation(params):
      ...

진행할까요?
```

## Output Format

```markdown
## 리팩토링 완료

### 변경 요약
- **유형**: [Extract Function / Rename / etc.]
- **영향 파일**: N개

### 변경 전
```[lang]
[원본 코드]
```

### 변경 후
```[lang]
[리팩토링된 코드]
```

### 개선 사항
- ✅ 함수 길이: 45줄 → 15줄
- ✅ 복잡도: 12 → 4
- ✅ 중복 제거: 2곳
```

## Safety Rules

```
1. ✅ 작은 단위로 리팩토링
2. ✅ 각 단계 후 테스트 가능 상태 유지
3. ✅ 변경 전 코드 보존 (git commit)
4. ❌ 한 번에 여러 종류 리팩토링 금지
5. ❌ 기능 변경과 리팩토링 동시 진행 금지
```
