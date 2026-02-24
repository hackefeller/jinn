---
title: Command Template Refactoring Plan
type: plan
date: '2026-02-24'
status: completed
---

# Command Template Refactoring Plan

**Complexity**: Medium  
**Total Effort**: 2-3 hours

---

## Context

We have 30 command definitions in `src/execution/features/commands/commands.ts` (lines 259-593) that use double-wrapped `<command-instruction>` tags. The current pattern interpolates templates with backticks, but templates already contain their own `<command-instruction>` wrappers.

This refactoring removes the redundant outer wrapping by using direct template references instead.

---

## Task Dependency Graph

| Task                                          | Depends On | Reason                                                  |
| --------------------------------------------- | ---------- | ------------------------------------------------------- |
| Task 1: Refactor Plugin Commands (13 cmds)    | None       | Independent refactoring, no prerequisites               |
| Task 2: Refactor Workflow Commands (5 cmds)   | None       | Independent refactoring, no prerequisites               |
| Task 3: Refactor Spec Commands (8 cmds)       | None       | Independent refactoring, no prerequisites               |
| Task 4: Refactor Resolution Commands (3 cmds) | None       | Independent refactoring, no prerequisites               |
| Task 5: Refactor Additional Commands (2 cmds) | None       | Independent refactoring, no prerequisites               |
| Task 6: Refactor Project Commands (1 cmd)     | None       | Independent refactoring, no prerequisites               |
| Task 7: TypeCheck All Changes                 | Task 1-6   | All refactorings must complete before type verification |
| Task 8: Run Test Suite                        | Task 7     | TypeCheck must pass before running tests                |
| Task 9: Final Verification & Commit           | Task 8     | Tests must pass before committing                       |

---

## Parallel Execution Graph

**Wave 1 (All refactorings can run in parallel - 0 dependencies)**

- Task 1: Refactor Plugin Commands (13 commands, no deps)
- Task 2: Refactor Workflow Commands (5 commands, no deps)
- Task 3: Refactor Spec Commands (8 commands, no deps)
- Task 4: Refactor Resolution Commands (3 commands, no deps)
- Task 5: Refactor Additional Commands (2 commands, no deps)
- Task 6: Refactor Project Commands (1 command, no deps)

**Wave 2 (Verification - sequential)**

- Task 7: TypeCheck All Changes (depends: Wave 1)
- Task 8: Run Test Suite (depends: Task 7)
- Task 9: Final Verification & Commit (depends: Task 8)

**Critical Path**: Task 1-6 (parallel) → Task 7 → Task 8 → Task 9  
**Estimated Parallel Speedup**: 50% faster than sequential

---

## Tasks

### Task 1: Refactor Plugin Commands (13 commands)

**Description**: Update 13 plugin command definitions to use direct template references.

**Commands**: ghostwire:plan-review, ghostwire:changelog, ghostwire:create-agent-skill, ghostwire:deepen-plan, ghostwire:generate-command, ghostwire:heal-skill, ghostwire:lfg, ghostwire:quiz-me, ghostwire:report-bug, ghostwire:reproduce-bug, ghostwire:sync-tutorials, ghostwire:teach-me, ghostwire:triage

**Delegation Recommendation**:

- Category: `quick`
- Skills: []

**Depends On**: None

**Acceptance Criteria**:

- ✅ All 13 commands use direct template reference (no backticks)
- ✅ All `description` and `argumentHint` fields preserved
- ✅ File compiles with typecheck

**Effort**: 20 minutes

---

### Task 2: Refactor Workflow Commands (5 commands)

**Description**: Update 5 workflow command definitions to use direct template references.

**Commands**: ghostwire:workflows:brainstorm, ghostwire:workflows:learnings, ghostwire:workflows:review, ghostwire:workflows:work, ghostwire:workflows:plan (v2)

**Delegation Recommendation**:

- Category: `quick`
- Skills: []

**Depends On**: None

**Acceptance Criteria**:

- ✅ All 5 workflow commands use direct template reference
- ✅ Metadata preserved
- ✅ Compiles

**Effort**: 12 minutes

---

### Task 3: Refactor Spec Commands (8 commands)

**Description**: Update 8 spec command definitions to use direct template references.

**Commands**: ghostwire:spec:create, ghostwire:spec:plan, ghostwire:spec:tasks, ghostwire:spec:implement, ghostwire:spec:clarify, ghostwire:spec:analyze, ghostwire:spec:checklist, ghostwire:spec:to-issues

**Delegation Recommendation**:

- Category: `quick`
- Skills: []

**Depends On**: None

**Acceptance Criteria**:

- ✅ All 8 spec commands use direct template reference
- ✅ Metadata fields preserved
- ✅ Compiles

**Effort**: 16 minutes

---

### Task 4: Refactor Parallel Resolution Commands (3 commands)

**Description**: Update 3 parallel resolution command definitions.

**Commands**: ghostwire:resolve-parallel, ghostwire:resolve-pr-parallel, ghostwire:resolve-todo-parallel

**Delegation Recommendation**:

- Category: `quick`
- Skills: []

**Depends On**: None

**Acceptance Criteria**:

- ✅ All 3 commands updated
- ✅ Metadata preserved
- ✅ Compiles

**Effort**: 6 minutes

---

### Task 5: Refactor Additional Plugin Commands (2 commands)

**Description**: Update 2 additional plugin commands.

**Commands**: ghostwire:xcode-test, ghostwire:deploy-docs

**Delegation Recommendation**:

- Category: `quick`
- Skills: []

**Depends On**: None

**Acceptance Criteria**:

- ✅ 2 commands updated
- ✅ Metadata preserved
- ✅ Compiles

**Effort**: 4 minutes

---

### Task 6: Refactor Project Commands (1 command)

**Description**: Update 1 project command definition.

**Commands**: ghostwire:project:constitution

**Delegation Recommendation**:

- Category: `quick`
- Skills: []

**Depends On**: None

**Acceptance Criteria**:

- ✅ Command updated to direct template reference
- ✅ Metadata preserved
- ✅ Compiles

**Effort**: 2 minutes

---

### Task 7: TypeCheck All Changes

**Description**: Run TypeScript type checking to verify all refactored commands.

**Command**: `bun run typecheck`

**Delegation Recommendation**:

- Category: `quick`
- Skills: []

**Depends On**: Task 1-6

**Acceptance Criteria**:

- ✅ 0 type errors reported
- ✅ All command definitions have correct types
- ✅ No "unused import" warnings

**Effort**: 5 minutes

---

### Task 8: Run Command Test Suite

**Description**: Execute command-specific tests to validate definitions and schemas.

**Command**: `bun test tests/commands.test.ts`

**Delegation Recommendation**:

- Category: `quick`
- Skills: []

**Depends On**: Task 7

**Acceptance Criteria**:

- ✅ All tests pass
- ✅ 180+ assertions pass
- ✅ Command schema validation passes for all refactored commands

**Effort**: 10 minutes

---

### Task 9: Final Verification & Create Commit

**Description**: Final verification and create atomic commit.

**Delegation Recommendation**:

- Category: `quick`
- Skills: [`git-master`]

**Depends On**: Task 8

**Acceptance Criteria**:

- ✅ All verification steps completed
- ✅ Atomic commit created with clear message
- ✅ Working directory clean after commit

**Effort**: 8 minutes

---

## Success Criteria

✅ All 30 command definitions use direct template references  
✅ No double-wrapping of `<command-instruction>` tags  
✅ All metadata fields (description, argumentHint, agent) preserved  
✅ `bun run typecheck` passes with 0 errors  
✅ `bun test tests/commands.test.ts` passes (180+ assertions)  
✅ Atomic commit created with clear message

---
