# Export Reference

Ghostwire supports modular export of orchestration intelligence for external agent runtimes with full capability parity.

## Command

```bash
ghostwire export --target <copilot|codex|all> [--groups <csv>] [--strict] [--manifest] [--force] [--directory <path>]
```

## Targets

- `copilot`: emits GitHub Copilot customization artifacts.
- `codex`: emits concise `AGENTS.md`.
- `all`: emits both target outputs.

## Copilot Artifact Topology

`ghostwire export --target copilot` emits:

- `.github/copilot-instructions.md`
- `.github/instructions/*.instructions.md`
- `.github/prompts/*.prompt.md`
- `.github/skills/*/SKILL.md`
- `.github/agents/*.agent.md`
- `.github/hooks/*.json`

Export inventory is generated from current source-of-truth manifests/templates at runtime.
Use `--manifest` to inspect exact emitted counts for your current revision.

## Runtime Parity Semantics

Export skill coverage is aligned to runtime skill resolution semantics:

- canonical scoped discovery rooted at `.agents/skills`
- deterministic first-wins collision handling
- built-in skills merged as fallback after scoped resolution

This ensures export coverage metrics reflect what runtime resolves, not just static embedded defaults.

## Groups Filter

Use `--groups` to emit a subset of Copilot artifact groups:

- `instructions`
- `prompts`
- `skills`
- `agents`
- `hooks`

Example:

```bash
ghostwire export --target copilot --groups prompts,skills
```

Root `.github/copilot-instructions.md` and `.ghostwire/export-manifest.json` are always emitted for Copilot targets.

## Strict Mode

`--strict` enables export-time validation:

- artifact content must be non-empty
- JSON artifacts must parse
- `.github/copilot-instructions.md` must be <= 4000 characters
- parity coverage must report zero missing IDs for applicable classes

Strict validation failure exits with status code `1`.

## Manifest (Opt-In)

By default, export does **not** write a manifest file.

Use `--manifest` to generate:

- `.ghostwire/export-manifest.json`

`.ghostwire/export-manifest.json` includes:

- generator id
- generation timestamp
- target
- coverage summary (`source_count`, `emitted_count`, `missing_ids`, `applicable`) for agents/skills/prompts/codex catalog
- entries with path, target, SHA-256 hash, and byte size

This supports deterministic verification and auditability.
