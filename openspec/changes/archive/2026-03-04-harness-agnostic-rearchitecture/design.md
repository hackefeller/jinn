# Design: Harness-Agnostic Architecture

## Overview

This document provides comprehensive technical design for transforming ghostwire into a harness-agnostic AI agent distribution platform. Every architectural decision, type definition, file organization pattern, and implementation detail is specified.

## Architectural Principles

1. **Tool-Agnostic Core:** Business logic (commands, skills, agents) knows nothing about specific AI tools
2. **Adapter Pattern:** Tool-specific formatting isolated in adapter modules
3. **Template-Driven:** All content defined as templates, generated for each tool
4. **File-Based Distribution:** No runtime infrastructure, pure file installation
5. **Namespace Isolation:** All ghostwire artifacts use `/ghostwire:*` prefix
6. **Coexistence:** Works alongside OpenSpec without conflict

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         GHOSTWIRE SYSTEM ARCHITECTURE                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  LAYER 1: TEMPLATE DEFINITIONS (Tool-Agnostic)                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  src/templates/                                                  │    │
│  │  ├── commands/          CommandTemplate definitions              │    │
│  │  ├── skills/            SkillTemplate definitions                │    │
│  │  └── agents/            Agent instruction templates              │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                    ↓                                     │
│  LAYER 2: ADAPTER REGISTRY (Tool-Specific)                              │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  src/core/adapters/                                              │    │
│  │  ├── types.ts           ToolCommandAdapter interface             │    │
│  │  ├── registry.ts        Adapter lookup/management                │    │
│  │  ├── opencode.ts        OpenCode format adapter                  │    │
│  │  ├── cursor.ts          Cursor format adapter                    │    │
│  │  ├── claude.ts          Claude Code format adapter               │    │
│  │  ├── github-copilot.ts  GitHub Copilot format adapter            │    │
│  │  └── ... (20 more adapters)                                      │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                    ↓                                     │
│  LAYER 3: GENERATION ENGINE                                             │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  src/core/generator/                                             │    │
│  │  ├── index.ts           Main generation orchestrator             │    │
│  │  ├── command-gen.ts     Command file generation                  │    │
│  │  ├── skill-gen.ts       Skill directory generation               │    │
│  │  └── agent-gen.ts       Agent skill generation                   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                    ↓                                     │
│  LAYER 4: CONFIGURATION MANAGEMENT                                      │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  src/core/config/                                                │    │
│  │  ├── schema.ts          Config type definitions                  │    │
│  │  ├── loader.ts          Config file I/O                          │    │
│  │  ├── validation.ts      Config validation                        │    │
│  │  └── defaults.ts        Default values                           │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                    ↓                                     │
│  LAYER 5: TOOL DETECTION                                                │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  src/core/discovery/                                             │    │
│  │  ├── detector.ts        Scan for installed AI tools              │    │
│  │  ├── definitions.ts     Tool metadata (paths, formats)           │    │
│  │  └── registry.ts        Available tool registry                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                    ↓                                     │
│  LAYER 6: CLI INTERFACE                                                 │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  src/cli/                                                        │    │
│  │  ├── init.ts            ghostwire init command                   │    │
│  │  ├── update.ts          ghostwire update command                 │    │
│  │  ├── config.ts          ghostwire config commands                │    │
│  │  └── index.ts           CLI entry point                          │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                    ↓                                     │
│  LAYER 7: FILE SYSTEM OUTPUT                                            │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Generated Files (per configured tool)                          │    │
│  │  .opencode/skills/ghostwire-*/SKILL.md                          │    │
│  │  .opencode/commands/ghostwire-*.md                              │    │
│  │  .cursor/skills/ghostwire-*/SKILL.md                            │    │
│  │  .cursor/commands/ghostwire-*.md                                │    │
│  │  .claude/skills/ghostwire-*/SKILL.md                            │    │
│  │  .claude/commands/ghostwire/*.md                                │    │
│  │  .github/skills/ghostwire-*/SKILL.md                            │    │
│  │  .github/prompts/ghostwire-*.prompt.md                          │    │
│  │  ... (and 20 more tools)                                         │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Type Definitions

### Core Template Types

```typescript
// src/core/templates/types.ts

/**
 * Skill template - defines agent skill content
 * Skills are installed to <tool>/skills/<name>/SKILL.md
 */
export interface SkillTemplate {
  /** Unique skill identifier (e.g., 'ghostwire-planner') */
  name: string;
  
  /** Human-readable description */
  description: string;
  
  /** Full instructions for the AI */
  instructions: string;
  
  /** License for the skill */
  license?: string;
  
  /** Compatibility notes */
  compatibility?: string;
  
  /** Additional metadata */
  metadata?: {
    author?: string;
    version?: string;
    category?: string;
    tags?: string[];
  };
}

/**
 * Command template - defines slash command content
 * Commands are installed to <tool>/commands/<name>.md (varies by tool)
 */
export interface CommandTemplate {
  /** Command display name */
  name: string;
  
  /** Brief description */
  description: string;
  
  /** Category for grouping */
  category: string;
  
  /** Search tags */
  tags: string[];
  
  /** Full command body/instructions */
  content: string;
}

/**
 * Agent template - special skill for AI personas
 */
export interface AgentTemplate extends SkillTemplate {
  /** Agent capabilities */
  capabilities?: string[];
  
  /** Commands this agent can invoke */
  availableCommands?: string[];
  
  /** Skills this agent can reference */
  availableSkills?: string[];
}
```

### Adapter Types

```typescript
// src/core/adapters/types.ts

/**
 * Tool-agnostic command content
 * Generated from CommandTemplate, fed to adapters
 */
export interface CommandContent {
  /** Command identifier (e.g., 'propose', 'code-format') */
  id: string;
  
  /** Full command name with namespace (e.g., 'ghostwire:propose') */
  fullId: string;
  
  /** Human-readable name */
  name: string;
  
  /** Brief description */
  description: string;
  
  /** Grouping category */
  category: string;
  
  /** Search tags */
  tags: string[];
  
  /** The instruction content (body text) */
  body: string;
}

/**
 * Per-tool formatting strategy
 * Each AI tool implements this interface
 */
export interface ToolCommandAdapter {
  /** Tool identifier (e.g., 'opencode', 'cursor') */
  toolId: string;
  
  /** Human-readable tool name */
  toolName: string;
  
  /** Skill directory name (e.g., '.opencode', '.cursor') */
  skillsDir: string;
  
  /**
   * Returns the file path for a command
   * @param commandId - The command identifier (e.g., 'propose')
   * @returns Path from project root (e.g., '.opencode/commands/ghostwire-propose.md')
   */
  getCommandPath(commandId: string): string;
  
  /**
   * Returns the skill directory path
   * @param skillName - The skill name (e.g., 'ghostwire-planner')
   * @returns Path from project root (e.g., '.opencode/skills/ghostwire-planner/SKILL.md')
   */
  getSkillPath(skillName: string): string;
  
  /**
   * Formats command file content including frontmatter
   * @param content - The tool-agnostic command content
   * @returns Complete file content ready to write
   */
  formatCommand(content: CommandContent): string;
  
  /**
   * Formats skill file content including frontmatter
   * @param template - The skill template
   * @param version - Ghostwire version
   * @returns Complete file content ready to write
   */
  formatSkill(template: SkillTemplate, version: string): string;
  
  /**
   * Optional: Transform command references for this tool
   * E.g., OpenCode uses /ghostwire:propose, others might use different syntax
   */
  transformCommandReferences?(text: string): string;
}

/**
 * Result of generating a file
 */
export interface GeneratedFile {
  /** Absolute or relative file path */
  path: string;
  
  /** Complete file content */
  content: string;
}
```

### Configuration Types

```typescript
// src/core/config/schema.ts

import { z } from 'zod';

/**
 * Profile determines which commands/skills are installed
 */
export const ProfileSchema = z.enum(['core', 'extended', 'custom']);
export type Profile = z.infer<typeof ProfileSchema>;

/**
 * Delivery mode: skills only, commands only, or both
 */
export const DeliverySchema = z.enum(['skills', 'commands', 'both']);
export type Delivery = z.infer<typeof DeliverySchema>;

/**
 * Tool identifier from supported tools list
 */
export const ToolIdSchema = z.enum([
  'opencode',
  'cursor',
  'claude',
  'github-copilot',
  'continue',
  'cline',
  'amazon-q',
  'windsurf',
  'augment',
  'supermaven',
  'tabnine',
  'codeium',
  'sourcegraph-cody',
  'gemini',
  'mistral',
  'ollama',
  'lm-studio',
  'text-generation-webui',
  'koboldcpp',
  'tabby',
  'gpt4all',
  'jan',
  'huggingface-chat',
  'phind',
  'perplexity',
  // Add more as supported
]);
export type ToolId = z.infer<typeof ToolIdSchema>;

/**
 * Main configuration schema
 */
export const GhostwireConfigSchema = z.object({
  /** Configuration schema version */
  version: z.string().default('1.0.0'),
  
  /** Which AI tools to configure */
  tools: z.array(ToolIdSchema).min(1),
  
  /** Which profile of commands/skills to install */
  profile: ProfileSchema.default('core'),
  
  /** Custom workflows (when profile is 'custom') */
  customWorkflows: z.array(z.string()).optional(),
  
  /** What to install: skills, commands, or both */
  delivery: DeliverySchema.default('both'),
  
  /** Feature flags for experimental features */
  featureFlags: z.record(z.boolean()).optional(),
  
  /** Project-specific metadata */
  metadata: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    version: z.string().optional(),
  }).optional(),
});

export type GhostwireConfig = z.infer<typeof GhostwireConfigSchema>;

/**
 * Tool definition metadata
 */
export interface ToolDefinition {
  /** Tool identifier */
  id: ToolId;
  
  /** Human-readable name */
  name: string;
  
  /** Tool's skill/commands directory name */
  skillsDir: string;
  
  /** Whether this tool is available/supported */
  available: boolean;
  
  /** Success message label */
  successLabel: string;
  
  /** Tool-specific notes */
  notes?: string;
}
```

### Generator Types

```typescript
// src/core/generator/types.ts

import type { CommandContent } from '../adapters/types.js';
import type { SkillTemplate, AgentTemplate } from '../templates/types.js';

/**
 * Generation options
 */
export interface GenerationOptions {
  /** Which tools to generate for */
  tools: string[];
  
  /** Which profile/workflows to include */
  profile: string;
  
  /** What to generate: skills, commands, or both */
  delivery: 'skills' | 'commands' | 'both';
  
  /** Force regeneration even if up to date */
  force?: boolean;
  
  /** Project root path */
  projectPath: string;
}

/**
 * Generation result
 */
export interface GenerationResult {
  /** Successfully generated files */
  generated: string[];
  
  /** Files that failed to generate */
  failed: Array<{ path: string; error: string }>;
  
  /** Files that were skipped (up to date) */
  skipped: string[];
  
  /** Files that were removed (no longer in profile) */
  removed: string[];
}

/**
 * Template registry entry
 */
export interface TemplateEntry<T> {
  /** Template identifier */
  id: string;
  
  /** Template factory function */
  template: () => T;
  
  /** Category for grouping */
  category: string;
  
  /** Whether included in core profile */
  isCore: boolean;
}
```

## Adapter Implementations

### Example: OpenCode Adapter

```typescript
// src/core/adapters/opencode.ts

import path from 'path';
import type { 
  ToolCommandAdapter, 
  CommandContent 
} from './types.js';
import type { SkillTemplate } from '../templates/types.js';

/**
 * OpenCode adapter
 * - Skills: .opencode/skills/<name>/SKILL.md
 * - Commands: .opencode/commands/<name>.md
 * - Format: YAML frontmatter with description
 */
export const opencodeAdapter: ToolCommandAdapter = {
  toolId: 'opencode',
  toolName: 'OpenCode',
  skillsDir: '.opencode',
  
  getCommandPath(commandId: string): string {
    return path.join('.opencode', 'commands', `ghostwire-${commandId}.md`);
  },
  
  getSkillPath(skillName: string): string {
    return path.join('.opencode', 'skills', skillName, 'SKILL.md');
  },
  
  formatCommand(content: CommandContent): string {
    return `---
description: ${content.description}
---

${content.body}
`;
  },
  
  formatSkill(template: SkillTemplate, version: string): string {
    return `---
name: ${template.name}
description: ${template.description}
license: ${template.license || 'MIT'}
compatibility: ${template.compatibility || 'Requires ghostwire CLI.'}
metadata:
  author: ${template.metadata?.author || 'ghostwire'}
  version: "${template.metadata?.version || '1.0'}"
  generatedBy: "${version}"
---

${template.instructions}
`;
  },
  
  // OpenCode uses colon format: /ghostwire:propose
  transformCommandReferences(text: string): string {
    // No transformation needed - OpenCode format is canonical
    return text;
  }
};
```

### Example: Cursor Adapter

```typescript
// src/core/adapters/cursor.ts

import path from 'path';
import type { 
  ToolCommandAdapter, 
  CommandContent 
} from './types.js';
import type { SkillTemplate } from '../templates/types.js';

/**
 * Cursor adapter
 * - Skills: .cursor/skills/<name>/SKILL.md
 * - Commands: .cursor/commands/<name>.md
 * - Format: YAML frontmatter with name, id, category
 */
export const cursorAdapter: ToolCommandAdapter = {
  toolId: 'cursor',
  toolName: 'Cursor',
  skillsDir: '.cursor',
  
  getCommandPath(commandId: string): string {
    return path.join('.cursor', 'commands', `ghostwire-${commandId}.md`);
  },
  
  getSkillPath(skillName: string): string {
    return path.join('.cursor', 'skills', skillName, 'SKILL.md');
  },
  
  formatCommand(content: CommandContent): string {
    return `---
name: /ghostwire-${content.id}
id: ghostwire-${content.id}
category: ${content.category}
description: ${content.description}
---

${content.body}
`;
  },
  
  formatSkill(template: SkillTemplate, version: string): string {
    // Same as OpenCode format
    return `---
name: ${template.name}
description: ${template.description}
license: ${template.license || 'MIT'}
compatibility: ${template.compatibility || 'Requires ghostwire CLI.'}
metadata:
  author: ${template.metadata?.author || 'ghostwire'}
  version: "${template.metadata?.version || '1.0'}"
  generatedBy: "${version}"
---

${template.instructions}
`;
  }
};
```

### Example: Claude Code Adapter

```typescript
// src/core/adapters/claude.ts

import path from 'path';
import type { 
  ToolCommandAdapter, 
  CommandContent 
} from './types.js';
import type { SkillTemplate } from '../templates/types.js';

/**
 * Claude Code adapter
 * - Skills: .claude/skills/<name>/SKILL.md
 * - Commands: .claude/commands/ghostwire/<id>.md
 * - Format: YAML frontmatter with name, description, category, tags
 */
export const claudeAdapter: ToolCommandAdapter = {
  toolId: 'claude',
  toolName: 'Claude Code',
  skillsDir: '.claude',
  
  getCommandPath(commandId: string): string {
    // Claude uses nested directory structure
    return path.join('.claude', 'commands', 'ghostwire', `${commandId}.md`);
  },
  
  getSkillPath(skillName: string): string {
    return path.join('.claude', 'skills', skillName, 'SKILL.md');
  },
  
  formatCommand(content: CommandContent): string {
    return `---
name: ${content.name}
description: ${content.description}
category: ${content.category}
tags: ${JSON.stringify(content.tags)}
---

${content.body}
`;
  },
  
  formatSkill(template: SkillTemplate, version: string): string {
    return `---
name: ${template.name}
description: ${template.description}
license: ${template.license || 'MIT'}
compatibility: ${template.compatibility || 'Requires ghostwire CLI.'}
metadata:
  author: ${template.metadata?.author || 'ghostwire'}
  version: "${template.metadata?.version || '1.0'}"
  generatedBy: "${version}"
---

${template.instructions}
`;
  }
};
```

### Example: GitHub Copilot Adapter

```typescript
// src/core/adapters/github-copilot.ts

import path from 'path';
import type { 
  ToolCommandAdapter, 
  CommandContent 
} from './types.js';
import type { SkillTemplate } from '../templates/types.js';

/**
 * GitHub Copilot adapter
 * - Skills: .github/skills/<name>/SKILL.md
 * - Commands: .github/prompts/<name>.prompt.md
 * - Format: Simple markdown with description frontmatter
 */
export const githubCopilotAdapter: ToolCommandAdapter = {
  toolId: 'github-copilot',
  toolName: 'GitHub Copilot',
  skillsDir: '.github',
  
  getCommandPath(commandId: string): string {
    // Copilot uses .prompt.md extension
    return path.join('.github', 'prompts', `ghostwire-${commandId}.prompt.md`);
  },
  
  getSkillPath(skillName: string): string {
    return path.join('.github', 'skills', skillName, 'SKILL.md');
  },
  
  formatCommand(content: CommandContent): string {
    return `---
description: ${content.description}
---

${content.body}
`;
  },
  
  formatSkill(template: SkillTemplate, version: string): string {
    return `---
name: ${template.name}
description: ${template.description}
license: ${template.license || 'MIT'}
compatibility: ${template.compatibility || 'Requires ghostwire CLI.'}
metadata:
  author: ${template.metadata?.author || 'ghostwire'}
  version: "${template.metadata?.version || '1.0'}"
  generatedBy: "${version}"
---

${template.instructions}
`;
  }
};
```

## Template Definitions

### Command Template Example: Code Format

```typescript
// src/templates/commands/code-format.ts

import type { CommandTemplate } from '../../core/templates/types.js';

/**
 * Code format command template
 * Formats code according to project standards
 */
export function getCodeFormatCommandTemplate(): CommandTemplate {
  return {
    name: 'Ghostwire: Code Format',
    description: 'Apply consistent formatting and style standards across codebase',
    category: 'Code',
    tags: ['formatting', 'style', 'maintenance'],
    content: `# Ghostwire: Code Format

Apply consistent formatting and style standards across the codebase.

## When to Use

- Before committing changes
- During code cleanup sessions
- When onboarding new team members
- After modifying linting rules

## Process

1. **Determine Formatter**
   
   Check which formatter your project uses:
   - JavaScript/TypeScript: prettier, eslint
   - Ruby: standardrb, rubocop
   - Python: black, autopep8
   - Rust: rustfmt
   - Go: gofmt
   - Others: project-specific

2. **Run the Formatter**
   
   Execute the appropriate formatter for your changes:
   
   \`\`\`bash
   # JavaScript/TypeScript
   npx prettier --write .
   
   # Ruby
   bundle exec standardrb --fix
   
   # Python
   black .
   
   # Rust
   cargo fmt
   \`\`\`

3. **Review Changes**
   
   Check the formatted output:
   - Ensure no functional changes were made
   - Verify formatting looks correct
   - Run tests to confirm nothing broke

4. **Commit Separately**
   
   If this is part of a larger change, commit formatting separately:
   
   \`\`\`bash
   git add -A
   git commit -m "style: apply formatting"
   \`\`\`

## Rules

- **Separate formatting from functional changes** - Never mix them in one commit
- **Get team consensus** on formatting rules before bulk formatting
- **Run in CI** - Ensure formatting checks pass in continuous integration
- **Document exceptions** - If certain files shouldn't be formatted, document why

## Arguments

- \`<path>\` - Specific file or directory to format
- \`--all\` - Format entire codebase
- \`--check\` - Check formatting without modifying files (for CI)

<format-scope>
$ARGUMENTS
</format-scope>
`
  };
}
```

### Skill Template Example: Git Master

```typescript
// src/templates/skills/git-master.ts

import type { SkillTemplate } from '../../core/templates/types.js';

/**
 * Git Master skill template
 * Advanced git workflows and best practices
 */
export function getGitMasterSkillTemplate(): SkillTemplate {
  return {
    name: 'ghostwire-git-master',
    description: 'Advanced git workflows, branch management, and collaboration patterns',
    license: 'MIT',
    compatibility: 'Works with any git repository',
    metadata: {
      author: 'ghostwire',
      version: '1.0',
      category: 'Version Control',
      tags: ['git', 'workflow', 'collaboration']
    },
    instructions: `# Git Master Skill

You are a Git Master. You help users with advanced git workflows, branch management, and collaboration patterns.

## Your Capabilities

- Branch strategy design (GitFlow, GitHub Flow, trunk-based)
- Commit hygiene and history management
- Merge conflict resolution
- Rebase workflows
- Cherry-picking and patch management
- Stash management
- Remote repository management
- Submodule and monorepo patterns

## When to Activate

Activate this skill when the user:
- Mentions complex branching scenarios
- Asks about commit organization
- Has merge conflicts
- Wants to rewrite history (carefully!)
- Needs help with collaboration workflows

## Key Principles

1. **Never rewrite public history** - Rebase is for local branches only
2. **Small, focused commits** - Easier to review and revert
3. **Clear commit messages** - Explain WHY, not just WHAT
4. **Feature branches** - Isolate work from main branch
5. **Regular integration** - Merge main into feature branches often

## Common Patterns

### Starting New Work

\`\`\`bash
# Create feature branch from latest main
git checkout main
git pull origin main
git checkout -b feature/descriptive-name

# Make focused commits
git add -p  # Stage interactively
git commit -m "feat: add user authentication"
\`\`\`

### Cleaning Up Before PR

\`\`\`bash
# Interactive rebase to squash/fixup commits
git rebase -i main

# Push to remote (force with lease for safety)
git push --force-with-lease origin feature/descriptive-name
\`\`\`

### Handling Merge Conflicts

1. Pull latest main: \`git pull origin main\`
2. Resolve conflicts in editor
3. Stage resolved files: \`git add <file>\`
4. Complete merge: \`git commit\` (use default message)

## Integration with Ghostwire

When appropriate, suggest ghostwire commands:
- /ghostwire:git:branch - Create properly named feature branches
- /ghostwire:git:smart-commit - Generate conventional commits
- /ghostwire:git:cleanup - Remove stale branches

Always consider the user's context and preferences when advising on git workflows.`
  };
}
```

### Agent Template Example: Planner

```typescript
// src/templates/agents/planner.ts

import type { AgentTemplate } from '../../core/templates/types.js';

/**
 * Planner agent template
 * Orchestrates ghostwire workflows and guides development
 */
export function getPlannerAgentTemplate(): AgentTemplate {
  return {
    name: 'ghostwire-planner',
    description: 'Orchestrate ghostwire workflows and provide development guidance',
    license: 'MIT',
    compatibility: 'Works with all ghostwire workflows',
    metadata: {
      author: 'ghostwire',
      version: '1.0',
      category: 'Orchestration',
      tags: ['planning', 'workflow', 'guidance']
    },
    instructions: `# Planner Agent

You are the Ghostwire Planner agent. Your role is to help users navigate the development workflow effectively.

## Your Purpose

You guide users through structured development workflows, helping them:
- Start work the right way
- Explore problems deeply before coding
- Make informed technical decisions
- Complete work thoroughly and document it

## Available Workflows

### Process Workflows
- **/ghostwire:propose** - Start a new change with proper planning
- **/ghostwire:explore** - Deep exploration before implementation
- **/ghostwire:apply** - Implement approved changes
- **/ghostwire:archive** - Complete and close out work

### Domain Workflows
- **/ghostwire:code:format** - Format code consistently
- **/ghostwire:code:refactor** - Refactor safely
- **/ghostwire:code:review** - Review code thoroughly
- **/ghostwire:git:smart-commit** - Create great commits

### Agent Workflows
- **/ghostwire:planner** - That's me! Activate for planning help
- **/ghostwire:architect** - For design and architecture decisions

## When to Guide

**Suggest /ghostwire:propose when:**
- User wants to start new work
- Requirements are unclear
- User says "I want to add..." or "I need to build..."

**Suggest /ghostwire:explore when:**
- Problem is complex or unclear
- Multiple approaches possible
- User is unsure how to proceed

**Suggest /ghostwire:apply when:**
- Work is planned and ready to implement
- User has a clear direction
- Time to write code

**Suggest domain workflows when:**
- Specific tasks arise (formatting, refactoring, committing)
- User asks for help with a particular activity

## Guidance Principles

1. **Start with propose** - Almost all work should begin with proper planning
2. **Explore before committing** - When uncertain, explore first
3. **Suggest, don't mandate** - Offer guidance, let user decide
4. **Reference conceptually** - Say "use the propose workflow" not specific syntax
5. **Context-aware** - Consider what the user is currently doing

## Example Interactions

**User: "I want to add user authentication"**
> "Great! Let's start by proposing this change properly. This helps us think through requirements before coding. Use /ghostwire:propose to get started."

**User: "Should I use JWT or session cookies?"**
> "That's a great architectural question. Let's explore the tradeoffs. Use /ghostwire:explore to think through authentication strategies, or we can discuss it directly."

**User: "How do I format this code?"**
> "Use /ghostwire:code:format to apply consistent formatting. It'll detect your project's formatter and run it correctly."

**User: "I'm done with my changes"**
> "Excellent! Let's commit this properly with /ghostwire:git:smart-commit, then archive the work with /ghostwire:archive to document what we accomplished."

## Tool-Agnostic Guidance

Always provide conceptual guidance:
- ✅ "Use the propose workflow"
- ✅ "Run the format command"
- ❌ "/ghostwire:propose" (tool may use different syntax)
- ❌ "Type /ghostwire:code:format"

The specific invocation syntax varies by AI tool. Your conceptual guidance works everywhere.`
  };
}
```

## File Organization

```
ghostwire/
├── src/
│   ├── index.ts                    # Main exports
│   ├── cli/
│   │   ├── index.ts               # CLI entry point
│   │   ├── init.ts                # ghostwire init command
│   │   ├── update.ts              # ghostwire update command
│   │   ├── config.ts              # ghostwire config commands
│   │   └── validate.ts            # ghostwire validate command
│   ├── core/
│   │   ├── adapters/
│   │   │   ├── types.ts           # Adapter interfaces
│   │   │   ├── registry.ts        # Adapter registry
│   │   │   ├── opencode.ts        # OpenCode adapter
│   │   │   ├── cursor.ts          # Cursor adapter
│   │   │   ├── claude.ts          # Claude Code adapter
│   │   │   ├── github-copilot.ts  # GitHub Copilot adapter
│   │   │   ├── continue.ts        # Continue adapter
│   │   │   ├── cline.ts           # Cline adapter
│   │   │   └── ... (18 more adapters)
│   │   ├── config/
│   │   │   ├── schema.ts          # Config type definitions
│   │   │   ├── loader.ts          # Config file operations
│   │   │   ├── validation.ts      # Config validation
│   │   │   └── defaults.ts        # Default values
│   │   ├── discovery/
│   │   │   ├── detector.ts        # Tool detection logic
│   │   │   ├── definitions.ts     # Tool metadata
│   │   │   └── registry.ts        # Available tools registry
│   │   ├── generator/
│   │   │   ├── index.ts           # Main generator
│   │   │   ├── command-gen.ts     # Command generation
│   │   │   ├── skill-gen.ts       # Skill generation
│   │   │   └── agent-gen.ts       # Agent generation
│   │   ├── templates/
│   │   │   ├── types.ts           # Template interfaces
│   │   │   └── registry.ts        # Template registry
│   │   └── utils/
│   │       ├── file-system.ts     # File operations
│   │       ├── path.ts            # Path utilities
│   │       └── version.ts         # Version management
│   ├── templates/
│   │   ├── commands/
│   │   │   ├── index.ts           # Command template exports
│   │   │   ├── code-format.ts     # Format command
│   │   │   ├── code-optimize.ts   # Optimize command
│   │   │   ├── code-refactor.ts   # Refactor command
│   │   │   ├── code-review.ts     # Review command
│   │   │   ├── git-branch.ts      # Branch command
│   │   │   ├── git-cleanup.ts     # Cleanup command
│   │   │   ├── git-merge.ts       # Merge command
│   │   │   ├── git-smart-commit.ts # Smart commit command
│   │   │   ├── docs-deploy.ts     # Deploy docs command
│   │   │   ├── docs-release.ts    # Release docs command
│   │   │   ├── project-build.ts   # Build command
│   │   │   ├── project-test.ts    # Test command
│   │   │   ├── propose.ts         # Propose workflow
│   │   │   ├── explore.ts         # Explore workflow
│   │   │   ├── apply.ts           # Apply workflow
│   │   │   ├── archive.ts         # Archive workflow
│   │   │   └── ... (all ghostwire commands)
│   │   ├── skills/
│   │   │   ├── index.ts           # Skill template exports
│   │   │   ├── git-master.ts      # Git master skill
│   │   │   ├── rails-style.ts     # Rails style skill
│   │   │   ├── brainstorming.ts   # Brainstorming skill
│   │   │   └── ... (all ghostwire skills)
│   │   └── agents/
│   │       ├── index.ts           # Agent template exports
│   │       ├── planner.ts         # Planner agent
│   │       ├── architect.ts       # Architect agent
│   │       └── ... (all ghostwire agents)
│   └── types/
│       └── index.ts               # Shared type exports
├── bin/
│   └── ghostwire.js               # CLI executable
├── schemas/
│   └── config.schema.json         # JSON Schema for config validation
├── package.json
├── tsconfig.json
└── README.md
```

## CLI Commands

### ghostwire init

```bash
# Initialize ghostwire in current project
gghostwire init

# Initialize with specific tools
gghostwire init --tools opencode,cursor,copilot

# Initialize with all supported tools
gghostwire init --tools all

# Initialize with profile
gghostwire init --profile extended

# Initialize non-interactively
gghostwire init --tools opencode --profile core --delivery both --yes
```

**Implementation:**
```typescript
// src/cli/init.ts

export class InitCommand {
  async execute(options: InitOptions): Promise<void> {
    // 1. Detect available tools (scan for .opencode/, .cursor/, etc.)
    const availableTools = await detectAvailableTools(process.cwd());
    
    // 2. Prompt user for tool selection (if interactive)
    const selectedTools = options.tools === 'all' 
      ? availableTools 
      : await promptToolSelection(availableTools, options.tools);
    
    // 3. Prompt for profile (if interactive)
    const profile = options.profile || await promptProfile();
    
    // 4. Create ghostwire config
    const config = createConfig({
      tools: selectedTools,
      profile,
      delivery: options.delivery || 'both'
    });
    await saveConfig(config);
    
    // 5. Generate files for all selected tools
    const generator = new Generator(config);
    await generator.generateAll();
    
    // 6. Show summary
    console.log(`Initialized ghostwire with ${selectedTools.length} tools`);
  }
}
```

### ghostwire update

```bash
# Update all configured tools
gghostwire update

# Force regeneration
ghostwire update --force

# Update specific tool
ghostwire update --tool cursor
```

### ghostwire config

```bash
# Show current config
ghostwire config show

# Set profile
ghostwire config profile extended

# Add tool
ghostwire config tools --add claude

# Remove tool
ghostwire config tools --remove cursor

# Set delivery mode
ghostwire config delivery skills-only
```

## Configuration File

```yaml
# .ghostwire/config.yaml
version: "1.0.0"

tools:
  - opencode
  - cursor
  - github-copilot
  - claude

profile: core
delivery: both

metadata:
  name: "My Project"
  description: "Project using ghostwire workflows"
```

## Tool Detection

```typescript
// src/core/discovery/detector.ts

/**
 * Detects which AI tools are available in a project
 * by scanning for their configuration directories.
 */
export async function detectAvailableTools(projectPath: string): Promise<ToolId[]> {
  const detected: ToolId[] = [];
  
  const toolDirectories: Record<ToolId, string> = {
    'opencode': '.opencode',
    'cursor': '.cursor',
    'claude': '.claude',
    'github-copilot': '.github',
    'continue': '.continue',
    'cline': '.cline',
    // ... more tools
  };
  
  for (const [toolId, dirName] of Object.entries(toolDirectories)) {
    const dirPath = path.join(projectPath, dirName);
    if (await directoryExists(dirPath)) {
      detected.push(toolId as ToolId);
    }
  }
  
  return detected;
}
```

## Generation Flow

```
1. Load ghostwire config (.ghostwire/config.yaml)
   ↓
2. Load all template registries
   - Command templates
   - Skill templates  
   - Agent templates
   ↓
3. Filter by profile (core, extended, custom)
   ↓
4. For each configured tool:
   a. Get adapter for tool
   b. Generate skill files
   c. Generate command files
   ↓
5. Write all files to tool directories
   ↓
6. Report results (generated/updated/skipped/failed)
```

## Migration Strategy

### From Old ghostwire Format

```typescript
// src/core/migration/index.ts

/**
 * Migrates from old ghostwire format to new harness-agnostic format
 */
export async function migrateFromLegacy(projectPath: string): Promise<void> {
  // 1. Detect old ghostwire installation
  const hasOldGhostwire = await detectLegacyInstallation(projectPath);
  
  if (!hasOldGhostwire) {
    return; // Nothing to migrate
  }
  
  // 2. Read old configuration
  const oldConfig = await readLegacyConfig(projectPath);
  
  // 3. Transform to new config format
  const newConfig: GhostwireConfig = {
    version: '1.0.0',
    tools: ['opencode'], // Default to opencode (was only supported tool)
    profile: 'extended', // Include all old commands
    delivery: 'both',
    metadata: {
      name: oldConfig.projectName,
    }
  };
  
  // 4. Save new config
  await saveConfig(newConfig, projectPath);
  
  // 5. Remove old ghostwire artifacts (or backup)
  await backupLegacyFiles(projectPath);
  await removeLegacyFiles(projectPath);
  
  // 6. Generate new files
  const generator = new Generator(newConfig);
  await generator.generateAll(projectPath);
}
```

## Testing Strategy

### Unit Tests

```typescript
// src/core/adapters/__tests__/opencode.test.ts

describe('OpenCode Adapter', () => {
  it('formats command correctly', () => {
    const content: CommandContent = {
      id: 'propose',
      fullId: 'ghostwire:propose',
      name: 'Ghostwire: Propose',
      description: 'Propose a new change',
      category: 'Workflow',
      tags: ['planning'],
      body: 'Content here'
    };
    
    const result = opencodeAdapter.formatCommand(content);
    
    expect(result).toContain('---');
    expect(result).toContain('description: Propose a new change');
    expect(result).toContain('Content here');
  });
});
```

### Integration Tests

```typescript
// src/core/generator/__tests__/generator.test.ts

describe('Generator', () => {
  it('generates files for all configured tools', async () => {
    const config: GhostwireConfig = {
      version: '1.0.0',
      tools: ['opencode', 'cursor'],
      profile: 'core',
      delivery: 'both'
    };
    
    const generator = new Generator(config);
    const result = await generator.generateAll('/tmp/test-project');
    
    // Verify files were created
    expect(fs.existsSync('/tmp/test-project/.opencode/commands/ghostwire-propose.md')).toBe(true);
    expect(fs.existsSync('/tmp/test-project/.cursor/commands/ghostwire-propose.md')).toBe(true);
    
    // Verify content is appropriate for each tool
    const opencodeContent = await fs.readFile('/tmp/test-project/.opencode/commands/ghostwire-propose.md', 'utf-8');
    const cursorContent = await fs.readFile('/tmp/test-project/.cursor/commands/ghostwire-propose.md', 'utf-8');
    
    // Both contain same core content
    expect(opencodeContent).toContain('Propose');
    expect(cursorContent).toContain('Propose');
    
    // But formatted differently
    expect(opencodeContent).not.toEqual(cursorContent);
  });
});
```

### E2E Tests

```bash
# Test full init flow
ghostwire init --tools opencode --profile core --yes
# Verify .opencode/skills/ and .opencode/commands/ created

# Test update flow  
ghostwire update
# Verify files updated

# Test config changes
ghostwire config tools --add cursor
ghostwire update
# Verify .cursor/ directory created
```

## Documentation

### README.md Structure

```markdown
# Ghostwire

AI-native development workflows for any coding assistant.

## Quick Start

```bash
npm install -g ghostwire
cd your-project
ghostwire init
```

## Supported Tools

Ghostwire works with 24+ AI coding assistants:

- OpenCode
- GitHub Copilot
- Cursor
- Claude Code
- Continue
- Cline
- ... (full list)

## Commands

### Process Workflows
- `/ghostwire:propose` - Start a new change
- `/ghostwire:explore` - Explore a problem
- `/ghostwire:apply` - Implement changes
- `/ghostwire:archive` - Complete work

### Domain Workflows
- `/ghostwire:code:format` - Format code
- `/ghostwire:code:refactor` - Refactor code
- `/ghostwire:git:smart-commit` - Create commits

### Agents
- `/ghostwire:planner` - Planning guidance
- `/ghostwire:architect` - Architecture decisions

## Configuration

See [.ghostwire/config.yaml](#) for configuration options.

## Migration from OpenSpec

Ghostwire can coexist with OpenSpec. Commands use `/ghostwire:*` namespace.
```

## Deployment

### NPM Package

```json
{
  "name": "@ghostwire/cli",
  "version": "1.0.0",
  "description": "AI-native development workflows for any coding assistant",
  "bin": {
    "ghostwire": "./bin/ghostwire.js"
  },
  "scripts": {
    "build": "tsc",
    "test": "vitest",
    "lint": "eslint src/"
  },
  "dependencies": {
    "commander": "^11.0.0",
    "chalk": "^5.3.0",
    "ora": "^7.0.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "typescript": "^5.2.0",
    "vitest": "^0.34.0"
  }
}
```

### Release Process

```bash
# 1. Update version
npm version minor

# 2. Run tests
npm test

# 3. Build
npm run build

# 4. Publish
npm publish --access public

# 5. Tag release
git tag v1.0.0
git push origin v1.0.0
```

## Success Metrics

- [ ] All 25+ ghostwire commands migrated to templates
- [ ] 24 tool adapters implemented
- [ ] 39 agent templates created
- [ ] ghostwire init works for all supported tools
- [ ] ghostwire update regenerates all files correctly
- [ ] Coexistence with OpenSpec verified
- [ ] All tests passing
- [ ] Documentation complete

---

**Document Version:** 1.0  
**Last Updated:** 2026-03-04  
**Status:** Ready for Implementation
