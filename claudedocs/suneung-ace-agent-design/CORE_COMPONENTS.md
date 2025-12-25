# 수능 ACE 에이전트 - 핵심 컴포넌트 상세 설계

각 컴포넌트의 역할과 구현 방법

---

## 1. Learning Memory Lane (교육 도메인 메모리)

### 파일: `memory/learning_memory.py`

```python
"""
Learning Memory Lane - ACE V5.2 Memory Lane 확장 (교육 도메인)

기본 6가지 + 교육 전용 6가지 = 총 12가지 메모리 유형
"""

from enum import Enum
from dataclasses import dataclass
from typing import List, Dict, Optional
from datetime import datetime
import chromadb
from chromadb.utils import embedding_functions


class MemoryType(Enum):
    """메모리 유형 (12가지)"""
    # ACE V5.2 기본 (6가지)
    CORRECTION = "correction"              # 사용자 수정
    DECISION = "decision"                  # 명시적 결정
    INSIGHT = "insight"                    # 깨달음
    PATTERN = "pattern"                    # 반복 행동
    GAP = "gap"                           # 실패/누락
    LEARNING = "learning"                  # 일반 학습

    # 교육 도메인 확장 (6가지)
    MASTERY = "mastery"                    # 완전 숙달
    STRUGGLE = "struggle"                  # 지속적 어려움
    CORRECTION_WRONG = "correction_wrong"  # 오답 분석
    INSIGHT_STRATEGY = "insight_strategy"  # 학습 전략
    PREFERENCE_STUDY = "preference_study"  # 학습 스타일
    GAP_EMOTION = "gap_emotion"            # 감정적 어려움


class SubjectType(Enum):
    """과목 유형"""
    KOREAN = "korean"      # 국어
    MATH = "math"          # 수학
    ENGLISH = "english"    # 영어
    SCIENCE = "science"    # 과학탐구
    SOCIAL = "social"      # 사회탐구
    GENERAL = "general"    # 일반 (과목 무관)


@dataclass
class LearningMemory:
    """학습 메모리 엔트리"""
    id: str
    task: str                      # 원본 작업
    result: str                    # 결과
    memory_type: MemoryType        # 메모리 유형
    subject: SubjectType           # 과목
    mastery_level: int            # 숙달도 (0-10)
    emotion: str                   # 감정 상태
    insight: str                   # 핵심 교훈
    timestamp: datetime
    confidence: float = 0.8        # 신뢰도
    urgency: float = 0.0          # 긴급도 (D-day 기반)
    review_count: int = 0         # 복습 횟수
    easiness_factor: float = 2.5  # SM-2 알고리즘용
    next_review_date: Optional[datetime] = None


class LearningMemoryLane:
    """
    교육 도메인 특화 Memory Lane

    Features:
    - 12가지 메모리 유형 (기본 6 + 교육 6)
    - 과목별 필터링
    - D-day 기반 긴급도 재계산
    - Query-Aware Type Boosting (교육 키워드)
    - Re-Ranking with Subject Match + Urgency
    """

    # Query-Aware Type Boosting Keywords (교육 도메인)
    TYPE_BOOST_KEYWORDS = {
        # 기본 키워드
        "실수": [MemoryType.CORRECTION, MemoryType.CORRECTION_WRONG, MemoryType.GAP],
        "잘못": [MemoryType.CORRECTION, MemoryType.GAP],
        "결정": [MemoryType.DECISION],
        "패턴": [MemoryType.PATTERN, MemoryType.LEARNING],
        "방법": [MemoryType.INSIGHT_STRATEGY, MemoryType.PATTERN],
        "배움": [MemoryType.INSIGHT, MemoryType.LEARNING],

        # 교육 전용 키워드
        "잘하는": [MemoryType.MASTERY],
        "자신있는": [MemoryType.MASTERY],
        "마스터": [MemoryType.MASTERY],
        "어려운": [MemoryType.STRUGGLE, MemoryType.GAP],
        "힘든": [MemoryType.STRUGGLE, MemoryType.GAP_EMOTION],
        "약점": [MemoryType.STRUGGLE, MemoryType.GAP],
        "틀린": [MemoryType.CORRECTION_WRONG, MemoryType.GAP],
        "오답": [MemoryType.CORRECTION_WRONG],
        "전략": [MemoryType.INSIGHT_STRATEGY, MemoryType.PATTERN],
        "효과적": [MemoryType.INSIGHT_STRATEGY],
        "선호": [MemoryType.PREFERENCE_STUDY],
        "좋아": [MemoryType.PREFERENCE_STUDY],
        "스타일": [MemoryType.PREFERENCE_STUDY],
        "불안": [MemoryType.GAP_EMOTION],
        "스트레스": [MemoryType.GAP_EMOTION],
        "긴장": [MemoryType.GAP_EMOTION],
    }

    def __init__(self, db_path: str = "./data/learning_memory"):
        """초기화"""
        self.client = chromadb.PersistentClient(path=db_path)
        self.embedding_fn = embedding_functions.DefaultEmbeddingFunction()

        # Collection 생성
        self.collection = self.client.get_or_create_collection(
            name="learning_memory_lane",
            embedding_function=self.embedding_fn,
            metadata={"description": "Education-specific Memory Lane with 12 types"}
        )

        print(f"🧠 [LearningMemoryLane] Initialized with {self.collection.count()} memories")

    def store(
        self,
        task: str,
        result: str,
        memory_type: MemoryType,
        subject: SubjectType,
        mastery_level: int,
        emotion: str,
        insight: str,
        confidence: float = 0.8,
        days_until_exam: int = 100
    ) -> str:
        """
        메모리 저장 (Type-Aware)

        Args:
            task: 학습 작업
            result: 결과
            memory_type: 메모리 유형 (12가지 중 1개)
            subject: 과목
            mastery_level: 숙달도 (0-10)
            emotion: 감정 상태
            insight: 핵심 교훈
            confidence: 신뢰도
            days_until_exam: D-day (긴급도 계산용)

        Returns:
            memory_id: 저장된 메모리 ID
        """
        # 긴급도 계산 (D-day 가까울수록 높음)
        urgency = 1.0 - (days_until_exam / 100.0)
        urgency = max(0.0, min(1.0, urgency))  # 0.0 ~ 1.0

        # 메모리 ID 생성
        memory_id = f"{subject.value}_{memory_type.value}_{datetime.now().timestamp()}"

        # 메타데이터
        metadata = {
            "memory_type": memory_type.value,
            "subject": subject.value,
            "mastery_level": mastery_level,
            "emotion": emotion,
            "confidence": confidence,
            "urgency": urgency,
            "timestamp": datetime.now().isoformat(),
        }

        # ChromaDB에 저장
        self.collection.add(
            ids=[memory_id],
            documents=[f"Task: {task}\nResult: {result}\nInsight: {insight}"],
            metadatas=[metadata]
        )

        print(f"💾 [Memory] Stored: {memory_type.value} ({subject.value}, mastery={mastery_level})")
        return memory_id

    def retrieve_context(
        self,
        query: str,
        subject: Optional[SubjectType] = None,
        top_k: int = 5,
        days_until_exam: int = 100
    ) -> List[Dict]:
        """
        쿼리 기반 메모리 검색 (Query-Aware + Re-Ranking)

        Re-Ranking Formula:
        Final Score = (Vector Similarity × 0.45)
                    + (Recency × 0.10)
                    + (Confidence × 0.10)
                    + (Type Boost × 0.15)
                    + (Subject Match × 0.10)
                    + (Urgency × 0.10)

        Args:
            query: 검색 쿼리
            subject: 필터링할 과목 (None이면 전체)
            top_k: 반환할 메모리 수
            days_until_exam: 현재 D-day (긴급도 재계산용)

        Returns:
            memories: Re-Ranking된 메모리 리스트
        """
        # 1. ChromaDB 벡터 검색
        results = self.collection.query(
            query_texts=[query],
            n_results=top_k * 3,  # Re-Ranking을 위해 더 많이 검색
            where={"subject": subject.value} if subject else None
        )

        if not results['ids'][0]:
            return []

        # 2. Type Boost 계산
        boosted_types = self._get_boosted_types(query)

        # 3. Re-Ranking
        scored_memories = []
        current_time = datetime.now()

        for i, memory_id in enumerate(results['ids'][0]):
            metadata = results['metadatas'][0][i]
            document = results['documents'][0][i]
            distance = results['distances'][0][i]

            # Vector Similarity (distance → similarity)
            vector_similarity = 1.0 - distance

            # Recency (최근일수록 높음)
            timestamp = datetime.fromisoformat(metadata['timestamp'])
            days_ago = (current_time - timestamp).days
            recency = 1.0 / (1.0 + days_ago / 30.0)  # 30일 기준

            # Confidence (메타데이터에서)
            confidence = metadata['confidence']

            # Type Boost (+15% if matching)
            memory_type = MemoryType(metadata['memory_type'])
            type_boost = 0.15 if memory_type in boosted_types else 0.0

            # Subject Match (+10% if exact match)
            subject_match = 0.10 if subject and metadata['subject'] == subject.value else 0.0

            # Urgency (D-day 기반, 긴급할수록 높음)
            urgency = 1.0 - (days_until_exam / 100.0)
            urgency = max(0.0, min(1.0, urgency))

            # Final Score
            final_score = (
                vector_similarity * 0.45
                + recency * 0.10
                + confidence * 0.10
                + type_boost
                + subject_match
                + urgency * 0.10
            )

            scored_memories.append({
                "id": memory_id,
                "content": document,
                "metadata": metadata,
                "score": final_score,
                "breakdown": {
                    "vector_similarity": vector_similarity,
                    "recency": recency,
                    "confidence": confidence,
                    "type_boost": type_boost,
                    "subject_match": subject_match,
                    "urgency": urgency,
                }
            })

        # 점수 기준 정렬
        scored_memories.sort(key=lambda x: x['score'], reverse=True)

        print(f"🔍 [Retrieve] Found {len(scored_memories)} memories, returning top {top_k}")
        return scored_memories[:top_k]

    def _get_boosted_types(self, query: str) -> List[MemoryType]:
        """쿼리에서 부스트할 메모리 유형 추출"""
        query_lower = query.lower()
        boosted = []

        for keyword, types in self.TYPE_BOOST_KEYWORDS.items():
            if keyword in query_lower:
                boosted.extend(types)

        return list(set(boosted))  # 중복 제거

    def update_for_spaced_repetition(
        self,
        memory_id: str,
        quality: int,
        easiness_factor: float,
        interval: int
    ):
        """
        Spaced Repetition 업데이트

        Args:
            memory_id: 메모리 ID
            quality: 복습 품질 (0-5)
            easiness_factor: SM-2 난이도 계수
            interval: 다음 복습 간격 (일)
        """
        # 메타데이터 업데이트
        existing = self.collection.get(ids=[memory_id])
        if not existing['ids']:
            return

        metadata = existing['metadatas'][0]
        metadata['review_count'] = metadata.get('review_count', 0) + 1
        metadata['easiness_factor'] = easiness_factor
        metadata['next_review_date'] = (datetime.now() + timedelta(days=interval)).isoformat()

        # ChromaDB 업데이트
        self.collection.update(
            ids=[memory_id],
            metadatas=[metadata]
        )

        print(f"🔄 [SR] Updated: {memory_id}, next review in {interval} days")

    def get_statistics(self) -> Dict:
        """메모리 통계"""
        all_memories = self.collection.get()

        if not all_memories['ids']:
            return {"total": 0}

        stats = {
            "total": len(all_memories['ids']),
            "by_type": {},
            "by_subject": {},
            "avg_mastery": 0.0,
        }

        mastery_sum = 0
        for metadata in all_memories['metadatas']:
            # By type
            mem_type = metadata['memory_type']
            stats['by_type'][mem_type] = stats['by_type'].get(mem_type, 0) + 1

            # By subject
            subject = metadata['subject']
            stats['by_subject'][subject] = stats['by_subject'].get(subject, 0) + 1

            # Mastery
            mastery_sum += metadata.get('mastery_level', 0)

        stats['avg_mastery'] = mastery_sum / len(all_memories['ids'])

        return stats
```

---

## 2. Subject-Aware Router (과목별 스마트 라우터)

### 파일: `core/router.py`

```python
"""
Subject-Aware Router - 과목 감지 + 복잡도 기반 라우팅

ACE V5.2 기본 Router 확장:
- 과목 자동 감지 (국어/수학/영어/과탐/사탐)
- 과목별 복잡도 키워드
- 감정 상태 체크 (스트레스/불안 → 심리 지원 모드)
"""

from enum import Enum
from dataclasses import dataclass
from typing import Optional, Dict
import re


class RouteDecision(Enum):
    """라우팅 결정"""
    SIMPLE = "simple"      # → GPT-5-nano
    MEDIUM = "medium"      # → GPT-5-mini
    COMPLEX = "complex"    # → GPT-5.2
    VISION = "vision"      # → Gemini-3-flash
    PSYCHOLOGY = "psychology"  # → 심리 지원 모드


class SubjectType(Enum):
    """과목 유형"""
    KOREAN = "korean"
    MATH = "math"
    ENGLISH = "english"
    SCIENCE = "science"
    SOCIAL = "social"
    GENERAL = "general"


@dataclass
class RoutingContext:
    """라우팅 컨텍스트"""
    decision: RouteDecision
    subject: SubjectType
    complexity_score: float
    emotion_detected: Optional[str] = None
    matched_keywords: Dict[str, float] = None


class SubjectAwareRouter:
    """
    과목 인식 + 복잡도 기반 라우터

    Process:
    1. 이미지 감지 → VISION
    2. 감정 키워드 감지 → PSYCHOLOGY
    3. 과목 감지 (국/영/수/과/사)
    4. 복잡도 계산 (과목별 키워드 + 기본 키워드)
    5. Threshold 기반 모델 선택
    """

    # 과목 감지 키워드
    SUBJECT_KEYWORDS = {
        SubjectType.KOREAN: ["국어", "비문학", "문학", "문법", "화법", "작문", "언매", "독서"],
        SubjectType.MATH: ["수학", "미적분", "확률", "통계", "기하", "함수", "미분", "적분"],
        SubjectType.ENGLISH: ["영어", "빈칸", "순서", "요약", "문법", "어휘", "독해", "듣기"],
        SubjectType.SCIENCE: ["과학", "물리", "화학", "생명", "지구과학", "과탐"],
        SubjectType.SOCIAL: ["사회", "경제", "윤리", "지리", "역사", "사탐", "사회문화"],
    }

    # 과목별 복잡도 키워드
    SUBJECT_COMPLEXITY_KEYWORDS = {
        # 국어
        "비문학": 0.30, "문학": 0.25, "문법": 0.28, "화법": 0.22,
        "지문": 0.20, "선지": 0.15, "주제": 0.18, "요지": 0.18,

        # 수학
        "미적분": 0.40, "확률": 0.35, "기하": 0.38, "증명": 0.35,
        "계산": 0.20, "공식": 0.15, "함수": 0.25, "그래프": 0.22,

        # 영어
        "빈칸": 0.30, "순서": 0.28, "요약": 0.25, "문법": 0.22,
        "독해": 0.20, "듣기": 0.10, "어휘": 0.15,

        # 과학/사회
        "실험": 0.25, "개념": 0.18, "그래프": 0.22, "분석": 0.28,
    }

    # 기본 복잡도 키워드 (ACE V5.2 기본)
    GENERAL_COMPLEXITY_KEYWORDS = {
        # High (0.25+)
        "implement": 0.35, "설계": 0.35, "아키텍처": 0.40,
        "분석": 0.30, "최적화": 0.30, "복잡": 0.35,
        # Medium (0.15-0.24)
        "create": 0.20, "만들어": 0.20, "설명": 0.15,
        "update": 0.18, "수정": 0.18,
        # Low (0-0.14)
        "hello": 0.05, "안녕": 0.05, "what": 0.10,
    }

    # 감정 키워드 (심리 지원 모드 트리거)
    EMOTION_KEYWORDS = {
        "불안": "anxious", "긴장": "nervous", "걱정": "worried",
        "힘들": "stressed", "피곤": "tired", "지쳐": "exhausted",
        "포기": "giving_up", "무서워": "scared", "슬픔": "sad",
    }

    # Complexity Thresholds
    THRESHOLDS = {
        "simple": 0.3,   # < 0.3 → SIMPLE
        "medium": 0.6,   # 0.3 ~ 0.6 → MEDIUM
        # >= 0.6 → COMPLEX
    }

    def route(
        self,
        task: str,
        has_image: bool = False
    ) -> RoutingContext:
        """
        라우팅 결정

        Args:
            task: 사용자 입력
            has_image: 이미지 포함 여부

        Returns:
            RoutingContext: 라우팅 결정 + 컨텍스트
        """
        # 1. 이미지 우선 처리
        if has_image:
            return RoutingContext(
                decision=RouteDecision.VISION,
                subject=SubjectType.GENERAL,
                complexity_score=0.0,
            )

        # 2. 감정 키워드 감지
        emotion = self._detect_emotion(task)
        if emotion:
            return RoutingContext(
                decision=RouteDecision.PSYCHOLOGY,
                subject=SubjectType.GENERAL,
                complexity_score=0.0,
                emotion_detected=emotion
            )

        # 3. 과목 감지
        subject = self._detect_subject(task)

        # 4. 복잡도 계산
        complexity_score, matched_keywords = self._calculate_complexity(task, subject)

        # 5. Threshold 기반 결정
        if complexity_score < self.THRESHOLDS["simple"]:
            decision = RouteDecision.SIMPLE
        elif complexity_score < self.THRESHOLDS["medium"]:
            decision = RouteDecision.MEDIUM
        else:
            decision = RouteDecision.COMPLEX

        return RoutingContext(
            decision=decision,
            subject=subject,
            complexity_score=complexity_score,
            matched_keywords=matched_keywords
        )

    def _detect_subject(self, task: str) -> SubjectType:
        """과목 감지"""
        task_lower = task.lower()

        # 과목별 키워드 매칭 점수 계산
        scores = {}
        for subject, keywords in self.SUBJECT_KEYWORDS.items():
            score = sum(1 for kw in keywords if kw in task_lower)
            if score > 0:
                scores[subject] = score

        # 최고 점수 과목 반환
        if scores:
            return max(scores, key=scores.get)

        return SubjectType.GENERAL

    def _calculate_complexity(
        self,
        task: str,
        subject: SubjectType
    ) -> tuple[float, Dict[str, float]]:
        """
        복잡도 계산

        Returns:
            (complexity_score, matched_keywords)
        """
        task_lower = task.lower()
        matched = {}

        # 과목별 복잡도 키워드
        for keyword, weight in self.SUBJECT_COMPLEXITY_KEYWORDS.items():
            if keyword in task_lower:
                matched[keyword] = weight

        # 기본 복잡도 키워드
        for keyword, weight in self.GENERAL_COMPLEXITY_KEYWORDS.items():
            if keyword in task_lower:
                matched[keyword] = weight

        # 평균 복잡도
        if matched:
            complexity_score = sum(matched.values()) / len(matched)
        else:
            complexity_score = 0.1  # 기본값

        return complexity_score, matched

    def _detect_emotion(self, task: str) -> Optional[str]:
        """감정 키워드 감지"""
        task_lower = task.lower()

        for keyword, emotion in self.EMOTION_KEYWORDS.items():
            if keyword in task_lower:
                return emotion

        return None
```

---

## 3. Stress Monitor (심리 지원 시스템)

### 파일: `core/stress_monitor.py`

```python
"""
Stress Monitor - 스트레스 & 번아웃 감지 시스템

Features:
- 감정 상태 분석 (텍스트 → 감정 점수)
- 번아웃 레벨 감지 (최근 7일 학습 데이터 분석)
- 심리 지원 메시지 생성
"""

from enum import Enum
from dataclasses import dataclass
from typing import List, Dict
from datetime import datetime, timedelta


class EmotionType(Enum):
    """감정 유형"""
    NEUTRAL = "neutral"          # 중립
    STRESSED = "stressed"        # 스트레스
    ANXIOUS = "anxious"          # 불안
    MOTIVATED = "motivated"      # 동기부여됨
    FRUSTRATED = "frustrated"    # 좌절
    TIRED = "tired"              # 피곤
    CONFIDENT = "confident"      # 자신감


class BurnoutLevel(Enum):
    """번아웃 레벨"""
    LOW = "low"          # 정상
    MEDIUM = "medium"    # 주의 필요
    HIGH = "high"        # 긴급 휴식 필요


@dataclass
class StudySession:
    """학습 세션"""
    timestamp: datetime
    duration_minutes: int        # 학습 시간 (분)
    emotion: EmotionType         # 감정 상태
    efficiency_score: float      # 효율성 (0-1)
    score_improvement: float     # 성적 변화


class StressMonitor:
    """
    스트레스 모니터링 시스템

    Features:
    - 실시간 감정 분석
    - 번아웃 감지 (7일 데이터 기반)
    - 심리 지원 메시지 추천
    """

    # 감정 키워드와 점수
    STRESS_KEYWORDS = {
        "불안": 0.8, "긴장": 0.7, "걱정": 0.6,
        "힘들": 0.7, "피곤": 0.5, "지쳐": 0.8,
        "포기": 0.9, "안돼": 0.7, "무서워": 0.8,
        "두려": 0.7, "슬픔": 0.6, "외로": 0.5,
    }

    MOTIVATION_KEYWORDS = {
        "잘하고싶어": 0.7, "열심히": 0.6, "해낼": 0.8,
        "목표": 0.5, "화이팅": 0.6, "도전": 0.7,
        "자신": 0.6, "할수있": 0.7, "노력": 0.5,
    }

    # 번아웃 임계값
    BURNOUT_THRESHOLDS = {
        "avg_study_hours": 4.0,       # 평균 4시간 이상
        "negative_emotion_ratio": 0.6, # 부정 감정 60% 이상
        "efficiency_threshold": 0.5,   # 효율성 50% 미만
    }

    def __init__(self):
        self.sessions: List[StudySession] = []

    def analyze_emotion(self, text: str) -> tuple[EmotionType, float]:
        """
        텍스트에서 감정 분석

        Args:
            text: 사용자 입력

        Returns:
            (emotion_type, emotion_score)
        """
        text_lower = text.lower()

        # 스트레스 점수 계산
        stress_score = 0.0
        stress_matches = 0
        for keyword, score in self.STRESS_KEYWORDS.items():
            if keyword in text_lower:
                stress_score += score
                stress_matches += 1

        # 동기부여 점수 계산
        motivation_score = 0.0
        motivation_matches = 0
        for keyword, score in self.MOTIVATION_KEYWORDS.items():
            if keyword in text_lower:
                motivation_score += score
                motivation_matches += 1

        # 감정 결정
        if stress_matches == 0 and motivation_matches == 0:
            return EmotionType.NEUTRAL, 0.0

        if stress_matches > motivation_matches:
            avg_stress = stress_score / stress_matches
            if avg_stress >= 0.7:
                emotion = EmotionType.ANXIOUS if "불안" in text_lower or "긴장" in text_lower else EmotionType.STRESSED
            elif avg_stress >= 0.5:
                emotion = EmotionType.TIRED
            else:
                emotion = EmotionType.FRUSTRATED

            return emotion, avg_stress

        else:
            avg_motivation = motivation_score / motivation_matches
            if avg_motivation >= 0.6:
                emotion = EmotionType.MOTIVATED
            else:
                emotion = EmotionType.CONFIDENT

            return emotion, avg_motivation

    def detect_burnout(
        self,
        recent_days: int = 7
    ) -> tuple[BurnoutLevel, Dict[str, float]]:
        """
        번아웃 감지 (최근 N일 데이터 분석)

        Args:
            recent_days: 분석할 최근 일수

        Returns:
            (burnout_level, metrics)
        """
        # 최근 N일 세션 필터링
        cutoff_date = datetime.now() - timedelta(days=recent_days)
        recent_sessions = [
            s for s in self.sessions
            if s.timestamp >= cutoff_date
        ]

        if len(recent_sessions) == 0:
            return BurnoutLevel.LOW, {}

        # 메트릭 계산
        total_minutes = sum(s.duration_minutes for s in recent_sessions)
        avg_study_hours = (total_minutes / 60) / recent_days

        negative_emotions = [
            EmotionType.STRESSED,
            EmotionType.ANXIOUS,
            EmotionType.FRUSTRATED,
            EmotionType.TIRED
        ]
        negative_count = sum(1 for s in recent_sessions if s.emotion in negative_emotions)
        negative_emotion_ratio = negative_count / len(recent_sessions)

        avg_efficiency = sum(s.efficiency_score for s in recent_sessions) / len(recent_sessions)

        total_score_change = sum(s.score_improvement for s in recent_sessions)

        metrics = {
            "avg_study_hours": avg_study_hours,
            "negative_emotion_ratio": negative_emotion_ratio,
            "avg_efficiency": avg_efficiency,
            "score_improvement": total_score_change,
        }

        # 번아웃 레벨 결정
        if (
            avg_study_hours >= self.BURNOUT_THRESHOLDS["avg_study_hours"]
            and negative_emotion_ratio >= self.BURNOUT_THRESHOLDS["negative_emotion_ratio"]
            and avg_efficiency < self.BURNOUT_THRESHOLDS["efficiency_threshold"]
        ):
            return BurnoutLevel.HIGH, metrics

        elif negative_emotion_ratio >= 0.4 or avg_efficiency < 0.6:
            return BurnoutLevel.MEDIUM, metrics

        else:
            return BurnoutLevel.LOW, metrics

    def get_support_message(
        self,
        emotion: EmotionType,
        burnout_level: BurnoutLevel
    ) -> str:
        """
        심리 지원 메시지 생성

        Args:
            emotion: 현재 감정
            burnout_level: 번아웃 레벨

        Returns:
            support_message: 지원 메시지
        """
        messages = {
            # 감정별 메시지
            EmotionType.ANXIOUS: [
                "시험 불안은 누구나 느끼는 감정이야. 깊게 숨을 쉬고, 지금까지 잘 준비해온 것들을 믿어봐!",
                "긴장될 때는 5분만 쉬면서 좋아하는 음악을 들어보는 건 어떨까? 작은 휴식이 큰 도움이 돼.",
            ],
            EmotionType.STRESSED: [
                "스트레스를 느끼고 있구나. 오늘은 학습량을 20% 줄이고, 가벼운 산책을 해보는 건 어때?",
                "너무 무리하지 마. 꾸준히 하는 것이 폭발적으로 하는 것보다 더 효과적이야.",
            ],
            EmotionType.FRUSTRATED: [
                "좌절감이 들 때는 작은 성공을 경험하는 게 중요해. 쉬운 문제부터 다시 풀어보자!",
                "어려운 시기를 겪고 있지만, 이 또한 성장의 과정이야. 오늘 하루만 집중해보자.",
            ],
            EmotionType.TIRED: [
                "피곤할 땐 무리하지 말고 충분히 쉬어. 30분만 자도 컨디션이 많이 좋아질 거야.",
                "체력이 곧 실력이야. 오늘은 일찍 자고 내일 다시 시작하자!",
            ],
            EmotionType.MOTIVATED: [
                "좋은 에너지네! 이 기세로 오늘 목표를 달성해보자!",
                "동기부여가 충만할 때 최대한 활용하되, 번아웃 주의! 적절한 휴식도 잊지 마.",
            ],
        }

        # 번아웃 레벨별 추가 메시지
        burnout_messages = {
            BurnoutLevel.HIGH: "⚠️ 번아웃 경고! 오늘은 완전히 쉬는 날로 하자. 장기적으로 보면 이게 더 도움이 돼.",
            BurnoutLevel.MEDIUM: "💛 컨디션 관리 필요. 오늘 학습 시간을 20% 줄이고, 좋아하는 과목 위주로 공부해보자.",
            BurnoutLevel.LOW: "✅ 좋은 컨디션! 계속 이 페이스로 가자!",
        }

        # 메시지 조합
        emotion_msg = messages.get(emotion, ["화이팅! 오늘도 잘 해낼 거야!"])[0]
        burnout_msg = burnout_messages[burnout_level]

        return f"{emotion_msg}\n\n{burnout_msg}"

    def log_session(
        self,
        duration_minutes: int,
        emotion: EmotionType,
        efficiency_score: float,
        score_improvement: float = 0.0
    ):
        """학습 세션 기록"""
        session = StudySession(
            timestamp=datetime.now(),
            duration_minutes=duration_minutes,
            emotion=emotion,
            efficiency_score=efficiency_score,
            score_improvement=score_improvement
        )
        self.sessions.append(session)

        print(f"📊 [Session] Logged: {duration_minutes}min, {emotion.value}, efficiency={efficiency_score:.2f}")
```

---

## 4. Spaced Repetition Engine (SM-2 알고리즘)

### 파일: `memory/spaced_repetition.py`

```python
"""
Spaced Repetition Engine - SM-2 알고리즘 기반 복습 스케줄러

SM-2 (SuperMemo 2): 장기 기억 형성을 위한 최적 복습 간격 계산
"""

from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import List, Dict
import heapq


@dataclass
class ReviewItem:
    """복습 항목"""
    id: str
    subject: str           # 과목
    topic: str             # 주제/단원
    content: str           # 내용
    easiness_factor: float = 2.5    # 난이도 계수 (1.3 ~ 2.5+)
    interval: int = 0                # 복습 간격 (일)
    repetitions: int = 0             # 복습 횟수
    next_review_date: datetime = None
    mastery_level: int = 0          # 숙달도 (0-10)
    priority: float = 0.0           # 우선순위 점수


class SpacedRepetitionEngine:
    """
    SM-2 알고리즘 기반 Spaced Repetition

    Features:
    - SM-2 알고리즘으로 최적 복습 간격 계산
    - 우선순위 큐로 복습 스케줄 관리
    - 취약점 우선 복습
    """

    def __init__(self):
        self.items: Dict[str, ReviewItem] = {}
        self.review_queue = []  # 우선순위 큐 (heapq)

    def add_item(
        self,
        item_id: str,
        subject: str,
        topic: str,
        content: str,
        initial_mastery: int = 0
    ):
        """복습 항목 추가"""
        item = ReviewItem(
            id=item_id,
            subject=subject,
            topic=topic,
            content=content,
            next_review_date=datetime.now(),  # 즉시 복습
            mastery_level=initial_mastery
        )

        self.items[item_id] = item
        self._update_priority(item)
        heapq.heappush(self.review_queue, (item.priority, item_id))

        print(f"➕ [SR] Added: {topic} ({subject})")

    def review_item(
        self,
        item_id: str,
        quality: int
    ) -> ReviewItem:
        """
        복습 수행 및 SM-2 알고리즘 적용

        Args:
            item_id: 복습 항목 ID
            quality: 복습 품질 (0-5)
                - 5: 완벽 (perfect response)
                - 4: 정확한 응답 (약간 망설임)
                - 3: 정확한 응답 (많이 망설임)
                - 2: 틀림 (쉬운 복습 후 기억남)
                - 1: 틀림 (복습 후에도 어려움)
                - 0: 전혀 기억 안남

        Returns:
            updated_item: 업데이트된 항목
        """
        if item_id not in self.items:
            raise ValueError(f"Item not found: {item_id}")

        item = self.items[item_id]

        # SM-2 알고리즘 적용
        new_ef, new_interval = self._calculate_sm2(
            item.easiness_factor,
            item.interval,
            item.repetitions,
            quality
        )

        # 항목 업데이트
        item.easiness_factor = new_ef
        item.interval = new_interval
        item.repetitions += 1
        item.next_review_date = datetime.now() + timedelta(days=new_interval)

        # 숙달도 업데이트 (quality 기반)
        mastery_change = (quality - 3) * 0.5  # -1.5 ~ +1.0
        item.mastery_level = max(0, min(10, item.mastery_level + mastery_change))

        # 우선순위 재계산
        self._update_priority(item)

        print(f"✅ [SR] Reviewed: {item.topic}, quality={quality}, next in {new_interval} days")
        return item

    def _calculate_sm2(
        self,
        ef: float,
        interval: int,
        repetitions: int,
        quality: int
    ) -> tuple[float, int]:
        """
        SM-2 알고리즘 핵심 계산

        Returns:
            (new_easiness_factor, new_interval)
        """
        # Easiness Factor 업데이트
        new_ef = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))

        # EF 최소값 제한
        if new_ef < 1.3:
            new_ef = 1.3

        # Interval 계산
        if quality < 3:
            # 틀림 → 1일 후 다시 복습
            new_interval = 1
            new_repetitions = 0
        else:
            if repetitions == 0:
                new_interval = 1
            elif repetitions == 1:
                new_interval = 6
            else:
                new_interval = int(interval * new_ef)

            new_repetitions = repetitions + 1

        return new_ef, new_interval

    def _update_priority(self, item: ReviewItem):
        """
        복습 우선순위 계산

        Priority = (10 - mastery_level) * 0.4  # 낮은 숙달도 우선
                 + urgency * 0.3                # 임박한 복습 우선
                 + (1 / easiness_factor) * 0.2  # 어려운 항목 우선
                 + repetition_boost * 0.1       # 반복 횟수 적을수록 우선
        """
        # 숙달도 (낮을수록 높은 우선순위)
        mastery_score = (10 - item.mastery_level) * 0.4

        # 긴급도 (복습일이 가까울수록 높은 우선순위)
        if item.next_review_date:
            days_until_review = (item.next_review_date - datetime.now()).days
            urgency = 1.0 / (1.0 + days_until_review) if days_until_review >= 0 else 1.0
        else:
            urgency = 1.0

        urgency_score = urgency * 0.3

        # 난이도 (어려울수록 높은 우선순위)
        difficulty_score = (1.0 / item.easiness_factor) * 0.2

        # 반복 횟수 (적을수록 높은 우선순위)
        repetition_boost = (1.0 / (1.0 + item.repetitions)) * 0.1

        item.priority = mastery_score + urgency_score + difficulty_score + repetition_boost

    def get_due_items(self, limit: int = 10) -> List[ReviewItem]:
        """
        복습 필요 항목 가져오기 (우선순위 순)

        Args:
            limit: 최대 개수

        Returns:
            due_items: 복습 대상 항목 리스트
        """
        now = datetime.now()
        due_items = []

        # 우선순위 큐에서 복습 필요 항목 추출
        while self.review_queue and len(due_items) < limit:
            priority, item_id = heapq.heappop(self.review_queue)
            item = self.items[item_id]

            # 복습일이 지났거나 오늘인 경우
            if item.next_review_date <= now:
                due_items.append(item)

        # 우선순위 재정렬 (다음 조회를 위해)
        self.review_queue = []
        for item in self.items.values():
            heapq.heappush(self.review_queue, (item.priority, item.id))

        return due_items

    def get_statistics(self) -> Dict:
        """통계 정보"""
        if not self.items:
            return {"total": 0}

        total = len(self.items)
        avg_mastery = sum(item.mastery_level for item in self.items.values()) / total
        avg_ef = sum(item.easiness_factor for item in self.items.values()) / total

        # 과목별 통계
        by_subject = {}
        for item in self.items.values():
            if item.subject not in by_subject:
                by_subject[item.subject] = {"count": 0, "avg_mastery": 0.0}

            by_subject[item.subject]["count"] += 1
            by_subject[item.subject]["avg_mastery"] += item.mastery_level

        for subject in by_subject:
            count = by_subject[subject]["count"]
            by_subject[subject]["avg_mastery"] /= count

        return {
            "total": total,
            "avg_mastery": avg_mastery,
            "avg_easiness_factor": avg_ef,
            "by_subject": by_subject,
        }
```

---

## 요약

이 문서에서는 수능 ACE 에이전트의 4가지 핵심 컴포넌트를 상세히 설계했습니다:

1. **Learning Memory Lane**: ACE V5.2의 6가지 메모리 유형을 12가지로 확장 (교육 도메인)
2. **Subject-Aware Router**: 과목 감지 + 복잡도 + 감정 상태 기반 라우팅
3. **Stress Monitor**: 감정 분석 + 번아웃 감지 + 심리 지원
4. **Spaced Repetition Engine**: SM-2 알고리즘 기반 최적 복습 스케줄

각 컴포넌트는 독립적으로 동작하면서도 서로 긴밀하게 통합되어 학생의 학습 효율을 극대화합니다.
