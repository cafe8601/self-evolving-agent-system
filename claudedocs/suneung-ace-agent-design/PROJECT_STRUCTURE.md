# 수능 ACE 에이전트 - 프로젝트 구조 설계

ACE Framework V5.2 기반 한국 입시 준비 에이전트 완전 설계

---

## 프로젝트 개요

**목표**: 수능/내신/모의고사 준비를 위한 개인화된 AI 학습 파트너
**기술 스택**: ACE V5.2 + Memory Lane + OpenRouter (GPT-5.2/Mini/Nano + Gemini-3)
**특화 기능**:
- D-day 기반 맞춤형 학습 스케줄
- 과목별 전문가 스킬 시스템
- 심리적 스트레스 모니터링 & 번아웃 예방
- Spaced Repetition 기반 취약점 집중 학습
- 모의고사 성적 분석 & 실력 예측

---

## 디렉토리 구조 상세

```
suneung-ace-agent/
│
├── config/                      # 설정 관리
│   ├── __init__.py
│   ├── settings.yaml            # 에이전트 핵심 설정
│   ├── subjects.yaml            # 과목별 설정 (가중치, 커리큘럼)
│   ├── exam_schedules.yaml      # 수능/모의고사 일정
│   └── loader.py                # YAML 로더 + 환경변수 통합
│
├── core/                        # 핵심 에이전트 로직
│   ├── __init__.py
│   ├── agent.py                 # SuneungACEAgent (메인 에이전트 클래스)
│   ├── router.py                # SubjectAwareRouter (과목별 + 복잡도 라우팅)
│   ├── teacher.py               # TeacherBrain (학습 평가 + 커리큘럼)
│   └── stress_monitor.py        # StressMonitor (감정 분석 + 번아웃 감지)
│
├── memory/                      # Memory Lane 확장 (교육 도메인)
│   ├── __init__.py
│   ├── learning_memory.py       # LearningMemoryLane (6 → 12가지 메모리 유형)
│   ├── progress_tracker.py      # ProgressTracker (과목별 진도율, 성취도)
│   ├── spaced_repetition.py     # SpacedRepetitionEngine (SM-2 알고리즘)
│   └── weak_points_db.py        # WeakPointDatabase (취약점 DB + 우선순위)
│
├── handlers/                    # 도메인 핸들러
│   ├── __init__.py
│   ├── subject_handlers.py      # SubjectHandler (과목별 로직: 국/영/수/과/사)
│   ├── schedule_planner.py      # SchedulePlanner (D-day 기반 학습 일정)
│   ├── mock_exam_analyzer.py    # MockExamAnalyzer (모의고사 점수 분석)
│   └── psychological_support.py # PsychologicalSupport (스트레스 관리)
│
├── skills/                      # 스킬 파일 (.md) - 자동 매칭
│   ├── korean-expert.md         # [국어] 비문학, 문학, 문법 전문가
│   ├── math-expert.md           # [수학] 미적분, 확률통계, 기하 전문가
│   ├── english-expert.md        # [영어] 독해, 듣기, 어법 전문가
│   ├── science-expert.md        # [과탐] 물리/화학/생명/지구과학
│   ├── social-expert.md         # [사탐] 사회문화/경제/윤리/지리/역사
│   ├── study-planner.md         # 학습 전략 및 시간 관리
│   ├── mental-coach.md          # 멘탈 관리 및 시험 불안 극복
│   ├── motivation-booster.md    # 동기부여 및 슬럼프 탈출
│   └── exam-strategy.md         # 시험 전략 (시간 배분, 찍기 전략)
│
├── data/                        # 데이터 저장소
│   ├── exam_schedules/          # 수능/모의고사 일정 (JSON/CSV)
│   │   ├── 2024_schedule.json
│   │   └── 2025_schedule.json
│   ├── curriculum/              # 과목별 커리큘럼 (단원별 학습 목표)
│   │   ├── korean.yaml
│   │   ├── math.yaml
│   │   ├── english.yaml
│   │   ├── science.yaml
│   │   └── social.yaml
│   ├── weak_points_db/          # 취약점 데이터 (ChromaDB)
│   └── student_profiles/        # 학생 프로필 (목표 대학, 현재 성적 등)
│
├── tests/                       # 테스트
│   ├── __init__.py
│   ├── test_learning_memory.py  # LearningMemoryLane 테스트
│   ├── test_subject_handlers.py # 과목별 핸들러 테스트
│   ├── test_stress_monitor.py   # 스트레스 모니터 테스트
│   ├── test_spaced_repetition.py # SR 알고리즘 테스트
│   └── test_integration.py      # 통합 테스트
│
├── utils/                       # 유틸리티
│   ├── __init__.py
│   ├── dday_calculator.py       # D-day 계산 및 긴급도 판단
│   ├── score_predictor.py       # 성적 예측 모델 (선형 회귀)
│   └── emotion_analyzer.py      # 감정 분석 (텍스트 → 감정 점수)
│
├── main.py                      # 진입점
├── requirements.txt             # 의존성
├── .env.example                 # 환경변수 템플릿
├── .gitignore
├── README.md                    # 한글 문서
└── ARCHITECTURE.md              # 아키텍처 문서
```

---

## 핵심 컴포넌트 설명

### 1. Memory Lane 확장 (교육 도메인)

#### 기본 6가지 메모리 유형 (ACE V5.2)
| Type | 설명 | 예시 |
|------|------|------|
| **correction** | 사용자 수정 요청 | "아니, 수학이 아니라 국어 풀이 보여줘" |
| **decision** | 명시적 결정 | "수학은 매일 2시간씩 하기로 결정" |
| **insight** | 새로운 깨달음 | "오답노트가 성적 향상에 도움됨" |
| **pattern** | 반복되는 행동 | "항상 저녁 7시에 공부 시작" |
| **gap** | 실패/누락 | "확률과 통계 문제 틀림" |
| **learning** | 일반 학습 | "미분 공식 외움" |

#### 추가 6가지 교육 전용 메모리 유형
| Type | 설명 | 예시 | Query Boost 키워드 |
|------|------|------|-------------------|
| **MASTERY** | 완전히 숙달한 개념/문제 유형 | "2차 함수 그래프는 완벽히 이해함" | "잘하는", "자신있는", "마스터" |
| **STRUGGLE** | 지속적으로 어려워하는 영역 | "영어 빈칸 추론 문제가 계속 틀림" | "어려운", "힘든", "약점" |
| **CORRECTION_WRONG** | 오답 원인 분석 | "케어리스 미스로 부호 실수" | "틀린", "오답", "실수" |
| **INSIGHT_STRATEGY** | 학습 전략 깨달음 | "아침 공부가 집중력 좋음" | "전략", "방법", "효과적" |
| **PREFERENCE_STUDY** | 학습 스타일 선호 | "문제 풀이보다 개념 정리 먼저" | "선호", "좋아", "스타일" |
| **GAP_EMOTION** | 감정적 어려움 (스트레스, 불안) | "시험만 생각하면 긴장됨" | "불안", "스트레스", "긴장" |

#### Memory Lane Re-Ranking for Education

```python
Final Score = (Vector Similarity × 0.45)      # 의미적 유사도
            + (Recency × 0.10)                # 최근성
            + (Confidence × 0.10)             # 신뢰도
            + (Type Boost × 0.15)             # 유형 부스트
            + (Subject Match × 0.10)          # 과목 일치도 (NEW)
            + (Urgency × 0.10)                # D-day 긴급도 (NEW)
```

**Subject Match**: 현재 과목과 메모리 과목이 일치하면 +10%
**Urgency**: D-day가 가까울수록 관련 메모리 우선순위 상승

---

### 2. Smart Router (SubjectAwareRouter)

#### 라우팅 결정 프로세스

```
사용자 입력
    ↓
1. 과목 감지 (국어/영어/수학/과탐/사탐)
    ↓
2. 복잡도 계산 (ACE V5.2 기본 + 교육 키워드)
    ↓
3. 감정 상태 체크 (스트레스/불안 키워드)
    ↓
4. 모델 선택
    - SIMPLE (Nano): 단순 질문, 동기부여
    - MEDIUM (Mini): 문제 풀이, 개념 설명
    - COMPLEX (Teacher): 복잡한 분석, 커리큘럼
    - VISION (Gemini): 문제 이미지 분석
    ↓
5. 스킬 매칭 (과목별 전문가)
```

#### 과목별 복잡도 키워드

```python
SUBJECT_COMPLEXITY_KEYWORDS = {
    # 국어 (Korean)
    "비문학": 0.30, "문학": 0.25, "문법": 0.28,
    "지문": 0.20, "선지": 0.15, "주제": 0.18,

    # 수학 (Math)
    "미적분": 0.40, "확률": 0.35, "기하": 0.38,
    "증명": 0.35, "계산": 0.20, "공식": 0.15,

    # 영어 (English)
    "빈칸": 0.30, "순서": 0.28, "요약": 0.25,
    "문법": 0.22, "독해": 0.20, "듣기": 0.10,

    # 과탐/사탐 (Science/Social)
    "실험": 0.25, "개념": 0.18, "그래프": 0.22,
}
```

---

### 3. Teacher Brain (학습 평가 + 커리큘럼)

#### 평가 프롬프트 (Memory Type 분류 포함)

```python
prompt = """Analyze this student's learning task. Output JSON:
{
    "success": true/false,
    "subject": "korean|math|english|science|social",
    "mastery_level": 0-10,  # 숙달 정도
    "insight": "Key lesson learned (1 sentence max)",
    "reason": "Brief explanation",
    "memory_type": "type from list below",
    "emotion_detected": "neutral|stressed|anxious|motivated|frustrated",
    "recommended_action": "next study step"
}

Memory Types (choose ONE most appropriate):
- "correction": User corrected something
- "decision": Explicit study decision
- "insight": New learning realization
- "pattern": Recurring study behavior
- "gap": Failed or missing capability
- "learning": General knowledge gain
- "MASTERY": Fully mastered concept
- "STRUGGLE": Persistent difficulty
- "CORRECTION_WRONG": Wrong answer analysis
- "INSIGHT_STRATEGY": Study strategy insight
- "PREFERENCE_STUDY": Study style preference
- "GAP_EMOTION": Emotional difficulty (stress/anxiety)

Task: {task}
Result: {result}
Student Context: D-{days_until_exam} days until exam
"""
```

#### 커리큘럼 생성 전략

1. **D-day 기반 우선순위**
   - D-30 이상: 기본 개념 + 취약점 보완
   - D-30 ~ D-7: 실전 문제 풀이 + 모의고사
   - D-7 이하: 핵심 개념 복습 + 오답 정리

2. **과목별 시간 배분**
   - 현재 성적 기반 가중치 계산
   - 목표 성적과의 갭 분석
   - 단위 시간당 성적 향상률 계산

3. **Spaced Repetition 적용**
   - SM-2 알고리즘으로 복습 주기 계산
   - 취약점 우선 복습 스케줄링
   - 완벽히 숙달한 내용은 복습 주기 연장

---

### 4. Stress Monitor (심리 지원)

#### 감정 상태 감지

```python
STRESS_KEYWORDS = {
    "불안": 0.8, "긴장": 0.7, "걱정": 0.6,
    "힘들": 0.7, "피곤": 0.5, "지쳐": 0.8,
    "포기": 0.9, "안돼": 0.7, "무서워": 0.8,
}

MOTIVATION_KEYWORDS = {
    "잘하고싶어": 0.7, "열심히": 0.6, "해낼": 0.8,
    "목표": 0.5, "화이팅": 0.6, "도전": 0.7,
}
```

#### 번아웃 감지 알고리즘

```python
def detect_burnout(recent_sessions: List[Session]) -> BurnoutLevel:
    """
    최근 7일 학습 세션 분석
    - 연속 긴 학습 시간 (4시간+ × 7일)
    - 부정적 감정 빈도 증가
    - 성적 향상 정체 또는 하락
    - 학습 효율 저하 (같은 내용 반복 질문)
    """
    if all([
        avg_study_hours > 4,
        negative_emotion_ratio > 0.6,
        score_improvement < 0,
        efficiency_score < 0.5
    ]):
        return BurnoutLevel.HIGH  # 긴급 휴식 필요
    elif negative_emotion_ratio > 0.4:
        return BurnoutLevel.MEDIUM  # 휴식 권장
    else:
        return BurnoutLevel.LOW  # 정상
```

#### 심리 지원 전략

| 번아웃 레벨 | 조치 |
|------------|------|
| **HIGH** | 1일 완전 휴식 권장, 가벼운 동기부여 메시지 |
| **MEDIUM** | 학습 시간 20% 감축, 좋아하는 과목 위주 학습 |
| **LOW** | 정상 학습 진행, 주기적 격려 |

---

### 5. Progress Tracker (진도율 추적)

#### 과목별 추적 메트릭

```python
@dataclass
class SubjectProgress:
    subject: str                    # 과목명
    total_units: int               # 전체 단원 수
    completed_units: int           # 완료 단원 수
    mastery_scores: Dict[str, float]  # 단원별 숙달도 (0-10)
    weak_units: List[str]          # 취약 단원
    recent_scores: List[float]     # 최근 5회 모의고사 점수
    target_score: float            # 목표 점수
    predicted_score: float         # 예측 점수 (선형 회귀)
    days_until_exam: int           # D-day
```

#### 진도율 계산

```python
progress_rate = completed_units / total_units * 100
avg_mastery = sum(mastery_scores.values()) / len(mastery_scores)
completion_score = (progress_rate * 0.4) + (avg_mastery * 0.6)
```

---

### 6. Spaced Repetition Engine

#### SM-2 알고리즘 적용

```python
def calculate_next_review(
    easiness_factor: float,  # 2.5 기본값
    interval: int,           # 이전 복습 간격 (일)
    quality: int             # 0-5 (사용자 평가)
) -> tuple[float, int]:
    """
    SM-2 알고리즘으로 다음 복습 일정 계산

    quality:
    - 5: 완벽 (perfect response)
    - 4: 정확한 응답 (약간 망설임)
    - 3: 정확한 응답 (많이 망설임)
    - 2: 틀림 (쉬운 복습 후 기억남)
    - 1: 틀림 (복습 후에도 어려움)
    - 0: 전혀 기억 안남
    """
    new_ef = easiness_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))

    if new_ef < 1.3:
        new_ef = 1.3

    if quality < 3:
        new_interval = 1  # 다시 1일 후 복습
    else:
        if interval == 0:
            new_interval = 1
        elif interval == 1:
            new_interval = 6
        else:
            new_interval = int(interval * new_ef)

    return new_ef, new_interval
```

#### 복습 우선순위

```python
priority_score = (
    (10 - mastery_level) * 0.4  # 낮은 숙달도일수록 우선
    + urgency * 0.3              # D-day 가까울수록 우선
    + error_count * 0.2          # 오답 많을수록 우선
    + recency * 0.1              # 최근 학습일수록 우선
)
```

---

## 스킬 파일 예시

### korean-expert.md

```markdown
# 국어 영역 전문가

**Triggers**: 국어, 비문학, 문학, 문법, 화법과작문, 언어와매체

## Expertise
- 비문학 지문 분석 (과학, 인문, 사회, 기술, 예술)
- 문학 작품 해석 (현대시, 고전시가, 현대소설, 고전소설)
- 문법 개념 정리 (음운, 형태, 통사, 의미, 화용)

## Strategies
- 선지 제거법 (소거법으로 정답 찾기)
- 주제문/핵심어 파악
- 시간 배분 전략 (지문당 3-4분)
```

### mental-coach.md

```markdown
# 멘탈 코칭 전문가

**Triggers**: 불안, 스트레스, 긴장, 포기, 번아웃, 동기부여

## Expertise
- 시험 불안 극복 (호흡법, 마인드셋)
- 슬럼프 탈출 전략
- 자기효능감 향상

## Support Messages
- 긴장될 때: "시험은 연습의 반복이야. 지금까지 잘 해왔으니 오늘도 할 수 있어!"
- 성적 하락 시: "일시적 하락은 성장의 신호일 수 있어. 오답을 분석하고 다음으로!"
```

---

## 데이터 파일 예시

### subjects.yaml

```yaml
subjects:
  korean:
    name: "국어"
    weight: 20  # 전체 학습 시간 중 비율 (%)
    units:
      - "화법과 작문"
      - "언어와 매체"
      - "독서 (비문학)"
      - "문학"
    difficulty: 3  # 1-5

  math:
    name: "수학"
    weight: 30
    units:
      - "수학 I (지수/로그, 삼각함수, 수열)"
      - "수학 II (함수의 극한, 미분, 적분)"
      - "미적분 (수열의 극한, 미분법, 적분법)"
      - "확률과 통계 (경우의 수, 확률, 통계)"
      - "기하 (이차곡선, 벡터, 공간도형)"
    difficulty: 5

  english:
    name: "영어"
    weight: 20
    units:
      - "듣기"
      - "독해 (빈칸, 순서, 요약)"
      - "어법/어휘"
    difficulty: 2
```

---

## 환경변수 (.env.example)

```bash
# ============================================
# Suneung ACE Agent Configuration
# ============================================

# OpenRouter Configuration (Required)
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# Teacher Model (Complex reasoning, evaluation)
TEACHER_MODEL=openai/gpt-5.2

# Student Medium Model (Balanced performance)
STUDENT_MEDIUM_MODEL=openai/gpt-5-mini

# Student Fast Model (Quick, cost-optimized)
STUDENT_MODEL=openai/gpt-5-nano

# Vision Model (Multimodal analysis for problem images)
VISION_MODEL=google/gemini-3-flash-preview

# Optional: Tavily API for Web Search (latest exam info)
# TAVILY_API_KEY=tvly-your-api-key-here

# ============================================
# Student Profile
# ============================================

# D-day until exam (e.g., 100 for 100 days remaining)
DAYS_UNTIL_EXAM=100

# Target university and department
TARGET_UNIVERSITY="서울대학교 컴퓨터공학부"

# Current average score (per subject, 0-100)
CURRENT_SCORE_KOREAN=75
CURRENT_SCORE_MATH=80
CURRENT_SCORE_ENGLISH=85
CURRENT_SCORE_SCIENCE=70
CURRENT_SCORE_SOCIAL=65

# Target average score
TARGET_SCORE=90
```

---

## 실행 흐름 예시

### 1. 에이전트 초기화

```python
from core.agent import SuneungACEAgent

# .env 파일에서 설정 로드
agent = SuneungACEAgent()

# 학생 프로필 자동 로드
# - D-day: 100일
# - 목표 대학: 서울대 컴공
# - 현재 점수: 국어 75, 수학 80, 영어 85
```

### 2. 학습 세션 시작

```python
# 사용자: "수학 미적분 문제 풀이해줘"
result = agent.run("수학 미적분 문제 풀이해줘")

# 내부 프로세스:
# 1. Router: 과목=수학, 복잡도=MEDIUM → GPT-5-mini
# 2. Skill Match: math-expert.md 로드
# 3. Memory Lane: 이전 "미적분" 관련 학습 기록 검색
#    - STRUGGLE: "적분 계산에서 부호 실수 많음"
#    - MASTERY: "극한 개념은 완벽히 이해"
# 4. 문제 풀이 제공 + 부호 실수 주의 강조
# 5. Teacher 평가: memory_type = "learning", mastery_level = 7
# 6. Memory Lane 저장 (Type-Aware)
```

### 3. 감정 지원

```python
# 사용자: "너무 불안해... 시험이 다가오니까 무섭다"
result = agent.run("너무 불안해... 시험이 다가오니까 무섭다")

# 내부 프로세스:
# 1. Stress Monitor: emotion = "anxious", stress_level = 0.8
# 2. Skill Match: mental-coach.md 로드
# 3. PsychologicalSupport: 불안 완화 메시지 생성
# 4. Teacher 평가: memory_type = "GAP_EMOTION"
# 5. Burnout Check: 최근 7일 데이터 분석
#    - 학습 시간 평균 5시간 (HIGH)
#    - 부정적 감정 60% (MEDIUM)
#    - Burnout Level = MEDIUM → 휴식 권장
```

### 4. 모의고사 분석

```python
# 사용자: "오늘 모의고사 결과: 국어 80, 수학 85, 영어 90"
result = agent.run("오늘 모의고사 결과: 국어 80, 수학 85, 영어 90")

# 내부 프로세스:
# 1. MockExamAnalyzer: 점수 파싱 및 추세 분석
#    - 국어: 75 → 80 (+5, 상승 추세)
#    - 수학: 80 → 85 (+5, 상승 추세)
#    - 영어: 85 → 90 (+5, 목표 달성)
# 2. ScorePredictor: 선형 회귀로 수능 점수 예측
#    - 예상 점수: 국어 88, 수학 92, 영어 95
# 3. ProgressTracker: 진도율 업데이트
# 4. SchedulePlanner: D-day 기반 남은 학습 계획 재조정
```

---

## 핵심 특징 요약

| 기능 | ACE V5.2 기본 | Suneung 확장 |
|------|--------------|-------------|
| **Memory Types** | 6가지 (correction, decision, insight, pattern, gap, learning) | **12가지** (+MASTERY, STRUGGLE, CORRECTION_WRONG, INSIGHT_STRATEGY, PREFERENCE_STUDY, GAP_EMOTION) |
| **Router** | Complexity-based (simple/medium/complex) | **Subject-Aware** (과목 감지 + 복잡도) |
| **Teacher** | Result evaluation + Type classification | **+ Curriculum generation** (D-day 기반) |
| **Memory Re-Ranking** | Vector + Recency + Confidence + Type | **+ Subject Match + Urgency** (D-day) |
| **Skills** | General purpose | **Subject-specific** (국/영/수/과/사 + 멘탈코칭) |
| **Monitoring** | Basic logging | **Stress & Burnout detection** |
| **Special Features** | - | **Spaced Repetition, Progress Tracking, Mock Exam Analysis** |

---

## 비용 최적화

| 작업 유형 | 모델 | 비용 비율 | 예상 빈도 |
|----------|------|----------|----------|
| 단순 질문 (동기부여, 일정 확인) | Nano | 1x | ~40% |
| 문제 풀이, 개념 설명 | Mini | 5x | ~40% |
| 복잡한 분석, 커리큘럼 생성 | Teacher | 150x | ~10% |
| 학습 평가 (모든 세션) | Teacher | 150x | ~100% (필수) |
| 이미지 문제 분석 | Gemini-3 | 3x | ~10% |

**예상 비용 절감**: Teacher-only 대비 **80-85%** (ACE V5.2 기본 동일)

**추가 비용**: Teacher의 Memory Type 분류 (교육 도메인 12가지) ~15% 증가
→ 하지만 **정확도 90%+** 보장으로 학습 효율성 향상

---

## 차별화 포인트

1. **D-day 기반 적응형 학습**: 시험까지 남은 시간에 따라 학습 전략 자동 조정
2. **과목별 전문가 시스템**: 각 과목의 특성에 맞는 학습 방법 제공
3. **심리 케어 통합**: 단순 공부 도구가 아닌 멘탈 관리까지 지원
4. **Spaced Repetition**: 과학적 복습 알고리즘으로 장기 기억 형성
5. **성적 예측**: 현재 추세 기반 실제 수능 점수 예측
6. **오답 분석**: 단순 틀린 문제가 아닌 원인 분석 (케어리스, 개념 부족 등)

---

**Version**: 1.0.0 (Based on ACE V5.2)
**Target Users**: 한국 수능/내신 준비 학생
**Expected Impact**: 학습 효율 30-50% 향상, 시험 불안 60% 감소 (예상치)
