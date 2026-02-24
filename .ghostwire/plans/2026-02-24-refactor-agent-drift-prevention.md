---
title: Agent Drift Prevention System
type: refactor
date: '2026-02-24'
status: pending
version: 1.0.0
estimated_effort: 13.5h
---

# Agent Drift Prevention System

## Executive Summary

Implement a comprehensive system to prevent and detect "reference drift" - where command templates and command files reference agents, categories, commands, or skills that no longer exist or have been renamed, causing runtime errors and silent failures.

### Problem Statement

Without validation:
- Developers accidentally reference renamed agents → runtime errors
- Command templates get out of sync with actual agent/skill definitions
- Broken references accumulate and are hard to find
- No early warning when adding invalid references
- Configuration drift spreads across multiple files

### Solution

Build a **multi-layered prevention system** with:
1. Source-of-truth constants for all entity types
2. Build-time validation script
3. Template helper utilities with type checking
4. Pre-commit hooks for early detection
5. Comprehensive test coverage
6. Automated migration of existing code

### Scope

**In Scope:**
- 67 command names
- 18 skill names
- 10 agent IDs
- 8 category types
- 44+ command files
- 25+ template files

**Out of Scope:**
- Runtime validation (build-time only)
- Plugin marketplace references
- External integrations

---

## Table of Contents

- [Architecture](#architecture)
- [Detailed Tasks](#detailed-tasks)
- [Parallelization Strategy](#parallelization-strategy)
- [Success Criteria](#success-criteria)

---

## Architecture

### Three-Layer Prevention System

#### Layer 1: Source of Truth (Constants)

**File**: `src/orchestration/agents/constants.ts`

```typescript
// Agent identifiers
export const VALID_AGENT_IDS = [
  "operator",
  "executor", 
  "advisor-plan",
  "advisor-strategy",
  "planner",
  "researcher-codebase",
  "researcher-data",
  "validator-audit",
  "analyzer-media",
  "orchestrator",
] as const;

export type ValidAgentId = typeof VALID_AGENT_IDS[number];

// Category identifiers
export const VALID_CATEGORIES = [
  "visual-engineering",
  "ultrabrain",
  "deep",
  "artistry",
  "quick",
  "unspecified-low",
  "unspecified-high",
  "writing",
] as const;

export type ValidCategory = typeof VALID_CATEGORIES[number];

// Command names (67 total from docs/commands.yml)
export const VALID_COMMAND_NAMES = [
  "workflows:create",
  "workflows:execute",
  "workflows:status",
  "workflows:complete",
  // ... 63 more
] as const;

export type ValidCommandName = typeof VALID_COMMAND_NAMES[number];

// Skill names (18 total from docs/skills.yml)
export const VALID_SKILL_NAMES = [
  "frontend-design",
  "database-design",
  // ... 16 more
] as const;

export type ValidSkillName = typeof VALID_SKILL_NAMES[number];
```

#### Layer 2: Template Helper Utility

**File**: `src/execution/features/commands/utils/template-helper.ts`

Tagged template function for type-safe command templates:

```typescript
export function commandTemplate(
  strings: TemplateStringsArray,
  ...values: any[]
): string {
  // Validate all agent/category/skill references at build time
  // Throw descriptive errors if invalid reference found
  // Return combined template string
}
```

**Usage in templates**:
```typescript
export const myCommandTemplate = commandTemplate`
  You are the ${AGENT_IDS.operator} agent.
  Your category is ${CATEGORIES.quick}.
  Use skill: ${SKILLS.frontend_design}.
`;
```

#### Layer 3: Build-Time Validation

**File**: `script/validate-agent-references.ts`

Scans all template and command files:
- Extracts agent/category/skill references
- Validates against constants.ts
- Reports invalid references with file location
- Exits with error code if issues found

**Added to package.json**:
```json
{
  "scripts": {
    "validate:references": "bun run script/validate-agent-references.ts",
    "prebuild": "bun run validate:references"
  }
}
```

#### Layer 4: Pre-Commit Hook

**Tool**: husky + lint-staged

Runs validation on staged files before commit, preventing drift from entering the repository.

---

## Detailed Tasks

### Wave 1: Foundation (Build-Time Validation Setup)

#### Task 1: Extend constants.ts with command and skill constants

**Category**: quick  
**Effort**: 30m  
**Blocks**: Tasks 2, 3, 4, 7, 8

**Description**: Add command name constants and skill name constants to `src/orchestration/agents/constants.ts`. Create `VALID_COMMAND_NAMES` and `VALID_SKILL_NAMES` arrays with all values from `docs/commands.yml` (67 commands) and `docs/skills.yml` (18 skills). Add type `ValidCommandName` and `ValidSkillName`.

**Acceptance Criteria**:
- ✅ `VALID_COMMAND_NAMES` array contains all 67 commands
- ✅ `VALID_SKILL_NAMES` array contains all 18 skills
- ✅ TypeScript types exported for both
- ✅ No duplicate entries
- ✅ `bun run typecheck` passes

---

### Wave 2: Template Utilities & Validation Infrastructure

#### Task 2: Create template helper utility

**Category**: ultrabrain  
**Effort**: 2h  
**Blocks**: Tasks 3, 7, 8  
**Depends On**: Task 1

**Description**: Create `src/execution/features/commands/utils/template-helper.ts` with `commandTemplate` tagged template function. Function should validate all agent/category/skill references against constants.ts at build time. Throw descriptive errors if invalid reference found.

**Acceptance Criteria**:
- ✅ `commandTemplate` function exported and typed
- ✅ Validates agent references at build time
- ✅ Validates category references at build time
- ✅ Validates skill references at build time
- ✅ Descriptive error messages with file/line info
- ✅ Works with existing command templates

#### Task 3: Create build-time validation script

**Category**: deep  
**Effort**: 2h  
**Blocks**: Task 5  
**Depends On**: Tasks 1, 2

**Description**: Create `script/validate-agent-references.ts` that scans `templates/` and `commands/` directories for agent/category/skill references, validates against constants.ts, and exits with error if invalid. Add to build scripts in package.json.

**Acceptance Criteria**:
- ✅ Scans all `.ts` files in relevant directories
- ✅ Extracts agent/category/skill references
- ✅ Validates against constants.ts
- ✅ Reports errors with file paths and line numbers
- ✅ Exits with error code 1 if issues found
- ✅ Can be run via `bun run validate:references`

#### Task 4: Fix agent-validation.test.ts to use constants

**Category**: quick  
**Effort**: 30m  
**Depends On**: Task 1

**Description**: Update `src/execution/features/commands/agent-validation.test.ts` to import `VALID_AGENT_IDS`, `VALID_CATEGORIES`, and new command/skill constants from constants.ts. Remove duplicate list. Add validation tests for commands and skills.

**Acceptance Criteria**:
- ✅ Tests import constants from constants.ts
- ✅ No duplicate definitions
- ✅ Tests cover agent validation
- ✅ Tests cover category validation
- ✅ Tests cover command validation
- ✅ Tests cover skill validation
- ✅ All tests pass

---

### Wave 3: Build Validation Integration

#### Task 5: Add pre-commit hook for validation

**Category**: deep  
**Effort**: 2h  
**Depends On**: Task 3

**Description**: Add lint-staged or husky to run validate-agent-references.ts on staged files before commit. Configure to check `.ts` files in `src/execution/features/commands/`. Add to package.json devDependencies if needed.

**Acceptance Criteria**:
- ✅ husky or lint-staged installed
- ✅ Hook runs validation script on `.ts` files
- ✅ Prevents commit if validation fails
- ✅ Clear error messages guide developer fixes
- ✅ Can be bypassed with `--no-verify` if needed
- ✅ Works with existing git workflow

---

### Wave 4: Template Migration (Batch 1-3)

#### Task 6: Create commands migration batch 1 (templates/*.ts)

**Category**: quick  
**Effort**: 2h  
**Depends On**: Tasks 1, 2

**Description**: Migrate first batch of template files in `src/execution/features/commands/templates/` to use constants and commandTemplate helper. Update imports and replace hardcoded strings with constants.

**Files**:
- project.ts
- refactor.ts
- deepen-plan.ts
- workflows.ts
- code.ts
- plan-review.ts
- git.ts
- util.ts
- lint-ruby.ts

**Acceptance Criteria**:
- ✅ All listed templates migrated
- ✅ Use constants for agent/category/skill refs
- ✅ No hardcoded reference strings remain
- ✅ `bun run typecheck` passes
- ✅ `bun run build` succeeds

#### Task 7: Create commands migration batch 2 (templates/*.ts)

**Category**: quick  
**Effort**: 2h  
**Depends On**: Tasks 1, 2

**Description**: Migrate second batch of template files to use constants. 

**Files**:
- release-docs.ts
- resolve-parallel.ts
- heal-skill.ts
- feature-video.ts
- resolve-pr-parallel.ts
- docs.ts
- stop-continuation.ts
- teach-me.ts
- xcode-test.ts
- deploy-docs.ts
- generate-command.ts

**Acceptance Criteria**:
- ✅ All listed templates migrated
- ✅ Use constants for all references
- ✅ No hardcoded strings remain
- ✅ `bun run typecheck` passes

#### Task 8: Create commands migration batch 3 (templates/*.ts)

**Category**: quick  
**Effort**: 2h  
**Depends On**: Tasks 1, 2

**Description**: Migrate remaining template files to use constants.

**Files**:
- changelog.ts
- triage.ts
- work.loop.ts
- quiz-me.ts
- sync-tutorials.ts
- test-browser.ts
- reproduce-bug.ts
- resolve-todo-parallel.ts
- create-agent-skill.ts
- report-bug.ts
- lfg.ts

**Acceptance Criteria**:
- ✅ All listed templates migrated
- ✅ 100% of template files converted
- ✅ `bun run typecheck` passes
- ✅ `bun run build` succeeds

---

### Wave 5: Command File Migration

#### Task 9: Migrate command files to use constants

**Category**: quick  
**Effort**: 2h  
**Depends On**: Task 1

**Description**: Update command files in `src/execution/features/commands/commands/` to import and use constants from constants.ts. Replace hardcoded `subagent_type` and `category` values. There are 44 command files total.

**Acceptance Criteria**:
- ✅ All 44 command files updated
- ✅ Import constants from constants.ts
- ✅ No hardcoded agent/category values remain
- ✅ Types align with constant types
- ✅ `bun run typecheck` passes

---

### Wave 6: Verification & Cleanup

#### Task 10: Run full validation and fix any issues

**Category**: quick  
**Effort**: 30m  
**Depends On**: Tasks 3, 4, 6, 7, 8, 9

**Description**: Run `bun run build` and `bun test` to verify all validation passes. Fix any issues found. Ensure agent-validation.test.ts passes with new constants.

**Acceptance Criteria**:
- ✅ `bun run validate:references` passes
- ✅ `bun run typecheck` shows no errors
- ✅ `bun run build` succeeds
- ✅ `bun test` passes (all tests)
- ✅ agent-validation.test.ts passes
- ✅ No warnings or errors in build output

---

## Parallelization Strategy

### Wave Breakdown

```
WAVE 1 (No dependencies):
└── Task 1: Extend constants.ts

WAVE 2 (After Wave 1):
├── Task 2: Template helper utility (parallel)
├── Task 3: Build-time validation (parallel)
└── Task 4: Fix test file (parallel)

WAVE 3 (After Wave 2):
└── Task 5: Pre-commit hook

WAVE 4 (After Wave 2, parallel):
├── Task 6: Template migration batch 1
├── Task 7: Template migration batch 2
└── Task 8: Template migration batch 3

WAVE 5 (After Wave 2):
└── Task 9: Command file migration

WAVE 6 (After all others):
└── Task 10: Full validation
```

**Critical Path**: Task 1 → Task 2/3 → Task 5 → Task 10  
**Parallel Tasks**: By Wave 2-4, can run Tasks 2-9 in parallel  
**Speedup**: ~40% faster with full parallelization

---

## Implementation Approach

### Atomic Commits

1. `refactor(validation): add agent/command/skill constants`
2. `refactor(validation): add template helper utility`
3. `refactor(validation): add build-time validation script`
4. `test: update agent-validation tests for constants`
5. `chore: add pre-commit validation hook`
6. `refactor(templates): migrate templates to use constants` (per batch)
7. `refactor(commands): migrate command files to constants`
8. `ci: add validation to build and test pipeline`

### Testing Strategy

- **Unit tests**: Validate constants are complete and correct
- **Helper tests**: Test commandTemplate validation
- **Integration tests**: Verify validator script finds all issues
- **Build tests**: Ensure build fails if validation fails

---

## Success Criteria

✅ **Constants system established** with all entity types  
✅ **Template helper** provides build-time validation  
✅ **Validation script** scans and reports issues  
✅ **Pre-commit hook** prevents drift before commit  
✅ **44+ command files** migrated to use constants  
✅ **25+ templates** migrated to use constants  
✅ **100% test coverage** for validation system  
✅ **Build integration** ensures validation runs  
✅ **Zero drift** - no invalid references in codebase  
✅ **Developer experience** improved with type safety

---

## Success Metrics

| Metric | Target | Validation |
|--------|--------|-----------|
| Constants completeness | 100% agents/categories/commands/skills | Audit against docs/\*.yml |
| Code coverage | >90% for validation code | `bun test` coverage report |
| Validation cost | <100ms per build | Benchmark script performance |
| Pre-commit latency | <500ms | Measure hook execution time |
| False negatives | 0 | Manual code review |
| Developer adoption | 100% team compliance | git logs with valid refs |

---

## Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Constants go stale | Medium | Automated sync with docs/\*.yml on update |
| False positives | Medium | Careful regex for reference extraction |
| Performance impact | Low | Validation script optimized, cacheable |
| Developer friction | Low | Clear error messages, bypass with `--no-verify` |
| Incomplete migration | Low | Batch tracking, final audit before cleanup |

---

## Dependencies

- **Internal**: Present agent/category/command/skill definitions (AGENTS.md, docs/)
- **External**: husky (git hooks), TypeScript compiler
- **File dependencies**: constants.ts must be complete before validation scripts

---

## Rollout Plan

**Phase 1 (Foundation)**: Tasks 1-4
- Establish constants and test infrastructure
- Share with team for validation

**Phase 2 (Integration)**: Task 5
- Add pre-commit hook
- Gradual enforcement

**Phase 3 (Migration)**: Tasks 6-9
- Migrate existing code over 1-2 weeks
- Parallel team work

**Phase 4 (Enforcement)**: Task 10
- Full validation in CI/CD
- Zero tolerance for drift

---

## Next Steps

1. **Kick off Wave 1**: Core constants definition
2. **Review with team**: Validate constants completeness
3. **Proceed to Wave 2**: Build validation infrastructure
4. **Execute Wave 4**: Migrate existing code
5. **Deploy Wave 6**: Full validation in pipeline

This system prevents drift from accumulating and provides developers with early feedback when references become invalid.
