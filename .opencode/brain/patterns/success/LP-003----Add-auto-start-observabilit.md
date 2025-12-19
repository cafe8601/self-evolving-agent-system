# Pattern: LP-003

## Metadata
- **ID**: LP-003
- **Status**: SUCCESS_PATTERN
- **Learned At**: 2025-12-20T00:05:31+09:00
- **Confidence**: 0.8

## Context
기능 추가: : Add auto-start observability server with portable settings

- Add ensure-server.sh for auto-starting observability on SessionStart
- Convert settings.json to settings.json.template with {{PROJECT_ROOT}} placeholders
- Update install.sh to generate settings.json from template
- Add settings.json to .gitignore (environment-specific)
- Add LP-044 pattern for session start automation

Portability: All paths now use templates or dynamic resolution.
Run `./scripts/install.sh` after cloning to configure paths.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

## Content
Changed 6 file(s): .claude/settings.json .claude/settings.json.template .gitignore .opencode/brain/project_brain.yaml o

## Tags
- feature

## Related Files
- .claude/settings.json
- .claude/settings.json.template
- .gitignore
- .opencode/brain/project_brain.yaml
- observability/scripts/ensure-server.sh

## Commit Info
- Hash: 179249eaad466319b26d9193bff87f5ca256ca46
- Message: feat: Add auto-start observability server with portable settings

- Add ensure-server.sh for auto-starting observability on SessionStart
- Convert settings.json to settings.json.template with {{PROJECT_ROOT}} placeholders
- Update install.sh to generate settings.json from template
- Add settings.json to .gitignore (environment-specific)
- Add LP-044 pattern for session start automation

Portability: All paths now use templates or dynamic resolution.
Run `./scripts/install.sh` after cloning to configure paths.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
