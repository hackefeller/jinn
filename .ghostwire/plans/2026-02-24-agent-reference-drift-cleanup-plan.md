---
title: Agent Reference Drift Cleanup Plan
type: plan
date: '2026-02-24'
status: draft
---

# Agent Reference Drift Cleanup Plan

## Summary
Eliminate stale references to removed agents/commands/skills in active runtime code, tests, and user-facing docs/prompts. Enforce deterministic identifier mapping and hard-remove deprecated command aliases from compatibility surfaces. Exclude historical archives under `.ghostwire/plans` and `.ghostwire/specs`.

## Scope
- In scope:
  - `src/**` runtime references
  - `tests/**` active regression/validation tests
  - `README.md`, `system-prompt.md`, `src/plugin/README.md`
  - validation tooling (`script/validate-agent-references.ts`)
  - command/agent constants and validation lists
- Out of scope:
  - `.ghostwire/plans/**`
  - `.ghostwire/specs/**`
  - backup/original files (`*.bak`, `*.orig`)

## Deterministic Mapping
- `seer-advisor` → `advisor-plan`
- `scout-recon` → `researcher-codebase`
- `archive-researcher` → `researcher-data`
- `performance-seer-advisor` → `oracle-performance`
- `tactician-strategist` → `advisor-strategy`
- `glitch-auditor` → `validator-bugs`
- `zen-planner` / `plan` → `planner`
- `nexus-orchestrator` / `build` → `orchestrator`

## Public Interface Changes
- Remove deprecated command aliases from exported command constants and valid-command arrays.
- Canonical IDs become the only valid runtime/template references.
- Reference validator scan scope expands beyond command/templates into core runtime paths and top-level docs.

## Implementation
- [ ] Replace stale runtime agent IDs in active code paths (starting with `src/execution/features/task-queue/delegation-engine.ts`).
- [ ] Normalize hardcoded subagent identifiers to canonical values (prefer constants from `src/orchestration/agents/constants.ts`).
- [ ] Hard-remove legacy command alias constants and remove them from validation allowlists.
- [ ] Update command/schema tests to assert old aliases fail and canonical names pass.
- [ ] Rewrite stale identifiers in active docs/prompts:
  - [ ] `README.md`
  - [ ] `system-prompt.md`
  - [ ] `src/plugin/README.md`
- [ ] Rewrite stale identifiers in active command templates and brainstorming skill copy.
- [ ] Update `package.json` keyword metadata to current canonical terminology.
- [ ] Replace legacy fixture arrays in `tests/regression.test.ts` with canonical agent/command sets.
- [ ] Extend `script/validate-agent-references.ts` scan coverage to include:
  - [ ] `src/execution/features/task-queue/**`
  - [ ] `src/orchestration/hooks/**`
  - [ ] `README.md`, `system-prompt.md`, `src/plugin/README.md`
- [ ] Add validator diagnostics that suggest deterministic replacement targets for known legacy IDs.
- [ ] Add/adjust tests for expanded validator behavior and replacement hint reporting.

## Verification
- [ ] `bun run validate:agent-references` passes with expanded coverage.
- [ ] `bun test tests/regression.test.ts` passes with updated canonical assertions.
- [ ] Validation/command tests pass for alias removal behavior.
- [ ] `bun run typecheck` passes.
- [ ] Final grep gate reports zero stale IDs in active tree:
  - `seer-advisor|scout-recon|archive-researcher|performance-seer-advisor|tactician-strategist|glitch-auditor|zen-planner|nexus-orchestrator`
  - excluding `.ghostwire/plans`, `.ghostwire/specs`, `*.bak`, `*.orig`.

## Risks
- Hidden references in long prompt/template prose may evade narrow regex.
- Alias removal may break external users relying on undocumented legacy names.
- Mixed semantic usage in prose may require targeted wording updates after deterministic replacement.

## Acceptance Criteria
- No stale identifiers in active source/tests/docs.
- Runtime delegation never points to removed agents.
- Deprecated command aliases are removed from active validation surfaces.
- Automated validator prevents reintroduction of legacy identifiers.
