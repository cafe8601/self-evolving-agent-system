# 수능 ACE 에이전트 - 사용 가이드

실제 사용 예시와 설정 방법

---

## 목차

1. [빠른 시작](#빠른-시작)
2. [환경 설정](#환경-설정)
3. [사용 시나리오](#사용-시나리오)
4. [과목별 활용법](#과목별-활용법)
5. [심리 지원 기능](#심리-지원-기능)
6. [성적 분석 및 예측](#성적-분석-및-예측)
7. [고급 기능](#고급-기능)

---

## 빠른 시작

### 1. 설치

```bash
# 프로젝트 클론
git clone https://github.com/your-repo/suneung-ace-agent.git
cd suneung-ace-agent

# 의존성 설치
pip install -r requirements.txt

# 환경변수 설정
cp .env.example .env
# .env 파일 편집 (API 키, 학생 프로필 설정)
```

### 2. 초기 설정

```bash
# Python 인터프리터 실행
python

>>> from core.agent import SuneungACEAgent
>>> agent = SuneungACEAgent()

# 학생 프로필 자동 로드
# D-day: 100일
# 목표: 서울대 컴공
# 현재 점수: 국어 75, 수학 80, 영어 85
```

### 3. 첫 대화

```python
# 간단한 질문
result = agent.run("수학 공부 어떻게 해야 해?")

# 문제 풀이 요청
result = agent.run("미적분 문제 풀이해줘: f(x) = x^2 + 2x + 1의 도함수는?")

# 동기부여 요청
result = agent.run("시험이 불안해...")
```

---

## 환경 설정

### .env 파일 설정

```bash
# ============================================
# API 설정
# ============================================

# OpenRouter API (필수)
OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# 모델 설정 (기본값 권장)
TEACHER_MODEL=openai/gpt-5.2
STUDENT_MEDIUM_MODEL=openai/gpt-5-mini
STUDENT_MODEL=openai/gpt-5-nano
VISION_MODEL=google/gemini-3-flash-preview

# ============================================
# 학생 프로필 (필수)
# ============================================

# D-day 설정 (수능까지 남은 일수)
DAYS_UNTIL_EXAM=100

# 목표 대학/학과
TARGET_UNIVERSITY="서울대학교 컴퓨터공학부"

# 현재 성적 (0-100)
CURRENT_SCORE_KOREAN=75
CURRENT_SCORE_MATH=80
CURRENT_SCORE_ENGLISH=85
CURRENT_SCORE_SCIENCE=70
CURRENT_SCORE_SOCIAL=65

# 목표 성적 (평균)
TARGET_SCORE=90

# ============================================
# 선택 사항
# ============================================

# 웹 검색 (최신 입시 정보)
# TAVILY_API_KEY=tvly-your-key-here

# ChromaDB 저장 경로
MEMORY_DB_PATH=./data/learning_memory
```

### config/settings.yaml

```yaml
# ============================================
# 에이전트 기본 설정
# ============================================

agent:
  name: "수능 ACE 에이전트"
  version: "1.0.0"
  language: "ko"

# ============================================
# 학습 스케줄 설정
# ============================================

schedule:
  # D-day 기반 학습 강도
  intensity_by_dday:
    high: 30      # D-30 이하: 고강도
    medium: 60    # D-30 ~ D-60: 중강도
    low: 100      # D-60 이상: 저강도

  # 일일 학습 시간 (분)
  daily_study_minutes:
    high: 480     # 8시간
    medium: 360   # 6시간
    low: 240      # 4시간

  # 과목별 시간 배분 (비율)
  subject_weights:
    korean: 20
    math: 30
    english: 20
    science: 15
    social: 15

# ============================================
# Spaced Repetition 설정
# ============================================

spaced_repetition:
  enabled: true
  min_interval: 1       # 최소 복습 간격 (일)
  max_interval: 30      # 최대 복습 간격 (일)
  daily_review_limit: 20  # 일일 복습 항목 수

# ============================================
# 번아웃 감지 설정
# ============================================

burnout_detection:
  enabled: true
  analysis_period_days: 7  # 분석 기간 (일)
  thresholds:
    avg_study_hours: 4.0
    negative_emotion_ratio: 0.6
    efficiency_threshold: 0.5

# ============================================
# 심리 지원 설정
# ============================================

psychological_support:
  enabled: true
  auto_check_in: true     # 자동 감정 체크인
  check_in_interval: 3    # 체크인 간격 (일)

# ============================================
# 복잡도 임계값 (라우팅)
# ============================================

routing:
  complexity_thresholds:
    simple: 0.3   # 0 ~ 0.3 → Nano
    medium: 0.6   # 0.3 ~ 0.6 → Mini
    # 0.6 ~ 1.0 → Teacher
```

---

## 사용 시나리오

### 시나리오 1: 일일 학습 루틴

```python
from core.agent import SuneungACEAgent

# 에이전트 초기화
agent = SuneungACEAgent()

# === 오전: 수학 학습 ===
print("=== 수학 학습 시작 ===")

# 오늘의 복습 항목 확인
result = agent.run("오늘 복습할 내용이 뭐야?")
# → SpacedRepetitionEngine이 우선순위 계산
# → "오늘은 미적분 극한, 확률 조합, 기하 벡터를 복습해야 해!"

# 미적분 공부
result = agent.run("미적분 극한 개념 설명해줘")
# → Router: subject=math, complexity=MEDIUM → GPT-5-mini
# → Skill Match: math-expert.md
# → Memory Lane: 이전 "미적분" 학습 기록 검색
# → 개념 설명 + 예제 문제

# 문제 풀이
result = agent.run("lim (x→0) (sin x / x) 계산해줘")
# → 문제 풀이 제공
# → Teacher 평가: mastery_level 계산
# → Memory Lane 저장 (type=LEARNING)

# === 점심 후: 성적 확인 및 심리 지원 ===
print("\n=== 모의고사 결과 입력 ===")

result = agent.run("어제 모의고사 점수: 국어 78, 수학 82, 영어 88")
# → MockExamAnalyzer: 점수 추세 분석
# → ProgressTracker: 진도율 업데이트
# → "수학 2점 상승, 좋은 추세야! 이 속도면 목표 달성 가능해!"

# 불안 표현
result = agent.run("근데 점수가 오르락내리락해서 불안해...")
# → Router: emotion=anxious → PSYCHOLOGY mode
# → StressMonitor: emotion analysis
# → PsychologicalSupport: 불안 완화 메시지
# → "점수 변동은 자연스러운 거야. 추세가 중요하고, 너는 상승 추세니까 걱정 마!"

# === 저녁: 영어 학습 ===
print("\n=== 영어 학습 ===")

result = agent.run("영어 빈칸 추론 문제 풀이 전략 알려줘")
# → Router: subject=english, complexity=MEDIUM
# → Skill Match: english-expert.md
# → "빈칸 추론 전략: 1) 주제 파악, 2) 논리 흐름, 3) 선지 소거법"

# === 하루 마무리 ===
print("\n=== 학습 세션 종료 ===")

# 오늘 학습 요약
result = agent.run("오늘 뭐 배웠는지 요약해줘")
# → Memory Lane: 오늘 저장된 메모리 조회
# → "오늘은 미적분 극한 3문제, 영어 빈칸 전략 학습, 모의고사 점수 상승 확인!"

# Spaced Repetition 업데이트
agent.memory.learning_memory.update_for_spaced_repetition(
    memory_id="math_calculus_limit_...",
    quality=4,  # 정확한 답변 (약간 망설임)
    easiness_factor=2.5,
    interval=6  # 6일 후 복습
)
```

### 시나리오 2: 번아웃 감지 및 대응

```python
# === 7일간 과도한 학습 후 ===

result = agent.run("너무 피곤해... 집중이 안돼")
# → Router: emotion=tired → PSYCHOLOGY mode
# → StressMonitor:
#    - 최근 7일 분석
#    - avg_study_hours: 5.2 (기준 4.0 초과)
#    - negative_emotion_ratio: 0.65 (기준 0.6 초과)
#    - Burnout Level: HIGH

# → Response:
# """
# ⚠️ 번아웃 경고!
#
# 최근 7일간 하루 평균 5.2시간 공부하고 있어.
# 부정적 감정도 65%로 높은 상태야.
#
# 오늘은 완전히 쉬는 날로 하자.
# 장기적으로 보면 휴식이 더 도움이 돼.
#
# 추천:
# 1. 오늘은 공부 금지!
# 2. 산책, 운동, 좋아하는 영화 보기
# 3. 내일부터 학습 시간 20% 감축 (4시간으로)
# 4. 3일간은 좋아하는 과목 위주로만
# """

# === 번아웃 회복 후 ===
result = agent.run("오늘 기분 좋아! 다시 시작할게")
# → StressMonitor: emotion=motivated
# → "좋은 에너지네! 하지만 무리하지 말고 천천히 페이스 올리자!"
```

### 시나리오 3: D-day 기반 학습 전략 조정

```python
# === D-100일 (초기) ===
agent.days_until_exam = 100

result = agent.run("지금부터 어떻게 공부해야 해?")
# → SchedulePlanner:
#    - Phase: 개념 학습
#    - 전략: 기본 개념 완성 + 취약점 보완
#    - 시간 배분: 개념 60%, 문제 40%

# """
# D-100 학습 전략:
#
# 현재는 개념 완성 단계야!
#
# 📚 우선순위:
# 1. 기본 개념 완벽 이해 (60%)
# 2. 취약점 집중 보완 (30%)
# 3. 기출 문제 분석 (10%)
#
# 📅 추천 일정:
# - 월/수/금: 수학 (미적분, 확률통계)
# - 화/목: 국어 (비문학 + 문학)
# - 매일: 영어 독해 3지문
# """

# === D-30일 (중간) ===
agent.days_until_exam = 30

result = agent.run("이제 한 달 남았는데 뭐 해야 해?")
# → SchedulePlanner:
#    - Phase: 실전 연습
#    - 전략: 모의고사 + 오답 정리
#    - 시간 배분: 문제 70%, 개념 30%

# """
# D-30 실전 대비 전략:
#
# 이제 실전 감각을 키울 시간이야!
#
# 📝 실전 루틴:
# - 주 2회 모의고사 (실제 시간 맞춰서)
# - 오답노트 정리 (틀린 이유 분석)
# - 자주 틀리는 유형 집중 연습
#
# ⚠️ 주의:
# - 새로운 개념 공부 NO
# - 아는 것 완벽하게 정리
# - 실수 줄이기 연습
# """

# === D-7일 (최종) ===
agent.days_until_exam = 7

result = agent.run("일주일 남았어... 뭐 하지?")
# → SchedulePlanner:
#    - Phase: 마무리
#    - 전략: 핵심 개념 복습 + 컨디션 관리
#    - 시간 배분: 복습 80%, 휴식 20%

# """
# D-7 최종 점검:
#
# 이제 새로운 공부는 독이야!
#
# ✅ 마지막 일주일:
# - 핵심 공식/개념만 복습
# - 오답노트 다시 보기
# - 충분한 수면 (최소 7시간)
# - 시험 당일 루틴 연습
#
# 💚 컨디션 관리:
# - D-3: 공부 시간 50% 감축
# - D-1: 가벼운 복습만 + 일찍 자기
# - D-Day: 자신감 갖고 임하기!
#
# 지금까지 잘 준비했으니 자신감 가져!
# """
```

---

## 과목별 활용법

### 국어 영역

```python
# === 비문학 지문 분석 ===
result = agent.run("""
국어 비문학 지문 분석해줘:

[지문]
양자역학에서 불확정성 원리는 입자의 위치와 운동량을
동시에 정확히 측정할 수 없음을 의미한다...

[질문]
이 지문의 주제는?
""")

# → Router: subject=korean, complexity=MEDIUM
# → Skill: korean-expert.md
# → Response:
# """
# 주제: 양자역학의 불확정성 원리
#
# 핵심 포인트:
# 1. 불확정성 원리 개념
# 2. 위치-운동량 동시 측정 불가능
# 3. 양자역학 특성
#
# 선지 제거 전략:
# - 주제와 무관한 선지 제거
# - 지문에 없는 내용 제거
# - 과장/축소된 표현 제거
# """

# === 문학 작품 해석 ===
result = agent.run("현대시 '진달래꽃' 해석해줘")

# → Skill: korean-expert.md
# → Memory Lane: 이전 "문학" 학습 기록
# → 작품 해석 + 시어 분석 + 주제 의식
```

### 수학 영역

```python
# === 미적분 문제 풀이 ===
result = agent.run("""
수학 문제 풀이:

f(x) = x^3 - 3x^2 + 2x + 1일 때,
f'(x)의 극값을 구하시오.
""")

# → Router: subject=math, complexity=COMPLEX → Teacher
# → Skill: math-expert.md
# → Memory Lane: "미적분 극값" 관련 학습
# → 단계별 풀이 제공

# === 개념 질문 ===
result = agent.run("미분가능성과 연속성의 관계가 뭐야?")

# → Complexity: MEDIUM → Mini
# → 개념 설명 + 반례 제시

# === 취약점 확인 ===
result = agent.run("내가 수학에서 자주 틀리는 부분이 뭐야?")

# → Memory Lane: type=CORRECTION_WRONG, subject=math
# → WeakPointDatabase 조회
# → "확률과 통계 조합 문제에서 경우의 수 계산 실수 많음"
```

### 영어 영역

```python
# === 빈칸 추론 전략 ===
result = agent.run("영어 빈칸 문제 어떻게 풀어?")

# → Skill: english-expert.md
# → "빈칸 추론 3단계: 주제 파악 → 논리 흐름 → 선지 검증"

# === 문법 질문 ===
result = agent.run("to부정사와 동명사 차이 설명해줘")

# → Complexity: SIMPLE → Nano
# → 간단한 문법 설명

# === 어휘 학습 ===
result = agent.run("오늘 배운 영어 단어 퀴즈 내줘")

# → Memory Lane: type=LEARNING, subject=english
# → SpacedRepetition: 복습 필요 단어 추출
# → 퀴즈 생성
```

---

## 심리 지원 기능

### 감정 체크인

```python
# === 자동 감정 체크인 (3일마다) ===
result = agent.run("요즘 기분 어때?")

# → StressMonitor: 자동 체크인
# → 최근 7일 감정 추이 분석
# → 번아웃 레벨 확인

# Response:
# """
# 최근 7일 감정 분석:
#
# 긍정: 40% (동기부여, 자신감)
# 중립: 30%
# 부정: 30% (불안, 피곤)
#
# 번아웃 레벨: LOW (정상)
#
# 좋은 컨디션이야! 계속 이 페이스로!
# """
```

### 시험 불안 극복

```python
# === 불안 표현 ===
result = agent.run("시험만 생각하면 심장이 두근거려...")

# → Router: PSYCHOLOGY mode
# → Skill: mental-coach.md
# → Memory Lane: type=GAP_EMOTION
# → 불안 완화 기법 제공

# Response:
# """
# 시험 불안 극복 전략:
#
# 🧘 즉시 실천:
# 1. 깊게 숨 쉬기 (4초 들이쉬고, 7초 멈추고, 8초 내쉬기)
# 2. 긍정 확언: "나는 준비가 되어있다. 잘 할 수 있다."
# 3. 5분 스트레칭
#
# 📝 장기 전략:
# - 모의고사로 시험 환경 익숙해지기
# - 작은 성공 경험 쌓기
# - 실패도 학습 과정임을 인정하기
#
# 💚 기억해:
# 불안은 너를 보호하려는 신호야.
# 적당한 긴장은 집중력을 높여줘!
# """
```

### 슬럼프 탈출

```python
# === 슬럼프 호소 ===
result = agent.run("공부해도 점수가 안 올라... 포기하고 싶어")

# → Emotion: frustrated + giving_up
# → Burnout Check: MEDIUM
# → Skill: motivation-booster.md

# Response:
# """
# 슬럼프는 성장의 신호야!
#
# 📊 너의 데이터를 보자:
# - 3주 전: 국어 70점
# - 지금: 국어 75점
# → 5점 상승! 느리지만 성장 중!
#
# 🌱 성장 곡선:
# 학습은 계단식이야. 한동안 정체기가 있다가
# 어느 순간 확 올라가는 구간이 와.
# 지금은 다음 점프를 준비하는 시기일 수 있어!
#
# 💡 추천:
# 1. 3일간 공부 시간 50% 감축
# 2. 좋아하는 과목만 하기
# 3. 작은 목표 설정 (오늘 3문제만!)
# 4. 1주일 후 다시 체크
#
# 포기하지 마. 지금까지 온 길이 아까워!
# """
```

---

## 성적 분석 및 예측

### 모의고사 점수 입력

```python
# === 모의고사 결과 입력 ===
result = agent.run("""
모의고사 점수:
- 국어: 80 (이전: 75)
- 수학: 85 (이전: 82)
- 영어: 88 (이전: 85)
- 과탐: 75 (이전: 70)
- 사탐: 68 (이전: 65)
""")

# → MockExamAnalyzer:
#    - 점수 파싱
#    - 추세 분석
#    - ProgressTracker 업데이트

# Response:
# """
# 📈 모의고사 분석 결과:
#
# 전체 평균: 79.2점 (+4.0점 ↗️)
#
# 과목별 분석:
# ✅ 국어: +5점 (좋은 상승!)
# ✅ 수학: +3점 (안정적 상승)
# ✅ 영어: +3점 (꾸준함)
# ✅ 과탐: +5점 (큰 향상!)
# ⚠️ 사탐: +3점 (상승했지만 약점)
#
# 💡 인사이트:
# - 전체적으로 상승 추세 (우수!)
# - 사탐이 상대적 약점 → 시간 투자 늘리기
# - 이 속도면 목표 90점 달성 가능!
#
# 📅 다음 액션:
# 1. 사탐 학습 시간 20% 증가
# 2. 국어/과탐은 유지
# 3. 2주 후 다음 모의고사
# """
```

### 성적 예측

```python
# === 수능 점수 예측 ===
result = agent.run("현재 추세로 수능 점수 예측해줘")

# → ScorePredictor:
#    - 최근 5회 모의고사 데이터
#    - 선형 회귀 모델
#    - D-day 고려

# Response:
# """
# 🔮 수능 점수 예측 (95% 신뢰구간):
#
# 과목별 예상 점수:
# - 국어: 88점 (±3)
# - 수학: 92점 (±4)
# - 영어: 95점 (±2)
# - 과탐: 85점 (±5)
# - 사탐: 80점 (±4)
#
# 전체 평균: 88점
# 목표 점수: 90점
# 갭: -2점
#
# 💪 목표 달성 전략:
# 사탐에서 +5점 더 올리면 목표 달성!
#
# 집중 영역:
# 1. 사탐 약점 단원 집중 (경제 시장론)
# 2. 과탐 실수 줄이기
# 3. 다른 과목은 유지
#
# 충분히 가능해! 화이팅!
# """
```

### 진도율 확인

```python
# === 과목별 진도율 ===
result = agent.run("지금 진도 어디까지야?")

# → ProgressTracker:
#    - 과목별 완료 단원
#    - 숙달도 평가
#    - 남은 학습량

# Response:
# """
# 📚 과목별 진도율:
#
# 국어 (85% 완료):
# ✅ 화법과 작문 (90% 숙달)
# ✅ 비문학 (85% 숙달)
# 🔄 문학 (70% 숙달) ← 진행 중
# ⏳ 문법 (미완료)
#
# 수학 (75% 완료):
# ✅ 수학 I (95% 숙달)
# ✅ 수학 II (80% 숙달)
# 🔄 미적분 (65% 숙달) ← 진행 중
# ⏳ 확률과 통계 (30% 숙달)
# ⏳ 기하 (미완료)
#
# 영어 (90% 완료):
# ✅ 듣기 (100% 숙달)
# ✅ 독해 (85% 숙달)
# 🔄 어법 (75% 숙달)
#
# 📅 남은 기간 (D-100):
# - 미완료 단원: 4개
# - 예상 소요: 40일
# - 여유 기간: 60일
#
# 페이스 좋아! 이대로 가자!
# """
```

---

## 고급 기능

### Spaced Repetition 수동 관리

```python
from memory.spaced_repetition import SpacedRepetitionEngine

# SR 엔진 접근
sr = agent.spaced_repetition

# 복습 항목 추가
sr.add_item(
    item_id="math_calculus_001",
    subject="math",
    topic="미적분 극한",
    content="lim (x→0) (sin x / x) = 1",
    initial_mastery=5
)

# 복습 수행
item = sr.review_item(
    item_id="math_calculus_001",
    quality=4  # 정확 (약간 망설임)
)

print(f"다음 복습: {item.next_review_date}")
# → 6일 후

# 복습 필요 항목 조회
due_items = sr.get_due_items(limit=10)
for item in due_items:
    print(f"- {item.topic} (숙달도: {item.mastery_level}/10)")
```

### Memory Lane 직접 조회

```python
from memory.learning_memory import LearningMemoryLane, SubjectType

# Memory Lane 접근
memory = agent.memory.learning_memory

# 특정 과목 메모리 검색
memories = memory.retrieve_context(
    query="미적분 극한 문제",
    subject=SubjectType.MATH,
    top_k=5,
    days_until_exam=100
)

for mem in memories:
    print(f"점수: {mem['score']:.3f}")
    print(f"내용: {mem['content'][:100]}...")
    print(f"유형: {mem['metadata']['memory_type']}")
    print(f"숙달도: {mem['metadata']['mastery_level']}/10")
    print("---")
```

### 커스텀 스킬 추가

```markdown
<!-- skills/custom-skill.md -->

# 나만의 학습 전략

**Triggers**: 나만의, 커스텀, 전략

## Expertise
- 오답노트 정리법
- 시간 관리 기법
- 집중력 향상 팁

## My Strategies

### 오답노트 3단계
1. 왜 틀렸는가? (원인 분석)
2. 어떻게 풀어야 하는가? (정답 풀이)
3. 다시 틀리지 않으려면? (예방책)

### 뽀모도로 테크닉
- 25분 집중 + 5분 휴식
- 4회 반복 후 15분 긴 휴식
```

```python
# 커스텀 스킬 사용
result = agent.run("나만의 오답노트 정리법 알려줘")
# → Skill Match: custom-skill.md
# → 커스텀 스킬 내용 로드 및 응답
```

---

## FAQ

### Q1: API 비용이 얼마나 드나요?

**A**: ACE V5.2의 3-Level Routing으로 Teacher-only 대비 80-85% 절감
- 일일 30분 사용 시: 약 $0.50 ~ $1.00
- 월간 예상: $15 ~ $30

### Q2: 오프라인에서도 사용 가능한가요?

**A**: 부분적으로 가능
- Memory Lane (ChromaDB): 완전 오프라인
- 추론 (API 필요): 온라인 필수
- 캐싱으로 동일 질문 재사용 가능

### Q3: 데이터는 어디에 저장되나요?

**A**: 로컬 저장
- ChromaDB: `./data/learning_memory/`
- 설정: `./config/`
- 로그: `./logs/`

### Q4: 다른 학생 프로필을 추가할 수 있나요?

**A**: 가능
```bash
# 프로필별 디렉토리 생성
mkdir -p ./profiles/student_A
mkdir -p ./profiles/student_B

# 각 프로필별 .env 파일
cp .env ./profiles/student_A/.env
cp .env ./profiles/student_B/.env

# 프로필 선택하여 실행
PROFILE=student_A python main.py
```

---

## 다음 단계

1. **첫 1주일**: 기본 사용법 익히기 (질문, 문제 풀이)
2. **2주차**: 모의고사 점수 입력 및 분석 활용
3. **3주차**: Spaced Repetition 시스템 완전 활용
4. **4주차 이후**: 심리 지원 + 진도율 관리로 최적화

---

**Version**: 1.0.0
**Last Updated**: 2025-12-25
**Support**: 문의는 GitHub Issues로!
