## Why

Ghostwire's command prompts are extremely minimal (7 lines each: "Start a new change.") while openspec has rich, detailed workflows (100+ lines each with step-by-step instructions, guardrails, and context). This makes ghostwire less useful out of the box compared to what users get with openspec. We need to provide high-quality prompts across all 24+ AI tool harnesses.

## What Changes

- Copy 4 main workflow prompts from openspec: propose, explore, apply, archive
- Copy 9 speckit prompts: analyze, checklist, clarify, constitution, implement, plan, specify, tasks, tasks-to-issues
- Copy 5 skills: openspec-propose, openspec-explore, openspec-apply, openspec-archive, ready-for-prod
- Convert all prompts to work across 24+ AI tool formats (OpenCode, Cursor, Claude Code, GitHub Copilot, etc.)
- Add new templates to ghostwire CLI generator

## Capabilities

### New Capabilities

- `workflow-prompts`: Rich slash command workflows (propose, explore, apply, archive)
- `speckit-prompts`: Specialized prompts for spec-driven development (analyze, plan, implement, etc.)
- `skill-templates`: Agent skills for executing workflows
- `multi-harness-output`: Support for generating prompts in all 24+ tool formats

### Modified Capabilities

(none - new capabilities)

## Impact

- New templates in `src/templates/commands/` and `src/templates/skills/`
- Updated generator in `src/core/generator/`
- CLI will generate 100+ files per tool instead of ~30
