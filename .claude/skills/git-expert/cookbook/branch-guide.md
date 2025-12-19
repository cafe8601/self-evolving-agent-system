# Branch Management Guide

## Branch Naming Convention

```
<type>/<description>

Types:
- feature/  : 새 기능 개발
- fix/      : 버그 수정
- hotfix/   : 긴급 수정
- release/  : 릴리스 준비
- refactor/ : 리팩토링
- docs/     : 문서 작업
- test/     : 테스트 추가
```

## Examples

```bash
# 기능 브랜치
git checkout -b feature/user-authentication
git checkout -b feature/payment-integration

# 버그 수정
git checkout -b fix/login-validation
git checkout -b fix/memory-leak

# 핫픽스
git checkout -b hotfix/critical-security-patch
```

## Branch Workflow

### 1. 브랜치 생성

```bash
# 최신 main에서 시작
git checkout main
git pull origin main
git checkout -b <branch-name>
```

### 2. 작업 후 푸시

```bash
git add .
git commit -m "commit message"
git push -u origin <branch-name>
```

### 3. 브랜치 정리

```bash
# 로컬 브랜치 삭제
git branch -d <branch-name>

# 원격 브랜치 삭제
git push origin --delete <branch-name>

# 머지된 브랜치 정리
git branch --merged | grep -v main | xargs git branch -d
```

## Branch Commands Reference

| 명령 | 설명 |
|------|------|
| `git branch` | 로컬 브랜치 목록 |
| `git branch -a` | 모든 브랜치 목록 |
| `git branch -r` | 원격 브랜치 목록 |
| `git checkout -b <name>` | 브랜치 생성 및 전환 |
| `git switch <name>` | 브랜치 전환 |
| `git branch -d <name>` | 브랜치 삭제 |
| `git branch -m <new>` | 브랜치 이름 변경 |
