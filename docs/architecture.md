# Jinn Architecture

## Overview

Jinn uses a harness-agnostic architecture that works across the AI coding tools it currently supports by separating reusable skills from native agent formats.

## Core Components

### 1. Adapters (`src/core/adapters/`)

Adapters format jinn content for specific AI tools:

```text
src/core/adapters/
├── index.ts        # Exports all adapters
├── registry.ts    # Adapter registry
├── types.ts       # Adapter interfaces
├── opencode.ts    # OpenCode adapter
├── cursor.ts      # Cursor adapter
├── claude.ts      # Claude Code adapter
└── ... (6 total)
```

Each adapter implements `ToolCommandAdapter`:

- `toolId` - Unique identifier
- `skillsDir` - Tool's skills directory
- `getSkillPath()` - Generate skill file path
- `formatSkill()` - Format skill content
- `getAgentPath()` - Generate native agent file path when the tool supports agents
- `formatAgent()` - Format native agent content when the tool supports agents

### 2. Templates (`src/templates/`)

Tool-agnostic content templates:

```text
src/templates/
├── skills/        # Skill templates
└── agents/        # Agent templates
```

### 3. Generator (`src/core/generator/`)

Generates files for all configured tools:

```typescript
// Generate skills for all tools
generateSkillsForAllTools(templates, adapters, version);

// Generate native agents for tools that support them
generateAgentsForAllTools(templates, adapters, version);
```

### 4. CLI (`src/cli/jinn/`)

Command-line interface:

- `init` - Initialize jinn
- `update` - Regenerate files
- `config` - Manage configuration
- `detect` - Detect available tools

## Data Flow

```text
User runs CLI → Config Loader → Generator → Adapters → Files
```

1. User runs `jinn init`
2. Config loader reads `.jinn/config.yaml`
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
- `delivery` - What to generate (`skills` or `both`)

## File Structure

Generated files follow each tool's conventions:

```text
.opencode/
├── agents/
│   ├── jinn-plan.md
│   └── jinn-review.md
├── skills-index.md
└── skills/
    ├── jinn-propose/
    │   └── SKILL.md
    └── jinn-frontend-design/
        └── SKILL.md

.cursor/
└── skills/
    └── jinn-propose/
        └── SKILL.md
```

## Extension Points

### Adding New Tools

1. Create adapter in `src/core/adapters/`
2. Register in `src/core/adapters/index.ts`
3. Implement native agent methods only if the tool actually supports agents
4. Works with all existing skills and native agents

### Adding New Agents

1. Create template in `src/templates/agents/`
2. Include in the generator's agent template set
3. Auto-generated only for tools with native agent support
