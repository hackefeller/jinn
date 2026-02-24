# PROJECT KNOWLEDGE BASE

**Generated:** 2026-02-23T20:32:38+00:00
**Commit:** Task-driven workflow architecture complete (Phases 1-6, 15-16)
**Branch:** Task-driven development

---

## **IMPORTANT: PULL REQUEST TARGET BRANCH**

> **ALL PULL REQUESTS MUST TARGET THE `main` BRANCH.**
>
> Use feature branches and submit PRs against `main` for review.

---

## OVERVIEW

OpenCode plugin: multi-model agent orchestration (Claude Opus 4.5, GPT-5.2, Gemini 3 Flash, Grok Code). 39 lifecycle hooks, 14 tools (LSP, AST-Grep, delegation), 10 specialized agents, full Claude Code compatibility. "oh-my-zsh" for OpenCode.

**NEW**: Task-driven workflow architecture with structured task breakdown, automatic parallelization, and intelligent agent delegation.

## TASK-DRIVEN WORKFLOW ARCHITECTURE

> **See `.ghostwire/TASK_DRIVEN_ARCHITECTURE_GUIDE.md` for complete migration guide.**

### Key Features

1. **Structured Task Breakdown** - Plans decomposed into JSON-specified tasks with dependencies
2. **Automatic Parallelization** - Tasks grouped into execution waves based on dependencies using topological sort
3. **Intelligent Delegation** - Tasks routed to appropriate agents by category (8 categories)
4. **Execution Orchestration** - Workflow state tracked through completion with progress reports

### New Commands

| Command | Old Name | Purpose |
|---------|----------|---------|
| `/workflows:create` | N/A | Break feature into tasks with JSON structure |
| `/workflows:execute` | `jack-in-work` | Execute plan with task delegation |
| `/workflows:status` | N/A | Check workflow progress |
| `/workflows:complete` | N/A | Finalize completed workflow |
| `/work:loop` | `ultrawork-loop` | Continuous execution with retry |
| `/work:cancel` | `cancel-ultrawork` | Cancel active loop |
| `/workflows:stop` | `stop-continuation` | Stop all continuation |

**Backward Compatibility**: Old command names still work and route to same handlers.

### Task Structure

```json
{
  "id": "task-1",
  "subject": "Task title",
  "description": "Detailed description",
  "category": "visual-engineering | ultrabrain | quick | deep | artistry | writing",
  "skills": ["skill1", "skill2"],
  "estimatedEffort": "30m" | "2h",
  "status": "pending | in_progress | completed",
  "blocks": ["task-2"],
  "blockedBy": ["task-1"],
  "wave": 1
}
```

### Delegation Categories

| Category | Agent Type | Skills |
|----------|-----------|--------|
| `visual-engineering` | Frontend specialist | `frontend-ui-ux`, custom |
| `ultrabrain` | Seer Advisor | Architecture, logic |
| `quick` | Main agent | Trivial fixes |
| `deep` | Archive Researcher | Analysis, research |
| `artistry` | Creative specialist | Unconventional solutions |
| `writing` | Documentation | Prose, technical writing |
| `unspecified-low` | Main agent | Fallback simple work |
| `unspecified-high` | Seer Advisor | Fallback complex work |

### Implementation Status

**Foundation Phases (1-6):**
- ✅ Phase 1: Command definitions
- ✅ Phase 2: Command routing
- ✅ Phase 3: Task structure types + Parallelization engine (topological sort)
- ✅ Phase 4: Delegation engine (category → agent mapping) + Execution orchestrator (state machine)
- ✅ Phase 5: workflows:create hook (feature → tasks)
- ✅ Phase 6: Testing infrastructure (89 tests, 265 assertions)

**Execution Phases (15-16):**
- ✅ Phase 15: workflows:execute hook (task execution with delegation)
- ✅ Phase 16: workflows:status hook (progress tracking and reporting)

*Phases 7-14 reserved for future enhancements (recovery, retries, history, completion, etc.)*

**Status**: ✅ **COMPLETE - Foundation + Execution phases implemented (1-6, 15-16)**

## PROJECT CONSTITUTION

> **Project principles and governance are defined in `.ghostwire/constitution.md`**
>
> All development work must comply with the core principles outlined in the constitution:
> - Library-First Architecture
> - CLI Interface
> - Test-First Development (NON-NEGOTIABLE)
> - Integration Testing
> - Observability
>
> See the constitution file for detailed guidelines and amendment process.

## METADATA

- `docs/agents.yml`: Agent metadata (names, models, purposes, fallbacks)
- `docs/hooks.yml`: Hook metadata (names, triggers, descriptions)
- `docs/tools.yml`: Tool metadata (names, categories, descriptions)
- `docs/features.yml`: Feature metadata (names, capabilities, descriptions)

## STRUCTURE

```
ghostwire/
├── src/
│   ├── orchestration/  # Agents + Hooks (what orchestrates)
│   │   ├── agents/        (what agents exist)
│   │   ├── hooks/         (when to call agents)
│   │   └── hooks/workflows-create/  # NEW: workflows:create handler
│   ├── execution/      # Features + Tools (what does work)
│   │   ├── features/      (what capabilities)
│   │   ├── features/task-queue/  # NEW: Task queue system
│   │   └── tools/         (what actions can be taken)
│   ├── integration/    # Shared utilities + MCPs (what integrates)
│   │   ├── shared/        # Cross-cutting utilities (logger, parser, etc.)
│   │   └── mcp/           # Built-in MCPs (websearch, context7, grep_app)
│   ├── platform/       # Config + Platform-specific (what configures)
│   │   ├── config/        # Zod schema, migrations, permission compat
│   │   ├── opencode/      # OpenCode-specific config
│   │   └── claude/        # Claude-specific config
│   ├── cli/            # CLI installer, doctor
│   └── index.ts        # Main plugin entry
├── .ghostwire/
│   ├── TASK_DRIVEN_ARCHITECTURE_GUIDE.md  # NEW: Migration guide
│   └── plans/          # Plan files with embedded tasks
├── script/             # build-schema.ts, build-binaries.ts
├── packages/           # 7 platform-specific binaries
└── dist/               # Build output (ESM + .d.ts)
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add agent | `src/orchestration/agents/` | Create .md with YAML frontmatter and prompt |
| Add hook | `src/orchestration/hooks/` | Create dir with `createXXXHook()`, register in index.ts |
| Add tool | `src/execution/tools/` | Dir with index/types/constants/tools.ts |
| Add MCP | `src/integration/mcp/` | Create config, add to index.ts |
| Add skill | `src/execution/features/skills/` | Create dir with SKILL.md |
| Add command | `src/execution/features/commands/commands/` | One command per file: `workflows.plan.ts`, `code.refactor.ts`, etc. |
| Config schema | `src/platform/config/schema.ts` | Zod schema, run `bun run build:schema` |
| **Task queue** | `src/execution/features/task-queue/` | **NEW**: Types, parser, parallelization, delegation, orchestrator |
| **Workflow hooks** | `src/orchestration/hooks/workflows-*` | **NEW**: workflows:create, workflows:execute, workflows:status command handlers |
| Background agents | `src/execution/features/background-agent/manager.ts` | Task lifecycle, concurrency (1419 lines) |
| Orchestrator | `src/orchestration/hooks/grid-sync/index.ts` | Main orchestration hook (757 lines) |

## TDD (Test-Driven Development)

**MANDATORY.** RED-GREEN-REFACTOR:
1. **RED**: Write test → `bun test` → FAIL
2. **GREEN**: Implement minimum → PASS
3. **REFACTOR**: Clean up → stay GREEN

**Rules:**
- NEVER write implementation before test
- NEVER delete failing tests - fix the code
- Test file: `*.test.ts` alongside source (603 test files after task-driven work)
- BDD comments: `//#given`, `//#when`, `//#then`

**Test Coverage**: 
- Task queue: 82 unit tests
- Workflows-create: 12 hook tests
- Workflows-execute: 7 hook tests
- Workflows-status: 9 hook tests
- Integration: 10 end-to-end tests
- **Total: 120 new tests** ✅

## CONVENTIONS

- **Package manager**: Bun only (`bun run`, `bun build`, `bunx`)
- **Types**: bun-types (NEVER @types/node)
- **Build**: `bun build` (ESM) + `tsc --emitDeclarationOnly`
- **Exports**: Barrel pattern via index.ts
- **Naming**: kebab-case dirs, `createXXXHook`/`createXXXTool` factories
- **Testing**: BDD comments, 603 test files
- **Temperature**: 0.1 for code agents, max 0.3
- **Tasks**: Use `blocks`/`blockedBy` arrays, assign category, validate before delegation

## ANTI-PATTERNS

| Category | Forbidden |
|----------|-----------|
| Package Manager | npm, yarn - Bun exclusively |
| Types | @types/node - use bun-types |
| File Ops | mkdir/touch/rm/cp/mv in code - use bash tool |
| Publishing | Direct `bun publish` - GitHub Actions only |
| Versioning | Local version bump - CI manages |
| Type Safety | `as any`, `@ts-ignore`, `@ts-expect-error` |
| Error Handling | Empty catch blocks |
| Testing | Deleting failing tests |
| Agent Calls | Sequential - use `delegate_task` parallel |
| Hook Logic | Heavy PreToolUse - slows every call |
| Commits | Giant (3+ files), separate test from impl |
| Temperature | >0.3 for code agents |
| Trust | Agent self-reports - ALWAYS verify |

## AGENT MODELS

**Source of truth:** `agents.yml`  
This table is intentionally maintained in `agents.yml` to avoid drift. Please refer there for current agent names, models, purposes, and fallbacks.

## COMMANDS

```bash
bun run typecheck      # Type check
bun run build          # ESM + declarations + schema
bun run rebuild        # Clean + Build
bun test               # 594 test files
```

## DEPLOYMENT

**GitHub Actions workflow_dispatch ONLY**
1. Commit & push changes
2. Trigger: `gh workflow run publish -f bump=patch`
3. Never `bun publish` directly, never bump version locally

## COMPLEXITY HOTSPOTS

| File | Lines | Description |
|------|-------|-------------|
| `src/execution/features/skills/skills.ts` | 1729 | Skill definitions |
| `src/execution/features/background-agent/manager.ts` | 1419 | Task lifecycle, concurrency |
| `src/execution/tools/delegate-task/tools.ts` | 1414 | Category-based delegation |
| `src/orchestration/agents/planner.ts` | 1283 | Planning agent (planner) |
| `src/index.ts` | 940 | Main plugin entry |
| `src/orchestration/hooks/grid-sync/index.ts` | 757 | Main orchestration hook (orchestrator) |
| `src/cli/config-manager.ts` | 741 | JSONC config parsing |

## MCP ARCHITECTURE

Three-tier system:
1. **Built-in**: websearch (Exa), context7 (docs), grep_app (GitHub)
2. **Claude Code compat**: .mcp.json with `${VAR}` expansion
3. **Skill-embedded**: YAML frontmatter in skills

## CONFIG SYSTEM

- **Zod validation**: `src/platform/config/schema.ts`
- **JSONC support**: Comments, trailing commas
- **Multi-level**: Project (`.opencode/`) → User (`~/.config/opencode/`)

## NOTES

- **OpenCode**: Requires >= 1.0.150
- **Flaky tests**: overclock-loop (CI timeout), session-state (parallel pollution)
- **Trusted deps**: @ast-grep/cli, @ast-grep/napi, @code-yeongyu/comment-checker
