# Jinn Quick Start Guide

## Installation

```bash
npm install -g @hackefeller/jinn
# or
bunx jinn init
```

## Quick Start

### 1. Initialize Your Project

```bash
# Navigate to your project
cd your-project

# Initialize jinn with auto-detection
jinn init --yes

# Or specify tools manually
jinn init --tools opencode,claude,cursor
```

### 2. Use The Installed Workflows

In your AI tool, invoke the generated workflows and agents for planning, exploration, execution, and review.

### 3. Update Generated Files

```bash
# Regenerate all files
jinn update

# Update specific tool
jinn update --tool cursor
```

## Configuration

Jinn creates `.jinn/config.yaml`:

```yaml
version: "1.0.0"
tools:
  - opencode
  - cursor
profile: core
delivery: both
```

### Profiles

- **core** - Essential skills and agents
- **extended** - Full skills and agents

### Delivery Modes

- **skills** - Only skills
- **both** - Skills and native agents where supported

## Supported Tools

Jinn supports 6 AI coding tools:

| Tool           | ID               | Directory    |
| -------------- | ---------------- | ------------ |
| OpenCode       | `opencode`       | `.opencode/` |
| Claude Code    | `claude`         | `.claude/`   |
| OpenAI Codex   | `codex`          | `.agents/`   |
| GitHub Copilot | `github-copilot` | `.github/`   |
| Google Gemini  | `gemini`         | `.gemini/`   |
| Cursor         | `cursor`         | `.cursor/`   |

## Example Workflows

### Starting New Work

1. Use the propose workflow to define the change
2. Use the explore workflow if you need to research
3. Use the apply workflow to implement
4. Use the archive workflow when done

### Code Review

1. Invoke the review workflow or review agent
2. The generated review system will analyze and provide feedback

### Performance Optimization

1. Use the planning or execution workflow to scope the optimization
2. Delegate to the relevant specialist or skill

## Troubleshooting

### No tools detected

```bash
# Check what tools are available
jinn detect
```

### Config issues

```bash
# View current config
jinn config show
```

### Regenerate files

```bash
# Force regeneration
jinn update --force
```

## Next Steps

- Read the [Architecture Overview](./docs/architecture.md)
- Check [Configuration Reference](./docs/config.md)
- Explore [Available Commands](./docs/commands.md)
