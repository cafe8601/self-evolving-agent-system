# Pattern: LP-001

## Metadata
- **ID**: LP-001
- **Status**: SUCCESS_PATTERN
- **Learned At**: 2025-12-19T04:16:08+09:00
- **Confidence**: 0.8

## Context
버그 수정: (mdflow): Update workflow configurations for CLI compatibility

- research.gemini.md: Change `dangerously-skip-permissions` to `yolo: true`
  (Gemini CLI uses --yolo flag)
- build.codex.md: Remove `model: codex` (Codex CLI has no --model flag)
- review.claude.md: Remove `model: opus` (Claude CLI has no --model flag)
- evolve.claude.md: Remove `model: opus` for master workflow

All four MDFlow workflows now properly integrate with their respective
CLI tools (Gemini, Codex, Claude) for the self-evolving agent system.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>

## Content
Automatically recorded pattern from system activity

## Tags
- bugfix

## Related Files


## Commit Info
- Hash: ceca616245a70c8c916a8c1bff4f19e863fb697f
- Message: fix(mdflow): Update workflow configurations for CLI compatibility

- research.gemini.md: Change `dangerously-skip-permissions` to `yolo: true`
  (Gemini CLI uses --yolo flag)
- build.codex.md: Remove `model: codex` (Codex CLI has no --model flag)
- review.claude.md: Remove `model: opus` (Claude CLI has no --model flag)
- evolve.claude.md: Remove `model: opus` for master workflow

All four MDFlow workflows now properly integrate with their respective
CLI tools (Gemini, Codex, Claude) for the self-evolving agent system.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
