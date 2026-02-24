---
title: Workflow Stage Diagram & User Journey
type: diagram
date: '2026-02-23'
status: completed
---

# Workflow Stage Diagram & User Journey

## Task-Driven Architecture Overview

```
The key insight: Plans must be broken down into ATOMIC TASKS
with metadata for DELEGATION and PARALLELIZATION

OLD (Simple Checklist):
  Plan → Checklist Tasks (just text) → Sequential execution

NEW (Task-Driven):
  Plan → Structured Tasks (JSON with metadata)
       → Analyze dependencies → Parallel delegation → Track progress
```

## Current State: Confusing Command Names

```
User's mental model:

  What do I want?
    ├─ I have a vague idea      → ???  (ultrawork-loop? workflows:plan?)
    ├─ I want to plan it out    → workflows:plan (✓ clear)
    ├─ I want to break it down  → ???  (workflows:create? or is this optional?)
    ├─ I want to execute it     → ???  (jack-in-work? workflows:work? ultrawork-loop?)
    └─ I want to review it      → workflows:review (✓ clear)

Problem: Execution phase has TWO confusing options
Problem: Breakdown phase is unclear/optional
```

## Proposed State: Clear Workflow Stages with Task-Driven Execution

```
User's journey (CLEAR):

Step 1: PLAN (Define what to build)
  └─ /ghostwire:workflows:plan "implement dark mode"
      Output: .ghostwire/plans/implement-dark-mode.md
      (High-level plan goals, scope, constraints)

Step 2: BREAKDOWN (Structure the plan as atomic tasks)
  └─ /ghostwire:workflows:create
      Input: Plan from Step 1
      Output: Updated plan with STRUCTURED TASK LIST (JSON format)
      Each task includes:
        ├─ id, subject, description
        ├─ owner (subagent category)
        ├─ category (visual-engineering, ultrabrain, etc.)
        ├─ skills (required skills for task)
        ├─ estimatedEffort (2h, 30m, etc.)
        ├─ blockedBy/blocks (dependency graph)
        ├─ wave (manual parallelization override - optional)
        └─ status (pending → in_progress → completed)

Step 3: EXECUTE (Delegate tasks to subagents, run in parallel)
  └─ /ghostwire:workflows:execute
      Input: Plan with structured tasks
      Process:
        1. Parse task list (JSON)
        2. Analyze dependencies → Determine execution order
        3. GROUP TASKS INTO WAVES:
           - AUTO: Orchestrator auto-groups independent tasks (respects dependencies)
           - MANUAL OVERRIDE: Use "wave" field to force grouping
        4. DELEGATE: For each task, invoke delegate_task(category, skills, description)
        5. RUN IN PARALLEL: Execute independent tasks concurrently
        6. TRACK: Update task status as work completes
      Output: Completed plan with all tasks marked "completed"
      Note: Can be invoked multiple times to resume incomplete work

Step 4: REVIEW (Verify & document)
  ├─ /ghostwire:workflows:review
  ├─ /ghostwire:workflows:learnings
  └─ (optional) Code review, QA, etc.

Step 5: COMPLETE (Wrap up)
  └─ /ghostwire:workflows:complete

Helper Commands:
  ├─ /ghostwire:work:cancel        (Cancel current work loop)
  ├─ /ghostwire:work:loop          (Ad-hoc work - no plan needed)
  ├─ /ghostwire:workflows:stop     (Stop all continuation)
  └─ /ghostwire:workflows:status   (Check workflow status)
```

## Parallelization Strategy: Hybrid (Auto + Manual Override)

```
DEFAULT: Orchestrator analyzes task dependencies automatically

Example Plan:
  Task 1: Setup DB     (blockedBy: [])         [Wave 1 - no deps]
  Task 2: Create API   (blockedBy: [Task1])    [Wave 2 - depends on 1]
  Task 3: Frontend     (blockedBy: [Task1])    [Wave 2 - depends on 1]
  Task 4: Tests        (blockedBy: [2, 3])     [Wave 3 - depends on 2,3]

Auto-determined execution:
  WAVE 1 (parallel):  Task 1
  WAVE 2 (parallel):  Task 2, Task 3       ← These can run together!
  WAVE 3 (parallel):  Task 4

MANUAL OVERRIDE: User can specify "wave" field to override:
  Task 1: wave: 1
  Task 2: wave: 2
  Task 3: wave: 2     ← Force Task 3 to wait for Task 2 (even if no dependency)
  Task 4: wave: 4     ← User knows Task 4 should wait longer

Result: Respects user's wave grouping instead of auto-parallelization
```

User's mental model:

What do I want?
├─ I have a vague idea → ??? (ultrawork-loop? workflows:plan?)
├─ I want to plan it out → workflows:plan (✓ clear)
├─ I want to execute it → ??? (jack-in-work? workflows:work? ultrawork-loop?)
└─ I want to review it → workflows:review (✓ clear)

Problem: Execution phase has TWO confusing options

```

## Proposed State: Clear Workflow Stages

```

User's journey (CLEAR):

Step 1: PLAN (Define what to build)
└─ /ghostwire:workflows:plan "implement dark mode"
Output: .ghostwire/plans/implement-dark-mode.md

Step 2: BREAKDOWN (Optional - structure the plan)
└─ /ghostwire:workflows:breakdown
Output: Updated plan with tasks/subtasks

Step 3: EXECUTE (Choose your path)
├─ PATH A: Execute the plan
│ └─ /ghostwire:workflows:execute
│ Reads plan → Executes tasks → Cross-session tracking
│
└─ PATH B: Quick ad-hoc work (no plan needed)
└─ /ghostwire:work:loop "fix this bug"
Iterative loop → Completion promise → No plan

Step 4: REVIEW (Verify & document)
├─ /ghostwire:workflows:review
├─ /ghostwire:workflows:learnings
└─ (optional) Code review, QA, etc.

Step 5: COMPLETE (Wrap up)
└─ /ghostwire:workflows:complete

Helper Commands:
├─ /ghostwire:work:cancel (Cancel current work loop)
├─ /ghostwire:workflows:stop (Stop all continuation)
└─ /ghostwire:workflows:status (Check workflow status)

```

## Command Namespace Visualization

```

/ghostwire/
├── workflows/ ← Planning & coordinated work (TASK-DRIVEN)
│ ├── plan (Phase 1 - Plan: High-level plan)
│ ├── create (Phase 2 - Breakdown: Structured tasks with metadata)
│ ├── execute (Phase 3 - Execute: Delegate tasks, run parallel)
│ ├── review (Phase 4 - Review: Code review)
│ ├── learnings (Phase 4 - Document: Learnings)
│ ├── complete (Phase 5 - Complete: Finalize)
│ ├── stop (Helper - Stop continuation)
│ └── status (Helper - Check status)
│
├── work/ ← Ad-hoc, exploration, quick tasks (NON-PLANNED)
│ ├── loop (Phase 3 - Execute: Iterative loop, no plan)
│ └── cancel (Helper - Cancel loop)
│
├── git/ ← Git operations
│ ├── smart-commit
│ ├── branch
│ ├── merge
│ └── cleanup
│
├── code/ ← Code quality
│ ├── refactor
│ ├── review
│ ├── optimize
│ └── format
│
└── [other namespaces...]

```

## User Decision Tree

```

I want to work on something
│
├─ Do I have a plan?
│ │
│ ├─ YES
│ │ ├─ Has it been broken down into tasks? (workflows:create)
│ │ │ │
│ │ │ ├─ YES → /ghostwire:workflows:execute
│ │ │ │ (Reads plan → Delegates tasks → Parallel execution)
│ │ │ │
│ │ │ └─ NO → /ghostwire:workflows:create
│ │ │ (Break plan into tasks) → Then workflows:execute
│ │ │
│ │ └─ Note: workflows:create now MANDATORY, outputs structured tasks
│ │
│ └─ NO
│ ├─ Do I want to create a plan first?
│ │ │
│ │ ├─ YES
│ │ │ └─ /ghostwire:workflows:plan "do this thing"
│ │ │ → /ghostwire:workflows:create
│ │ │ → /ghostwire:workflows:execute
│ │ │
│ │ └─ NO
│ │ └─ /ghostwire:work:loop "do this thing"
│ │ (Iterative loop, no plan, simple)
│ │
│ └─ Use work:loop for quick fixes or exploration
│
└─ When done, review and complete
└─ /ghostwire:workflows:review
└─ /ghostwire:workflows:learnings
└─ /ghostwire:workflows:complete

```

## Migration Matrix: Old vs New

```

┌──────────────────────────────────────────────────────────────────────────────┐
│ COMMAND RENAMING MATRIX │
├──────────────────────┬──────────────────────┬──────────────────┬────────┬────┤
│ OLD COMMAND │ NEW COMMAND │ WORKFLOW PHASE │ STATUS │KEY │
├──────────────────────┼──────────────────────┼──────────────────┼────────┼────┤
│ /ghostwire: │ /ghostwire: │ Phase 1: Plan │ KEEP │ ✓ │
│ workflows:plan │ workflows:plan │ (Unchanged) │ │ │
├──────────────────────┼──────────────────────┼──────────────────┼────────┼────┤
│ /ghostwire: │ /ghostwire: │ Phase 2: │ KEEP │ ⚡ │
│ workflows:create │ workflows:create │ Breakdown │ [TASK] │ │
│ (optional breakdown) │ (MANDATORY tasks) │ (TASK-DRIVEN!) │ [+ALI] │ │
├──────────────────────┼──────────────────────┼──────────────────┼────────┼────┤
│ /ghostwire: │ /ghostwire: │ Phase 3a: │ RENAME │ 🎯 │
│ jack-in-work │ workflows:execute │ Execute Planned │ [+ALI] │ │
│ (simple exec) │ (task-delegated) │ (TASK-DRIVEN!) │ │ │
├──────────────────────┼──────────────────────┼──────────────────┼────────┼────┤
│ /ghostwire: │ /ghostwire: │ Phase 3b: │ RENAME │ 🔄 │
│ ultrawork-loop │ work:loop │ Execute Ad-hoc │ [+ALI] │ │
│ (self-loop) │ (no plan) │ (non-planned) │ │ │
├──────────────────────┼──────────────────────┼──────────────────┼────────┼────┤
│ /ghostwire: │ /ghostwire: │ Phase 4: Review │ KEEP │ ✓ │
│ workflows:review │ workflows:review │ (Unchanged) │ │ │
├──────────────────────┼──────────────────────┼──────────────────┼────────┼────┤
│ /ghostwire: │ /ghostwire: │ Phase 4: Docs │ KEEP │ ✓ │
│ workflows:learnings │ workflows:learnings │ (Unchanged) │ │ │
├──────────────────────┼──────────────────────┼──────────────────┼────────┼────┤
│ /ghostwire: │ /ghostwire: │ Phase 5: │ KEEP │ ✓ │
│ workflows:complete │ workflows:complete │ Complete │ │ │
├──────────────────────┼──────────────────────┼──────────────────┼────────┼────┤
│ /ghostwire: │ /ghostwire: │ Helper: │ RENAME │ 🛑 │
│ cancel-ultrawork │ work:cancel │ Cancel Loop │ [+ALI] │ │
├──────────────────────┼──────────────────────┼──────────────────┼────────┼────┤
│ /ghostwire: │ /ghostwire: │ Helper: │ RENAME │ ⏹️ │
│ stop-continuation │ workflows:stop │ Stop All │ [+ALI] │ │
└──────────────────────┴──────────────────────┴──────────────────┴────────┴────┘

Legend:
KEEP = Command name unchanged
RENAME = Command renamed, [+ALI] = old name kept as alias for backward compat

Task-Driven Architecture Indicators:
⚡ = workflows:create now MANDATORY, outputs structured JSON tasks
🎯 = workflows:execute now delegates individual tasks to subagents
🔄 = work:loop for non-planned iterative work
🛑 = work:cancel for canceling loops
⏹️ = workflows:stop for stopping all continuation

```

## Example User Journeys

### Journey 1: Planned Work (Complex Feature) - TASK-DRIVEN

```

User: "I want to implement authentication with JWT"

Step 1: Create a plan
/ghostwire:workflows:plan "Add JWT authentication to API"
↓
Agent generates: .ghostwire/plans/add-jwt-auth.md
(High-level goals, scope, constraints)

Step 2: Break down into tasks (MANDATORY - with metadata)
/ghostwire:workflows:create
↓
Agent produces STRUCTURED TASK LIST:

Task 001: Set up database schema - owner: backend - category: ultrabrain - skills: [database-design, sql] - estimatedEffort: 2h - blockedBy: [] - blocks: [task-002, task-003] - wave: 1

Task 002: Create auth middleware - owner: backend - category: ultrabrain - skills: [express, jwt] - estimatedEffort: 1.5h - blockedBy: [task-001] - blocks: [task-005] - wave: 2

Task 003: Create login endpoint - owner: backend - category: ultrabrain - skills: [express, jwt] - estimatedEffort: 2h - blockedBy: [task-001] - blocks: [task-005] - wave: 2

Task 004: Frontend login form - owner: frontend - category: visual-engineering - skills: [react, forms] - estimatedEffort: 1.5h - blockedBy: [task-002] (needs endpoint) - blocks: [task-005] - wave: 3

Task 005: Write tests - owner: qa - category: ultrabrain - skills: [testing, jest] - estimatedEffort: 2h - blockedBy: [task-002, task-003, task-004] - blocks: [] - wave: 4

Step 3: Execute tasks (TASK-DRIVEN DELEGATION with PARALLEL execution)
/ghostwire:workflows:execute
↓
Orchestrator analyzes dependencies:
WAVE 1 (parallel): Task 001
WAVE 2 (parallel): Task 002, Task 003 ← Independent!
WAVE 3 (parallel): Task 004
WAVE 4 (parallel): Task 005

Then delegates to subagents:
Wave 1: backend subagent handles task-001
Wave 2: backend subagent handles task-002 & task-003 in parallel
Wave 3: frontend subagent handles task-004
Wave 4: qa subagent handles task-005

Progress tracking (plan updates in real-time):
[✓] task-001: Set up database schema (COMPLETED)
[✓] task-002: Create auth middleware (COMPLETED)
[✓] task-003: Create login endpoint (COMPLETED)
[✓] task-004: Frontend login form (COMPLETED)
[✓] task-005: Write tests (COMPLETED)

Step 4: Review and document
/ghostwire:workflows:review
/ghostwire:workflows:learnings
↓
Agent reviews code changes and documents what was learned

Step 5: Complete workflow
/ghostwire:workflows:complete
↓
Workflow finalized, state cleaned up

KEY INSIGHT: Each task was delegated to the right subagent AND tasks ran in parallel
where possible - no sequential execution needed!

```

### Journey 2: Quick Ad-hoc Work (Bug Fix)

```

User: "Fix this bug quickly"

Path: Skip planning, go straight to work
/ghostwire:work:loop "Fix the null pointer exception in PaymentService"
↓
Agent iterates until: <promise>DONE</promise>
↓
No plan created, no cross-session tracking needed
Simple and quick

```

### Journey 3: Mid-workflow Resume (Across Sessions)

```

Session 1: Start execution
/ghostwire:workflows:execute
(works on 3 tasks, then stops)

Session 2: Resume from same point
/ghostwire:workflows:execute
(picks up where Session 1 left off, reads ultrawork.json)
(continues with remaining tasks)

```

## Clarity Improvements

### Before (Confusing)

```

User's questions:
"What does 'jack-in-work' mean?" ❌ Jargon, unclear
"Should I use ultrawork-loop or jack-in-work?" ❌ No guidance
"What phase am I in?" ❌ Not obvious
"How do I resume a workflow?" ❌ Not obvious

```

### After (Clear)

```

User's questions:
"What does 'workflows:execute' mean?" ✓ Clear: Execute workflow
"Should I use work:loop or workflows:execute?" ✓ Clear: Has plan? Use execute. No plan? Use loop.
"What phase am I in?" ✓ Clear: Phase in command name (workflows/work)
"How do I resume a workflow?" ✓ Clear: Use workflows:execute again

```

## Benefits of This Naming Scheme

1. **Self-documenting**: Command name tells you the workflow phase
2. **Predictable**: All workflow commands under `workflows:`, all ad-hoc under `work:`
3. **Progressive**: Names guide user from Plan → Breakdown → Execute → Review → Complete
4. **Familiar**: Matches real-world workflow terminology
5. **Flexible**: Keeps both planned and ad-hoc paths clear and separate
6. **Backward compatible**: Old names can work as aliases during transition
```
