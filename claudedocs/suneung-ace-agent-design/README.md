# 수능 ACE 에이전트 - 완전 설계 문서

ACE Framework V5.2 기반 한국 입시 준비 AI 에이전트

---

## 프로젝트 개요

**목표**: 수능/내신/모의고사를 준비하는 한국 학생들을 위한 개인화된 AI 학습 파트너

**핵심 기술**:
- **ACE Framework V5.2**: Teacher-Student Distillation, 3-Level Smart Router
- **Memory Lane Architecture**: 12가지 교육 전용 메모리 유형
- **OpenRouter**: GPT-5.2 (Teacher) + GPT-5-mini (Medium) + GPT-5-nano (Fast) + Gemini-3-flash (Vision)

**차별화 포인트**:
1. D-day 기반 적응형 학습 스케줄
2. 과목별 전문가 스킬 시스템 (국/영/수/과/사)
3. 심리적 스트레스 모니터링 & 번아웃 예방
4. Spaced Repetition (SM-2 알고리즘) 기반 과학적 복습
5. 성적 예측 및 진도율 추적

---

## 문서 구조

이 디렉토리에는 3개의 핵심 문서가 포함되어 있습니다:

### 1. PROJECT_STRUCTURE.md
**내용**: 프로젝트 전체 구조 및 컴포넌트 개요
- 디렉토리 구조 상세 설명
- Memory Lane 확장 (6 → 12가지 메모리 유형)
- Smart Router (과목별 + 복잡도 라우팅)
- Teacher Brain (학습 평가 + 커리큘럼)
- Stress Monitor (심리 지원 시스템)
- Progress Tracker & Spaced Repetition
- 스킬 파일 & 데이터 파일 예시

**읽어야 할 사람**: 프로젝트 전체를 이해하고 싶은 개발자

### 2. CORE_COMPONENTS.md
**내용**: 핵심 컴포넌트 구현 상세 (Python 코드 포함)
- LearningMemoryLane: 교육 도메인 Memory Lane 구현
- SubjectAwareRouter: 과목 감지 + 복잡도 라우팅
- StressMonitor: 감정 분석 + 번아웃 감지
- SpacedRepetitionEngine: SM-2 알고리즘 구현

**읽어야 할 사람**: 실제 구현을 담당할 개발자

### 3. USAGE_GUIDE.md
**내용**: 실제 사용법 및 시나리오 예시
- 빠른 시작 가이드
- 환경 설정 (.env, settings.yaml)
- 사용 시나리오 (일일 루틴, 번아웃 대응, D-day 전략)
- 과목별 활용법 (국어/수학/영어)
- 심리 지원 기능
- 성적 분석 및 예측
- 고급 기능 (SR 수동 관리, Memory Lane 직접 조회)

**읽어야 할 사람**: 에이전트를 사용할 학생 및 최종 사용자

---

## 빠른 참조

### 프로젝트 구조 (요약)

```
suneung-ace-agent/
├── config/          # 설정 (settings.yaml, subjects.yaml)
├── core/            # 핵심 로직 (agent.py, router.py, teacher.py, stress_monitor.py)
├── memory/          # Memory Lane (learning_memory.py, spaced_repetition.py)
├── handlers/        # 도메인 핸들러 (subject, schedule, mock_exam, psychology)
├── skills/          # 스킬 파일 (korean-expert.md, math-expert.md, etc.)
├── data/            # 데이터 (exam_schedules, curriculum, weak_points_db)
├── tests/           # 테스트
└── main.py          # 진입점
```

### 핵심 기능 매트릭스

| 기능 | ACE V5.2 기본 | Suneung 확장 |
|------|--------------|-------------|
| **Memory Types** | 6가지 | **12가지** (교육 도메인) |
| **Router** | Complexity-based | **Subject + Complexity + Emotion** |
| **Teacher** | Evaluation + Type Classification | **+ Curriculum Generation** |
| **Memory Re-Ranking** | Vector + Recency + Confidence + Type | **+ Subject + Urgency (D-day)** |
| **Skills** | General | **Subject-specific** (국/영/수/과/사) |
| **Monitoring** | Basic | **Stress & Burnout Detection** |
| **Special** | - | **Spaced Repetition, Progress Tracking, Mock Exam Analysis** |

### 12가지 메모리 유형

#### ACE V5.2 기본 (6가지)
1. **CORRECTION**: 사용자 수정
2. **DECISION**: 명시적 결정
3. **INSIGHT**: 깨달음
4. **PATTERN**: 반복 행동
5. **GAP**: 실패/누락
6. **LEARNING**: 일반 학습

#### 교육 도메인 확장 (6가지)
7. **MASTERY**: 완전 숙달
8. **STRUGGLE**: 지속적 어려움
9. **CORRECTION_WRONG**: 오답 분석
10. **INSIGHT_STRATEGY**: 학습 전략
11. **PREFERENCE_STUDY**: 학습 스타일
12. **GAP_EMOTION**: 감정적 어려움

---

## 시스템 아키텍처

```
┌──────────────────────────────────────────────────────────────────┐
│                      사용자 입력 (학생)                           │
│   "수학 미적분 문제 풀이해줘" / "너무 불안해..." / 이미지 업로드  │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                  Subject-Aware Smart Router                       │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 1. 이미지 감지 → VISION (Gemini-3)                         │  │
│  │ 2. 감정 키워드 → PSYCHOLOGY (심리 지원)                    │  │
│  │ 3. 과목 감지 (국/영/수/과/사)                              │  │
│  │ 4. 복잡도 계산 (과목별 + 기본 키워드)                      │  │
│  │ 5. 모델 선택:                                              │  │
│  │    - SIMPLE (< 0.3) → GPT-5-nano                           │  │
│  │    - MEDIUM (0.3~0.6) → GPT-5-mini                         │  │
│  │    - COMPLEX (> 0.6) → GPT-5.2 (Teacher)                   │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                     Skill Matching                                │
│  과목별 전문가 스킬 자동 로드:                                    │
│  - korean-expert.md, math-expert.md, english-expert.md           │
│  - mental-coach.md, motivation-booster.md                        │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│               Learning Memory Lane (교육 도메인)                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Query-Aware Retrieval:                                      │  │
│  │ - "미적분 극한 문제" 검색                                   │  │
│  │ - Type Boosting: "실수" → CORRECTION_WRONG 우선            │  │
│  │ - Subject Match: 수학 메모리 우선                           │  │
│  │ - Urgency: D-day 가까울수록 높은 우선순위                  │  │
│  │                                                              │  │
│  │ Re-Ranking:                                                  │  │
│  │ Final Score = Vector(0.45) + Recency(0.10)                  │  │
│  │             + Confidence(0.10) + TypeBoost(0.15)            │  │
│  │             + SubjectMatch(0.10) + Urgency(0.10)            │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                    선택된 모델 실행                               │
│  Teacher (GPT-5.2) / Medium (Mini) / Fast (Nano) / Vision        │
│  + Skill Context + Memory Context                                │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Teacher Brain 평가                             │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 모든 응답을 Teacher(GPT-5.2)가 평가:                        │  │
│  │ - success: true/false                                       │  │
│  │ - subject: korean/math/english/science/social               │  │
│  │ - mastery_level: 0-10 (숙달도)                              │  │
│  │ - insight: "핵심 교훈 1문장"                                │  │
│  │ - memory_type: 12가지 중 1개 분류                           │  │
│  │ - emotion_detected: neutral/stressed/anxious/motivated      │  │
│  │ - recommended_action: "다음 학습 단계"                       │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│              병렬 처리: 메모리 저장 + 심리 체크 + SR 업데이트     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Memory Lane  │  │ Stress       │  │ Spaced Repetition    │  │
│  │ 즉시 저장    │  │ Monitor      │  │ 복습 스케줄 업데이트 │  │
│  │ (Type-Aware) │  │ 감정 기록    │  │ (SM-2 알고리즘)      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                       사용자에게 응답 반환                        │
│   + 다음 학습 추천 + 복습 알림 + 감정 지원 메시지                │
└──────────────────────────────────────────────────────────────────┘
```

---

## 데이터 흐름 예시

### 예시 1: 수학 문제 풀이 요청

```
사용자: "미적분 극한 문제 풀이해줘: lim (x→0) (sin x / x)"

1. Router:
   - 과목 감지: MATH
   - 복잡도: "미적분" (0.40) + "극한" (0.35) = 0.375 → MEDIUM
   - 모델 선택: GPT-5-mini

2. Skill Match:
   - math-expert.md 로드

3. Memory Lane Retrieval:
   - Query: "미적분 극한 문제"
   - Subject Match: MATH
   - 검색 결과:
     * [LEARNING] "lim (x→0) (sin x / x) = 1" (숙달도: 7/10)
     * [STRUGGLE] "극한 계산에서 부호 실수 많음" (숙달도: 3/10)

4. GPT-5-mini 실행:
   - Context: math-expert.md + 이전 학습 기록
   - Response:
     """
     lim (x→0) (sin x / x) = 1

     풀이:
     1. 직접 대입 시 0/0 꼴 (부정형)
     2. 로피탈 정리 또는 기본 극한 공식 사용
     3. sin x / x는 x→0일 때 1로 수렴 (기본 공식)

     주의: 부호 실수 조심! (이전에 자주 틀렸던 부분)
     """

5. Teacher 평가:
   - success: true
   - subject: math
   - mastery_level: 8 (이전 7 → 향상)
   - memory_type: LEARNING
   - insight: "미적분 극한 기본 공식 이해 향상"

6. Memory Lane 저장:
   - Type: LEARNING
   - Subject: MATH
   - Mastery: 8
   - Urgency: (100 - days_until_exam) / 100

7. Spaced Repetition 업데이트:
   - quality: 4 (정확, 약간 망설임)
   - next_review: 6일 후

8. 사용자 응답 + "6일 후 다시 복습하자!"
```

### 예시 2: 심리적 불안 표현

```
사용자: "시험만 생각하면 너무 불안해..."

1. Router:
   - 감정 키워드 감지: "불안" → PSYCHOLOGY mode
   - 모델: GPT-5-mini (심리 지원)

2. Skill Match:
   - mental-coach.md 로드

3. Stress Monitor:
   - 감정 분석: ANXIOUS (점수: 0.8)
   - 최근 7일 데이터 조회:
     * avg_study_hours: 3.5
     * negative_emotion_ratio: 0.35
     * Burnout Level: LOW (정상)

4. Memory Lane Retrieval:
   - Query: "불안"
   - Type Boost: GAP_EMOTION
   - 검색 결과:
     * [GAP_EMOTION] "모의고사 전날 긴장" (3일 전)
     * [INSIGHT_STRATEGY] "호흡법이 불안 완화에 도움" (1주일 전)

5. GPT-5-mini 실행:
   - Context: mental-coach.md + 이전 불안 대응 기록
   - Response:
     """
     시험 불안은 자연스러운 감정이야.

     🧘 즉시 실천:
     1. 깊게 숨 쉬기 (지난번에 도움 됐던 방법!)
     2. "나는 준비되어 있다" 긍정 확언
     3. 5분 가벼운 스트레칭

     💚 기억해:
     불안은 너를 보호하려는 신호야.
     적당한 긴장은 집중력을 높여줘!

     컨디션은 정상이니 너무 걱정 마.
     """

6. Teacher 평가:
   - success: true
   - memory_type: GAP_EMOTION
   - emotion_detected: anxious
   - insight: "시험 불안 표현, 호흡법 재추천"

7. Memory Lane 저장:
   - Type: GAP_EMOTION
   - Subject: GENERAL
   - Emotion: anxious

8. Stress Monitor 기록:
   - Session logged with emotion=ANXIOUS

9. 사용자 응답 + "3일 후 감정 체크인 예정"
```

---

## 기술 스펙

### 모델 구성

| 역할 | 모델 | 용도 | 비용 비율 |
|------|------|------|----------|
| **Teacher** | GPT-5.2 | 복잡한 추론, 평가, 메모리 분류 | 150x |
| **Student Medium** | GPT-5-mini | 문제 풀이, 개념 설명 | 5x |
| **Student Fast** | GPT-5-nano | 단순 질문, 동기부여, 라우팅 | 1x |
| **Vision** | Gemini-3-flash | 이미지 문제 분석 | 3x |

### 비용 최적화

| 작업 유형 | 모델 | 예상 빈도 |
|----------|------|----------|
| 단순 질문 (동기부여, 일정) | Nano | ~40% |
| 문제 풀이, 개념 설명 | Mini | ~40% |
| 복잡한 분석 | Teacher | ~10% |
| **평가 (모든 세션)** | **Teacher** | **~100% (필수)** |
| 이미지 문제 | Gemini | ~10% |

**예상 비용**: Teacher-only 대비 **80-85% 절감**

### 메모리 시스템

| 구분 | 기술 | 용도 |
|------|------|------|
| **Vector DB** | ChromaDB | Memory Lane 저장 |
| **Embedding** | text-embedding-3-small | 의미적 검색 |
| **Storage** | Local (./data/) | 학습 데이터, 프로필 |

### Spaced Repetition

- **알고리즘**: SM-2 (SuperMemo 2)
- **복습 간격**: 1일 ~ 30일 (난이도 기반)
- **우선순위**: 숙달도 + 긴급도 + 난이도 + 반복 횟수

---

## 확장 가능성

### 단기 (1-3개월)
1. **성적 시각화**: 그래프 및 대시보드
2. **학습 일정 자동 생성**: Google Calendar 연동
3. **그룹 스터디**: 친구와 진도율 비교
4. **모바일 앱**: iOS/Android 네이티브 앱

### 중기 (3-6개월)
1. **음성 인터페이스**: 음성으로 질문/답변
2. **실시간 모의고사**: 온라인 모의고사 시스템
3. **AI 튜터 매칭**: 과목별 전문 튜터 연결
4. **학부모 대시보드**: 학습 진도 및 감정 상태 모니터링

### 장기 (6-12개월)
1. **VR 학습 환경**: 가상 강의실
2. **EEG 기반 집중도 측정**: 뇌파 센서 연동
3. **AI 친구 모드**: 감정적 교감 강화
4. **대학 입시 전략**: 수시/정시 전략 컨설팅

---

## 윤리적 고려사항

### 학생 보호
- **과도한 의존 방지**: 스스로 생각하는 능력 유지
- **건강 우선**: 번아웃 감지 시 강제 휴식 권장
- **긍정적 메시지**: 절대 부정적 평가 금지

### 데이터 프라이버시
- **로컬 저장**: 모든 데이터 로컬 디바이스 저장
- **암호화**: 민감 정보 암호화 저장
- **익명화**: 통계 분석 시 개인 식별 정보 제거

### 공정성
- **편견 없는 평가**: 성별, 지역, 배경 무관
- **접근성**: 저소득층 학생 지원 프로그램
- **장애인 지원**: 스크린 리더, 음성 인터페이스

---

## 라이선스

MIT License (예정)

---

## 기여

현재 개발 단계로, 기여 가이드라인은 추후 공개 예정

---

## 연락처

- **개발자**: [Your Name]
- **이메일**: [your-email@example.com]
- **GitHub**: https://github.com/your-repo/suneung-ace-agent

---

## 버전 히스토리

- **v1.0.0** (2025-12-25): 초기 설계 완료
  - ACE Framework V5.2 기반 아키텍처
  - 12가지 교육 도메인 메모리 유형
  - Subject-Aware Smart Router
  - Stress Monitor & Spaced Repetition
  - 상세 설계 문서 3종 완성

---

**설계 완료일**: 2025-12-25
**다음 단계**: 프로토타입 구현 시작
