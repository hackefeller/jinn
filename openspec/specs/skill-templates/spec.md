# skill-templates Specification

## Purpose
TBD - created by archiving change copy-openspec-prompts-to-ghostwire. Update Purpose after archive.
## Requirements
### Requirement: Openspec-propose skill
The ghostwire CLI SHALL generate `ghostwire-skills/openspec-propose/SKILL.md` that enables agents to create changes with full artifact generation.

#### Scenario: Agent runs propose skill
- **WHEN** agent activates openspec-propose skill
- **THEN** skill provides instructions for change creation workflow

### Requirement: Openspec-explore skill
The ghostwire CLI SHALL generate `ghostwire-skills/openspec-explore/SKILL.md` that enables thinking and investigation.

#### Scenario: Agent activates explore skill
- **WHEN** agent activates openspec-explore skill
- **THEN** skill provides framework for exploration without implementation

### Requirement: Openspec-apply skill
The ghostwire CLI SHALL generate `ghostwire-skills/openspec-apply/SKILL.md` that executes implementation.

#### Scenario: Agent activates apply skill
- **WHEN** agent activates openspec-apply skill
- **THEN** skill provides instructions for task execution

### Requirement: Openspec-archive skill
The ghostwire CLI SHALL generate `ghostwire-skills/openspec-archive/SKILL.md` for change completion.

#### Scenario: Agent activates archive skill
- **WHEN** agent activates openspec-archive skill
- **THEN** skill provides workflow for archiving completed changes

### Requirement: Ready-for-prod skill
The ghostwire CLI SHALL generate `ghostwire-skills/ready-for-prod/SKILL.md` for production readiness checks.

#### Scenario: Agent checks production readiness
- **WHEN** agent activates ready-for-prod skill
- **THEN** skill provides checklist for production deployment

