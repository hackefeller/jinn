import type { CommandDefinition } from "../../claude-code-command-loader";

export const NAME = "ghostwire:spec:tasks";
export const DESCRIPTION = "Generate actionable tasks from implementation plan";
export const TEMPLATE = `<command-instruction>
---
description: "Task list for $FEATURE_NAME implementation"
---

# Tasks: $FEATURE_NAME

**Input**: Design documents from \`.ghostwire/specs/$BRANCH_NAME/\`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

---

## Format: \`[ID] [P?] [Story?] Description\`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: \`src/\`, \`tests/\` at repository root
- **Web app**: \`backend/src/\`, \`frontend/src/\`
- **Mobile**: \`api/src/\`, \`ios/src/\` or \`android/src/\`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

$SETUP_TASKS

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story

⚠️ **CRITICAL**: No user story work can begin until this phase is complete

$FOUNDATIONAL_TASKS

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

$USER_STORY_PHASES

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] TXXX [P] Documentation updates in docs/
- [ ] TXXX Code cleanup and refactoring
- [ ] TXXX Performance optimization across all stories
- [ ] TXXX [P] Additional unit tests in tests/unit/
- [ ] TXXX Security hardening
- [ ] TXXX Run quickstart.md validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

$USER_STORY_DEPENDENCIES

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
</command-instruction>`;
export const ARGUMENT_HINT = "[path to plan.md or auto-detect from branch]";

export const COMMAND: CommandDefinition = {
  name: NAME,
  description: DESCRIPTION,
  template: TEMPLATE,
  argumentHint: ARGUMENT_HINT,
};