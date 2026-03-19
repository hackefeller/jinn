# Jinn Migration Guide

## Overview

This guide helps you migrate to the current jinn architecture.

## What's New

The current architecture:

- Works across the supported AI tools in this repository
- Uses template-based generation
- Separates reusable skills from native agent files
- Supports profiles (`core`, `extended`)

## Migration Steps

### 1. Update Installation

Old way:

```bash
# Old installation
npm install ghostwire
```

Current way:

```bash
# Install jinn
npm install -g @hackefeller/jinn
```

### 2. Initialize New Project

```bash
# Navigate to your project
cd your-project

# Initialize jinn
jinn init --yes
```

This creates:

- `.jinn/config.yaml` - Configuration file
- Tool-specific skill directories
- Native agent files for tools that support them

### 3. Update AI Tool Configuration

Each AI tool has its own configuration directory:

| Tool           | Directory                |
| -------------- | ------------------------ |
| OpenCode       | `.opencode/`             |
| Cursor         | `.cursor/`               |
| Claude Code    | `.claude/`               |
| GitHub Copilot | `.github/`               |
| OpenAI Codex   | `.agents/` and `.codex/` |
| Gemini         | `.gemini/`               |

### 4. Update Workflow Entry Points

Move from ad hoc tool-specific prompts to the generated jinn skills and native agents for planning, exploration, execution, and review.

### 5. Update Configuration

Old config (if any):

```yaml
# Old config format
tools:
  - opencode
```

New config:

```yaml
# New config format
version: "1.0.0"
tools:
  - opencode
  - cursor
profile: core
delivery: both
```

## Profiles

### Core Profile

Essential skills and agents:

- Workflow skills: propose, explore, apply, archive, review
- Domain skills: git, frontend-design, code-quality, docs, build, deploy
- Native agents: plan, do, review, architect, designer, git, search

### Extended Profile

Extended profile adds the broader skill and agent set used across the repository.

## Updating

To update generated files:

```bash
jinn update
```

## Troubleshooting

### Commands not found

1. Run init: `jinn init --yes`
2. Check config: `jinn config show`
3. Update: `jinn update --force`

### Tool not supported

Check supported tools:

```bash
jinn detect
```

## Rollback

To remove jinn-managed output:

```bash
rm -rf .jinn .opencode .claude .github .gemini .cursor .agents .codex
```

## Support

For issues, check:

- `jinn config show` - View config
- `jinn detect` - Check tools
- `jinn update --force` - Regenerate files
