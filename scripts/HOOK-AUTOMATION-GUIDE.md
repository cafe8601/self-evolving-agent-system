# Hook 기반 자동 학습 시스템 가이드

## 개요

이 시스템은 Claude Code의 Hook 기능을 활용하여 **세션 종료 시 자동으로** 학습 내용을 `project_brain.yaml`에 병합합니다.

```
┌─────────────────────────────────────────────────────────────┐
│                    작업 중 (Claude)                          │
│  ┌─────────────┐    add-pattern.ts    ┌──────────────────┐  │
│  │ 패턴 발견   │ ─────────────────────▶│ pending_patterns │  │
│  └─────────────┘                       │     .yaml        │  │
└─────────────────────────────────────────┴──────────────────┘
                                                  │
                          세션 종료 (Stop Hook)    │
                                                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    자동 동기화                               │
│  ┌──────────────────┐    sync-brain.ts   ┌───────────────┐  │
│  │ pending_patterns │ ──────────────────▶│ project_brain │  │
│  │     .yaml        │                    │     .yaml     │  │
│  └──────────────────┘                    └───────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 설치 방법

### 1. Hook 설정 복사

`scripts/hooks-config.example.json`의 내용을 Claude Code 설정에 추가합니다.

**방법 A: 전역 설정** (~/.claude/settings.json)
```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "cd /YOUR/PROJECT/PATH && npx tsx scripts/sync-brain.ts 2>&1 || true"
          }
        ]
      }
    ]
  }
}
```

**방법 B: 프로젝트 설정** (.claude/settings.json)
```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "npx tsx scripts/sync-brain.ts 2>&1 || true"
          }
        ]
      }
    ]
  }
}
```

### 2. 의존성 설치

```bash
npm install yaml
# 또는
pnpm add yaml
```

### 3. 경로 확인

`hooks-config.example.json`의 PROJECT_PATH를 실제 프로젝트 경로로 변경하세요.

## 사용 방법

### 방법 1: SuperClaude 명령어 자동 캡처 (권장)

**SuperClaude 명령어 (/sc:*)를 실행하면 자동으로 패턴이 캡처됩니다.**

```
/sc:implement → PostToolUse Hook → superclaude-hook.ts → pending_patterns.yaml
/sc:analyze   → PostToolUse Hook → superclaude-hook.ts → pending_patterns.yaml
/sc:design    → PostToolUse Hook → superclaude-hook.ts → pending_patterns.yaml
...
```

자동 캡처되는 명령어:
- `/sc:implement` - 구현 패턴
- `/sc:design` - 설계 패턴
- `/sc:refactor` - 리팩토링 패턴
- `/sc:troubleshoot` - 트러블슈팅 패턴
- `/sc:workflow` - 워크플로우 패턴
- 실패한 모든 /sc: 명령어 - 실패 패턴

### 방법 2: capture-learning.ts (빠른 캡처)

작업 중 발견한 패턴을 간편하게 기록합니다:

```bash
# 성공 패턴
npx tsx scripts/capture-learning.ts success "컨텍스트" "학습 내용" --tags "tag1,tag2"

# 실패 패턴
npx tsx scripts/capture-learning.ts failure "컨텍스트" "실패 원인"

# 경고
npx tsx scripts/capture-learning.ts warning "컨텍스트" "주의사항"

# 발견
npx tsx scripts/capture-learning.ts discovery "컨텍스트" "새로운 인사이트"
```

**npm 단축 명령어:**
```bash
npm run learn:success "컨텍스트" "내용"
npm run learn:failure "컨텍스트" "내용"
npm run learn:warning "컨텍스트" "내용"
npm run learn:discovery "컨텍스트" "내용"
```

### 방법 3: add-pattern.ts (상세 기록)

더 많은 옵션으로 상세하게 패턴을 기록합니다:

```bash
npx tsx scripts/add-pattern.ts \
  -c "패턴 컨텍스트" \
  -s SUCCESS \
  -m "패턴 내용 설명" \
  -t "tag1,tag2" \
  -f "related/file.ts"
```

#### 옵션 설명

| 옵션 | 축약 | 필수 | 설명 |
|------|------|------|------|
| --context | -c | ✅ | 패턴이 발견된 상황 |
| --status | -s | ❌ | SUCCESS 또는 FAILURE (기본: SUCCESS) |
| --content | -m | ✅ | 구체적인 패턴 내용 |
| --confidence | | ❌ | 신뢰도 0.0-1.0 (기본: 0.8) |
| --tags | -t | ❌ | 쉼표로 구분된 태그 |
| --files | -f | ❌ | 관련 파일 경로 |

#### 예시

**성공 패턴 기록:**
```bash
npx tsx scripts/add-pattern.ts \
  -c "React 컴포넌트 최적화" \
  -s SUCCESS \
  -m "React.memo()를 사용하면 불필요한 리렌더링 방지. props가 변경되지 않으면 컴포넌트 재렌더링 스킵." \
  -t "react,performance,optimization" \
  -f "components/UserList.tsx"
```

**실패 패턴 기록:**
```bash
npx tsx scripts/add-pattern.ts \
  -c "API 에러 핸들링" \
  -s FAILURE \
  -m "catch 블록 없이 async/await 사용 시 unhandled promise rejection 발생. 항상 try-catch로 감싸거나 .catch() 체이닝 필수." \
  --confidence 0.95 \
  -t "api,error-handling,async" \
  -f "services/api.ts"
```

### 세션 종료 시 자동 동기화

Claude Code 세션이 종료되면 Hook이 자동으로 `sync-brain.ts`를 실행합니다:

```
🧠 Brain 동기화 시작...

📝 2개 패턴 병합 중...
   ✅ LP-005: React 컴포넌트 최적화
   ✅ LP-006: API 에러 핸들링

📊 메트릭스 업데이트 중...
   ✅ 패턴 수: 6
   ✅ 진화 사이클: 3
   ✅ 평균 신뢰도: 0.875

💾 project_brain.yaml 저장 완료
🔄 pending_patterns.yaml 초기화 완료

══════════════════════════════════════════════════
✅ Brain 동기화 완료!
══════════════════════════════════════════════════
   📝 추가된 패턴: 2개
   📋 기록된 워크플로우: 0개
   🧠 총 패턴 수: 6개
   🔄 진화 사이클: 3회
```

### 수동 동기화

Hook 없이 수동으로 동기화할 수도 있습니다:

```bash
npx tsx scripts/sync-brain.ts
```

## 워크플로우 예시

### 전체 작업 흐름

```
1. Claude Code 세션 시작
   │
2. project_brain.yaml 로드 (기존 패턴 확인)
   │
3. 작업 수행
   │
   ├─ 새 패턴 발견 시:
   │   └─ add-pattern.ts 실행 → pending_patterns.yaml에 저장
   │
   ├─ 기존 패턴 적용 시:
   │   └─ pending_metrics.patterns_applied 증가
   │
   └─ 작업 완료/실패 시:
       └─ pending_metrics.tasks_completed/tasks_failed 증가
   │
4. 세션 종료
   │
5. Stop Hook 실행
   │
   └─ sync-brain.ts 자동 실행
       ├─ pending_patterns → project_brain.yaml 병합
       ├─ 메트릭스 업데이트
       └─ pending_patterns.yaml 초기화
```

### Claude가 패턴을 기록해야 하는 시점

1. **새로운 해결 방법 발견**
   - "이 방식이 효과적이었다" → SUCCESS_PATTERN
   - "이 방식은 문제가 있었다" → FAILURE_PATTERN

2. **기존 패턴 검증**
   - 기존 패턴이 현재 상황에도 유효함을 확인
   - confidence 점수 조정 필요 시 메모

3. **프로젝트 특화 지식**
   - 이 프로젝트에서만 적용되는 특별한 규칙
   - 팀 컨벤션이나 아키텍처 결정

## 파일 구조

```
scripts/
├── capture-learning.ts     # 빠른 학습 캡처 CLI (신규)
├── superclaude-hook.ts     # SuperClaude 명령어 Hook 처리기 (신규)
├── add-pattern.ts          # 상세 패턴 추가 헬퍼
├── sync-brain.ts           # Brain 동기화 스크립트
├── hooks-config.example.json  # Hook 설정 예시
└── HOOK-AUTOMATION-GUIDE.md   # 이 가이드

.opencode/brain/
├── project_brain.yaml      # 핵심 Brain (Git 추적)
├── pending_patterns.yaml   # 대기 중인 패턴 (임시)
└── sc_log.yaml            # SuperClaude 명령어 실행 로그 (신규)
└── sc_commands.log        # 명령어 실행 기록 (신규)

.claude/
└── settings.json          # Hook 설정 (프로젝트 레벨)
```

## 주의사항

### 1. pending_patterns.yaml은 임시 파일

- 세션 종료 시 자동으로 초기화됩니다
- Git에 커밋할 필요 없습니다 (.gitignore 추가 권장)

### 2. project_brain.yaml은 핵심 지식 저장소

- Git으로 버전 관리하세요
- 팀원과 공유하면 집단 지성 축적 가능

### 3. Hook 실패 시에도 세션은 정상 종료

- `|| true`로 에러 무시 처리
- 실패 시 로그 확인: `/tmp/claude-activity.log`

### 4. 패턴 ID는 자동 생성

- `id: "auto"`로 설정하면 LP-001, LP-002... 자동 번호 부여
- 기존 최대 번호 + 1로 계산

## 트러블슈팅

### Hook이 실행되지 않음

1. Claude Code 설정 확인
   ```bash
   cat ~/.claude/settings.json
   ```

2. 경로 확인
   ```bash
   cd /your/project/path && npx tsx scripts/sync-brain.ts
   ```

### sync-brain.ts 오류

1. yaml 패키지 설치 확인
   ```bash
   npm list yaml
   ```

2. 파일 경로 확인
   ```bash
   ls .opencode/brain/project_brain.yaml
   ls .opencode/brain/pending_patterns.yaml
   ```

### 패턴이 추가되지 않음

1. pending_patterns.yaml 내용 확인
   ```bash
   cat .opencode/brain/pending_patterns.yaml
   ```

2. add-pattern.ts 직접 실행 테스트
   ```bash
   npx tsx scripts/add-pattern.ts -c "테스트" -m "테스트 내용"
   ```

## 확장 아이디어

### 1. PostToolUse Hook 활용

Edit 도구 사용 시마다 파일 변경 기록:

```json
{
  "PostToolUse": [
    {
      "matcher": "Edit",
      "hooks": [
        {
          "type": "command",
          "command": "echo \"[$(date)] Edit: $TOOL_INPUT\" >> /tmp/changes.log"
        }
      ]
    }
  ]
}
```

### 2. 워크플로우 자동 기록

작업 시작/종료 시 워크플로우 기록 스크립트 추가

### 3. 패턴 검증 자동화

기존 패턴의 유효성을 주기적으로 검증하는 스크립트

---

## 요약

| 컴포넌트 | 역할 | 실행 시점 |
|----------|------|-----------|
| `add-pattern.ts` | 패턴 기록 | Claude 작업 중 |
| `pending_patterns.yaml` | 임시 저장소 | 세션 동안 |
| `sync-brain.ts` | Brain 병합 | 세션 종료 시 (Hook) |
| `project_brain.yaml` | 영구 저장소 | 항상 |

이제 Claude Code를 사용하면서 **자동으로** 학습 내용이 축적됩니다!
