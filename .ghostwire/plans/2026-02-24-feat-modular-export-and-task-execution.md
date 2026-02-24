---
title: 'Modular Export Pipeline & Task-Driven Execution'
type: feat
date: 2026-02-24
status: completed
version: 1.0.0
---

# Export Pipeline & Task-Driven Workflow Automation

## Executive Summary

This consolidated plan covers two complementary automation initiatives:

1. **Build Modular Copilot and Codex Export Pipeline** - Replace monolithic export with modular artifacts (prompts, skills, hooks)
2. **Implementation Breakdown: Task-Driven Workflow Architecture** - Transform workflow system from simple command routing to structured, delegatable tasks

Together, these initiatives enable sophisticated export capabilities and introduce a powerful task-driven automation architecture supporting parallelization and cross-session resumption.

---

## Table of Contents

- [Part 1: Build Modular Copilot and Codex Export Pipeline](#part-1-build-modular-copilot-and-codex-export-pipeline)
- [Part 2: Task-Driven Workflow Architecture](#part-2-task-driven-workflow-architecture)
- [Parallel Execution Strategy](#parallel-execution-strategy)
- [Overall Success Criteria](#overall-success-criteria)

---

## Part 1: Build Modular Copilot and Codex Export Pipeline

### Problem Statement

The current export implementation emits a high-entropy, monolithic instructions artifact for Copilot, which degrades maintainability, violates platform customization granularity, and risks instruction truncation or reduced retrieval utility in downstream Copilot workflows.

### Goals and Non-Goals

#### Goals

- ✅ Replace monolithic Copilot export with a compositional artifact graph aligned to GitHub Copilot customization primitives
- ✅ Preserve Codex compatibility while minimizing duplicated instruction payload
- ✅ Introduce deterministic export generation with stable paths, idempotent writes, and test coverage

#### Non-Goals

- ❌ Rebuild Ghostwire runtime to execute natively inside Copilot/Codex host runtimes
- ❌ Migrate all historical Ghostwire prompts into Copilot artifacts in a single release

### Brainstorm Decisions

- Adopt a compiler-style export architecture: shared normalized intermediate model → target-specific emitters
- Keep repository-level Copilot instructions minimal and push domain/task detail into scoped files
- Map Ghostwire command intent to Copilot prompt files and map high-value operational guardrails to skills/hooks
- Preserve AGENTS.md for Codex while constraining verbosity and linking to modular assets where applicable

### Research Summary

#### Local Findings

- [src/cli/export.ts:28] Current exporter builds a single shared content block with embedded full system protocol, causing oversized target artifacts
- [src/cli/export.ts:89] Copilot target currently emits only `.github/copilot-instructions.md`, with no support for `.github/instructions`, `.github/prompts`, `.github/skills`, `.github/agents`, or `.github/hooks`
- [src/cli/index.ts:123] Export command already exists and can be extended without CLI surface redesign
- [src/execution/features/commands/templates/workflows/plan.ts:68] Canonical planning schema requires strict frontmatter and section contract
- [AGENTS.md:165] Project constitution enforces test-first development and integration testing

#### External Findings

- [GitHub Docs](https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/): Repository custom instructions recommends keeping instructions concise and using additional customization mechanisms for specificity
- [Prompt files tutorial](https://docs.github.com/en/copilot/tutorials/customization-library/prompt-files/): Prompt files provide reusable slash-command style task templates
- [About agent skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills): Skills are file-based capability bundles with structured metadata
- [About hooks](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-hooks): Hooks provide lifecycle policy enforcement with JSON configuration

### Proposed Approach

Implement a modular export subsystem with a normalized `ExportModel` and target emitters:

1. Add `compileExportModel()` to aggregate Ghostwire system prompt constraints, agent metadata, command templates, and policy fragments
2. Replace direct string assembly with emitter modules:
   - `emitCopilotRepoInstructions()` → `.github/copilot-instructions.md` (minimal core rules)
   - `emitCopilotScopedInstructions()` → `.github/instructions/*.instructions.md`
   - `emitCopilotPromptFiles()` → `.github/prompts/*.prompt.md`
   - `emitCopilotSkills()` → `.github/skills/*/SKILL.md`
   - `emitCopilotAgents()` → `.github/agents/*.agent.md`
   - `emitCopilotHooks()` → `.github/hooks/*.json`
   - `emitCodexAgents()` → concise `AGENTS.md`
3. Add deterministic manifest output (`export-manifest.json`)
4. Add configuration flags for artifact groups and strict mode
5. Update documentation

### Acceptance Criteria

- ✅ `ghostwire export --target copilot` emits modular artifact tree (`.github/copilot-instructions.md`, `.github/instructions/`, `.github/prompts/`, `.github/skills/`, `.github/agents/`, `.github/hooks/`)
- ✅ Copilot repository-level instruction file remains concise
- ✅ `ghostwire export --target codex` emits concise `AGENTS.md`
- ✅ Export behavior is idempotent (repeated runs produce byte-identical outputs)
- ✅ Test suite covers overwrite behavior, artifact sets, and content-shape validation

### Implementation Steps

- ✅ Define `ExportModel` types and `compileExportModel()`
- ✅ Refactor exporter into target-specific emitter modules
- ✅ Implement Copilot emitters (repo instructions, scoped instructions, prompt files, skills, agents, hooks)
- ✅ Implement concise Codex emitter
- ✅ Add manifest generation and validation
- ✅ Add tests following RED-GREEN-REFACTOR
- ✅ Update CLI documentation

### Task List for Export Pipeline

```json
{
  "id": "export-pipeline",
  "subject": "Modular Copilot and Codex Export Pipeline",
  "tasks": [
    {
      "id": "export-001",
      "subject": "Define normalized export model and compiler",
      "category": "ultrabrain",
      "estimatedEffort": "1h",
      "status": "completed"
    },
    {
      "id": "export-002",
      "subject": "Refactor exporter into modular emitter architecture",
      "category": "quick",
      "estimatedEffort": "1h",
      "status": "completed"
    },
    {
      "id": "export-003",
      "subject": "Implement Copilot core + scoped instructions emitters",
      "category": "writing",
      "estimatedEffort": "1h",
      "blockedBy": ["export-001", "export-002"],
      "status": "completed"
    },
    {
      "id": "export-004",
      "subject": "Implement Copilot prompt file emitter",
      "category": "writing",
      "estimatedEffort": "45m",
      "blockedBy": ["export-001", "export-002"],
      "status": "completed"
    },
    {
      "id": "export-005",
      "subject": "Implement Copilot skills emitter",
      "category": "writing",
      "estimatedEffort": "45m",
      "blockedBy": ["export-001", "export-002"],
      "status": "completed"
    },
    {
      "id": "export-006",
      "subject": "Implement Copilot agents emitter",
      "category": "writing",
      "estimatedEffort": "45m",
      "blockedBy": ["export-001", "export-002"],
      "status": "completed"
    },
    {
      "id": "export-007",
      "subject": "Implement Copilot hooks emitter",
      "category": "deep",
      "estimatedEffort": "45m",
      "blockedBy": ["export-001", "export-002"],
      "status": "completed"
    },
    {
      "id": "export-008",
      "subject": "Implement concise Codex AGENTS emitter",
      "category": "quick",
      "estimatedEffort": "30m",
      "blockedBy": ["export-001", "export-002"],
      "status": "completed"
    },
    {
      "id": "export-009",
      "subject": "Add export manifest, flags, and documentation",
      "category": "quick",
      "estimatedEffort": "1h",
      "blockedBy": ["export-003", "export-004", "export-005", "export-006", "export-007", "export-008"],
      "status": "completed"
    },
    {
      "id": "export-010",
      "subject": "Implement RED-GREEN-REFACTOR test suite and validation",
      "category": "quick",
      "estimatedEffort": "1.5h",
      "blockedBy": ["export-003", "export-004", "export-005", "export-006", "export-007", "export-008", "export-009"],
      "status": "completed"
    }
  ]
}
```

### Testing Strategy

- **Unit**: Emitter snapshot/shape tests, model compiler normalization
- **Integration**: CLI export command test in temp workspace
- **End-to-end**: Smoke run against fixture repo with Copilot customization expectations

### Dependencies and Rollout

- Dependencies: existing `AGENTS_MANIFEST`, `system-prompt.md`, command metadata
- Sequencing: model compiler → Copilot emitters → Codex emitter → docs
- Rollback: Retain previous monolithic export behind fallback flag for one release

---

## Part 2: Task-Driven Workflow Architecture

### Overview: What We're Building

Transform the workflow system from simple command routing to a **task-driven architecture** where:

1. Plans are broken down into **structured, delegatable tasks** (JSON format)
2. Tasks have metadata for **subagent routing and parallelization**
3. `workflows:execute` **delegates individual tasks** to the right subagents
4. Tasks run in **parallel** based on dependencies
5. Work can be **resumed across sessions** by reading task status

### Command Renaming

| Old Name                    | New Name                      | Purpose                        |
| --------------------------- | ----------------------------- | ------------------------------ |
| `ghostwire:jack-in-work`    | `ghostwire:workflows:execute` | Execute planned tasks          |
| `ghostwire:ultrawork-loop`  | `ghostwire:work:loop`         | Continuous task execution      |
| `ghostwire:cancel-ultrawork` | `ghostwire:work:cancel`       | Cancel active loop             |
| `ghostwire:stop-continuation` | `ghostwire:workflows:stop`  | Stop all continuation          |

**Note**: Old command names remain supported for backward compatibility

### Task Structure

```json
{
  "id": "task-1",
  "subject": "Task title",
  "description": "Detailed description",
  "category": "visual-engineering | ultrabrain | quick | deep | artistry | writing",
  "skills": ["skill1", "skill2"],
  "estimatedEffort": "30m | 2h",
  "status": "pending | in_progress | completed",
  "blocks": ["task-2"],
  "blockedBy": ["task-1"],
  "wave": 1
}
```

### Atomic Tasks Breakdown

#### PHASE 1: Command Definition Updates (No functional changes)

**Task 1.1**: Update CommandName Type & Schema
- Update `src/execution/features/commands/types.ts`
- Add new command names, keep old names as aliases

**Task 1.2**: Update Command Definitions
- Update `src/execution/features/commands/commands.ts`
- Rename entries with new command names

**Task 1.3**: Update Auto-Slash-Command Hook Exclusions
- Update `src/orchestration/hooks/auto-slash-command/constants.ts`
- Add new command names to exclusion set

#### PHASE 2: Command Routing & Handler Updates

**Task 2.1**: Add Command Aliases & Routing in index.ts
- Support both old and new command names
- Ensure same behavior for both sets

**Task 2.2**: Build & Verify Phase 1 & 2
- Run `bun run build`
- Run `bun run typecheck`

#### PHASE 3: Task Structure & JSON Parsing (Core feature)

**Task 3.1**: Define Task Structure Types
- Create `src/execution/features/task-queue/task-structure.ts`
- Define `StructuredTask` interface and Zod schema

**Task 3.2**: Create Plan File Parser
- Create `src/execution/features/task-queue/plan-parser.ts`
- Implement parsing and file update functions

**Task 3.3**: Implement Parallelization Logic
- Create `src/execution/features/task-queue/parallelization.ts`
- Implement wave calculation and topological sort

#### PHASE 4: Subagent Delegation Integration

**Task 4.1**: Implement Task Delegation Engine
- Create `src/execution/features/task-queue/task-delegator.ts`
- Implement delegation and status tracking

**Task 4.2**: Update workflows:execute Handler
- Update hook to implement task-driven execution
- Execute tasks wave by wave

#### PHASE 5: Update workflows:create for Task Structure Output

**Task 5.1**: Update workflows:create Handler
- Update template prompt to request JSON task structure
- Ensure output contains valid task list

#### PHASE 6: Tests & Validation

**Task 6.1**: Write Unit Tests
- Test task structure validation
- Test parallelization logic
- Test plan file parsing

**Task 6.2**: Write Integration Tests
- Test full execution flow
- Test cross-session resumption
- Test wave parallelization

**Task 6.3**: Update Regression Tests
- Add tests for new command names
- Verify backward compatibility

#### PHASE 7: Documentation & Migration

**Task 7.1**: Create Migration Guide
- Document command name changes
- Explain task structure format
- Document parallelization strategy

**Task 7.2**: Update AGENTS.md Knowledge Base
- Add task-driven architecture section
- Document delegation strategy

**Task 7.3**: Update README.md Examples
- Update example commands
- Add task-driven workflow example

#### PHASE 8: Final Build & Verification

**Task 8.1**: Full Build & Test
- Run `bun run typecheck`
- Run `bun test`
- Run `bun run build`

### Parallelization Strategy

```
WAVE 1 (Command definitions - no dependencies):
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

### Implementation Phases Timeline

- **Phase 1-2 (Command definitions)**: 2.5 hours
- **Phase 3 (Task structure)**: 3.5 hours
- **Phase 4 (Delegation)**: 3 hours
- **Phase 5-6 (workflows:create + tests)**: 4.5 hours
- **Phase 7 (Documentation)**: 1.5 hours
- **Phase 8 (Build & Verify)**: 1 hour

**Total: ~16 hours** (suitable for parallel delegation)

### Files to Create

- `src/execution/features/task-queue/task-structure.ts`
- `src/execution/features/task-queue/plan-parser.ts`
- `src/execution/features/task-queue/parallelization.ts`
- `src/execution/features/task-queue/task-delegator.ts`
- `tests/task-driven-execution.test.ts`
- `docs/migration/TASK_DRIVEN_WORKFLOWS.md`

### Files to Modify

- `src/execution/features/commands/types.ts`
- `src/platform/config/schema.ts`
- `src/execution/features/commands/commands.ts`
- `src/orchestration/hooks/auto-slash-command/constants.ts`
- `src/index.ts`
- `src/orchestration/hooks/start-work/index.ts`
- `tests/regression.test.ts`
- `AGENTS.md`
- `README.md`

### Success Criteria - Part 2

✅ All new command names defined and typed  
✅ Old commands still work (backward compatibility)  
✅ Build succeeds  
✅ All tests pass  
✅ Task structure parses valid JSON  
✅ Parallelization correctly determines execution waves  
✅ `workflows:execute` delegates individual tasks  
✅ `workflows:create` outputs JSON task structure  
✅ Cross-session resumption works  
✅ Documentation is complete

---

## Parallel Execution Strategy

### Combined Timeline

**Days 1-3: Parallel Execution**
- **Export Pipeline** (Part 1) executing independently
  - Phases 1-3: Model definition and emitter architecture
  - Phases 4-7: Emitter implementations
  - Phase 8-10: Testing and manifest

- **Task-Driven Workflows** (Part 2) executing independently
  - Phases 1-2: Command definitions
  - Phases 3-4: Task structure and delegation engine
  - Phases 5-7: workflows:create, tests, documentation
  - Phase 8: Final build

**Day 4: Integration Point**
- Both initiatives converge
- Final integration testing
- No conflicts (isolated domains)
- Single consolidated PR

### Risk Mitigation

- **Export Pipeline**: Isolated to CLI export code, tests in `src/cli/`
- **Task-Driven Workflows**: Isolated to command definitions and task-queue features
- **No file conflicts**: Different code domains and file locations
- **Independent testing**: Each initiative has self-contained test coverage
- **Controlled merge**: Coordination at integration point ensures quality

---

## Overall Success Criteria

### Part 1: Export Pipeline

✅ Modular export architecture implemented  
✅ Copilot targets emit artifact tree correctly  
✅ Codex targets emit concise AGENTS.md  
✅ Manifest generation deterministic and complete  
✅ All export tests passing (unit + integration + e2e)  
✅ Documentation updated with artifact topology

### Part 2: Task-Driven Workflows

✅ Command renaming complete with backward compatibility  
✅ Task structure validated with Zod schemas  
✅ Parallelization engine correctly groups tasks into waves  
✅ Delegation engine routes tasks to appropriate subagents  
✅ Cross-session resumption functional  
✅ All workflow tests passing (594+)

### Combined Integration

✅ **Zero conflicts** between initiatives  
✅ **Full test coverage** - both initiatives contribute tests  
✅ **No regressions** - all existing functionality preserved  
✅ **Performance maintained** - build time < 2 minutes  
✅ **Documentation complete** - both features documented  
✅ **Single PR merge** - clean integration into main

---

## Next Steps

1. **Begin Parallel Execution**:
   - Start Export Pipeline implementation (Part 1)
   - Simultaneously start Task-Driven Workflows (Part 2)
   - Both work in isolated code domains

2. **Daily Synchronization**:
   - Check for any unexpected file conflicts
   - Update team on progress
   - Identify any integration concerns early

3. **Integration Point (Day 4)**:
   - Merge both initiatives into single feature branch
   - Run full integration test suite
   - Create consolidated PR for review

4. **Quality Gates**:
   - All 594+ tests passing
   - TypeScript compilation succeeds
   - Build completes in < 2 minutes
   - Code review approvals received
   - CI/CD pipeline passes

This consolidated plan enables efficient parallel execution of two significant features while maintaining code quality, test coverage, and backward compatibility.
