# Commands Reference

## Identifier Format

- Command ID: `jinn:<domain>:<action>`
- Slash form: `/jinn:<domain>:<action>`

## Families

| Family | Prefix | Function |
| --- | --- | --- |
| Workflows | `jinn:workflows:*` | planning and execution lifecycle |
| Work Loop | `jinn:work:*` | loop control |
| Code | `jinn:code:*` | review/refactor/optimize/format |
| Git | `jinn:git:*` | commit/branch/merge/cleanup |
| Project | `jinn:project:*` | init/map/build/deploy/test |
| Docs | `jinn:docs:*` | documentation workflows |
| Util | `jinn:util:*` | maintenance utilities |

## High-Use Commands

| Command | Output Class |
| --- | --- |
| `/jinn:workflows:plan` | plan document |
| `/jinn:workflows:create` | multi-mode artifact generation (`tasks|analyze|checklist|issues`) |
| `/jinn:workflows:execute` | execution state transitions |
| `/jinn:workflows:status` | progress snapshot |
| `/jinn:workflows:complete` | completion artifact |
| `/jinn:work:loop` | loop session start |
| `/jinn:work:cancel` | loop termination |
| `/jinn:project:map` | project topology artifact |

## Removed Commands

`jinn:spec:*` aliases have been removed. Use `jinn:workflows:*` directly.

## CLI Export

Use `jinn export` to generate host-native artifacts for Copilot and Codex.

Examples:

- `jinn export --target copilot`
- `jinn export --target codex`
- `jinn export --target all --groups instructions,prompts --strict --manifest`

See [Export Reference](../export.md) for artifact topology and validation rules.

## Deprecation Policy

Legacy aliases (`init-deep`, `jack-in-work`, `ultrawork-loop`, `cancel-ultrawork`, `stop-continuation`) are non-canonical and excluded from active usage guidance.

## Validation Path

- [`src/orchestration/agents/constants.ts`](../../src/orchestration/agents/constants.ts)
- [`src/platform/config/schema.ts`](../../src/platform/config/schema.ts)
- `bun test src/commands/agent-validation.test.ts`
