# Agent CLI Audit Log

Ghostwire hook guardrails now write append-only JSONL audit events for agent CLI commands.

Runtime executable:

- `bin/agent-cli-audit.js`

## Location

- Primary log: `.ghostwire/logs/agent-cli.jsonl`
- Archives: `.ghostwire/logs/agent-cli.jsonl.1` ... `.ghostwire/logs/agent-cli.jsonl.10`

## Event schema (v1)

Each line is one JSON object.

Required fields:

- `schema_version` (`"1"`)
- `event_type` (`"pre_tool_use"`, `"post_tool_use"`, or `"session_start"`)
- `ts` (RFC3339 UTC with milliseconds)
- `session_id`
- `tool_name`
- `cwd`
- `command_redacted`
- `command_hash_sha256`

`post_tool_use` may include:

- `exit_code`
- `duration_ms`

## Rotation

- Rotate when active file would exceed `50MB`.
- Keep 10 archives (`.1` newest, `.10` oldest).

## Redaction

Before persistence, command text redacts:

- assignment-like secrets: variables containing `TOKEN`, `PASSWORD`, `SECRET`, or `API_KEY`
- secret flags: `--token`, `--password`, `--secret`, `--api-key`

The logger also stores `command_hash_sha256` of the original command for correlation.

## Failure behavior

Hook logging is fail-open. Logger errors are emitted to stderr and process exit code remains `0` so command execution is not blocked.
