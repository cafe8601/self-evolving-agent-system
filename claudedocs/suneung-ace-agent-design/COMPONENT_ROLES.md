# 수능 ACE 에이전트 - 컴포넌트 역할 및 책임

각 파일과 클래스의 역할을 명확히 정의

---

## 디렉토리별 역할

### `/config` - 설정 관리

| 파일 | 역할 | 책임 |
|------|------|------|
| `__init__.py` | 패키지 초기화 | config 모듈을 Python 패키지로 만듦 |
| `settings.yaml` | 에이전트 기본 설정 | 학습 스케줄, 라우팅 임계값, 번아웃 감지 설정 |
| `subjects.yaml` | 과목별 설정 | 과목 가중치, 단원 구성, 난이도 설정 |
| `exam_schedules.yaml` | 시험 일정 | 수능/모의고사 일정, D-day 계산 기준 |
| `loader.py` | 설정 로더 | YAML 파일 읽기 + 환경변수 통합 |

**핵심 책임**: 에이전트 동작 파라미터 중앙 관리

---

### `/core` - 핵심 에이전트 로직

#### `agent.py` - **SuneungACEAgent (메인 에이전트)**

```python
class SuneungACEAgent:
    """
    수능 ACE 에이전트 메인 클래스

    역할:
    - 사용자 요청 진입점
    - 컴포넌트 오케스트레이션
    - 세션 관리

    책임:
    - Router, Memory, Skills 초기화
    - run() 메서드로 요청 처리
    - 응답 생성 및 반환
    - 컴포넌트 간 데이터 흐름 관리
    """

    def __init__(self):
        # 설정 로드
        # Router, Memory Lane, Skills, Stress Monitor 초기화
        # OpenRouter 클라이언트 설정

    def run(self, task: str, image_path: str = None) -> str:
        """
        사용자 요청 처리

        Flow:
        1. Router로 라우팅 결정
        2. Skill 매칭
        3. Memory Lane에서 컨텍스트 검색
        4. 선택된 모델로 실행
        5. Teacher 평가
        6. Memory Lane 저장
        7. Stress Monitor 업데이트
        8. 응답 반환
        """
```

#### `router.py` - **SubjectAwareRouter (라우팅 결정)**

```python
class SubjectAwareRouter:
    """
    과목 인식 + 복잡도 기반 라우터

    역할:
    - 입력 분석 (과목, 복잡도, 감정)
    - 최적 모델 선택 (Nano/Mini/Teacher/Vision)

    책임:
    - 이미지 감지 → VISION
    - 감정 키워드 감지 → PSYCHOLOGY
    - 과목 감지 (국/영/수/과/사)
    - 복잡도 계산 (키워드 가중치)
    - RouteDecision 반환
    """

    def route(self, task: str, has_image: bool) -> RoutingContext:
        """
        라우팅 결정

        Returns:
            RoutingContext:
                - decision: SIMPLE/MEDIUM/COMPLEX/VISION/PSYCHOLOGY
                - subject: korean/math/english/science/social/general
                - complexity_score: 0.0 ~ 1.0
                - emotion_detected: anxious/stressed/motivated/etc.
        """
```

#### `teacher.py` - **TeacherBrain (학습 평가 및 커리큘럼)**

```python
class TeacherBrain:
    """
    Teacher Model (GPT-5.2) 전용 평가 및 커리큘럼 생성

    역할:
    - 모든 학습 세션 평가
    - Memory Type 분류 (12가지)
    - 커리큘럼 생성 (D-day 기반)

    책임:
    - analyze_result(): 작업 결과 평가
      → success, mastery_level, insight, memory_type
    - generate_curriculum(): D-day 기반 학습 계획
      → 과목별 시간 배분, 우선순위, 학습 전략
    - classify_memory_type(): 12가지 메모리 유형 분류
      → Teacher가 프롬프트로 분류 (90%+ 정확도)
    """

    def analyze_result(
        self,
        task: str,
        result: str,
        days_until_exam: int
    ) -> EvaluationResult:
        """
        학습 결과 평가

        Prompt to Teacher:
        - Task, Result 분석
        - Success 판단
        - Mastery Level (0-10) 계산
        - Memory Type 분류 (12가지 중 1개)
        - Insight 추출 (1문장)
        - Recommended Action 제안
        """

    def generate_curriculum(
        self,
        days_until_exam: int,
        current_progress: Dict[str, float],
        weak_areas: List[str]
    ) -> CurriculumPlan:
        """
        D-day 기반 커리큘럼 생성

        Strategy:
        - D-30 이상: 개념 60%, 문제 40%
        - D-30 ~ D-7: 문제 70%, 개념 30%
        - D-7 이하: 복습 80%, 휴식 20%
        """
```

#### `stress_monitor.py` - **StressMonitor (심리 지원)**

```python
class StressMonitor:
    """
    스트레스 & 번아웃 감지 시스템

    역할:
    - 실시간 감정 분석
    - 번아웃 레벨 감지 (7일 데이터 기반)
    - 심리 지원 메시지 추천

    책임:
    - analyze_emotion(): 텍스트 → EmotionType
    - detect_burnout(): 최근 7일 분석 → BurnoutLevel
    - get_support_message(): 감정 + 번아웃 레벨 → 지원 메시지
    - log_session(): 학습 세션 기록
    """

    def analyze_emotion(self, text: str) -> tuple[EmotionType, float]:
        """
        감정 분석

        Keywords:
        - Stress: 불안, 긴장, 걱정, 힘들, 피곤, 지쳐, 포기
        - Motivation: 잘하고싶어, 열심히, 해낼, 목표, 화이팅

        Returns:
            (emotion_type, emotion_score)
        """

    def detect_burnout(self, recent_days: int = 7) -> tuple[BurnoutLevel, Dict]:
        """
        번아웃 감지

        Criteria:
        - HIGH: avg_study_hours >= 4 AND negative_emotion >= 60% AND efficiency < 50%
        - MEDIUM: negative_emotion >= 40% OR efficiency < 60%
        - LOW: 정상

        Returns:
            (burnout_level, metrics)
        """
```

---

### `/memory` - Memory Lane & 학습 메모리

#### `learning_memory.py` - **LearningMemoryLane (교육 도메인 메모리)**

```python
class LearningMemoryLane:
    """
    ACE V5.2 Memory Lane 확장 (6 → 12가지 메모리 유형)

    역할:
    - Type-Aware 메모리 저장
    - Query-Aware 컨텍스트 검색
    - Re-Ranking (과목 + 긴급도 추가)

    책임:
    - store(): 메모리 저장 (Teacher가 분류한 type 사용)
    - retrieve_context(): Query-Aware 검색 + Re-Ranking
      → Final Score = Vector(0.45) + Recency(0.10) + Confidence(0.10)
                    + TypeBoost(0.15) + SubjectMatch(0.10) + Urgency(0.10)
    - update_for_spaced_repetition(): SR 업데이트
    - get_statistics(): 메모리 통계
    """

    # 12가지 메모리 유형
    MEMORY_TYPES = [
        # ACE V5.2 기본 (6가지)
        CORRECTION, DECISION, INSIGHT, PATTERN, GAP, LEARNING,
        # 교육 도메인 (6가지)
        MASTERY, STRUGGLE, CORRECTION_WRONG, INSIGHT_STRATEGY,
        PREFERENCE_STUDY, GAP_EMOTION
    ]

    # Query-Aware Type Boosting
    TYPE_BOOST_KEYWORDS = {
        "실수": [CORRECTION, CORRECTION_WRONG, GAP],
        "결정": [DECISION],
        "잘하는": [MASTERY],
        "어려운": [STRUGGLE, GAP],
        "불안": [GAP_EMOTION],
        # ... 더 많은 키워드
    }
```

#### `progress_tracker.py` - **ProgressTracker (진도율 추적)**

```python
class ProgressTracker:
    """
    과목별 학습 진도 및 성취도 추적

    역할:
    - 단원별 완료 상태 관리
    - 숙달도 점수 계산 (0-10)
    - 취약점 식별

    책임:
    - update_progress(): 단원 완료 표시
    - calculate_mastery(): 숙달도 계산
    - get_weak_areas(): 취약 단원 추출
    - get_completion_rate(): 과목별 진도율
    """

    def update_progress(
        self,
        subject: str,
        unit: str,
        mastery_score: float
    ):
        """단원 학습 완료 및 숙달도 업데이트"""

    def get_weak_areas(
        self,
        threshold: float = 5.0
    ) -> List[Dict]:
        """
        취약 단원 추출

        Criteria:
        - mastery_score < threshold (기본 5.0)
        - 우선순위: 낮은 점수 순
        """
```

#### `spaced_repetition.py` - **SpacedRepetitionEngine (SM-2 알고리즘)**

```python
class SpacedRepetitionEngine:
    """
    SM-2 알고리즘 기반 복습 스케줄러

    역할:
    - 최적 복습 간격 계산
    - 우선순위 큐로 복습 일정 관리

    책임:
    - add_item(): 복습 항목 추가
    - review_item(): 복습 수행 + SM-2 적용
      → quality (0-5) 기반으로 easiness_factor, interval 계산
    - get_due_items(): 복습 필요 항목 반환
    - _calculate_sm2(): SM-2 핵심 알고리즘
    - _update_priority(): 우선순위 재계산
      → Priority = (10 - mastery) * 0.4 + urgency * 0.3
                 + difficulty * 0.2 + repetition_boost * 0.1
    """

    def _calculate_sm2(
        self,
        ef: float,      # easiness_factor
        interval: int,  # 현재 복습 간격
        repetitions: int,
        quality: int    # 0-5 (사용자 평가)
    ) -> tuple[float, int]:
        """
        SM-2 알고리즘 핵심

        Quality Scale:
        - 5: 완벽
        - 4: 정확 (약간 망설임)
        - 3: 정확 (많이 망설임)
        - 2: 틀림 (복습 후 기억)
        - 1: 틀림 (복습 후에도 어려움)
        - 0: 전혀 기억 안남

        Returns:
            (new_easiness_factor, new_interval)
        """
```

#### `weak_points_db.py` - **WeakPointDatabase (취약점 DB)**

```python
class WeakPointDatabase:
    """
    학생의 취약점 데이터베이스

    역할:
    - 오답 패턴 분석
    - 취약점 우선순위 관리

    책임:
    - add_weakness(): 취약점 추가
    - get_priority_weaknesses(): 우선순위 순 취약점 반환
    - analyze_pattern(): 오답 패턴 분석
      → 케어리스 미스, 개념 부족, 시간 부족 등 분류
    """
```

---

### `/handlers` - 도메인 핸들러

#### `subject_handlers.py` - **SubjectHandler (과목별 로직)**

```python
class SubjectHandler:
    """
    과목별 특화 로직

    역할:
    - 과목별 문제 유형 인식
    - 과목별 풀이 전략 제공

    구현:
    - KoreanHandler: 비문학/문학/문법
    - MathHandler: 미적분/확률통계/기하
    - EnglishHandler: 빈칸/순서/요약
    - ScienceHandler: 물리/화학/생명/지구과학
    - SocialHandler: 사회문화/경제/윤리 등
    """

class KoreanHandler(SubjectHandler):
    """
    국어 영역 핸들러

    책임:
    - 지문 유형 분석 (비문학/문학)
    - 선지 제거법 적용
    - 주제/핵심어 파악 전략
    """

class MathHandler(SubjectHandler):
    """
    수학 영역 핸들러

    책임:
    - 문제 유형 분류 (계산/증명/응용)
    - 단계별 풀이 제공
    - 공식 적용 가이드
    """
```

#### `schedule_planner.py` - **SchedulePlanner (학습 일정 계획)**

```python
class SchedulePlanner:
    """
    D-day 기반 학습 스케줄러

    역할:
    - D-day에 따른 학습 전략 조정
    - 과목별 시간 배분

    책임:
    - generate_daily_schedule(): 일일 학습 계획
    - adjust_for_dday(): D-day 기반 강도 조정
      → D-30 이상: 저강도 (개념 중심)
      → D-30 ~ D-7: 중강도 (문제 중심)
      → D-7 이하: 마무리 (복습 중심)
    - allocate_time(): 과목별 시간 배분
      → 취약 과목에 더 많은 시간
    """
```

#### `mock_exam_analyzer.py` - **MockExamAnalyzer (모의고사 분석)**

```python
class MockExamAnalyzer:
    """
    모의고사 성적 분석기

    역할:
    - 점수 추세 분석
    - 과목별 성적 변화 추적
    - 성적 예측

    책임:
    - parse_scores(): 점수 입력 파싱
    - analyze_trend(): 추세 분석 (상승/하락/정체)
    - predict_score(): 선형 회귀로 수능 점수 예측
    - identify_weaknesses(): 약점 과목/단원 식별
    """
```

#### `psychological_support.py` - **PsychologicalSupport (심리 지원)**

```python
class PsychologicalSupport:
    """
    심리 지원 시스템

    역할:
    - 감정 상태 기반 메시지 생성
    - 번아웃 대응 전략 제공

    책임:
    - generate_support_message(): 감정 + 번아웃 레벨 → 메시지
    - recommend_break(): 휴식 권장 (번아웃 HIGH)
    - motivate(): 동기부여 메시지
    - anxiety_relief(): 불안 완화 기법 제공
      → 호흡법, 긍정 확언, 마인드셋
    """
```

---

### `/skills` - 스킬 파일 (.md)

각 스킬 파일은 마크다운 형식으로 작성되며, `ToolManager`가 자동으로 로드합니다.

#### 스킬 파일 구조

```markdown
# [스킬 이름]

**Triggers**: 키워드1, 키워드2, 키워드3

## Expertise
- 전문 영역 1
- 전문 영역 2

## Strategies
- 전략 1: 설명
- 전략 2: 설명

## Examples
[예시 제공]
```

#### 스킬 목록 및 역할

| 파일 | 역할 | Triggers |
|------|------|----------|
| `korean-expert.md` | 국어 영역 전문가 | 국어, 비문학, 문학, 문법 |
| `math-expert.md` | 수학 영역 전문가 | 수학, 미적분, 확률, 기하 |
| `english-expert.md` | 영어 영역 전문가 | 영어, 빈칸, 순서, 요약 |
| `science-expert.md` | 과학탐구 전문가 | 물리, 화학, 생명, 지구과학 |
| `social-expert.md` | 사회탐구 전문가 | 사회, 경제, 윤리, 지리, 역사 |
| `study-planner.md` | 학습 전략 전문가 | 계획, 시간관리, 효율 |
| `mental-coach.md` | 멘탈 코칭 전문가 | 불안, 긴장, 멘탈, 심리 |
| `motivation-booster.md` | 동기부여 전문가 | 슬럼프, 포기, 동기부여 |
| `exam-strategy.md` | 시험 전략 전문가 | 시간배분, 찍기, 전략 |

---

### `/data` - 데이터 저장소

#### `exam_schedules/`
- **역할**: 수능/모의고사 일정 저장
- **파일**: `2024_schedule.json`, `2025_schedule.json`
- **책임**: D-day 계산 기준 제공

#### `curriculum/`
- **역할**: 과목별 커리큘럼 정의
- **파일**: `korean.yaml`, `math.yaml`, `english.yaml`, `science.yaml`, `social.yaml`
- **책임**: 단원 구성, 학습 목표, 난이도 정보

#### `weak_points_db/`
- **역할**: ChromaDB 저장소 (취약점 데이터)
- **책임**: 오답 패턴, 취약 단원, 우선순위 관리

#### `student_profiles/`
- **역할**: 학생 프로필 저장
- **파일**: `[student_id].yaml`
- **책임**: 목표 대학, 현재 성적, D-day, 선호 학습 스타일

---

### `/tests` - 테스트

각 컴포넌트에 대한 단위 테스트 및 통합 테스트

| 파일 | 테스트 대상 |
|------|------------|
| `test_learning_memory.py` | LearningMemoryLane (저장, 검색, Re-Ranking) |
| `test_subject_handlers.py` | SubjectHandler (과목별 로직) |
| `test_stress_monitor.py` | StressMonitor (감정 분석, 번아웃 감지) |
| `test_spaced_repetition.py` | SpacedRepetitionEngine (SM-2 알고리즘) |
| `test_integration.py` | 전체 시스템 통합 테스트 |

---

### `/utils` - 유틸리티

#### `dday_calculator.py` - **D-day 계산**

```python
class DdayCalculator:
    """
    D-day 계산 및 긴급도 판단

    역할:
    - 수능/모의고사까지 남은 일수 계산
    - 긴급도 점수 계산 (0.0 ~ 1.0)

    책임:
    - calculate_dday(): 날짜 → D-day
    - calculate_urgency(): D-day → urgency (0.0 ~ 1.0)
      → urgency = 1.0 - (days / 100)
    """
```

#### `score_predictor.py` - **성적 예측**

```python
class ScorePredictor:
    """
    선형 회귀 기반 성적 예측

    역할:
    - 최근 모의고사 점수 → 수능 점수 예측
    - 95% 신뢰구간 계산

    책임:
    - fit(): 과거 점수 데이터로 모델 학습
    - predict(): 미래 점수 예측
    - get_confidence_interval(): 신뢰구간 계산
    """
```

#### `emotion_analyzer.py` - **감정 분석**

```python
class EmotionAnalyzer:
    """
    텍스트 감정 분석 (키워드 기반)

    역할:
    - 텍스트 → 감정 점수 (0.0 ~ 1.0)
    - 감정 유형 분류

    책임:
    - analyze(): 텍스트 → (EmotionType, score)
    - extract_emotion_keywords(): 감정 키워드 추출
    """
```

---

## 컴포넌트 간 데이터 흐름

### 1. 사용자 요청 → 응답

```
User Input
    ↓
SuneungACEAgent.run()
    ↓
SubjectAwareRouter.route() → RoutingContext
    ↓
ToolManager.match_skills() → Skills
    ↓
LearningMemoryLane.retrieve_context() → Memory Context
    ↓
Selected Model (Nano/Mini/Teacher/Vision) + Context → Response
    ↓
TeacherBrain.analyze_result() → EvaluationResult
    ↓
[병렬 처리]
├─ LearningMemoryLane.store() → Memory Storage
├─ StressMonitor.log_session() → Emotion Log
└─ SpacedRepetitionEngine.review_item() → SR Update
    ↓
Return Response to User
```

### 2. 모의고사 점수 입력

```
User: "모의고사 점수: 국어 80, 수학 85, ..."
    ↓
MockExamAnalyzer.parse_scores() → ScoreData
    ↓
MockExamAnalyzer.analyze_trend() → TrendAnalysis
    ↓
ProgressTracker.update_progress() → Progress Update
    ↓
ScorePredictor.predict() → Predicted Score
    ↓
SchedulePlanner.adjust_for_dday() → Adjusted Schedule
    ↓
Return Analysis + Recommendations
```

### 3. 번아웃 감지 및 대응

```
User: "너무 피곤해..."
    ↓
SubjectAwareRouter.route() → PSYCHOLOGY mode
    ↓
StressMonitor.analyze_emotion() → EmotionType.TIRED
    ↓
StressMonitor.detect_burnout() → BurnoutLevel.MEDIUM
    ↓
PsychologicalSupport.generate_support_message() → Support Message
    ↓
TeacherBrain.analyze_result() → memory_type=GAP_EMOTION
    ↓
LearningMemoryLane.store() → Emotion Memory
    ↓
Return Support Message + Break Recommendation
```

---

## 책임 분리 원칙

### Single Responsibility (단일 책임)

각 컴포넌트는 **하나의 명확한 역할**만 수행:
- `Router`: 라우팅 결정만
- `Memory Lane`: 메모리 저장/검색만
- `Teacher`: 평가 및 커리큘럼만
- `Stress Monitor`: 감정 분석 및 번아웃 감지만

### Open/Closed (개방-폐쇄)

확장에는 열려있고 수정에는 닫혀있음:
- 새로운 과목 추가: `SubjectHandler` 상속으로 확장
- 새로운 스킬 추가: `.md` 파일만 추가
- 새로운 메모리 유형: `MemoryType` enum 확장

### Dependency Inversion (의존성 역전)

상위 모듈이 하위 모듈에 의존하지 않음:
- `SuneungACEAgent`는 구체적 구현이 아닌 인터페이스에 의존
- `Router`, `Memory`, `Teacher` 모두 교체 가능한 설계

---

## 요약: 핵심 컴포넌트 5가지

| 컴포넌트 | 핵심 역할 | 책임 |
|----------|----------|------|
| **SuneungACEAgent** | 오케스트레이터 | 모든 컴포넌트 조율, 요청 처리 |
| **SubjectAwareRouter** | 라우터 | 과목 감지, 복잡도 계산, 모델 선택 |
| **LearningMemoryLane** | 메모리 시스템 | Type-Aware 저장, Query-Aware 검색 |
| **TeacherBrain** | 평가자 | 결과 평가, Memory Type 분류, 커리큘럼 생성 |
| **StressMonitor** | 심리 지원 | 감정 분석, 번아웃 감지, 지원 메시지 |

---

**Version**: 1.0.0
**Last Updated**: 2025-12-25
