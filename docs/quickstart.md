# Ghostwire Quick Start Guide

## Installation

```bash
# Clone the repository
git clone https://github.com/your-repo/ghostwire.git
cd ghostwire

# Install dependencies (if needed)
bun install
```

## Quick Start

### 1. Initialize Your Project

```bash
# Navigate to your project
cd your-project

# Initialize ghostwire with auto-detection
bun run /path/to/ghostwire/src/cli/ghostwire/index.ts init --yes

# Or specify tools manually
bun run /path/to/ghostwire/src/cli/ghostwire/index.ts init --tools opencode,cursor
```

### 2. Use Ghostwire Commands

In your AI tool, use these commands:

```
/ghostwire:propose - Start a new change
/ghostwire:explore - Explore a problem space  
/ghostwire:apply - Implement changes
/ghostwire:archive - Complete and document work
```

### 3. Update Generated Files

```bash
# Regenerate all files
bun run /path/to/ghostwire/src/cli/ghostwire/index.ts update

# Update specific tool
bun run /path/to/ghostwire/src/cli/ghostwire/index.ts update --tool cursor
```

## Configuration

Ghostwire creates `.ghostwire/config.yaml`:

```yaml
version: "1.0.0"
tools:
  - opencode
  - cursor
profile: core
delivery: both
```

### Profiles

- **core** - Essential commands and agents
- **extended** - Full command set

### Delivery Modes

- **commands** - Only commands
- **skills** - Only skills
- **both** - Commands and skills

## Supported Tools

Ghostwire supports 24 AI coding assistants:

| Tool | Command Format |
|------|----------------|
| OpenCode | `/ghostwire:command` |
| Cursor | `/ghostwire:command` |
| Claude Code | `/ghostwire:command` |
| GitHub Copilot | `@ghostwire /command` |
| Continue | `/ghostwire:command` |
| Cline | `/ghostwire:command` |
| Amazon Q | `/ghostwire:command` |
| Windsurf | `/ghostwire:command` |

## Example Workflows

### Starting New Work

1. Use `/ghostwire:propose` to define the change
2. Use `/ghostwire:explore` if you need to research
3. Use `/ghostwire:apply` to implement
4. Use `/ghostwire:archive` when done

### Code Review

1. Use `/ghostwire:code:review` to review changes
2. Agents will analyze and provide feedback

### Performance Optimization

1. Use `/ghostwire:code:optimize` with target
2. Agents will profile and optimize

## Troubleshooting

### No tools detected

```bash
# Check what tools are available
bun run /path/to/ghostwire/src/cli/ghostwire/index.ts detect
```

### Config issues

```bash
# View current config
bun run /path/to/ghostwire/src/cli/ghostwire/index.ts config show
```

### Regenerate files

```bash
# Force regeneration
bun run /path/to/ghostwire/src/cli/ghostwire/index.ts update --force
```

## Next Steps

- Read the [Architecture Overview](./docs/architecture.md)
- Check [Configuration Reference](./docs/config.md)
- Explore [Available Commands](./docs/commands.md)
