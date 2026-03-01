# Tasks: Simplify Agentic Framework with Scoped Skills

**Input**: Design documents from `/specs/001-simplify-agent-framework/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Regression and parity tests are required by spec (`FR-005`) and quickstart validation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare deterministic fixtures and test harness scaffolding for scoped skill discovery.

- [X] T001 Create scoped skill fixture matrix documentation in tests/fixtures/skills-scopes/README.md
- [X] T002 [P] Add canonical `.agents/skills` test fixtures in tests/fixtures/skills-scopes/repo/.agents/skills/
- [X] T003 [P] Add duplicate-ID collision fixtures in tests/fixtures/skills-scopes/collisions/.agents/skills/
- [X] T004 Create shared fixture loader utilities in tests/helpers/skill-discovery-fixtures.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish canonical discovery policy and one reusable resolver contract before user stories.

**⚠️ CRITICAL**: No user story implementation starts before this phase is complete.

- [X] T005 Define canonical discovery policy types in src/execution/opencode-skill-loader/types.ts
- [X] T006 Implement scope-walk source enumeration for `.agents/skills` in src/execution/opencode-skill-loader/loader.ts
- [X] T007 Implement deterministic first-wins collision diagnostics model in src/execution/opencode-skill-loader/merger.ts
- [X] T008 [P] Add resolution digest utility for stable parity snapshots in src/execution/opencode-skill-loader/skill-content.ts
- [X] T009 Expose single resolver interface used by runtime/composer/export in src/execution/opencode-skill-loader/index.ts

**Checkpoint**: Canonical discovery primitives are available to all user story phases.

---

## Phase 3: User Story 1 - Deterministic skill discovery model (Priority: P1) 🎯 MVP

**Goal**: Enforce deterministic `.agents/skills` scope discovery and conflict handling.

**Independent Test**: Configure fixtures at multiple scopes and verify deterministic precedence/collision output without touching export pipeline.

### Tests for User Story 1 (required) ⚠️

- [X] T010 [P] [US1] Add precedence matrix tests for scoped discovery in tests/skills.test.ts
- [X] T011 [P] [US1] Add collision-event determinism tests in tests/skills.test.ts
- [X] T012 [US1] Add malformed `SKILL.md` boundary tests in tests/skills.test.ts

### Implementation for User Story 1

- [X] T013 [US1] Enforce canonical `.agents/skills` path policy in src/execution/opencode-skill-loader/loader.ts
- [X] T014 [US1] Remove non-canonical implicit fallback resolution paths in src/execution/opencode-skill-loader/loader.ts
- [X] T015 [US1] Apply deterministic precedence ordering in src/execution/opencode-skill-loader/merger.ts
- [X] T016 [US1] Emit structured collision diagnostics in src/execution/opencode-skill-loader/merger.ts
- [X] T017 [US1] Wire validation of required skill metadata fields in src/execution/opencode-skill-loader/skill-content.ts

**Checkpoint**: User Story 1 is independently functional and testable.

---

## Phase 4: User Story 2 - Unified runtime/build model (Priority: P2)

**Goal**: Align generated/exported artifacts with runtime resolved skill semantics.

**Independent Test**: Compare runtime resolved output digest and generated artifact semantics for identical fixture inputs.

### Tests for User Story 2 (required) ⚠️

- [X] T018 [P] [US2] Add runtime/export parity snapshot tests in src/cli/export.test.ts
- [X] T019 [P] [US2] Add manifest semantic parity tests in tests/workflows-integration.test.ts

### Implementation for User Story 2

- [X] T020 [US2] Update runtime-resolved skill export mapping in src/cli/export.ts
- [X] T021 [US2] Align generated skills manifest semantics with runtime resolver in src/execution/skills/skills-manifest.ts
- [X] T022 [US2] Align skills manifest build generation with canonical policy in src/script/build-skills-manifest.ts
- [X] T023 [US2] Ensure built-in skill merge occurs after scoped resolution in src/execution/skills/skills.ts

**Checkpoint**: User Stories 1 and 2 are independently testable with parity evidence.

---

## Phase 5: User Story 3 - Reduced orchestration surface complexity (Priority: P3)

**Goal**: Remove duplicate composition paths and route consumers through one resolver pipeline.

**Independent Test**: Validate that plugin init and config composition consume one shared resolver and preserve expected behavior.

### Tests for User Story 3 (required) ⚠️

- [X] T024 [P] [US3] Add shared-pipeline integration tests for plugin initialization in src/index.test.ts
- [X] T025 [P] [US3] Add config composer single-pipeline tests in src/plugin-config.test.ts

### Implementation for User Story 3

- [X] T026 [US3] Replace duplicated discovery path in plugin initialization with shared resolver in src/index.ts
- [X] T027 [US3] Replace duplicated discovery path in config composition with shared resolver in src/platform/opencode/config-composer.ts
- [X] T028 [US3] Remove redundant async loader entry points in src/execution/opencode-skill-loader/async-loader.ts
- [X] T029 [US3] Consolidate opencode skill loader exports around the canonical resolver in src/execution/opencode-skill-loader/index.ts

**Checkpoint**: All user stories are implemented with one discovery/composition pipeline.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finalize migration docs, verify end-to-end quality gates, and clean up residual complexity.

- [X] T030 [P] Update migration documentation for `.agents/skills` hard switch in docs/configurations.md
- [X] T031 [P] Update export behavior documentation for runtime parity in docs/export.md
- [X] T032 Remove or update stale references to legacy skill paths in src/cli/config-manager.ts
- [X] T033 Execute full validation commands listed in specs/001-simplify-agent-framework/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all user stories.
- **User Story Phases (Phase 3-5)**: Depend on Foundational completion.
- **Polish (Phase 6)**: Depends on completion of selected user stories.

### User Story Dependencies

- **US1 (P1)**: Starts after Phase 2; no dependency on US2/US3.
- **US2 (P2)**: Starts after Phase 2; depends functionally on US1 resolver semantics for parity assertions.
- **US3 (P3)**: Starts after Phase 2; should be applied after US1 to preserve deterministic behavior during consolidation.

### Within Each User Story

- Tests must be written first and fail before implementation (RED).
- Core resolver/domain logic before integration wiring (GREEN).
- Cleanup and simplification after passing tests (REFACTOR).

### Parallel Opportunities

- Phase 1 tasks marked `[P]` can run concurrently.
- Phase 2 task T008 can run in parallel after policy types are in place.
- US1 test tasks T010 and T011 can run in parallel.
- US2 test tasks T018 and T019 can run in parallel.
- US3 test tasks T024 and T025 can run in parallel.
- Polish documentation tasks T030 and T031 can run in parallel.

---

## Parallel Example: User Story 1

```bash
# Parallel US1 tests
Task: T010 tests/skills.test.ts
Task: T011 tests/skills.test.ts

# Then implement deterministic behavior
Task: T013 src/execution/opencode-skill-loader/loader.ts
Task: T015 src/execution/opencode-skill-loader/merger.ts
```

## Parallel Example: User Story 2

```bash
# Parallel US2 parity tests
Task: T018 src/cli/export.test.ts
Task: T019 tests/workflows-integration.test.ts

# Then align generators
Task: T021 src/execution/skills/skills-manifest.ts
Task: T022 src/script/build-skills-manifest.ts
```

## Parallel Example: User Story 3

```bash
# Parallel US3 integration tests
Task: T024 src/index.test.ts
Task: T025 src/plugin-config.test.ts

# Then consolidate runtime composition
Task: T026 src/index.ts
Task: T027 src/platform/opencode/config-composer.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Complete Phase 1 and Phase 2.
2. Complete US1 tests and implementation (Phase 3).
3. Validate deterministic discovery and collision behavior.
4. Stop for review/demo before runtime/export unification.

### Incremental Delivery

1. Deliver US1 (deterministic discovery).
2. Deliver US2 (runtime/export parity).
3. Deliver US3 (single-pipeline orchestration simplification).
4. Finalize docs and full validation in Phase 6.

### Parallel Team Strategy

1. One engineer handles foundational resolver primitives (Phase 2).
2. After Phase 2, split by story:
   - Engineer A: US1 loader/merger semantics.
   - Engineer B: US2 export/manifest parity.
   - Engineer C: US3 orchestration consolidation.
3. Merge through shared resolver contract and run full validation.

---

## Notes

- All tasks conform to strict checklist format.
- `[USx]` labels are applied only to user story phase tasks.
- File-path specificity is included for immediate executability.
- Task IDs are sequential in execution order (`T001` → `T033`).