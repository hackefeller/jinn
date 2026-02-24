$ ghostwire export --target all
$ ghostwire export --target copilot --directory /path/to/repo
$ ghostwire export --target codex --force

Exports Ghostwire intelligence into host-native instruction files:

- `copilot` -> `.github/copilot-instructions.md`
- `codex` -> `AGENTS.md`
- `all` -> both files

Use `--force` to overwrite existing instruction files.
