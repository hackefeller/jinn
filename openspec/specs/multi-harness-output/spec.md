# multi-harness-output Specification

## Purpose
TBD - created by archiving change copy-openspec-prompts-to-ghostwire. Update Purpose after archive.
## Requirements
### Requirement: OpenCode format adapter
The ghostwire CLI SHALL generate prompts in OpenCode format (.opencode/commands/*.md, .opencode/skills/*/SKILL.md).

#### Scenario: User configures OpenCode
- **WHEN** user runs `ghostwire init --tools opencode`
- **THEN** system generates commands and skills in OpenCode directory structure

### Requirement: GitHub Copilot format adapter
The ghostwire CLI SHALL generate prompts in GitHub Copilot format (.github/prompts/*.prompt.md, .github/skills/*/SKILL.md).

#### Scenario: User configures GitHub Copilot
- **WHEN** user runs `ghostwire init --tools github-copilot`
- **THEN** system generates prompts and skills in .github directory structure

### Requirement: Cursor format adapter
The ghostwire CLI SHALL generate prompts in Cursor format (.cursor/rules/*.md).

#### Scenario: User configures Cursor
- **WHEN** user runs `ghostwire init --tools cursor`
- **THEN** system generates rules in .cursor/rules directory

### Requirement: Claude Code format adapter
The ghostwire CLI SHALL generate prompts in Claude Code format (.claude/commands/*.md).

#### Scenario: User configures Claude Code
- **WHEN** user runs `ghostwire init --tools claude-code`
- **THEN** system generates commands in .claude/commands directory

### Requirement: All 24+ tool adapters
The ghostwire CLI SHALL generate prompts in all 24+ supported AI tool formats.

#### Scenario: User configures multiple tools
- **WHEN** user runs `ghostwire init --tools all`
- **THEN** system generates appropriate format for each detected tool

