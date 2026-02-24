# Agent Reference Drift Prevention System

**Status**: ready  
**Approach**: Tagged template literals with constants + build-time validation + pre-commit hook

> **Note**: Project uses oxlint (Rust-based), not ESLint. Custom ESLint rules not available.

---

## Requirements (confirmed)

- **Code-based solution**: TypeScript constants as source of truth (not YAML)
- **Include commands and skills**: Apply same system to all three
- **Both edit-time and test-time validation**: Defense in depth

## Current State Analysis

### Sources of Truth (what exists)

| Source                                  | Type       | Contents                                   |
| --------------------------------------- | ---------- | ------------------------------------------ |
| `src/orchestration/agents/constants.ts` | TypeScript | 40 agent ID constants, type `ValidAgentId` |
| `docs/agents.yml`                       | YAML       | Agent IDs (documentation only, NOT source) |
| `docs/commands.yml`                     | YAML       | 67 command names                           |
| `docs/skills.yml`                       | YAML       | 18 skill names                             |

### Problem Areas (where drift occurs)

| Location                                         | Issue                                           |
| ------------------------------------------------ | ----------------------------------------------- |
| `src/execution/features/commands/templates/*.ts` | Hardcoded `subagent_type="planner"` (49 files)  |
| `src/execution/features/commands/commands/*.ts`  | Hardcoded `subagent_type="researcher-codebase"` |
| `agent-validation.test.ts`                       | Has DUPLICATE list of valid IDs (not imported!) |

### Validation Gap

- Test runs at `bun test` time only
- No IDE integration
- Test has its own copy of valid IDs (maintenance burden)

---

## The Core Challenge

Templates are static strings like:

```typescript
export const TEMPLATE = `<command-instruction>
Use subagent_type="planner" for planning
</command-instruction>`;
```

We need to:

1. Use constants for validation
2. Keep templates as valid strings (for agent consumption)
3. Enable IDE auto-completion
4. Catch drift at edit time

---

## Recommended Solution: Template with Constants + Validation

### Architecture

```
src/orchestration/agents/constants.ts  ← SOURCE OF TRUTH
       ↓ (imports)
src/execution/features/commands/templates/*.ts  ← Use constants
       ↓ (validated by)
build-time script + test + pre-commit hook
       ↓
bun run build → validates → CI catches issues
```

### Implementation Components

1. **Extend constants.ts** - Add command and skill constants
2. **Create template helper** - Function that validates and produces strings
3. **Build-time validation script** - Runs with `bun run build`
4. **Fix validation test** - Import from constants instead of duplicate (existing test)
5. **Add pre-commit hook** - Run validation as safety net

---

## Option Analysis (with oxlint constraint)

### Option A: Tagged Template Literals + Build-time Validation (SELECTED)

**Approach**: Import constants in templates, validate at build time.

```typescript
import { AGENT_PLANNER, CATEGORY_ULTRABRAIN } from "../../../orchestration/agents/constants";
import { commandTemplate } from "../utils";

export const TEMPLATE = commandTemplate`
  Use subagent_type="${AGENT_PLANNER}" for planning
  Use category="${CATEGORY_ULTRABRAIN}" for complex tasks
`;
```

The `commandTemplate` tagged function validates all interpolations at build time.

| Pros                                | Cons                                  |
| ----------------------------------- | ------------------------------------- |
| ✅ TypeScript type checking         | ❌ All 49 template files need updates |
| ✅ Build fails on invalid reference | ❌ Template syntax more complex       |
| ✅ Single source of truth           | ❌ No IDE inline validation           |
| ✅ Works with oxlint                |                                       |

**Feasibility**: High - Primary recommended approach.

---

### Option B: Pre-commit Hook + Auto-fix

**Approach**: Run validation before commit, auto-fix issues.

| Pros                         | Cons                                      |
| ---------------------------- | ----------------------------------------- |
| ✅ Catches issues before CI  | ❌ Not edit-time                          |
| ✅ Can auto-fix known issues | ❌ Adds friction                          |
| ✅ Works with existing code  | ❌ Developers can skip with `--no-verify` |

**Feasibility**: Medium - Good secondary layer.

---

### Option C: IDE via TypeScript LSP

**Approach**: Use TypeScript language server for basic validation.

| Pros                     | Cons                                               |
| ------------------------ | -------------------------------------------------- |
| ✅ No additional tooling | ❌ Limited validation (no string pattern matching) |
| ✅ Works in VSCode/IDEs  | ❌ Only catches import errors, not string values   |

**Feasibility**: Low - Not sufficient alone.

---

### Option D: Keep Test-only (Current State)

**Approach**: Just fix the duplicate list in validation test.

| Pros                  | Cons                                     |
| --------------------- | ---------------------------------------- |
| ✅ Minimal changes    | ❌ Only catches at test time             |
| ✅ Quick to implement | ❌ No edit-time or build-time validation |

**Feasibility**: Low - Doesn't meet requirements.

---

## Technical Implementation Plan

### Phase 1: Extend Constants (SOURCE OF TRUTH)

- Add command name constants to `constants.ts`
- Add skill name constants to `constants.ts`
- Create `VALID_COMMAND_NAMES` and `VALID_SKILL_NAMES` arrays

### Phase 2: Create Template Helper

- Create `src/execution/features/commands/utils/template-helper.ts`
- Function `commandTemplate(strings: TemplateStringsArray, ...args: any[]): string`
- Validates all agent/category references against constants
- Throws at build time if invalid reference found

### Phase 3: Build-time Validation Script

- Create `script/validate-agent-references.ts`
- Scans templates/commands for agent/category references
- Validates against constants.ts
- Run as part of `bun run build` (add to build scripts)
- Exits with error if invalid references found

### Phase 4: Fix Validation Test

- Update `agent-validation.test.ts` to import from `constants.ts`
- Remove duplicate list
- Add validation for commands and skills

### Phase 5: Pre-commit Hook

- Add `lint-staged` or similar to run validation
- Configure to check staged files

### Phase 6: Migrate Templates (49 files)

- Update each template to use constants
- Use helper function for string building

---

## Scope Boundaries

**INCLUDE**:

- Agent IDs in templates and commands
- Categories in templates and commands
- Command names validation
- Skill names validation
- Fix validation test to use constants

**EXCLUDE**:

- Runtime validation (not needed - compile-time only)
- YAML files (not source of truth)

---

## Open Questions

1. Should we auto-generate constants from YAML or maintain manually?
   - User said: "code-based solution" - so manual in TypeScript

2. How to handle the template string interpolation?
   - Use tagged template literal helper that validates

---

## Next Steps

1. User approves this plan
2. Move to `.ghostwire/plans/`
3. Execute implementation
