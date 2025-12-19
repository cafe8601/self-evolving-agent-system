---
description: 자기 진화형 학습 루프 규칙 - 모든 작업에 적용
globs:
  - "**/*"
---

# Learning Loop Rules

## Rule 1: Brain Sync Before Tasks

모든 중요한 작업 시작 전:

1. `.opencode/brain/project_brain.yaml` 파일 확인
2. `learned_patterns` 섹션에서 관련 패턴 검색
3. SUCCESS_PATTERN 적용 계획
4. FAILURE_PATTERN 회피 전략

## Rule 2: Pattern Application

작업 수행 시:

- 관련 SUCCESS_PATTERN이 있으면 해당 방식 우선 적용
- 관련 FAILURE_PATTERN이 있으면 해당 방식 명시적 회피
- 패턴의 confidence 점수가 높을수록 강하게 적용

## Rule 3: Learn After Tasks (자동 학습 시스템)

작업 완료 후 자동 및 수동 학습:

### 자동 학습 (Hook 기반)
- **SuperClaude 명령어 실행 시**: PostToolUse Hook이 자동으로 패턴 캡처
- **세션 종료 시**: Stop Hook이 pending_patterns.yaml을 project_brain.yaml에 병합

### 수동 학습 캡처
작업 중 발견한 패턴을 즉시 기록:

```bash
# 성공 패턴 기록
npx tsx scripts/capture-learning.ts success "컨텍스트" "학습 내용" --tags "tag1,tag2"

# 실패 패턴 기록
npx tsx scripts/capture-learning.ts failure "컨텍스트" "실패 원인" --tags "tag1,tag2"

# 경고 기록
npx tsx scripts/capture-learning.ts warning "컨텍스트" "경고 내용"

# 발견 기록
npx tsx scripts/capture-learning.ts discovery "컨텍스트" "발견 내용"
```

### npm 단축 명령어
```bash
npm run learn:success "컨텍스트" "내용"
npm run learn:failure "컨텍스트" "내용"
npm run learn:warning "컨텍스트" "내용"
npm run learn:discovery "컨텍스트" "내용"
npm run brain:sync      # 수동 병합
npm run brain:status    # 대기 패턴 확인
```

### 학습 캡처 시점
- 새로운 해결책 발견 시 → success
- 오류/버그 해결 시 → success + 원인 기록
- 실패한 접근법 → failure (회피 패턴)
- 주의해야 할 상황 발견 → warning
- 새로운 인사이트 → discovery

## Rule 4: Skill Integration

스킬 사용 시:

- 해당 스킬 관련 패턴도 함께 검색
- 스킬 실행 결과도 학습 대상
- `skill_integration` 섹션의 트리거 참조

## Pattern Format

새 패턴 추가 시 필수 필드:

```yaml
- id: "LP-NNN"           # 자동 번호
  context: "상황 설명"    # 필수
  status: "SUCCESS_PATTERN" | "FAILURE_PATTERN"  # 필수
  content: "구체적 교훈"  # 필수
  learned_at: "ISO8601"   # 자동
  confidence: 0.0-1.0     # 기본 0.8
  tags: []               # 선택
  related_files: []      # 선택
```

## Metrics Update

각 작업 후 업데이트:

- `workflow_history.total_tasks`: +1
- `workflow_history.successful_tasks`: 성공 시 +1
- `workflow_history.success_rate`: 재계산
- `metrics.evolution_cycles`: 학습 발생 시 +1
