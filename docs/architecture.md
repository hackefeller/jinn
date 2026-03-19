# Ghostwire Architecture

## Overview

Ghostwire uses a harness-agnostic architecture that allows it to work across 24+ AI coding assistants.

## Core Components

### 1. Adapters (`src/core/adapters/`)

Adapters format ghostwire content for specific AI tools:

```
src/core/adapters/
├── index.ts        # Exports all adapters
├── registry.ts    # Adapter registry
├── types.ts       # Adapter interfaces
├── opencode.ts    # OpenCode adapter
├── cursor.ts      # Cursor adapter
├── claude.ts      # Claude Code adapter
└── ... (24 total)
```

Each adapter implements `ToolCommandAdapter`:

- `toolId` - Unique identifier
- `skillsDir` - Tool's skills directory
- `getCommandPath()` - Generate command file path
- `getSkillPath()` - Generate skill file path
- `formatCommand()` - Format command content
- `formatSkill()` - Format skill content

### 2. Templates (`src/templates/`)

Tool-agnostic content templates:

```
src/templates/
├── commands/      # Command templates
├── skills/        # Skill templates
└── agents/        # Agent templates
```

### 3. Generator (`src/core/generator/`)

Generates files for all configured tools:

```typescript
// Generate commands for all tools
generateCommandsForAllTools(template, commandId, adapters, version);

// Generate skills for all tools
generateSkillsForAllTools(templates, adapters, version);

// Generate agents for all tools
generateAgentsForAllTools(templates, adapters, version);
```

### 4. CLI (`src/cli/ghostwire/`)

Command-line interface:

- `init` - Initialize ghostwire
- `update` - Regenerate files
- `config` - Manage configuration
- `detect` - Detect available tools

## Data Flow

```
User runs CLI → Config Loader → Generator → Adapters → Files
```

1. User runs `ghostwire init`
2. Config loader reads `.ghostwire/config.yaml`
3. Generator creates templates for each tool
4. Adapters format content for specific tools
5. Files written to tool-specific directories

## Configuration

```yaml
version: "1.0.0"
tools:
  - opencode
  - cursor
profile: core
delivery: both
```

- `tools` - Which AI tools to generate for
- `profile` - Which templates to include (core/extended)
- `delivery` - What to generate (commands/skills/both)

## File Structure

Generated files follow each tool's conventions:

```
.opencode/
├── commands/
│   ├── ghostwire-propose.md
│   └── ghostwire-apply.md
└── skills/
    ├── ghostwire-planner/
    │   └── SKILL.md
    └── ghostwire-architect/
        └── SKILL.md

.cursor/
├── commands/
│   └── ghostwire-propose.md
└── skills/
    └── ghostwire-planner/
        └── SKILL.md
```

## Extension Points

### Adding New Commands

1. Create template in `src/templates/commands/`
2. Register in generator
3. Files auto-generated for all tools

### Adding New Tools

1. Create adapter in `src/core/adapters/`
2. Register in `src/core/adapters/index.ts`
3. Works with all existing commands/skills/agents

### Adding New Agents

1. Create template in `src/templates/agents/`
2. Include in profile
3. Auto-generated for all tools
