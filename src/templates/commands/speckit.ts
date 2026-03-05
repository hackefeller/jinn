import type { CommandTemplate } from '../../core/templates/types.js';

export function getSpeckitAnalyzeCommandTemplate(): CommandTemplate {
  return {
    name: 'Ghostwire: Speckit Analyze',
    description: 'Perform cross-artifact consistency and quality analysis',
    category: 'Speckit',
    tags: ['speckit', 'analysis', 'quality', 'consistency'],
    content: `## Goal

Identify inconsistencies, duplications, ambiguities, and underspecified items across the core artifacts (\`spec.md\`, \`plan.md\`, \`tasks.md\`) before implementation.

## Operating Constraints

**STRICTLY READ-ONLY**: Do **not** modify any files. Output a structured analysis report. Offer an optional remediation plan.

**Constitution Authority**: The project constitution is **non-negotiable** within this analysis scope. Constitution conflicts are automatically CRITICAL.

## Execution Steps

### 1. Initialize Analysis Context

Locate and validate required files:
- SPEC = <feature>/spec.md
- PLAN = <feature>/plan.md  
- TASKS = <feature>/tasks.md

Abort with an error if any required file is missing.

### 2. Load Artifacts

Load minimal necessary context:

**From spec.md:**
- Overview/Context
- Functional Requirements
- Non-Functional Requirements
- User Stories

**From plan.md:**
- Architecture/stack choices
- Data Model references
- Phases

**From tasks.md:**
- Task IDs
- Descriptions
- Phase grouping

### 3. Detection Passes

#### A. Duplication Detection
- Identify near-duplicate requirements
- Mark lower-quality phrasing for consolidation

#### B. Ambiguity Detection
- Flag vague adjectives (fast, scalable, secure) lacking measurable criteria
- Flag unresolved placeholders (TODO, ???, \`<placeholder>\`)

#### C. Underspecification
- Requirements with verbs but missing object or measurable outcome
- Tasks referencing files not defined in spec/plan

#### D. Coverage Gaps
- Requirements with zero associated tasks
- Tasks with no mapped requirement/story
- Non-functional requirements not reflected in tasks

#### E. Inconsistency
- Terminology drift (same concept named differently)
- Data entities referenced in plan but absent in spec
- Task ordering contradictions

### 4. Severity Assignment

- **CRITICAL**: Missing core spec artifact, or requirement with zero coverage
- **HIGH**: Duplicate or conflicting requirement, ambiguous security/performance
- **MEDIUM**: Terminology drift, missing non-functional task coverage
- **LOW**: Style/wording improvements

### 5. Produce Analysis Report

Output a Markdown report:

## Specification Analysis Report

| ID | Category | Severity | Location | Summary | Recommendation |
|----|----------|----------|----------|---------|----------------|
| A1 | Duplication | HIGH | spec.md | Two similar requirements... | Merge phrasing |

**Coverage Summary:**
- Total Requirements
- Total Tasks  
- Coverage %
- Issue Counts

### 6. Provide Next Actions

- If CRITICAL issues: Resolve before implementation
- If LOW/MEDIUM: User may proceed with improvements suggested
`,
  };
}

export function getSpeckitPlanCommandTemplate(): CommandTemplate {
  return {
    name: 'Ghostwire: Speckit Plan',
    description: 'Create detailed work plans with milestones',
    category: 'Speckit',
    tags: ['speckit', 'plan', 'milestones', 'work-breakdown'],
    content: `## Goal

Interview the user to understand what they want to build, then create a detailed work plan with clear phases and milestones.

## Steps

### 1. Understand the Request

Ask clarifying questions to understand:
- What problem does this solve?
- Who are the users?
- What's the timeline?
- Any constraints or requirements?

### 2. Analyze Requirements

Break down the request into:
- Core features
- Supporting features  
- Edge cases
- Non-functional requirements (performance, security, etc.)

### 3. Identify Dependencies

Map relationships between:
- Features that depend on others
- External integrations
- Infrastructure needs

### 4. Create Work Breakdown

Structure the plan into phases:
- **Phase 1**: Foundation (setup, infrastructure)
- **Phase 2**: Core features
- **Phase 3**: Supporting features
- **Phase 4**: Polish and testing

### 5. Define Milestones

Each milestone should:
- Have clear success criteria
- Be achievable in 1-3 days
- Produce something demonstrable

### 6. Output Plan

Create a plan document with:
- Overview and goals
- Phase breakdown with tasks
- Dependencies map
- Milestone definitions
- Risks and mitigations
`,
  };
}

export function getSpeckitImplementCommandTemplate(): CommandTemplate {
  return {
    name: 'Ghostwire: Speckit Implement',
    description: 'Execute implementation tasks with verification',
    category: 'Speckit',
    tags: ['speckit', 'implement', 'execution', 'tasks'],
    content: `## Goal

Execute implementation tasks from the work plan with verification at each step.

## Steps

### 1. Review Tasks

Read the tasks.md file and understand:
- Task structure and numbering
- Dependencies between tasks
- Success criteria for each task

### 2. Prioritize

Order tasks by:
- Dependencies (what must be done first)
- Risk (start with foundational, lower-risk tasks)
- User value (early wins)

### 3. Execute Tasks

For each task:
1. Understand what needs to be built
2. Make the code changes
3. Run tests/verification
4. Commit if appropriate

### 4. Verify Progress

After each task:
- Confirm it meets success criteria
- Update task status
- Check for side effects

### 5. Handle Blockers

If blocked:
- Document the blocker clearly
- Suggest options for unblocking
- Don't move on until resolved or explicitly directed

## Guidelines

- Keep changes focused and atomic
- Run tests frequently
- Commit logical units of work
- Don't skip verification
`,
  };
}

export function getSpeckitSpecifyCommandTemplate(): CommandTemplate {
  return {
    name: 'Ghostwire: Speckit Specify',
    description: 'Create detailed requirement specifications',
    category: 'Speckit',
    tags: ['speckit', 'specify', 'requirements', 'scenarios'],
    content: `## Goal

Create detailed, testable requirement specifications with scenarios.

## Steps

### 1. Gather Context

- Read any existing documentation
- Talk to stakeholders
- Understand the problem space

### 2. Define Requirements

For each requirement:
- **Name**: Clear, imperative statement
- **Description**: What and why
- **Acceptance Criteria**: Measurable conditions

### 3. Write Scenarios

Use Gherkin-style or simple WHEN/THEN:

#### Scenario: <name>
- **WHEN** <condition>
- **THEN** <expected outcome>

Each requirement should have at least one scenario.

### 4. Identify Edge Cases

- What happens at boundaries?
- What about error conditions?
- What about concurrent access?

### 5. Review for Completeness

- Are requirements testable?
- Are scenarios specific enough?
- Are there gaps in coverage?

## Output

Create spec.md with:
- Overview
- Functional Requirements (with scenarios)
- Non-Functional Requirements
- User Stories
- Edge Cases
`,
  };
}

export function getSpeckitTasksCommandTemplate(): CommandTemplate {
  return {
    name: 'Ghostwire: Speckit Tasks',
    description: 'Create implementation task lists',
    category: 'Speckit',
    tags: ['speckit', 'tasks', 'work-breakdown', 'implementation'],
    content: `## Goal

Break down the specification into actionable implementation tasks.

## Steps

### 1. Review Spec

Read the spec.md and understand:
- All requirements
- User stories
- Acceptance criteria
- Edge cases

### 2. Identify Tasks

For each requirement/story, create tasks:
- Implementation tasks
- Testing tasks
- Documentation tasks

### 3. Structure Tasks

Organize into phases:
- Foundation/setup
- Core implementation
- Integration
- Testing
- Deployment

### 4. Define Dependencies

Mark which tasks:
- Can run in parallel [P]
- Must run sequentially
- Block other tasks

### 5. Estimate Effort

For each task, consider:
- Complexity (1-5)
- Estimated time
- Prerequisites

## Output

Create tasks.md with:
- Phase structure
- Task descriptions
- Dependencies noted
- Checkbox format for tracking
`,
  };
}

export function getSpeckitConstitutionCommandTemplate(): CommandTemplate {
  return {
    name: 'Ghostwire: Speckit Constitution',
    description: 'Establish project conventions and standards',
    category: 'Speckit',
    tags: ['speckit', 'constitution', 'standards', 'conventions'],
    content: `## Goal

Establish project conventions, coding standards, and operational principles.

## Steps

### 1. Gather Existing Standards

Review:
- README.md
- CONTRIBUTING.md
- Any existing style guides
- Linting configurations

### 2. Define Key Areas

Establish standards for:
- Code style and formatting
- Naming conventions
- File organization
- Git workflow
- Testing requirements
- Documentation expectations
- Code review process

### 3. Draft Principles

For each area, write:
- **Principle**: Clear statement
- **Rationale**: Why this matters
- **Examples**: Do and don't examples

### 4. Make It Actionable

Ensure principles can be:
- Verified automatically where possible
- Enforced through tooling
- Understood by new team members

## Output

Create constitution.md with:
- Introduction and purpose
- Code standards
- Process standards
- Quality gates
- Enforcement mechanisms
`,
  };
}
