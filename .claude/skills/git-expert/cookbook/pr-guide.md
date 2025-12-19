# Pull Request Guide

## PR Template

```markdown
## 📋 Summary
[변경 사항 요약 - 1-2문장]

## 🔄 Type of Change
- [ ] 🆕 New feature
- [ ] 🐛 Bug fix
- [ ] 📝 Documentation
- [ ] ♻️ Refactoring
- [ ] 🧪 Test
- [ ] 🔧 Configuration

## 📝 Description
[상세 설명]

### What changed?
- 변경 사항 1
- 변경 사항 2

### Why?
[변경 이유]

## 🧪 Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing done

### Test Instructions
1. Step 1
2. Step 2

## 📸 Screenshots (if applicable)
[UI 변경 시 스크린샷]

## ✅ Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated

## 🔗 Related Issues
Closes #[issue_number]
```

## PR 생성 워크플로우

### 1. 변경 사항 분석

```bash
# 현재 브랜치와 main 비교
git log main..HEAD --oneline
git diff main...HEAD --stat
```

### 2. PR 정보 수집

분석할 내용:
- 커밋 메시지들
- 변경된 파일 목록
- 변경 라인 수
- 관련 이슈 번호

### 3. PR 제목 생성

```
<type>: <short description>

예시:
- feat: Add user authentication system
- fix: Resolve login timeout issue
- docs: Update API documentation
```

### 4. PR 본문 작성

위 템플릿을 기반으로:
1. 커밋 메시지에서 Summary 추출
2. 변경 파일에서 Type 결정
3. diff에서 Description 작성
4. Checklist 제공

## GitHub CLI 사용

```bash
# PR 생성
gh pr create --title "feat: Add feature" --body "Description"

# 템플릿 사용
gh pr create --template pull_request_template.md

# Draft PR
gh pr create --draft
```
