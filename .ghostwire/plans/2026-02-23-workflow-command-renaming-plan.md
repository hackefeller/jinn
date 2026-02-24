# Workflow Command Renaming Plan

**Date**: 2026-02-23  
**Branch**: `refactor/workflow-command-naming`  
**Objective**: Rename commands to make workflow stages explicit and guide users through the natural workflow progression

---

## Executive Summary

The current command naming (`ultrawork-loop`, `jack-in-work`, `workflows:work`) is confusing because:

1. Users don't understand which workflow phase each command belongs to
2. Command names don't indicate their purpose or relationship to other commands
3. There's no clear progression path through the workflow stages
4. Jargon-heavy names (`jack-in-work`) don't communicate intent

**Solution**: Create a workflow-aware command hierarchy that guides users through: PLAN → BREAKDOWN → EXECUTE → REVIEW → COMPLETE

---

## Proposed Workflow Stages

### **CRITICAL: Task-Driven Architecture**

All workflows MUST be task-driven. The BREAKDOWN phase is **MANDATORY (not optional)**, and:

- Plans are decomposed into **atomic tasks** suitable for subagent delegation
- Each task has structured metadata: ID, subject, description, dependencies, owner, category, skills, estimated effort
- Tasks are stored in **JSON format** for reliable parsing and subagent routing
- **Hybrid parallelization**: Orchestrator auto-determines parallelization based on dependencies, but humans can manually specify "wave" groupings to override
- Tasks enable **parallel execution** of independent work across subagents
- Tasks support **cross-session resumption** (pick up where you left off)

### Stage 1: PLAN

Gather requirements, understand the problem, create a high-level plan.

- **Command**: `/ghostwire:workflows:plan`
- **Description**: Transform feature descriptions into implementation plans
- **Output**: `.ghostwire/plans/{plan-name}.md` with plan goals, scope, constraints
- **Note**: Plan is high-level only (NOT task-level detail)

### Stage 2: BREAKDOWN (MANDATORY - Integrated into workflows:create)

Break plan into actionable tasks **with structured metadata for subagent delegation**.

- **Command**: `/ghostwire:workflows:create` (unchanged, but now mandatory breakdown happens inside)
- **Description**: Break down plan into atomic tasks with dependencies and delegation metadata
- **Output**: Updated plan file with:
  - Structured task list (JSON blocks, not just checkboxes)
  - Task metadata: id, subject, description, owner (subagent category), category, skills, blockedBy, blocks, estimatedEffort, wave
  - Dependency graph (which tasks block which others)
  - Parallel execution plan (wave 1, 2, 3, etc. for auto-grouped tasks)
- **Key difference from old "workflows:create"**:
  - OLD: Optional breakdown, tasks were just checkboxes
  - NEW: MANDATORY breakdown with full structured metadata for delegation
  - Enables orchestrator to delegate individual tasks to appropriate subagents
  - Enables parallel execution of independent tasks
- **Example task structure in plan**:
  ```json
  {
    "id": "task-001",
    "subject": "Set up database schema",
    "description": "Create auth tables (users, tokens, roles) with proper indexes",
    "owner": "backend",
    "category": "ultrabrain",
    "skills": ["database-design"],
    "estimatedEffort": "2h",
    "blockedBy": [],
    "blocks": ["task-002", "task-003"],
    "wave": 1
  }
  ```

### Stage 3: EXECUTE

Execute the planned tasks (using task-driven architecture).

- **Command**: `/ghostwire:workflows:execute` (rename from jack-in-work)
- **Description**: Execute planned tasks from workflow plan (with atomic task delegation)
- **Process**:
  1. Read plan file
  2. Parse structured task list
  3. Determine execution order and parallelization (hybrid: auto + manual waves)
  4. **Delegate individual tasks to subagents** based on category/skills metadata
  5. Run tasks in parallel (respecting dependencies)
  6. Track progress for cross-session resumption
- **Alternative path for ad-hoc work** (no plan):
  - **Command**: `/ghostwire:work:loop` (rename from ultrawork-loop)
  - No plan required, no task breakdown needed
  - Iterative loop until completion promise met
  - For quick fixes, exploration, or when planning overhead not worth it

### Stage 4: REVIEW

Review code, verify functionality, document learnings.

- **Commands**:
  - `/ghostwire:workflows:review` (already exists)
  - `/ghostwire:workflows:learnings` (already exists)

### Stage 5: COMPLETE

Finalize the workflow, merge changes, cleanup state.

- **Command**: `/ghostwire:workflows:complete` (already exists)

---

## Command Mapping: Old → New

| Phase             | Old Command           | New Command                                 | Notes                                                              |
| ----------------- | --------------------- | ------------------------------------------- | ------------------------------------------------------------------ |
| PLAN              | `workflows:plan`      | **KEEP: `/ghostwire:workflows:plan`**       | No change needed                                                   |
| BREAKDOWN         | `workflows:create`    | **KEEP: `/ghostwire:workflows:create`**     | Now MANDATORY with structured task metadata (integrated breakdown) |
| EXECUTE (Planned) | `jack-in-work`        | **RENAME → `/ghostwire:workflows:execute`** | Consolidates into workflows namespace, task-driven execution       |
| EXECUTE (Ad-hoc)  | `ultrawork-loop`      | **RENAME → `/ghostwire:work:loop`**         | New namespace for non-workflow work                                |
| REVIEW            | `workflows:review`    | **KEEP: `/ghostwire:workflows:review`**     | Already clear                                                      |
| REVIEW (Docs)     | `workflows:learnings` | **KEEP: `/ghostwire:workflows:learnings`**  | Already clear                                                      |
| COMPLETE          | `workflows:complete`  | **KEEP: `/ghostwire:workflows:complete`**   | Already clear                                                      |
| CLEANUP           | `cancel-ultrawork`    | **RENAME → `/ghostwire:work:cancel`**       | Move under work namespace                                          |
| UTILITY           | `stop-continuation`   | **RENAME → `/ghostwire:workflows:stop`**    | Move under workflows for consistency                               |

---

## Alternative: Flat Namespace (If preferred)

If nesting is too deep, consider:

| Phase             | Command                |
| ----------------- | ---------------------- |
| PLAN              | `/ghostwire:plan`      |
| BREAKDOWN         | `/ghostwire:breakdown` |
| EXECUTE (Planned) | `/ghostwire:execute`   |
| EXECUTE (Ad-hoc)  | `/ghostwire:loop`      |
| REVIEW            | `/ghostwire:review`    |
| LEARNINGS         | `/ghostwire:learnings` |
| COMPLETE          | `/ghostwire:complete`  |
| CANCEL WORK       | `/ghostwire:cancel`    |

**Recommendation**: Use the **first option (nested)** because:

- Keeps workflow commands grouped under `workflows:*`
- Keeps exploration commands grouped under `work:*`
- Maintains consistency with existing patterns (`git:*`, `code:*`, `project:*`)

---

## Implementation Tasks

### Task-Driven Execution Architecture

**Critical capability change for `/ghostwire:workflows:create` and `/ghostwire:workflows:execute`:**

#### workflows:create (BREAKDOWN phase) → Task structure output

- Input: Existing plan (from `workflows:plan`)
- Output: **Structured task list in JSON format** (appended to plan file)
- Task metadata MUST include:
  - `id`: Unique identifier (e.g., "task-001")
  - `subject`: Brief title (e.g., "Set up database schema")
  - `description`: Detailed description of what to do
  - `owner`: Subagent category/owner (e.g., "backend", "frontend", "devops")
  - `category`: Delegation category ("visual-engineering", "ultrabrain", "quick", "deep", "artistry")
  - `skills`: Array of skills needed (e.g., ["database-design", "sql"])
  - `estimatedEffort`: Time estimate (e.g., "2h", "30m")
  - `blockedBy`: Array of task IDs that must complete first (dependencies)
  - `blocks`: Array of task IDs that depend on this task
  - `wave`: Integer (1, 2, 3...) for manual parallelization groups (optional, overrides auto-parallelization)
  - `status`: "pending" | "in_progress" | "completed" (initially "pending")

#### workflows:execute (EXECUTE phase) → Task-driven delegation

- Input: Plan file with structured task list
- Process:
  1. Parse task list from plan
  2. Determine execution order:
     - By default: Orchestrator analyzes dependencies and parallelizes automatically
     - If `wave` specified: Use manual wave groupings instead
     - Respects `blockedBy`/`blocks` relationships
  3. **Delegate tasks to subagents**:
     - Group tasks by `category` and `skills`
     - Use `delegate_task(category=X, load_skills=Y, description=Z)` for each task
     - Run independent tasks in parallel (across multiple subagents)
  4. Track progress:
     - Update task status in plan file as work completes
     - Enable cross-session resumption (pick up incomplete tasks)
  5. Output: Completed plan with all tasks marked "completed"

### Phase 1: Command Definition Changes (10 files)

#### 1.1 Update Command Names and Descriptions

**File**: `src/execution/features/commands/commands.ts`

Changes:

```typescript
// KEEP - but update description to mention task-driven execution
"ghostwire:workflows:create": {
  description: "Break down workflow plan into atomic tasks with delegation metadata [Phase: BREAKDOWN]",
  agent: "orchestrator",
  // ... ensure this now REQUIRES task structure output
}

// RENAME
"ghostwire:jack-in-work": {  // OLD
// becomes:
"ghostwire:workflows:execute": {
  description: "Execute planned tasks from workflow plan (task-driven, with subagent delegation) [Phase: EXECUTE]",
  agent: "orchestrator",
  // ... ensure this reads structured task list and delegates individual tasks
}

// RENAME
"ghostwire:ultrawork-loop": {  // OLD
// becomes:
"ghostwire:work:loop": {
  description: "Start iterative work loop until completion (ad-hoc, no plan required) [Phase: EXECUTE]",
  // ...
}

// RENAME
"ghostwire:cancel-ultrawork": {  // OLD
// becomes:
"ghostwire:work:cancel": {
  description: "Cancel active work loop",
  // ...
}

// RENAME
"ghostwire:stop-continuation": {  // OLD
// becomes:
"ghostwire:workflows:stop": {
  description: "Stop all workflow continuation mechanisms",
  // ...
}
```

#### 1.2 Update Type Definitions

**File**: `src/execution/features/commands/types.ts`

Update `CommandName` type union to include new names:

- Remove: `"ghostwire:jack-in-work"`, `"ghostwire:ultrawork-loop"`, `"ghostwire:cancel-ultrawork"`, `"ghostwire:stop-continuation"`
- Add: `"ghostwire:workflows:execute"`, `"ghostwire:work:loop"`, `"ghostwire:work:cancel"`, `"ghostwire:workflows:breakdown"`, `"ghostwire:workflows:stop"`

#### 1.3 Update Schema

**File**: `src/platform/config/schema.ts`

Update `CommandNameSchema` enum with same changes as types.ts

#### 1.4 Update Command Aliases (Backward Compatibility)

**File**: `src/index.ts`

In the `slashcommand` handler (around lines 760-794), update command matching:

```typescript
// Support both old and new names for now (with deprecation warnings)
if (
  (command === "ultrawork-loop" ||
    command === "ghostwire:ultrawork-loop" ||
    command === "work:loop" ||
    command === "ghostwire:work:loop") &&
  sessionID
) {
  // ... same implementation
}

if (
  (command === "jack-in-work" ||
    command === "ghostwire:jack-in-work" ||
    command === "workflows:execute" ||
    command === "ghostwire:workflows:execute") &&
  sessionID
) {
  // ... same implementation
}

// etc.
```

#### 1.5 Update Hook Exclusions

**File**: `src/orchestration/hooks/auto-slash-command/constants.ts`

Update `EXCLUDED_COMMANDS` set:

```typescript
export const EXCLUDED_COMMANDS = new Set([
  "ghostwire:ultrawork-loop", // OLD - keep for backward compat
  "ghostwire:work:loop", // NEW
  "ghostwire:cancel-ultrawork", // OLD - keep for backward compat
  "ghostwire:work:cancel", // NEW
  // etc.
]);
```

#### 1.6 Update Tests

**File**: `tests/regression.test.ts`

Add tests for both old and new command names to verify they still work.

#### 1.7 Update Documentation

**File**: `docs/commands.yml`

Update command entries with new names.

**File**: `docs/features.yml`

Update feature descriptions to reference new command names.

#### 1.8 Update LFG Command Template

**File**: `src/execution/features/commands/templates/lfg.ts`

Update any references to old command names:

```typescript
export const LFG_TEMPLATE = `
1. \`/ghostwire:work:loop "finish all tasks" --completion-promise "DONE"\`
2. \`/ghostwire:workflows:plan $ARGUMENTS\`
3. \`/ghostwire:workflows:breakdown\`
4. \`/ghostwire:workflows:execute\`
5. \`/ghostwire:workflows:review\`
...
`;
```

#### 1.9 Update Templates

**File**: `src/execution/features/commands/templates/start-work.ts`

- Rename to `execute-work.ts` (optional)
- Update references in template content

**File**: `src/execution/features/commands/templates/ultrawork-loop.ts`

- Rename to `work-loop.ts` (optional)
- Update template content with new command reference

#### 1.10 Update Hook Names (Optional - may not be necessary)

**File**: `src/index.ts`

Check if hooks need renaming or if they stay as-is (internal implementation).

### Phase 2: Implementation Handler Changes (2-3 files)

#### 2.1 Update Handler in src/index.ts

Update the slashcommand handler to check for new command names.

#### 2.2 Ensure start-work Hook still works

**File**: `src/orchestration/hooks/start-work/index.ts`

Should work unchanged (it's triggered by `ghostwire:workflows:execute` now).

#### 2.3 Ensure ultrawork-loop Hook still works

**File**: `src/orchestration/hooks/ultrawork-loop/index.ts`

Should work unchanged (it's triggered by `ghostwire:work:loop` now).

### Phase 3: Tests and Verification (2 files)

#### 3.1 Update Regression Tests

**File**: `tests/regression.test.ts`

Add tests for new command names:

```typescript
test("new workflow command names work", () => {
  expect(CommandNameSchema.safeParse("ghostwire:workflows:execute").success).toBe(true);
  expect(CommandNameSchema.safeParse("ghostwire:work:loop").success).toBe(true);
  expect(CommandNameSchema.safeParse("ghostwire:work:cancel").success).toBe(true);
  expect(CommandNameSchema.safeParse("ghostwire:workflows:stop").success).toBe(true);
  expect(CommandNameSchema.safeParse("ghostwire:workflows:breakdown").success).toBe(true);
});

test("old command names still work (backward compat)", () => {
  // Verify old names still function if kept as aliases
});
```

#### 3.2 Integration Tests

Create or update integration tests to verify:

- `/ghostwire:workflows:execute` works like old `/ghostwire:jack-in-work`
- `/ghostwire:work:loop` works like old `/ghostwire:ultrawork-loop`
- Command handlers route to correct hooks

### Phase 4: Documentation (3-4 files)

#### 4.1 Create Migration Guide

**New File**: `docs/migration/COMMAND_RENAMING.md`

```markdown
# Command Renaming Guide

## Workflow Command Changes

| Old Command                    | New Command                    | Notes                 |
| ------------------------------ | ------------------------------ | --------------------- |
| `/ghostwire:jack-in-work`      | `/ghostwire:workflows:execute` | Execute planned tasks |
| `/ghostwire:ultrawork-loop`    | `/ghostwire:work:loop`         | Ad-hoc iterative work |
| `/ghostwire:cancel-ultrawork`  | `/ghostwire:work:cancel`       | Cancel work loop      |
| `/ghostwire:stop-continuation` | `/ghostwire:workflows:stop`    | Stop all continuation |

**Timeline**: Old commands will continue working until version X.Y.Z

**Why**: New names clearly indicate workflow stages and make it obvious which phase you're in.
```

#### 4.2 Update AGENTS.md

**File**: `AGENTS.md`

Update any references to old command names in the knowledge base.

#### 4.3 Update Command Help

**File**: `src/execution/features/commands/commands.ts`

Update description text to include workflow stage information:

```typescript
"ghostwire:workflows:execute": {
  description:
    "Execute planned tasks from workflow plan [Phase: EXECUTE]",
  // ...
}

"ghostwire:work:loop": {
  description:
    "Start iterative work loop until completion - ad-hoc, no plan required [Phase: EXECUTE]",
  // ...
}
```

#### 4.4 Update README

**File**: `README.md`

Update any example commands in documentation.

---

## Implementation Order

1. **Command Definition Changes** (Phase 1) - Update types, schemas, command definitions
2. **Build & Type Check** - Ensure no TypeScript errors
3. **Handler Updates** (Phase 2) - Update command routing
4. **Tests** (Phase 3) - Add tests for new commands, verify backward compat
5. **Docs** (Phase 4) - Update all documentation
6. **Full Test Suite** - Run `bun test` to ensure no regressions
7. **Build** - Run `bun run build` to verify bundle is valid

---

## Backward Compatibility Strategy

### Key Decision: Integrated Breakdown (NOT separate command)

- Old: `/ghostwire:workflows:create` was optional, produced simple checklist
- New: `/ghostwire:workflows:create` is now MANDATORY and produces structured tasks
- This is a **capability enhancement**, not a breaking change
- Old behavior (simple checklist) still works, but new behavior (structured tasks) is recommended

### Task Structure Compatibility

- When `workflows:create` runs, it MUST output tasks in JSON format
- If old workflows don't have structured tasks, `workflows:execute` should:
  - Option A: Auto-convert simple checkboxes to minimal task structure
  - Option B: Require re-breakdown with new `workflows:create` command
- **Recommendation**: Option A (auto-convert for backward compat)

### Command Name Aliases

- Old commands still work but show deprecation warning
- Easier migration path for users
- Can remove old names in version X.0.0

**Old → New Aliases:**

- `ghostwire:jack-in-work` → `ghostwire:workflows:execute`
- `ghostwire:ultrawork-loop` → `ghostwire:work:loop`
- `ghostwire:cancel-ultrawork` → `ghostwire:work:cancel`
- `ghostwire:stop-continuation` → `ghostwire:workflows:stop`

---

## Success Criteria

### Command Renaming & Backward Compatibility

- [ ] All new commands are defined in `commands.ts`
- [ ] All new commands appear in `CommandNameSchema` and `CommandName` type
- [ ] Old command names still route to correct handlers (backward compat with deprecation warning)
- [ ] Build succeeds: `bun run build` exits with 0
- [ ] Regression tests specifically verify both old and new command names

### Task-Driven Architecture (Critical)

- [ ] `workflows:create` outputs **structured task list in JSON format** (not just checkboxes)
- [ ] Each task includes all required fields: id, subject, description, owner, category, skills, estimatedEffort, blockedBy, blocks, wave, status
- [ ] `workflows:execute` **reads structured task list** and delegates individual tasks to subagents
- [ ] `workflows:execute` uses `delegate_task(category=..., load_skills=..., description=...)` for each task
- [ ] Parallelization strategy implemented: **auto-determined by dependency analysis** (can be overridden by manual `wave` specification)
- [ ] Cross-session resumption works: `workflows:execute` can resume incomplete tasks across multiple invocations
- [ ] Task status is tracked and updated in plan file as work progresses

### Testing & Verification

- [ ] All tests pass: `bun test` shows no new failures
- [ ] Task structure schema is defined and validated (task JSON parse doesn't fail)
- [ ] Integration tests verify:
  - `workflows:create` produces valid task JSON
  - `workflows:execute` can parse and delegate tasks
  - Parallel execution respects dependencies
  - Cross-session resumption works correctly

### Documentation & Migration

- [ ] Documentation is updated with new command names
- [ ] Help text shows workflow stage for each command
- [ ] Migration guide explains task-driven architecture
- [ ] Example plan files show JSON task structure

---

## Files Modified Summary

| File                                                      | Type     | Changes                                         |
| --------------------------------------------------------- | -------- | ----------------------------------------------- |
| `src/execution/features/commands/commands.ts`             | Core     | Add new commands, keep old as comments/fallback |
| `src/execution/features/commands/types.ts`                | Core     | Update CommandName type                         |
| `src/platform/config/schema.ts`                           | Core     | Update CommandNameSchema                        |
| `src/index.ts`                                            | Core     | Update command handlers                         |
| `src/orchestration/hooks/auto-slash-command/constants.ts` | Core     | Update EXCLUDED_COMMANDS                        |
| `src/execution/features/commands/templates/*.ts`          | Template | Update references in templates                  |
| `tests/regression.test.ts`                                | Test     | Add new command tests                           |
| `docs/commands.yml`                                       | Doc      | Update command registry                         |
| `docs/features.yml`                                       | Doc      | Update feature descriptions                     |
| `AGENTS.md`                                               | Doc      | Update knowledge base                           |
| `README.md`                                               | Doc      | Update examples                                 |
| `docs/migration/COMMAND_RENAMING.md`                      | Doc      | New migration guide                             |

**Total files**: ~12 core + documentation files

---

## Risks & Mitigations

| Risk                                    | Mitigation                                  |
| --------------------------------------- | ------------------------------------------- |
| Users confused by old commands breaking | Keep aliases, show deprecation warning      |
| Incomplete migration of all references  | Grep/search for old names before committing |
| Tests fail due to naming changes        | Add tests for both old and new names        |
| Documentation gets out of sync          | Update docs in same PR                      |
| Schema validation fails                 | Run `bun run build` early to catch errors   |

---

## Next Steps

1. ✅ Create feature branch: `refactor/workflow-command-naming`
2. ⏭️ Implement Phase 1: Command definitions
3. ⏭️ Implement Phase 2: Handlers
4. ⏭️ Implement Phase 3: Tests
5. ⏭️ Implement Phase 4: Documentation
6. ⏭️ Run full test suite
7. ⏭️ Create PR and request review
8. ⏭️ Merge to main when approved

---

## Questions for Review

1. **Should we keep old command names as aliases indefinitely or deprecate them?**
2. **Do you prefer the nested namespace (workflows:_, work:_) or flat namespace?**
3. **Should workflows:breakdown be added or rename workflows:create?**
4. **Should we add deprecation warnings to old commands or silent fallback?**
5. **Any other commands that need renaming for clarity?**
