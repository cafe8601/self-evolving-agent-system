---
name: git-expert
description: Git workflow automation including commits, branches, merges, and PR creation. Use when user says git commit, create branch, merge, pull request, git history, rebase, cherry-pick, or any git-related operations.
---

# Git Expert Skill

> Git 작업을 자동화하고 베스트 프랙티스를 적용합니다.

## Purpose

- **스마트 커밋**: 변경 사항 분석 후 컨벤셔널 커밋 메시지 자동 생성
- **브랜치 관리**: 브랜치 생성, 전환, 정리
- **PR 생성**: Pull Request 템플릿 자동 작성
- **히스토리 분석**: 커밋 히스토리 분석 및 요약

## Variables

```yaml
commit_style: conventional  # conventional, simple, detailed
branch_prefix: feature      # feature, fix, hotfix, release
default_branch: main
```

## Workflow

### Commit 요청 시

1. `git status`로 변경 사항 확인
2. `git diff --staged` 또는 `git diff`로 변경 내용 분석
3. 변경 유형 판단 (feat, fix, docs, refactor, test, chore)
4. 컨벤셔널 커밋 메시지 생성
5. 사용자 확인 후 커밋 실행

### Branch 요청 시

→ `cookbook/branch-guide.md` 읽기

### PR 요청 시

→ `cookbook/pr-guide.md` 읽기

## Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | 설명 | 예시 |
|------|------|------|
| feat | 새 기능 | feat(auth): add JWT authentication |
| fix | 버그 수정 | fix(api): resolve null pointer exception |
| docs | 문서 변경 | docs(readme): update installation guide |
| refactor | 리팩토링 | refactor(utils): simplify date formatting |
| test | 테스트 | test(user): add unit tests for UserService |
| chore | 기타 작업 | chore(deps): update dependencies |

## Examples

### 스마트 커밋

```
User: "commit my changes"

Claude:
1. git status 확인
2. 변경 파일 분석: src/auth/login.py 수정
3. 변경 내용: 로그인 유효성 검사 추가

제안 커밋 메시지:
feat(auth): add input validation for login

- Add email format validation
- Add password strength check
- Return detailed error messages

이대로 커밋할까요?
```

### 브랜치 생성

```
User: "create a branch for user authentication feature"

Claude:
git checkout -b feature/user-authentication

브랜치 'feature/user-authentication'를 생성하고 전환했습니다.
```

### PR 생성

```
User: "create a PR for this branch"

Claude:
→ cookbook/pr-guide.md 참조하여 PR 템플릿 생성
```

## Output Format

```markdown
## Git 작업 완료

**작업**: [커밋/브랜치/PR]
**상태**: ✅ 성공

### 상세
[작업 상세 내용]

### 다음 단계
[권장 다음 작업]
```
