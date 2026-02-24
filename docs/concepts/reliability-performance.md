# Reliability and Performance Analysis (Current Pipeline)

Date: 2026-02-18

## Scope

Static + dynamic analysis of the active runtime pipeline:

- plugin bootstrap and lifecycle hooks (`src/index.ts`)
- config composition (`src/plugin-config.ts`, `src/platform/opencode/config-composer.ts`)
- background orchestration (`src/features/background-agent/manager.ts`)
- tool paths (`src/tools/*`)

Validation baseline executed during this analysis:

- `bun run typecheck` -> pass
- `bun run build` -> pass
- `bun test` -> pass (2016 pass, 0 fail)

## Pipeline Model

Runtime is event-driven with four dominant flows:

1. `chat.message`: prompt preprocessing and mode/hook injection
2. `tool.execute.before`: argument gating/transforms
3. `tool.execute.after`: post-processing, reminders, transcript logic
4. `event`: session lifecycle and continuation/recovery

All hook execution is explicit and sequenced via `await` chains in `src/index.ts`.

## Reliability Assessment

### Strengths

- **Deterministic wiring**: lifecycle handlers are composed in one place (`src/index.ts`), reducing hidden side effects.
- **Schema-validated config**: invalid user/project config is rejected with error capture (`src/plugin-config.ts`, `src/config/schema.ts`).
- **Tolerant JSONC parsing for operational config surfaces**: malformed files degrade gracefully instead of crashing (config + LSP loaders).
- **Session/task lifecycle controls**: background manager tracks queued/running states and cleanup hooks (`src/features/background-agent/manager.ts`).
- **Deadlock prevention in model discovery**: config handler avoids provider-list calls during init by using cache-only pattern.

### Reliability Risks

- **Hook-order coupling**: behavior depends on fixed order in sequential `await` pipelines; reordering can create regressions.
- **State coupling across subsystems**: session-state, boulder-state, and background-task state interact through shared identifiers.
- **Large orchestrator surfaces**: Nexus Orchestrator/background/delegate-task are high-complexity modules with high blast radius.
- **Implicit policy in prompt injection**: orchestration guarantees rely partly on textual directives rather than hard capability boundaries.

## Performance Assessment

### Current Characteristics

- **Startup composition cost** is bounded but non-trivial: multiple managers and conditional hooks are instantiated on plugin load.
- **Per-event latency** is additive due to sequential hook awaits in `chat.message`, `tool.execute.before`, `tool.execute.after`, and `event`.
- **Background throughput** is controlled by `ConcurrencyManager` + keyed queues, limiting overload while preserving fairness.
- **LSP/tool path efficiency**: direct file-based config resolution and server lookup are straightforward; installation checks remain filesystem-heavy but scoped.

### Performance Risks

- **Serial hook pipeline** can become dominant latency source as hook count grows.
- **Repeated filesystem checks** in some tool/config paths can accumulate under heavy usage.
- **High-complexity prompts/injections** increase token/context overhead and downstream model latency.

## Product Impact Summary

Current pipeline prioritizes correctness and control over raw latency. Given test/build/typecheck green status, reliability posture is solid for a single-plugin runtime, but scalability risks are concentrated in orchestration hooks and serial pre/post-tool chains.

## Prioritized Improvements

1. **Introduce per-hook timing telemetry** in lifecycle handlers (p50/p95/p99 per hook).
2. **Set hook latency budgets** and enforce warnings for budget overruns.
3. **Cache expensive repeated lookups** (filesystem/model metadata) with explicit TTL + invalidation.
4. **Reduce textual policy dependence** by moving critical orchestration constraints into hard permission/tool gating where feasible.
5. **Add regression tests for hook order invariants** to prevent accidental sequencing regressions.

## Conclusion

For the current product scope (single OpenCode plugin), the direct integrated architecture is the correct reliability/performance tradeoff. The highest leverage next step is observability of hook latency and state transitions, not architectural indirection.
