# Jinn Configuration Reference

## Configuration File

Location: `.jinn/config.yaml`

## Schema

```yaml
version: "string" # Config version (required)
tools: # List of tools (required)
  - "opencode"
  - "cursor"
profile: "string" # Profile name (optional, default: core)
delivery: "string" # What to generate (optional, default: both)
```

## Properties

### version

Config format version. Currently `1.0.0`.

```yaml
version: "1.0.0"
```

### tools

List of AI tools to generate files for.

```yaml
tools:
  - opencode
  - cursor
  - claude
  - github-copilot
```

#### Available Tools

| Tool ID          | Description    |
| ---------------- | -------------- |
| `opencode`       | OpenCode       |
| `claude`         | Claude Code    |
| `codex`          | OpenAI Codex   |
| `github-copilot` | GitHub Copilot |
| `gemini`         | Google Gemini  |
| `cursor`         | Cursor         |

### profile

Which template profile to use.

```yaml
profile: core      # Core skills and agents
# or
profile: extended  # Full skills and agents
```

#### Profiles

| Profile    | Description                  |
| ---------- | ---------------------------- |
| `core`     | Essential skills and agents  |
| `extended` | Full skills and agent set    |

### delivery

What types of content to generate.

```yaml
delivery: both      # Skills + native agents where supported
# or
delivery: skills    # Only skills
```

#### Delivery Modes

| Mode       | Description                                         |
| ---------- | --------------------------------------------------- |
| `both`     | Generate skills and native agents where supported   |
| `skills`   | Only generate skills                                |

## Examples

### Minimal Config

```yaml
version: "1.0.0"
tools:
  - opencode
```

### Multi-Tool Config

```yaml
version: "1.0.0"
tools:
  - opencode
  - cursor
  - claude
profile: core
delivery: both
```

### Extended Profile

```yaml
version: "1.0.0"
tools:
  - opencode
  - cursor
  - claude
  - github-copilot
profile: extended
delivery: both
```

## CLI Commands

### View Config

```bash
jinn config show
```

### Add Tool

```bash
jinn config add-tool claude
```

### Remove Tool

```bash
jinn config remove-tool cursor
```

### Set Profile

```bash
jinn config set profile extended
```

## Environment Variables

None currently supported.

## Validation

The configuration is validated using Zod schemas:

- Tool IDs must be from the supported list
- Profile must be `core` or `extended`
- Delivery must be `skills` or `both`
- Version must be a valid semver string
