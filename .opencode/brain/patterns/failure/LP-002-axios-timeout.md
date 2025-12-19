# LP-002: Axios 타임아웃 미설정 문제

**ID**: LP-002
**Status**: FAILURE_PATTERN
**Confidence**: 0.95
**Learned At**: 2025-12-16

---

## Context

API 호출 시 네트워크 지연으로 인한 무한 로딩 문제

## Problem Description

axios 요청에 타임아웃을 설정하지 않으면 다음 문제가 발생합니다:

1. **무한 로딩**: 네트워크 지연 시 사용자가 영원히 대기
2. **리소스 점유**: 미완료 요청이 리소스를 계속 점유
3. **사용자 경험 저하**: 응답 없음 상태가 지속됨

## Anti-Pattern Example

```typescript
// ❌ 잘못된 예시 - 타임아웃 없음
const response = await axios.get('/api/data');
```

## Correct Pattern

```typescript
// ✅ 올바른 예시 - 타임아웃 설정
const response = await axios.get('/api/data', {
  timeout: 5000, // 5초 타임아웃
});

// ✅ 글로벌 설정
const apiClient = axios.create({
  baseURL: process.env.API_URL,
  timeout: 5000,
});
```

## Recommended Timeout Values

| 요청 유형 | 권장 타임아웃 |
|----------|-------------|
| 일반 API | 5초 |
| 검색/목록 | 10초 |
| 파일 업로드 | 30초 |
| 백그라운드 작업 | 60초 |

## Error Handling

```typescript
try {
  const response = await axios.get('/api/data', { timeout: 5000 });
} catch (error) {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      // 타임아웃 에러 처리
      console.error('요청 시간 초과');
    }
  }
}
```

## Prevention Checklist

- [ ] 모든 API 호출에 타임아웃 설정
- [ ] axios 인스턴스에 기본 타임아웃 설정
- [ ] 타임아웃 에러 핸들링 구현
- [ ] 사용자에게 적절한 피드백 제공

## Related Files

- `utils/api-client.ts`
- `services/*.ts`

## Tags

- api
- axios
- timeout
- error-handling
- network
