## Context

Ghostwire needs to provide rich prompts across 24+ AI tool harnesses. Currently:
- CLI generator produces ~30 files per tool (commands + skills + agents)
- Each prompt is minimal (7 lines)
- No multi-harness adaptation for prompt content

Source material exists in hominem repo:
- `.github/prompts/opsx-*.prompt.md` - 4 workflow prompts
- `.github/prompts/speckit.*.prompt.md` - 9 specialized prompts
- `.github/skills/openspec-*/SKILL.md` - 5 skills

## Goals / Non-Goals

**Goals:**
- Copy all openspec prompts and skills to ghostwire templates
- Make prompts work across all 24+ AI tool formats (OpenCode, Cursor, Claude Code, GitHub Copilot, etc.)
- Generate 100+ files per tool when user runs `ghostwire init`
- Maintain prompt quality (detailed workflows, not placeholders)

**Non-Goals:**
- Modify openspec itself (source of truth remains hominem)
- Build new CLI framework (use existing TypeScript CLI)
- Add new AI tools to adapter registry (stay at 24)

## Decisions

1. **Template Structure**: Keep existing structure (`src/templates/commands/`, `src/templates/skills/`, `src/templates/agents/`) - proven to work

2. **Multi-harness Adaptation**: Each adapter already handles path formatting. For content adaptation, add optional `transformContent()` method to adapters for harness-specific prompt modifications

3. **Prompts vs Skills**: Copy prompts as command templates, skills as skill templates. Both need rich content.

4. **Incremental Migration**: Keep existing minimal prompts as fallback, overlay new rich prompts

## Risks / Trade-offs

- [Risk] Prompt bloat - 100+ files per tool could overwhelm users → Mitigation: Add profile system (core vs extended)
- [Risk] Content drift between source (hominem) and ghostwire → Mitigation: Document that ghostwire mirrors hominem
- [Risk] Some prompts may be harness-specific (CLI commands vs slash commands) → Mitigation: Add `compatibility` metadata to templates
