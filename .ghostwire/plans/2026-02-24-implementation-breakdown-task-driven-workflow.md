# Implementation Breakdown: Task-Driven Workflow Architecture

**Date**: 2026-02-24  
**Branch**: `refactor/workflow-command-naming`  
**Status**: Ready for Implementation  
**Previous Planning**: 
- `.ghostwire/plans/2026-02-23-workflow-command-renaming-plan.md`
- `.ghostwire/plans/2026-02-23-workflow-command-renaming-DIAGRAM.md`

---

## Overview: What We're Building

Transform the workflow system from simple command routing to a **task-driven architecture** where:
1. Plans are broken down into **structured, delegatable tasks** (JSON format)
2. Tasks have metadata for **subagent routing and parallelization**
3. `workflows:execute` **delegates individual tasks** to the right subagents
4. Tasks run in **parallel** based on dependencies (hybrid auto + manual override)
5. Work can be **resumed across sessions** by reading task status

---

## Atomic Tasks Breakdown

### PHASE 1: Command Definition Updates (No functional changes yet)

#### Task 1.1: Update CommandName Type & Schema
**Owner**: Backend (quick)  
**Category**: quick  
**Skills**: [typescript, zod]  
**Estimated Effort**: 30m  
**Dependencies**: None  
**Wave**: 1

**What to do**:
1. Open `src/execution/features/commands/types.ts`
2. Find the `CommandName` type union definition
3. Update to include new command names:
   - RENAME: `"ghostwire:jack-in-work"` → `"ghostwire:workflows:execute"`
   - RENAME: `"ghostwire:ultrawork-loop"` → `"ghostwire:work:loop"`
   - ADD: `"ghostwire:work:cancel"` (from `ghostwire:cancel-ultrawork`)
   - ADD: `"ghostwire:workflows:stop"` (from `ghostwire:stop-continuation`)
   - KEEP old names as aliases for backward compat (comment them)

4. Open `src/platform/config/schema.ts`
5. Find `CommandNameSchema` enum (or similar)
6. Apply same updates as types.ts

**Validation**: TypeScript compiles without errors

---

#### Task 1.2: Update Command Definitions
**Owner**: Backend (quick)  
**Category**: quick  
**Skills**: [typescript]  
**Estimated Effort**: 45m  
**Dependencies**: Task 1.1  
**Blocks**: Task 2.1  
**Wave**: 1

**What to do**:
1. Open `src/execution/features/commands/commands.ts`
2. Locate the COMMAND_DEFINITIONS object
3. **Rename entries**:
   ```typescript
   // OLD:
   "ghostwire:jack-in-work": { ... }
   // NEW:
   "ghostwire:workflows:execute": { ... }
   
   // OLD:
   "ghostwire:ultrawork-loop": { ... }
   // NEW:
   "ghostwire:work:loop": { ... }
   
   // OLD:
   "ghostwire:cancel-ultrawork": { ... }
   // NEW:
   "ghostwire:work:cancel": { ... }
   
   // OLD:
   "ghostwire:stop-continuation": { ... }
   // NEW:
   "ghostwire:workflows:stop": { ... }
   ```

4. Update descriptions to mention task-driven execution:
   ```typescript
   "ghostwire:workflows:execute": {
     description: "Execute planned tasks from workflow plan (task-driven, with subagent delegation) [Phase: EXECUTE]",
     agent: "orchestrator",
     // ... templates
   }
   
   "ghostwire:workflows:create": {
     description: "Break down workflow plan into atomic tasks with delegation metadata [Phase: BREAKDOWN]",
     agent: "orchestrator",
     // ... templates (same as before, but docs mention task structure)
   }
   ```

5. **Keep old names as commented aliases** for now (we'll add routing in next phase)

**Validation**: TypeScript compiles without errors, command names match types.ts

---

#### Task 1.3: Update Auto-Slash-Command Hook Exclusions
**Owner**: Backend (quick)  
**Category**: quick  
**Skills**: [typescript]  
**Estimated Effort**: 15m  
**Dependencies**: Task 1.2  
**Blocks**: None  
**Wave**: 2

**What to do**:
1. Open `src/orchestration/hooks/auto-slash-command/constants.ts`
2. Find `EXCLUDED_COMMANDS` set
3. Add new command names to the set:
   ```typescript
   export const EXCLUDED_COMMANDS = new Set([
     "ghostwire:ultrawork-loop",     // Keep old for backward compat
     "ghostwire:work:loop",          // Add new
     "ghostwire:cancel-ultrawork",   // Keep old
     "ghostwire:work:cancel",        // Add new
     "ghostwire:stop-continuation",  // Keep old
     "ghostwire:workflows:stop",     // Add new
     // ... existing entries
   ]);
   ```

**Validation**: Build succeeds

---

### PHASE 2: Command Routing & Handler Updates

#### Task 2.1: Add Command Aliases & Routing in index.ts
**Owner**: Backend (quick)  
**Category**: quick  
**Skills**: [typescript, regex]  
**Estimated Effort**: 45m  
**Dependencies**: Task 1.2  
**Blocks**: None  
**Wave**: 2

**What to do**:
1. Open `src/index.ts` around line 760-795
2. Find the slashcommand handler sections
3. **Update ultrawork-loop routing** (around line 760):
   ```typescript
   if ((command === "ultrawork-loop" || command === "ghostwire:ultrawork-loop" ||
        command === "work:loop" || command === "ghostwire:work:loop") && sessionID) {
     // existing logic
   }
   ```

4. **Update cancel-ultrawork routing** (around line 775):
   ```typescript
   if ((command === "ghostwire:cancel-ultrawork" || command === "ghostwire:work:cancel") && sessionID) {
     // existing logic
   }
   ```

5. **Update stop-continuation routing** (around line 785):
   ```typescript
   if ((command === "ghostwire:stop-continuation" || command === "ghostwire:workflows:stop") && sessionID) {
     // existing logic
   }
   ```

6. **Add jack-in-work → workflows:execute routing** (new section after stop-continuation):
   ```typescript
   if ((command === "ghostwire:jack-in-work" || command === "ghostwire:workflows:execute") && sessionID) {
     // Trigger start-work hook with plan execution
     // (same as current jack-in-work behavior - no change yet)
   }
   ```

**Validation**: Old and new command names both trigger same behavior

---

#### Task 2.2: Build & Verify Phase 1 & 2
**Owner**: Backend (quick)  
**Category**: quick  
**Skills**: [bun, typescript]  
**Estimated Effort**: 10m  
**Dependencies**: Task 2.1  
**Blocks**: Task 3.1  
**Wave**: 2

**What to do**:
1. Run `bun run build` and verify no errors
2. Run `bun run typecheck` and verify passes
3. Verify build output includes all new command names

**Validation**: `bun run build` succeeds, no TypeScript errors

---

### PHASE 3: Task Structure & JSON Parsing (Core feature)

#### Task 3.1: Define Task Structure Types
**Owner**: Backend (ultrabrain)  
**Category**: ultrabrain  
**Skills**: [typescript, zod]  
**Estimated Effort**: 1h  
**Dependencies**: Task 2.2  
**Blocks**: Task 3.2, Task 3.3  
**Wave**: 3

**What to do**:
1. Open or create `src/execution/features/task-queue/task-structure.ts`
2. Define structured task type:
   ```typescript
   export interface StructuredTask {
     id: string;                              // "task-001"
     subject: string;                         // "Set up database schema"
     description: string;                     // Detailed description
     owner?: string;                          // Subagent owner/category
     category?: "visual-engineering" | "ultrabrain" | "quick" | "deep" | "artistry";
     skills?: string[];                       // ["database-design", "sql"]
     estimatedEffort?: string;                // "2h", "30m", "1.5h"
     blockedBy?: string[];                    // Task IDs that block this
     blocks?: string[];                       // Task IDs this blocks
     wave?: number;                           // Manual parallelization (1, 2, 3...)
     status: "pending" | "in_progress" | "completed";
     createdAt?: string;                      // ISO timestamp
     startedAt?: string;                      // ISO timestamp
     completedAt?: string;                    // ISO timestamp
   }
   
   export interface WorkflowTaskList {
     plan_id: string;
     plan_name: string;
     tasks: StructuredTask[];
     created_at: string;
     breakdown_at?: string;
     executed_at?: string;
     completed_at?: string;
     auto_parallelization?: boolean;          // If true, auto-determine waves
     manual_waves?: Record<number, string[]>;  // If specified, use these wave groupings
   }
   ```

3. Add Zod schema validation:
   ```typescript
   export const StructuredTaskSchema = z.object({
     id: z.string(),
     subject: z.string(),
     description: z.string(),
     owner: z.string().optional(),
     category: z.enum([...]).optional(),
     skills: z.string().array().optional(),
     estimatedEffort: z.string().optional(),
     blockedBy: z.string().array().optional(),
     blocks: z.string().array().optional(),
     wave: z.number().optional(),
     status: z.enum(["pending", "in_progress", "completed"]),
     createdAt: z.string().datetime().optional(),
     startedAt: z.string().datetime().optional(),
     completedAt: z.string().datetime().optional(),
   });
   
   export const WorkflowTaskListSchema = z.object({
     // ... similar validation
   });
   ```

**Validation**: Types compile, Zod schemas parse valid task JSON

---

#### Task 3.2: Create Plan File Parser
**Owner**: Backend (ultrabrain)  
**Category**: ultrabrain  
**Skills**: [typescript, file-io, parsing]  
**Estimated Effort**: 1h  
**Dependencies**: Task 3.1  
**Blocks**: Task 3.3, Task 4.1  
**Wave**: 3

**What to do**:
1. Create `src/execution/features/task-queue/plan-parser.ts`
2. Implement `parsePlanFile(planPath: string): Promise<WorkflowTaskList>`
   - Read plan markdown file
   - Extract JSON task block (markdown code fence)
   - Parse JSON using WorkflowTaskListSchema
   - Return validated task list or throw error with clear message

3. Implement `updatePlanFile(planPath: string, tasks: StructuredTask[]): Promise<void>`
   - Read plan file
   - Update JSON task block with new task status values
   - Write back to file (preserving markdown formatting)

4. Add helper: `findTaskDependencies(taskId: string, tasks: StructuredTask[]): string[]`
   - Return IDs of tasks that block the given task

5. Add helper: `findTaskDependers(taskId: string, tasks: StructuredTask[]): string[]`
   - Return IDs of tasks that depend on the given task

**Validation**: Tests pass for parsing valid/invalid task JSON, file I/O works

---

#### Task 3.3: Implement Parallelization Logic
**Owner**: Backend (ultrabrain)  
**Category**: ultrabrain  
**Skills**: [typescript, graph-algorithms]  
**Estimated Effort**: 1.5h  
**Dependencies**: Task 3.1  
**Blocks**: Task 4.1  
**Wave**: 3

**What to do**:
1. Create `src/execution/features/task-queue/parallelization.ts`
2. Implement `calculateExecutionWaves(tasks: StructuredTask[]): number[][]`
   - Build dependency graph from `blockedBy`/`blocks`
   - Topological sort to determine execution order
   - Group independent tasks into waves:
     ```
     WAVE 1: Tasks with no dependencies
     WAVE 2: Tasks that depend only on WAVE 1
     WAVE 3: Tasks that depend on WAVE 1 or 2 (but not each other)
     etc.
     ```
   - Return array of waves, each wave = array of task IDs

3. Implement `applyManualWaves(tasks: StructuredTask[], waves: Record<number, string[]>): void`
   - If task has `wave: 3`, move it to wave 3 (even if dependency analysis would put it in 2)
   - Verify no circular dependencies after manual override
   - Update task.wave field

4. Implement `getTasksInWave(tasks: StructuredTask[], wave: number): StructuredTask[]`
   - Return all tasks with .wave === waveNumber

**Validation**: Tests verify:
- Linear dependency chain produces N+1 waves
- Independent tasks group into same wave
- Manual wave override is respected
- Circular dependencies detected and throw error

---

### PHASE 4: Subagent Delegation Integration

#### Task 4.1: Implement Task Delegation Engine
**Owner**: Backend (ultrabrain)  
**Category**: ultrabrain  
**Skills**: [typescript, delegate-task]  
**Estimated Effort**: 1.5h  
**Dependencies**: Task 3.3, Task 3.2  
**Blocks**: Task 4.2  
**Wave**: 4

**What to do**:
1. Create `src/execution/features/task-queue/task-delegator.ts`
2. Implement `delegateTask(task: StructuredTask, planPath: string): Promise<void>`
   - Build delegation prompt from task metadata:
     ```markdown
     ## Task: {subject}
     
     {description}
     
     ### Metadata
     - Estimated Effort: {estimatedEffort}
     - Skills: {skills.join(', ')}
     - Blocked By: {blockedBy}
     
     ### Expected Outcome
     [Auto-generate based on task type]
     
     ### Must Do
     - Update plan file when complete: {planPath}
     - Update task.status from "pending" → "in_progress" → "completed"
     ```
   - Invoke `delegate_task()` with appropriate category and skills:
     ```typescript
     delegate_task(
       description: `Execute task: ${task.subject}`,
       prompt: delegationPrompt,
       category: task.category || "deep",
       load_skills: task.skills || [],
       run_in_background: false  // Wait for completion
     )
     ```
   - Wait for task completion
   - Update plan file: set task.status = "completed", task.completedAt = now

3. Implement `delegateTasksInWave(tasks: StructuredTask[], planPath: string): Promise<void>`
   - For each task in wave, invoke delegateTask in parallel
   - Wait for all to complete before moving to next wave

**Validation**: Tasks delegated with correct category/skills, status updated after completion

---

#### Task 4.2: Update workflows:execute Handler
**Owner**: Backend (ultrabrain)  
**Category**: ultrabrain  
**Skills**: [typescript, orchestration]  
**Estimated Effort**: 1.5h  
**Dependencies**: Task 4.1  
**Blocks**: Task 5.1  
**Wave**: 4

**What to do**:
1. Open `src/orchestration/hooks/start-work/index.ts` (the hook that runs on jack-in-work / workflows:execute)
2. Update hook to implement task-driven execution:
   ```typescript
   export function createStartWorkHook() {
     return {
       async name() { return "start-work"; },
       
       async execute(context: HookContext) {
         const planPath = context.planName;  // From command args
         
         // 1. Parse plan file to get task list
         const taskList = await parsePlanFile(planPath);
         const { tasks } = taskList;
         
         // 2. Calculate execution waves (auto-determined, respecting manual overrides)
         const waves = calculateExecutionWaves(tasks);
         
         // 3. Execute tasks wave by wave
         for (const wave of waves) {
           const tasksInWave = getTasksInWave(tasks, wave);
           await delegateTasksInWave(tasksInWave, planPath);
         }
         
         // 4. Mark plan complete
         taskList.completed_at = new Date().toISOString();
         await updatePlanFile(planPath, taskList);
       }
     };
   }
   ```

3. Ensure `workflows:execute` command triggers this hook (should already work via command routing)

4. Add logging:
   ```typescript
   log(`[workflows:execute] Starting task-driven execution`, { planPath });
   log(`[workflows:execute] Found ${tasks.length} tasks`, { tasksCount: tasks.length });
   log(`[workflows:execute] Determined ${waves.length} execution waves`, { waveCount: waves.length });
   log(`[workflows:execute] Wave ${i}: Running ${tasksInWave.length} tasks in parallel`, { wave: i, count: tasksInWave.length });
   ```

**Validation**: Hook executes all tasks in correct wave order, plan file updated

---

### PHASE 5: Update workflows:create for Task Structure Output

#### Task 5.1: Update workflows:create Handler (Breakdown Phase)
**Owner**: Backend (ultrabrain)  
**Category**: ultrabrain  
**Skills**: [typescript, prompt-engineering]  
**Estimated Effort**: 1h  
**Dependencies**: Task 4.2  
**Blocks**: Task 6.1  
**Wave**: 5

**What to do**:
1. Open `src/execution/features/commands/templates/workflows/create.ts` (or wherever workflows:create template lives)
2. Update template prompt to explicitly request JSON task structure:
   ```markdown
   ## Task: Break down the plan into atomic, delegatable tasks
   
   You have a plan at: {planPath}
   
   Your job is to:
   1. Read the existing plan
   2. Break it down into ATOMIC TASKS (smallest unit that can be delegated to a single subagent)
   3. For each task, specify:
     - id: "task-001", "task-002", etc.
     - subject: Brief title
     - description: What needs to be done
     - owner: Who should do it (backend/frontend/devops/qa/etc.)
     - category: visual-engineering, ultrabrain, quick, deep, artistry
     - skills: Required skills (e.g., ["react", "typescript"])
     - estimatedEffort: "2h", "30m", etc.
     - blockedBy: Tasks that must complete first
     - blocks: Tasks that depend on this
     - status: "pending" (initially)
   
   4. Output the task list as a JSON code block in the plan file:
      ```json
      {
        "plan_id": "...",
        "plan_name": "...",
        "tasks": [
          { "id": "task-001", ... },
          { "id": "task-002", ... },
          ...
        ],
        "auto_parallelization": true
      }
      ```
   
   5. Do NOT delete existing plan content - append JSON task block
   ```

3. Invoke workflows:create via agent template (same as before, but with new prompt)

**Validation**: Output contains valid JSON task structure

---

### PHASE 6: Tests & Validation

#### Task 6.1: Write Unit Tests for Task Structure
**Owner**: Backend (quick)  
**Category**: quick  
**Skills**: [typescript, testing]  
**Estimated Effort**: 1h  
**Dependencies**: Task 5.1  
**Blocks**: Task 6.2  
**Wave**: 5

**What to do**:
1. Create `src/execution/features/task-queue/task-structure.test.ts`
2. Test `StructuredTaskSchema` validation:
   - Valid task parses
   - Invalid task (missing required fields) throws
   - Optional fields work correctly

3. Create `src/execution/features/task-queue/parallelization.test.ts`
4. Test `calculateExecutionWaves`:
   - Linear dependency: A → B → C produces waves [1, 2, 3]
   - Diamond: A → B, A → C, B → D, C → D produces waves [1, 1, 2, 3]
   - No dependencies: All in wave 1
   - Circular dependency throws error

5. Create `src/execution/features/task-queue/plan-parser.test.ts`
6. Test `parsePlanFile` and `updatePlanFile`:
   - Parse valid plan JSON
   - Update task status
   - Handle missing task list gracefully

**Validation**: All tests pass

---

#### Task 6.2: Write Integration Tests for Task-Driven Execution
**Owner**: Backend (quick)  
**Category**: quick  
**Skills**: [typescript, testing]  
**Estimated Effort**: 1.5h  
**Dependencies**: Task 6.1  
**Blocks**: Task 6.3  
**Wave**: 5

**What to do**:
1. Create `tests/task-driven-execution.test.ts`
2. Create a mock plan file with 5 tasks:
   - Task 1: No dependencies (wave 1)
   - Task 2-3: Depend on Task 1 (wave 2)
   - Task 4: Depends on Tasks 2-3 (wave 3)

3. Test the full execution flow:
   - `workflows:execute` reads plan
   - Calculates correct waves
   - Delegates tasks in correct order
   - Updates plan file as tasks complete

4. Test cross-session resumption:
   - Start execution, pause after wave 2
   - Read plan, verify tasks 1-3 marked "completed"
   - Resume execution, verify only task 4 runs

**Validation**: Full end-to-end workflow executes correctly

---

#### Task 6.3: Update Regression Tests
**Owner**: Backend (quick)  
**Category**: quick  
**Skills**: [typescript, testing]  
**Estimated Effort**: 30m  
**Dependencies**: Task 6.2  
**Blocks**: Task 7.1  
**Wave**: 6

**What to do**:
1. Open `tests/regression.test.ts`
2. Add tests for new command names:
   ```typescript
   test("new command names are recognized", () => {
     expect(CommandNameSchema.safeParse("ghostwire:workflows:execute").success).toBe(true);
     expect(CommandNameSchema.safeParse("ghostwire:work:loop").success).toBe(true);
     expect(CommandNameSchema.safeParse("ghostwire:work:cancel").success).toBe(true);
     expect(CommandNameSchema.safeParse("ghostwire:workflows:stop").success).toBe(true);
   });

   test("old command names still work (backward compat)", () => {
     expect(CommandNameSchema.safeParse("ghostwire:jack-in-work").success).toBe(true);
     expect(CommandNameSchema.safeParse("ghostwire:ultrawork-loop").success).toBe(true);
     expect(CommandNameSchema.safeParse("ghostwire:cancel-ultrawork").success).toBe(true);
     expect(CommandNameSchema.safeParse("ghostwire:stop-continuation").success).toBe(true);
   });
   ```

3. Add test for command routing:
   ```typescript
   test("old and new command names route to same handler", async () => {
     // Mock handler calls
     // Invoke both old and new command
     // Verify same handler was called
   });
   ```

**Validation**: All regression tests pass

---

### PHASE 7: Documentation & Migration

#### Task 7.1: Create Migration Guide
**Owner**: Documentation (writing)  
**Category**: writing  
**Skills**: [markdown]  
**Estimated Effort**: 30m  
**Dependencies**: Task 6.3  
**Blocks**: Task 7.2  
**Wave**: 6

**What to do**:
1. Create `docs/migration/TASK_DRIVEN_WORKFLOWS.md`
2. Document:
   - What changed (command names, task structure)
   - How to migrate (old commands still work, new names recommended)
   - Task structure format (with JSON examples)
   - How parallelization works (auto vs manual waves)
   - Example plan with structured tasks

**Validation**: Guide is clear and complete

---

#### Task 7.2: Update AGENTS.md Knowledge Base
**Owner**: Documentation (writing)  
**Category**: writing  
**Skills**: [markdown]  
**Estimated Effort**: 30m  
**Dependencies**: Task 7.1  
**Blocks**: None  
**Wave**: 6

**What to do**:
1. Open `AGENTS.md`
2. Update command names table
3. Add "Task-Driven Architecture" section explaining:
   - What tasks are
   - How they're delegated to subagents
   - Parallelization strategy
   - Cross-session resumption

**Validation**: Knowledge base reflects new architecture

---

#### Task 7.3: Update README.md Examples
**Owner**: Documentation (writing)  
**Category**: writing  
**Skills**: [markdown]  
**Estimated Effort**: 20m  
**Dependencies**: Task 7.2  
**Blocks**: None  
**Wave**: 7

**What to do**:
1. Open `README.md`
2. Update any example commands that reference old names
3. Add example of task-driven workflow

**Validation**: Examples use new command names

---

### PHASE 8: Final Build & Verification

#### Task 8.1: Full Build & Test
**Owner**: Backend (quick)  
**Category**: quick  
**Skills**: [bun]  
**Estimated Effort**: 10m  
**Dependencies**: Task 7.3  
**Blocks**: None  
**Wave**: 7

**What to do**:
1. Run `bun run typecheck` - verify no errors
2. Run `bun test` - verify all tests pass
3. Run `bun run build` - verify build succeeds
4. Verify dist/ files are generated correctly

**Validation**: All builds and tests pass

---

## Summary of Changes

### Files Created
- `src/execution/features/task-queue/task-structure.ts` - Task types and Zod schema
- `src/execution/features/task-queue/plan-parser.ts` - Plan file parsing and updating
- `src/execution/features/task-queue/parallelization.ts` - Wave calculation and task grouping
- `src/execution/features/task-queue/task-delegator.ts` - Subagent delegation engine
- `tests/task-driven-execution.test.ts` - Integration tests
- `docs/migration/TASK_DRIVEN_WORKFLOWS.md` - Migration guide

### Files Modified
- `src/execution/features/commands/types.ts` - Add new command names
- `src/platform/config/schema.ts` - Update CommandNameSchema
- `src/execution/features/commands/commands.ts` - Rename commands, update descriptions
- `src/orchestration/hooks/auto-slash-command/constants.ts` - Add to EXCLUDED_COMMANDS
- `src/index.ts` - Update command routing (aliases)
- `src/orchestration/hooks/start-work/index.ts` - Implement task-driven execution
- `tests/regression.test.ts` - Add new command name tests
- `AGENTS.md` - Update documentation
- `README.md` - Update examples

### Total Effort Estimate
- Phase 1-2 (Command definitions): 2.5 hours
- Phase 3 (Task structure): 3.5 hours
- Phase 4 (Delegation): 3 hours
- Phase 5-6 (workflows:create + tests): 4.5 hours
- Phase 7 (Documentation): 1.5 hours
- Phase 8 (Build & Verify): 1 hour

**Total: ~16 hours** (suitable for parallel delegation across multiple subagents)

---

## Parallelization Strategy

```
WAVE 1 (Commands definitions - no dependencies):
  - Task 1.1: Update CommandName & Schema
  - Task 1.2: Update Command Definitions (depends on 1.1)
  
WAVE 2 (Continue definitions):
  - Task 1.3: Auto-Slash-Command Hook
  - Task 2.1: Command Routing (depends on 1.2)
  - Task 2.2: Build & Verify (depends on 2.1)

WAVE 3 (Core task structure - parallel):
  - Task 3.1: Task Structure Types (no dependencies)
  - Task 3.2: Plan File Parser (depends on 3.1)
  - Task 3.3: Parallelization Logic (depends on 3.1)

WAVE 4 (Delegation engine):
  - Task 4.1: Task Delegation Engine (depends on 3.2, 3.3)
  - Task 4.2: Update workflows:execute Handler (depends on 4.1)

WAVE 5 (Higher-level features & tests):
  - Task 5.1: Update workflows:create (depends on 4.2)
  - Task 6.1: Unit Tests (depends on 5.1)
  - Task 6.2: Integration Tests (depends on 6.1)

WAVE 6 (Documentation):
  - Task 6.3: Regression Tests (depends on 6.2)
  - Task 7.1: Migration Guide (depends on 6.3)
  - Task 7.2: Update AGENTS.md (depends on 7.1)

WAVE 7 (Final):
  - Task 7.3: Update README (depends on 7.2)
  - Task 8.1: Full Build (depends on 7.3)
```

**Key insight**: Waves 1, 3, and parallel sections of wave 5 can run in parallel!

---

## Success Criteria (Verification)

- [ ] All new commands defined and typed
- [ ] Old commands still work (backward compatibility)
- [ ] Build succeeds: `bun run build`
- [ ] All tests pass: `bun test`
- [ ] Task structure parses valid JSON
- [ ] Parallelization correctly determines execution waves
- [ ] `workflows:execute` delegates individual tasks
- [ ] `workflows:create` outputs JSON task structure
- [ ] Cross-session resumption works
- [ ] Documentation is complete and clear

---

## Next Steps

1. **Ready for delegation**: This breakdown is structured for subagent delegation
2. **Recommended delegation**:
   - Phases 1-2: Quick subagent (backend, command definitions)
   - Phase 3: Ultrabrain subagent (task structure & algorithms)
   - Phase 4: Ultrabrain subagent (delegation engine)
   - Phase 5: Ultrabrain subagent (workflows:create update)
   - Phase 6: Quick subagent (tests)
   - Phase 7: Writing subagent (documentation)
   - Phase 8: Quick subagent (build verification)

3. **Parallelization**: Can delegate Phases 1, 3 (parallel), 6-7 (parallel) simultaneously
