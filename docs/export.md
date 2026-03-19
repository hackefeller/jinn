# Export Reference

Jinn exports workflow commands, skills, and agents into the native shapes expected by each supported runtime.

## Command

```bash
jinn export --target <copilot|codex|all> [--groups <csv>] [--strict] [--force] [--directory <path>]
```

## Targets

- `copilot`: emits GitHub Copilot customization artifacts.
- `codex`: emits Codex-native `.codex/skills/*/SKILL.md` and `.codex/agents/*.toml` artifacts.
- `all`: emits both target outputs.

## Copilot Artifact Topology

`jinn export --target copilot` emits:

- `.github/copilot-instructions.md`
- `.github/instructions/*.instructions.md`
- `.github/prompts/*.prompt.md`
- `.github/skills/*/SKILL.md`
- `.github/agents/*.agent.md`
- `.github/hooks/*.json`

## Codex Artifact Topology

`jinn export --target codex` emits:

- `.codex/skills/*/SKILL.md`
- `.codex/agents/*.toml`

Codex skills are emitted into `.codex/skills` and native agents are emitted into `.codex/agents`.

## Runtime Parity Semantics

Codex skill export is aligned to runtime skill resolution semantics:

- canonical scoped discovery rooted at `.codex/skills`
- deterministic first-wins collision handling
- built-in skills merged as fallback after scoped resolution

Workflow skills are emitted with Codex-style `SKILL.md` frontmatter that includes only `name` and `description`.

## Groups Filter

Use `--groups` to emit a subset of Copilot artifact groups:

- `instructions`
- `prompts`
- `skills`
- `agents`
- `hooks`

Example:

```bash
jinn export --target copilot --groups prompts,skills
```

Root `.github/copilot-instructions.md` is always emitted for Copilot targets.

## Strict Mode

`--strict` enables export-time validation:

- artifact content must be non-empty
- JSON artifacts must parse
- parity coverage must report zero missing IDs for applicable classes

Strict validation failure exits with status code `1`.
