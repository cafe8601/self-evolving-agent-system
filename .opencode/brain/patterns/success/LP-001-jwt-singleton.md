# LP-001: JWT 토큰 Singleton 패턴

**ID**: LP-001
**Status**: SUCCESS_PATTERN
**Confidence**: 0.9
**Learned At**: 2025-12-17

---

## Context

JWT 인증 시스템 구현 시 토큰 관리 방식

## Pattern Description

JWT 토큰 관리를 Singleton 패턴으로 구현하면 다음과 같은 이점이 있습니다:

1. **일관된 상태 유지**: 앱 전체에서 동일한 토큰 인스턴스 사용
2. **자동 갱신**: 토큰 만료 전 자동 리프레시 로직 중앙화
3. **메모리 효율**: 불필요한 중복 인스턴스 방지

## Implementation Example

```typescript
// auth/token-manager.ts
class TokenManager {
  private static instance: TokenManager;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  private constructor() {}

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  async getValidToken(): Promise<string> {
    if (this.isTokenExpired()) {
      await this.refreshAccessToken();
    }
    return this.accessToken!;
  }

  private isTokenExpired(): boolean {
    // JWT 만료 체크 로직
  }

  private async refreshAccessToken(): Promise<void> {
    // 리프레시 토큰으로 액세스 토큰 갱신
  }
}

export const tokenManager = TokenManager.getInstance();
```

## Best Practices

- 리프레시 토큰은 httpOnly 쿠키에 저장
- 액세스 토큰은 메모리에만 유지 (XSS 방지)
- 토큰 갱신 실패 시 로그아웃 처리

## Related Files

- `auth/token-manager.ts`
- `middleware/auth.ts`
- `hooks/useAuth.ts`

## Tags

- authentication
- jwt
- security
- singleton
