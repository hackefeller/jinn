## ADDED Requirements

### Requirement: Speckit analyze prompt
The ghostwire CLI SHALL generate `/ghostwire:speckit-analyze` prompt for codebase analysis and architecture review.

#### Scenario: User analyzes codebase
- **WHEN** user runs `/ghostwire:speckit-analyze`
- **THEN** system explores codebase structure, identifies patterns, surfaces complexity

### Requirement: Speckit plan prompt
The ghostwire CLI SHALL generate `/ghostwire:speckit-plan` prompt for creating detailed work plans.

#### Scenario: User creates plan
- **WHEN** user runs `/ghostwire:speckit-plan`
- **THEN** system interviews user, creates milestone-based plan in tasks.md

### Requirement: Speckit implement prompt
The ghostwire CLI SHALL generate `/ghostwire:speckit-implement` prompt for executing implementation tasks.

#### Scenario: User implements
- **WHEN** user runs `/ghostwire:speckit-implement`
- **THEN** system executes tasks with verification at each step

### Requirement: Speckit specify prompt
The ghostwire CLI SHALL generate `/ghostwire:speckit-specify` prompt for detailed requirement specification.

#### Scenario: User specifies requirements
- **WHEN** user runs `/ghostwire:speckit-specify`
- **THEN** system helps create detailed spec files with scenarios

### Requirement: Speckit tasks prompt
The ghostwire CLI SHALL generate `/ghostwire:speckit-tasks` prompt for creating implementation task lists.

#### Scenario: User creates tasks
- **WHEN** user runs `/ghostwire:speckit-tasks`
- **THEN** system breaks work into actionable tasks with dependencies

### Requirement: Speckit constitution prompt
The ghostwire CLI SHALL generate `/ghostwire:speckit-constitution` prompt for establishing project conventions.

#### Scenario: User creates constitution
- **WHEN** user runs `/ghostwire:speckit-constitution`
- **THEN** system helps define coding standards, patterns, and practices
