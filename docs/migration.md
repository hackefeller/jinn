# Ghostwire Migration Guide

## Overview

This guide helps you migrate to the new harness-agnostic architecture.

## What's New

The new architecture:
- Works across 24+ AI tools (not just OpenCode)
- Uses template-based generation
- Has a unified command interface
- Supports profiles (core, extended)

## Migration Steps

### 1. Update Installation

Old way:
```bash
# Old installation
npm install ghostwire
```

New way:
```bash
# Clone and use CLI directly
git clone https://github.com/your-repo/ghostwire.git
cd ghostwire
```

### 2. Initialize New Project

```bash
# Navigate to your project
cd your-project

# Initialize ghostwire
bun run /path/to/ghostwire/src/cli/ghostwire/index.ts init --yes
```

This creates:
- `.ghostwire/config.yaml` - Configuration file
- Tool-specific directories with commands
- Skills and agents

### 3. Update AI Tool Configuration

Each AI tool has its own configuration directory:

| Tool | Directory |
|------|-----------|
| OpenCode | `.opencode/` |
| Cursor | `.cursor/` |
| Claude | `.claude/` |
| GitHub Copilot | `.github/` |

### 4. Update Commands

Old format:
```
# Old command
/do something
```

New format:
```
/ghostwire:propose
/ghostwire:explore
/ghostwire:apply
/ghostwire:archive
```

### 5. Update Configuration

Old config (if any):
```yaml
# Old config format
commands:
  - propose
  - apply
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

## Command Mapping

| Old | New |
|-----|-----|
| `/do` | `/ghostwire:apply` |
| `/plan` | `/ghostwire:propose` |
| `/review` | `/ghostwire:code:review` |
| `/refactor` | `/ghostwire:code:refactor` |

## Profiles

### Core Profile
Essential commands:
- Workflow: propose, explore, apply, archive
- Code: format, refactor, review, optimize
- Git: smart-commit, branch, cleanup, merge

### Extended Profile
All commands plus:
- Docs commands
- Project commands
- Utility commands
- Work commands

## Updating

To update generated files:

```bash
bun run /path/to/ghostwire/src/cli/ghostwire/index.ts update
```

## Troubleshooting

### Commands not found

1. Run init: `ghostwire init --yes`
2. Check config: `ghostwire config show`
3. Update: `ghostwire update --force`

### Tool not supported

Check supported tools:
```bash
ghostwire detect
```

## Rollback

To remove ghostwire:

```bash
rm -rf .ghostwire
rm -rf .opencode .cursor .claude .github
```

## Support

For issues, check:
- `ghostwire config show` - View config
- `ghostwire detect` - Check tools
- `ghostwire update --force` - Regenerate files
