# workflow-prompts Specification

## Purpose
TBD - created by archiving change copy-openspec-prompts-to-ghostwire. Update Purpose after archive.
## Requirements
### Requirement: Ghostwire propose workflow prompt
The ghostwire CLI SHALL generate a rich `/ghostwire:propose` command prompt that enables users to create changes with full OpenSpec-style artifact generation.

#### Scenario: User invokes propose with change name
- **WHEN** user runs `/ghostwire:propose add-user-auth`
- **THEN** system creates change directory with .openspec.yaml scaffold

#### Scenario: User invokes propose without input
- **WHEN** user runs `/ghostwire:propose` with no argument
- **THEN** system prompts user with AskUserQuestion to clarify what they want to build

### Requirement: Ghostwire explore workflow prompt
The ghostwire CLI SHALL generate a rich `/ghostwire:explore` command prompt that enables thinking, investigation, and requirement clarification without implementing.

#### Scenario: User explores vague idea
- **WHEN** user runs `/ghostwire:explore real-time-collaboration`
- **THEN** system enters thinking mode, asks clarifying questions, explores problem space

#### Scenario: User explores with change context
- **WHEN** user runs `/ghostwire:explore add-dark-mode` with existing change
- **THEN** system reads change artifacts and discusses in context

### Requirement: Ghostwire apply workflow prompt
The ghostwire CLI SHALL generate a rich `/ghostwire:apply` command prompt that executes implementation tasks from tasks.md.

#### Scenario: User applies change
- **WHEN** user runs `/ghostwire:apply`
- **THEN** system reads tasks.md and executes tasks in order

### Requirement: Ghostwire archive workflow prompt
The ghostwire CLI SHALL generate a rich `/ghostwire:archive` command prompt that completes and archives finished changes.

#### Scenario: User archives completed change
- **WHEN** user runs `/ghostwire:archive`
- **THEN** system validates all tasks complete, moves change to archive, syncs specs

