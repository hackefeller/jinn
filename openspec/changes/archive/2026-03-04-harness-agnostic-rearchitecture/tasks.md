# Tasks: Harness-Agnostic Architecture Implementation

## Overview

This task list provides exhaustive, granular implementation steps for the harness-agnostic architecture realignment. Every file to create, every function to implement, every test to write is specified.

## Scope Clarification

**Updated 2026-03-04:** After reviewing the actual ghostwire codebase, this plan accounts for:
- **25+ commands** (ghostwire commands)
- **15+ skills** (domain expertise skills)
- **39 agents** (not 5 - see Appendix A for complete list)
- **24 tool adapters**

**Total estimated time: ~234 hours (~5.8 weeks full-time)**

The 39 agents significantly increases Phase 3 (Template Migration) and testing scope. Each agent requires template extraction, harness-agnostic refactoring, and comprehensive testing.

## Task Organization

Tasks are organized by phase and dependency order. Each task includes:
- **ID**: Unique identifier (e.g., P1-T1)
- **Description**: What to implement
- **Files**: Specific files to create/modify
- **Dependencies**: Tasks that must complete first
- **Acceptance Criteria**: How to verify completion

---

## Phase 1: Foundation (Week 1)

### P1-T1: Project Structure Setup
**Priority:** Critical  
**Estimated Time:** 2 hours

**Description:**
Create the new directory structure for the harness-agnostic architecture.

**Files to Create:**
```
src/
├── core/
│   ├── adapters/
│   │   ├── types.ts
│   │   ├── registry.ts
│   │   └── README.md
│   ├── config/
│   │   ├── schema.ts
│   │   ├── loader.ts
│   │   ├── validation.ts
│   │   ├── defaults.ts
│   │   └── README.md
│   ├── discovery/
│   │   ├── detector.ts
│   │   ├── definitions.ts
│   │   ├── registry.ts
│   │   └── README.md
│   ├── generator/
│   │   ├── index.ts
│   │   ├── command-gen.ts
│   │   ├── skill-gen.ts
│   │   ├── agent-gen.ts
│   │   └── README.md
│   ├── templates/
│   │   ├── types.ts
│   │   ├── registry.ts
│   │   └── README.md
│   └── utils/
│       ├── file-system.ts
│       ├── path.ts
│       ├── version.ts
│       └── README.md
├── templates/
│   ├── commands/
│   │   └── README.md
│   ├── skills/
│   │   └── README.md
│   └── agents/
│       └── README.md
├── cli/
│   ├── index.ts
│   ├── init.ts
│   ├── update.ts
│   ├── config.ts
│   ├── validate.ts
│   └── README.md
└── types/
    └── index.ts
```

**Acceptance Criteria:**
- [x] All directories created
- [x] All README.md files created with purpose description
- [x] No TypeScript errors in empty files

---

### P1-T2: Core Type Definitions
**Priority:** Critical  
**Estimated Time:** 4 hours  
**Dependencies:** P1-T1

**Description:**
Implement all core type interfaces for templates, adapters, config, and generation.

**Files to Modify:**
- `src/core/templates/types.ts`
- `src/core/adapters/types.ts`
- `src/core/config/schema.ts`
- `src/core/generator/types.ts`
- `src/types/index.ts`

**Implementation Details:**

**src/core/templates/types.ts:**
```typescript
export interface SkillTemplate {
  name: string;
  description: string;
  instructions: string;
  license?: string;
  compatibility?: string;
  metadata?: {
    author?: string;
    version?: string;
    category?: string;
    tags?: string[];
  };
}

export interface CommandTemplate {
  name: string;
  description: string;
  category: string;
  tags: string[];
  content: string;
}

export interface AgentTemplate extends SkillTemplate {
  capabilities?: string[];
  availableCommands?: string[];
  availableSkills?: string[];
}
```

**src/core/adapters/types.ts:**
```typescript
export interface CommandContent {
  id: string;
  fullId: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  body: string;
}

export interface ToolCommandAdapter {
  toolId: string;
  toolName: string;
  skillsDir: string;
  getCommandPath(commandId: string): string;
  getSkillPath(skillName: string): string;
  formatCommand(content: CommandContent): string;
  formatSkill(template: SkillTemplate, version: string): string;
  transformCommandReferences?(text: string): string;
}

export interface GeneratedFile {
  path: string;
  content: string;
}
```

**src/core/config/schema.ts:**
```typescript
import { z } from 'zod';

export const ProfileSchema = z.enum(['core', 'extended', 'custom']);
export type Profile = z.infer<typeof ProfileSchema>;

export const DeliverySchema = z.enum(['skills', 'commands', 'both']);
export type Delivery = z.infer<typeof DeliverySchema>;

export const ToolIdSchema = z.enum([
  'opencode', 'cursor', 'claude', 'github-copilot',
  'continue', 'cline', 'amazon-q', 'windsurf',
  // ... add all 24 tools
]);
export type ToolId = z.infer<typeof ToolIdSchema>;

export const GhostwireConfigSchema = z.object({
  version: z.string().default('1.0.0'),
  tools: z.array(ToolIdSchema).min(1),
  profile: ProfileSchema.default('core'),
  customWorkflows: z.array(z.string()).optional(),
  delivery: DeliverySchema.default('both'),
  featureFlags: z.record(z.boolean()).optional(),
  metadata: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    version: z.string().optional(),
  }).optional(),
});

export type GhostwireConfig = z.infer<typeof GhostwireConfigSchema>;

export interface ToolDefinition {
  id: ToolId;
  name: string;
  skillsDir: string;
  available: boolean;
  successLabel: string;
  notes?: string;
}
```

**src/core/generator/types.ts:**
```typescript
export interface GenerationOptions {
  tools: string[];
  profile: string;
  delivery: 'skills' | 'commands' | 'both';
  force?: boolean;
  projectPath: string;
}

export interface GenerationResult {
  generated: string[];
  failed: Array<{ path: string; error: string }>;
  skipped: string[];
  removed: string[];
}

export interface TemplateEntry<T> {
  id: string;
  template: () => T;
  category: string;
  isCore: boolean;
}
```

**Acceptance Criteria:**
- [x] All type definitions compile without errors
- [x] Zod schemas validate correctly
- [x] Types are exported from src/types/index.ts
- [x] All optional fields marked with `?`
- [x] Documentation comments on all public interfaces

---

### P1-T3: Utility Functions
**Priority:** High  
**Estimated Time:** 3 hours  
**Dependencies:** P1-T2

**Description:**
Implement utility functions for file system operations, path handling, and version management.

**Files to Modify:**
- `src/core/utils/file-system.ts`
- `src/core/utils/path.ts`
- `src/core/utils/version.ts`

**Implementation Details:**

**src/core/utils/file-system.ts:**
```typescript
import * as fs from 'fs/promises';
import * as path from 'path';

export async function directoryExists(dirPath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(filePath);
    return stats.isFile();
  } catch {
    return false;
  }
}

export async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

export async function writeFile(filePath: string, content: string): Promise<void> {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, 'utf-8');
}

export async function readFile(filePath: string): Promise<string> {
  return fs.readFile(filePath, 'utf-8');
}

export async function removeDir(dirPath: string): Promise<void> {
  await fs.rm(dirPath, { recursive: true, force: true });
}

export async function listDirs(dirPath: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    return entries
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name);
  } catch {
    return [];
  }
}
```

**src/core/utils/path.ts:**
```typescript
import * as path from 'path';

export function normalizePath(filePath: string): string {
  return path.normalize(filePath);
}

export function joinPaths(...segments: string[]): string {
  return path.join(...segments);
}

export function relativePath(from: string, to: string): string {
  return path.relative(from, to);
}

export function getProjectRoot(): string {
  return process.cwd();
}
```

**src/core/utils/version.ts:**
```typescript
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export function getGhostwireVersion(): string {
  const { version } = require('../../package.json');
  return version;
}

export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    
    if (p1 < p2) return -1;
    if (p1 > p2) return 1;
  }
  
  return 0;
}
```

**Acceptance Criteria:**
- [x] All utility functions have unit tests
- [x] Cross-platform path handling (Windows/Unix)
- [x] Proper error handling for file operations
- [x] Async/await used consistently

---

### P1-T4: Tool Definitions
**Priority:** Critical  
**Estimated Time:** 4 hours  
**Dependencies:** P1-T2

**Description:**
Define metadata for all 24 supported AI tools including directory names and format notes.

**Files to Modify:**
- `src/core/discovery/definitions.ts`

**Implementation Details:**
```typescript
import type { ToolDefinition } from '../config/schema.js';

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    id: 'opencode',
    name: 'OpenCode',
    skillsDir: '.opencode',
    available: true,
    successLabel: 'OpenCode',
    notes: 'Primary development platform'
  },
  {
    id: 'cursor',
    name: 'Cursor',
    skillsDir: '.cursor',
    available: true,
    successLabel: 'Cursor',
    notes: 'VS Code-based AI editor'
  },
  {
    id: 'claude',
    name: 'Claude Code',
    skillsDir: '.claude',
    available: true,
    successLabel: 'Claude Code',
    notes: 'Anthropic CLI tool'
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    skillsDir: '.github',
    available: true,
    successLabel: 'GitHub Copilot',
    notes: 'Uses .github/prompts/ for commands'
  },
  {
    id: 'continue',
    name: 'Continue',
    skillsDir: '.continue',
    available: true,
    successLabel: 'Continue',
    notes: 'Open-source AI coding assistant'
  },
  {
    id: 'cline',
    name: 'Cline',
    skillsDir: '.cline',
    available: true,
    successLabel: 'Cline',
    notes: 'Autonomous coding agent'
  },
  {
    id: 'amazon-q',
    name: 'Amazon Q Developer',
    skillsDir: '.amazonq',
    available: true,
    successLabel: 'Amazon Q Developer',
    notes: 'AWS AI assistant'
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    skillsDir: '.windsurf',
    available: true,
    successLabel: 'Windsurf',
    notes: 'AI-powered IDE'
  },
  // ... add remaining 16 tools
];

export function getToolDefinition(toolId: string): ToolDefinition | undefined {
  return TOOL_DEFINITIONS.find(tool => tool.id === toolId);
}

export function getAllToolDefinitions(): ToolDefinition[] {
  return TOOL_DEFINITIONS;
}

export function getAvailableTools(): ToolDefinition[] {
  return TOOL_DEFINITIONS.filter(tool => tool.available);
}
```

**Acceptance Criteria:**
- [x] All 24 tools defined
- [x] Each tool has unique skillsDir
- [x] Tool names are human-readable
- [x] getToolDefinition works correctly
- [x] Type-safe tool ID access

---

### P1-T5: Tool Detection
**Priority:** High  
**Estimated Time:** 3 hours  
**Dependencies:** P1-T3, P1-T4

**Description:**
Implement tool detection by scanning project directories.

**Files to Modify:**
- `src/core/discovery/detector.ts`
- `src/core/discovery/registry.ts`

**Implementation Details:**

**src/core/discovery/detector.ts:**
```typescript
import * as path from 'path';
import { directoryExists } from '../utils/file-system.js';
import { TOOL_DEFINITIONS } from './definitions.js';
import type { ToolId } from '../config/schema.js';

export async function detectAvailableTools(projectPath: string): Promise<ToolId[]> {
  const detected: ToolId[] = [];
  
  for (const tool of TOOL_DEFINITIONS) {
    const toolDir = path.join(projectPath, tool.skillsDir);
    if (await directoryExists(toolDir)) {
      detected.push(tool.id);
    }
  }
  
  return detected;
}

export async function isToolAvailable(projectPath: string, toolId: string): Promise<boolean> {
  const tool = TOOL_DEFINITIONS.find(t => t.id === toolId);
  if (!tool) return false;
  
  const toolDir = path.join(projectPath, tool.skillsDir);
  return directoryExists(toolDir);
}

export function getDetectedToolsMessage(tools: ToolId[]): string {
  if (tools.length === 0) {
    return 'No AI tools detected in this project.';
  }
  
  const toolNames = tools.map(id => {
    const tool = TOOL_DEFINITIONS.find(t => t.id === id);
    return tool?.name || id;
  });
  
  return `Detected ${tools.length} tool(s): ${toolNames.join(', ')}`;
}
```

**src/core/discovery/registry.ts:**
```typescript
import { TOOL_DEFINITIONS } from './definitions.js';
import type { ToolDefinition } from '../config/schema.js';

export class ToolRegistry {
  private tools: Map<string, ToolDefinition>;
  
  constructor() {
    this.tools = new Map();
    for (const tool of TOOL_DEFINITIONS) {
      this.tools.set(tool.id, tool);
    }
  }
  
  get(toolId: string): ToolDefinition | undefined {
    return this.tools.get(toolId);
  }
  
  getAll(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }
  
  getAvailable(): ToolDefinition[] {
    return this.getAll().filter(tool => tool.available);
  }
  
  has(toolId: string): boolean {
    return this.tools.has(toolId);
  }
}

// Singleton instance
export const toolRegistry = new ToolRegistry();
```

**Acceptance Criteria:**
- [x] Detects tools by directory presence
- [x] Returns correct tool IDs
- [x] Handles missing directories gracefully
- [x] Unit tests for detection logic
- [x] Registry singleton works correctly

---

### P1-T6: Configuration Management
**Priority:** Critical  
**Estimated Time:** 6 hours  
**Dependencies:** P1-T2, P1-T3

**Description:**
Implement configuration loading, validation, and defaults.

**Files to Modify:**
- `src/core/config/loader.ts`
- `src/core/config/validation.ts`
- `src/core/config/defaults.ts`

**Implementation Details:**

**src/core/config/defaults.ts:**
```typescript
import type { GhostwireConfig } from './schema.js';

export const DEFAULT_CONFIG: GhostwireConfig = {
  version: '1.0.0',
  tools: [],
  profile: 'core',
  delivery: 'both',
  featureFlags: {},
};

export const DEFAULT_CONFIG_FILENAME = 'config.yaml';
export const GHOSTWIRE_DIR_NAME = '.ghostwire';
```

**src/core/config/loader.ts:**
```typescript
import * as path from 'path';
import * as yaml from 'yaml';
import { fileExists, readFile, writeFile, ensureDir } from '../utils/file-system.js';
import { GhostwireConfigSchema, type GhostwireConfig } from './schema.js';
import { DEFAULT_CONFIG, DEFAULT_CONFIG_FILENAME, GHOSTWIRE_DIR_NAME } from './defaults.js';

export function getGhostwireDir(projectPath: string): string {
  return path.join(projectPath, GHOSTWIRE_DIR_NAME);
}

export function getConfigPath(projectPath: string): string {
  return path.join(getGhostwireDir(projectPath), DEFAULT_CONFIG_FILENAME);
}

export async function loadConfig(projectPath: string): Promise<GhostwireConfig | null> {
  const configPath = getConfigPath(projectPath);
  
  if (!await fileExists(configPath)) {
    return null;
  }
  
  try {
    const content = await readFile(configPath);
    const parsed = yaml.parse(content);
    return GhostwireConfigSchema.parse(parsed);
  } catch (error) {
    throw new Error(`Failed to load config from ${configPath}: ${error}`);
  }
}

export async function saveConfig(
  config: GhostwireConfig, 
  projectPath: string
): Promise<void> {
  const configPath = getConfigPath(projectPath);
  await ensureDir(path.dirname(configPath));
  
  const content = yaml.stringify(config, {
    indent: 2,
    sortMapEntries: true,
  });
  
  await writeFile(configPath, content);
}

export async function createDefaultConfig(
  projectPath: string,
  overrides?: Partial<GhostwireConfig>
): Promise<GhostwireConfig> {
  const config: GhostwireConfig = {
    ...DEFAULT_CONFIG,
    ...overrides,
  };
  
  await saveConfig(config, projectPath);
  return config;
}

export async function hasConfig(projectPath: string): Promise<boolean> {
  const configPath = getConfigPath(projectPath);
  return fileExists(configPath);
}
```

**src/core/config/validation.ts:**
```typescript
import { z } from 'zod';
import { GhostwireConfigSchema, type GhostwireConfig } from './schema.js';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateConfig(config: unknown): ValidationResult {
  const result = GhostwireConfigSchema.safeParse(config);
  
  if (result.success) {
    return { valid: true, errors: [] };
  }
  
  const errors = result.error.errors.map(err => 
    `${err.path.join('.')}: ${err.message}`
  );
  
  return { valid: false, errors };
}

export function validateTools(config: GhostwireConfig): string[] {
  const errors: string[] = [];
  
  if (config.tools.length === 0) {
    errors.push('At least one tool must be configured');
  }
  
  // Additional tool-specific validations
  
  return errors;
}
```

**Acceptance Criteria:**
- [x] Loads YAML config correctly
- [x] Saves YAML config with proper formatting
- [x] Validates against Zod schema
- [x] Provides helpful validation errors
- [x] Creates default config
- [x] Unit tests for all functions

---

## Phase 2: Adapter Infrastructure (Week 1-2)

### P2-T1: Adapter Base Interface
**Priority:** Critical  
**Estimated Time:** 2 hours  
**Dependencies:** P1-T2

**Description:**
Finalize and export adapter types.

**Already implemented in:** P1-T2

**Acceptance Criteria:**
- [x] Review adapter interface completeness
- [x] Ensure all 24 tools can be supported
- [x] Document adapter interface

---

### P2-T2: Adapter Registry
**Priority:** Critical  
**Estimated Time:** 3 hours  
**Dependencies:** P2-T1

**Description:**
Create registry for managing tool adapters.

**Files to Modify:**
- `src/core/adapters/registry.ts`

**Implementation Details:**
```typescript
import type { ToolCommandAdapter } from './types.js';

export class AdapterRegistry {
  private adapters: Map<string, ToolCommandAdapter>;
  
  constructor() {
    this.adapters = new Map();
  }
  
  register(adapter: ToolCommandAdapter): void {
    this.adapters.set(adapter.toolId, adapter);
  }
  
  get(toolId: string): ToolCommandAdapter {
    const adapter = this.adapters.get(toolId);
    if (!adapter) {
      throw new Error(`No adapter registered for tool: ${toolId}`);
    }
    return adapter;
  }
  
  has(toolId: string): boolean {
    return this.adapters.has(toolId);
  }
  
  getAll(): ToolCommandAdapter[] {
    return Array.from(this.adapters.values());
  }
  
  getRegisteredToolIds(): string[] {
    return Array.from(this.adapters.keys());
  }
}

// Factory function to create populated registry
export function createAdapterRegistry(): AdapterRegistry {
  const registry = new AdapterRegistry();
  
  // Will be populated with actual adapters in P2-T3 through P2-T26
  
  return registry;
}
```

**Acceptance Criteria:**
- [x] Register adapters
- [x] Retrieve adapters by tool ID
- [x] Error on missing adapter
- [x] List all registered adapters

---

### P2-T3 through P2-T26: Implement 24 Tool Adapters
**Priority:** Critical  
**Estimated Time:** 12 hours total (30 min each)  
**Dependencies:** P2-T2

**Description:**
Implement adapter for each of the 24 AI tools.

**Files to Create:**
- `src/core/adapters/opencode.ts`
- `src/core/adapters/cursor.ts`
- `src/core/adapters/claude.ts`
- `src/core/adapters/github-copilot.ts`
- `src/core/adapters/continue.ts`
- `src/core/adapters/cline.ts`
- `src/core/adapters/amazon-q.ts`
- `src/core/adapters/windsurf.ts`
- `src/core/adapters/augment.ts`
- `src/core/adapters/supermaven.ts`
- `src/core/adapters/tabnine.ts`
- `src/core/adapters/codeium.ts`
- `src/core/adapters/sourcegraph-cody.ts`
- `src/core/adapters/gemini.ts`
- `src/core/adapters/mistral.ts`
- `src/core/adapters/ollama.ts`
- `src/core/adapters/lm-studio.ts`
- `src/core/adapters/text-generation-webui.ts`
- `src/core/adapters/koboldcpp.ts`
- `src/core/adapters/tabby.ts`
- `src/core/adapters/gpt4all.ts`
- `src/core/adapters/jan.ts`
- `src/core/adapters/huggingface-chat.ts`
- `src/core/adapters/phind.ts`
- `src/core/adapters/perplexity.ts`

**Example Implementation (opencode.ts):**
```typescript
import path from 'path';
import type { ToolCommandAdapter, CommandContent } from './types.js';
import type { SkillTemplate } from '../templates/types.js';

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

${content.body}`;
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

${template.instructions}`;
  }
};
```

**Acceptance Criteria (for each adapter):**
- [x] Tool ID correct
- [x] Skills directory correct
- [x] Command path format correct
- [x] Skill path format correct
- [x] Frontmatter includes required fields
- [x] YAML formatting valid
- [x] Unit test for formatting

---

### P2-T27: Adapter Tests
**Priority:** High  
**Estimated Time:** 4 hours  
**Dependencies:** P2-T3 through P2-T26

**Description:**
Write comprehensive tests for all adapters.

**Files to Create:**
- `src/core/adapters/__tests__/opencode.test.ts`
- `src/core/adapters/__tests__/cursor.test.ts`
- `src/core/adapters/__tests__/claude.test.ts`
- `src/core/adapters/__tests__/github-copilot.test.ts`
- ... (tests for all adapters)

**Example Test:**
```typescript
import { describe, it, expect } from 'vitest';
import { opencodeAdapter } from '../opencode.js';
import type { CommandContent } from '../types.js';

describe('opencodeAdapter', () => {
  it('has correct metadata', () => {
    expect(opencodeAdapter.toolId).toBe('opencode');
    expect(opencodeAdapter.toolName).toBe('OpenCode');
    expect(opencodeAdapter.skillsDir).toBe('.opencode');
  });
  
  it('generates correct command path', () => {
    const path = opencodeAdapter.getCommandPath('propose');
    expect(path).toBe('.opencode/commands/ghostwire-propose.md');
  });
  
  it('generates correct skill path', () => {
    const path = opencodeAdapter.getSkillPath('ghostwire-planner');
    expect(path).toBe('.opencode/skills/ghostwire-planner/SKILL.md');
  });
  
  it('formats command with frontmatter', () => {
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

**Acceptance Criteria:**
- [x] All adapters have tests
- [x] Tests cover path generation
- [x] Tests cover formatting
- [x] Tests validate YAML output

---

## Phase 3: Template Migration (Week 2-3)

### P3-T1: Create Template Registry
**Priority:** Critical  
**Estimated Time:** 4 hours  
**Dependencies:** P1-T2

**Description:**
Create registry for managing command, skill, and agent templates.

**Files to Modify:**
- `src/core/templates/registry.ts`

**Implementation Details:**
```typescript
import type { CommandTemplate, SkillTemplate, AgentTemplate, TemplateEntry } from './types.js';

export class TemplateRegistry {
  private commands: Map<string, TemplateEntry<CommandTemplate>>;
  private skills: Map<string, TemplateEntry<SkillTemplate>>;
  private agents: Map<string, TemplateEntry<AgentTemplate>>;
  
  constructor() {
    this.commands = new Map();
    this.skills = new Map();
    this.agents = new Map();
  }
  
  // Command registration
  registerCommand(entry: TemplateEntry<CommandTemplate>): void {
    this.commands.set(entry.id, entry);
  }
  
  getCommand(id: string): CommandTemplate | undefined {
    const entry = this.commands.get(id);
    return entry?.template();
  }
  
  getAllCommands(): TemplateEntry<CommandTemplate>[] {
    return Array.from(this.commands.values());
  }
  
  getCoreCommands(): TemplateEntry<CommandTemplate>[] {
    return this.getAllCommands().filter(cmd => cmd.isCore);
  }
  
  // Skill registration
  registerSkill(entry: TemplateEntry<SkillTemplate>): void {
    this.skills.set(entry.id, entry);
  }
  
  getSkill(id: string): SkillTemplate | undefined {
    const entry = this.skills.get(id);
    return entry?.template();
  }
  
  getAllSkills(): TemplateEntry<SkillTemplate>[] {
    return Array.from(this.skills.values());
  }
  
  // Agent registration
  registerAgent(entry: TemplateEntry<AgentTemplate>): void {
    this.agents.set(entry.id, entry);
  }
  
  getAgent(id: string): AgentTemplate | undefined {
    const entry = this.agents.get(id);
    return entry?.template();
  }
  
  getAllAgents(): TemplateEntry<AgentTemplate>[] {
    return Array.from(this.agents.values());
  }
}

// Factory to create populated registry
export function createTemplateRegistry(): TemplateRegistry {
  const registry = new TemplateRegistry();
  
  // Will be populated in P3-T2 through P3-T4
  
  return registry;
}
```

**Acceptance Criteria:**
- [x] Commands, skills, agents tracked separately
- [x] Core vs extended profile support
- [x] Template factory functions work

---

### P3-T2: Migrate All Ghostwire Commands
**Priority:** Critical  
**Estimated Time:** 16 hours  
**Dependencies:** P3-T1

**Description:**
Convert all existing ghostwire commands to CommandTemplate format.

**Files to Create (25+ files):**
- `src/templates/commands/propose.ts`
- `src/templates/commands/explore.ts`
- `src/templates/commands/apply.ts`
- `src/templates/commands/archive.ts`
- `src/templates/commands/code-format.ts`
- `src/templates/commands/code-optimize.ts`
- `src/templates/commands/code-refactor.ts`
- `src/templates/commands/code-review.ts`
- `src/templates/commands/git-branch.ts`
- `src/templates/commands/git-cleanup.ts`
- `src/templates/commands/git-merge.ts`
- `src/templates/commands/git-smart-commit.ts`
- `src/templates/commands/docs-deploy.ts`
- `src/templates/commands/docs-release.ts`
- `src/templates/commands/docs-feature-video.ts`
- `src/templates/commands/docs-test-browser.ts`
- `src/templates/commands/project-build.ts`
- `src/templates/commands/project-deploy.ts`
- `src/templates/commands/project-test.ts`
- `src/templates/commands/project-constitution.ts`
- ... (and 5+ more)

**For each command:**
1. Extract template from existing command in `commands-manifest.ts`
2. Create `get<CommandName>CommandTemplate()` function
3. Register in template registry
4. Write unit test

**Acceptance Criteria (for each command):**
- [x] Template function exports CommandTemplate
- [x] Content migrated from old format
- [x] Tags and category appropriate
- [x] Unit test validates template
- [x] Registered in registry

---

### P3-T3: Migrate All Ghostwire Skills
**Priority:** High  
**Estimated Time:** 12 hours  
**Dependencies:** P3-T1

**Description:**
Convert existing ghostwire skills to SkillTemplate format.

**Files to Create (15+ files):**
- `src/templates/skills/git-master.ts`
- `src/templates/skills/rails-style.ts`
- `src/templates/skills/brainstorming.ts`
- `src/templates/skills/coding-tutor.ts`
- `src/templates/skills/frontend-design.ts`
- `src/templates/skills/frontend-ui-ux.ts`
- `src/templates/skills/playwright.ts`
- `src/templates/skills/rclone.ts`
- `src/templates/skills/gemini-imagegen.ts`
- `src/templates/skills/dspy-ruby.ts`
- `src/templates/skills/andrew-kane-gem-writer.ts`
- ... (and 5+ more)

**For each skill:**
1. Extract from `src/skills/<name>/`
2. Create `get<SkillName>SkillTemplate()` function
3. Register in template registry
4. Write unit test

**Acceptance Criteria:**
- [x] Template function exports SkillTemplate
- [x] Instructions migrated completely
- [x] Metadata included
- [x] Unit test validates template

---

### P3-T4: Create Agent Templates (39 Total)
**Priority:** High  
**Estimated Time:** 32 hours  
**Dependencies:** P3-T1

**Description:**
Create AgentTemplate definitions for all 39 ghostwire agents. This is the largest migration task due to the number of agents.

**Files to Create (39 total):**
- `src/templates/agents/planner.ts`
- `src/templates/agents/advisor-strategy.ts`
- `src/templates/agents/advisor-architecture.ts`
- `src/templates/agents/analyzer-design.ts`
- `src/templates/agents/analyzer-patterns.ts`
- `src/templates/agents/designer-builder.ts`
- `src/templates/agents/designer-flow.ts`
- `src/templates/agents/designer-iterator.ts`
- `src/templates/agents/designer-sync.ts`
- `src/templates/agents/do.ts`
- `src/templates/agents/research.ts`
- `src/templates/agents/plan.ts`
- `src/templates/agents/analyzer-media.ts`
- `src/templates/agents/researcher-codebase.ts`
- `src/templates/agents/researcher-deep.ts`
- `src/templates/agents/researcher-web.ts`
- `src/templates/agents/analyzer-dependencies.ts`
- `src/templates/agents/analyzer-performance.ts`
- `src/templates/agents/analyzer-security.ts`
- `src/templates/agents/analyzer-tests.ts`
- `src/templates/agents/implementer-feature.ts`
- `src/templates/agents/implementer-refactor.ts`
- `src/templates/agents/implementer-optimize.ts`
- `src/templates/agents/implementer-tests.ts`
- `src/templates/agents/implementer-docs.ts`
- `src/templates/agents/implementer-fix.ts`
- `src/templates/agents/implementer-review.ts`
- `src/templates/agents/specialist-frontend.ts`
- `src/templates/agents/specialist-backend.ts`
- `src/templates/agents/specialist-devops.ts`
- `src/templates/agents/specialist-database.ts`
- `src/templates/agents/specialist-api.ts`
- `src/templates/agents/specialist-mobile.ts`
- `src/templates/agents/specialist-ai.ts`
- `src/templates/agents/specialist-security.ts`
- `src/templates/agents/reviewer-code.ts`
- `src/templates/agents/reviewer-architecture.ts`
- `src/templates/agents/reviewer-security.ts`
- `src/templates/agents/reviewer-performance.ts`

**Implementation Notes:**
- Extract from `src/agents/catalog.ts`
- Convert to harness-agnostic instructions
- Remove OpenCode-specific references
- Add available commands list
- Maintain agent capabilities

**Acceptance Criteria:**
- [x] All 39 agent templates created
- [x] Each agent has harness-agnostic instructions
- [x] Available commands listed for each agent
- [x] Capabilities documented
- [x] Unit tests for all 39 agents

---

### P3-T5: Template Tests
**Priority:** High  
**Estimated Time:** 6 hours  
**Dependencies:** P3-T2, P3-T3, P3-T4

**Description:**
Comprehensive tests for all templates.

**Files to Create:**
- Tests for each command template
- Tests for each skill template
- Tests for each agent template

**Acceptance Criteria:**
- [x] 100% template coverage
- [x] Validates template structure
- [x] Validates required fields present
- [x] Validates content completeness

---

## Phase 4: Generator Implementation (Week 3-4)

### P4-T1: Command Generator
**Priority:** Critical  
**Estimated Time:** 6 hours  
**Dependencies:** P2-T27, P3-T5

**Description:**
Implement command file generation for all tools.

**Files to Modify:**
- `src/core/generator/command-gen.ts`

**Implementation Details:**
```typescript
import type { ToolCommandAdapter } from '../adapters/types.js';
import type { CommandTemplate } from '../templates/types.js';
import type { GeneratedFile } from '../adapters/types.js';

export interface CommandGenerationOptions {
  template: CommandTemplate;
  adapter: ToolCommandAdapter;
  commandId: string;
  version: string;
}

export function generateCommand(options: CommandGenerationOptions): GeneratedFile {
  const { template, adapter, commandId, version } = options;
  
  const content: CommandContent = {
    id: commandId,
    fullId: `ghostwire:${commandId}`,
    name: template.name,
    description: template.description,
    category: template.category,
    tags: template.tags,
    body: template.content
  };
  
  const filePath = adapter.getCommandPath(commandId);
  const fileContent = adapter.formatCommand(content);
  
  return {
    path: filePath,
    content: fileContent
  };
}

export function generateCommandsForAllTools(
  template: CommandTemplate,
  commandId: string,
  adapters: ToolCommandAdapter[],
  version: string
): GeneratedFile[] {
  return adapters.map(adapter => 
    generateCommand({ template, adapter, commandId, version })
  );
}
```

**Acceptance Criteria:**
- [x] Generates correct file paths
- [x] Formats content for each tool
- [x] Handles all 24 adapters
- [x] Unit tests for generation

---

### P4-T2: Skill Generator
**Priority:** Critical  
**Estimated Time:** 6 hours  
**Dependencies:** P2-T27, P3-T5

**Description:**
Implement skill file generation for all tools.

**Files to Modify:**
- `src/core/generator/skill-gen.ts`

**Implementation Details:**
```typescript
import type { ToolCommandAdapter } from '../adapters/types.js';
import type { SkillTemplate } from '../templates/types.js';
import type { GeneratedFile } from '../adapters/types.js';

export interface SkillGenerationOptions {
  template: SkillTemplate;
  adapter: ToolCommandAdapter;
  version: string;
}

export function generateSkill(options: SkillGenerationOptions): GeneratedFile {
  const { template, adapter, version } = options;
  
  const filePath = adapter.getSkillPath(template.name);
  const fileContent = adapter.formatSkill(template, version);
  
  return {
    path: filePath,
    content: fileContent
  };
}

export function generateSkillsForAllTools(
  template: SkillTemplate,
  adapters: ToolCommandAdapter[],
  version: string
): GeneratedFile[] {
  return adapters.map(adapter => 
    generateSkill({ template, adapter, version })
  );
}
```

**Acceptance Criteria:**
- [x] Generates correct skill directories
- [x] Formats SKILL.md for each tool
- [x] Includes version metadata
- [x] Unit tests for generation

---

### P4-T3: Agent Generator
**Priority:** High  
**Estimated Time:** 4 hours  
**Dependencies:** P4-T2

**Description:**
Implement agent skill generation (agents are special skills).

**Files to Modify:**
- `src/core/generator/agent-gen.ts`

**Implementation:**
Reuse skill generator - agents use same mechanism.

**Acceptance Criteria:**
- [x] Agents generated as skills
- [x] Special agent metadata included
- [x] All configured tools get agents

---

### P4-T4: Main Generator Orchestrator
**Priority:** Critical  
**Estimated Time:** 8 hours  
**Dependencies:** P4-T1, P4-T2, P4-T3

**Description:**
Create main generator that orchestrates all file generation.

**Files to Modify:**
- `src/core/generator/index.ts`

**Implementation Details:**
```typescript
import type { GhostwireConfig } from '../config/schema.js';
import type { GenerationResult, GenerationOptions } from './types.js';
import type { ToolCommandAdapter } from '../adapters/types.js';
import { AdapterRegistry, createAdapterRegistry } from '../adapters/registry.js';
import { TemplateRegistry, createTemplateRegistry } from '../templates/registry.js';
import { generateCommand } from './command-gen.js';
import { generateSkill } from './skill-gen.js';
import { writeFile, fileExists } from '../utils/file-system.js';
import { getGhostwireVersion } from '../utils/version.js';

export class Generator {
  private config: GhostwireConfig;
  private adapterRegistry: AdapterRegistry;
  private templateRegistry: TemplateRegistry;
  private version: string;
  
  constructor(config: GhostwireConfig) {
    this.config = config;
    this.adapterRegistry = createAdapterRegistry();
    this.templateRegistry = createTemplateRegistry();
    this.version = getGhostwireVersion();
  }
  
  async generateAll(projectPath: string): Promise<GenerationResult> {
    const result: GenerationResult = {
      generated: [],
      failed: [],
      skipped: [],
      removed: []
    };
    
    const adapters = this.getAdaptersForTools();
    
    // Generate commands
    if (this.config.delivery !== 'skills') {
      const commandResult = await this.generateCommands(adapters, projectPath);
      this.mergeResults(result, commandResult);
    }
    
    // Generate skills
    if (this.config.delivery !== 'commands') {
      const skillResult = await this.generateSkills(adapters, projectPath);
      this.mergeResults(result, skillResult);
    }
    
    // Generate agents
    if (this.config.delivery !== 'commands') {
      const agentResult = await this.generateAgents(adapters, projectPath);
      this.mergeResults(result, agentResult);
    }
    
    return result;
  }
  
  private getAdaptersForTools(): ToolCommandAdapter[] {
    return this.config.tools.map(toolId => 
      this.adapterRegistry.get(toolId)
    );
  }
  
  private async generateCommands(
    adapters: ToolCommandAdapter[],
    projectPath: string
  ): Promise<GenerationResult> {
    // Implementation
  }
  
  private async generateSkills(
    adapters: ToolCommandAdapter[],
    projectPath: string
  ): Promise<GenerationResult> {
    // Implementation
  }
  
  private async generateAgents(
    adapters: ToolCommandAdapter[],
    projectPath: string
  ): Promise<GenerationResult> {
    // Implementation
  }
  
  private mergeResults(target: GenerationResult, source: GenerationResult): void {
    target.generated.push(...source.generated);
    target.failed.push(...source.failed);
    target.skipped.push(...source.skipped);
    target.removed.push(...source.removed);
  }
}
```

**Acceptance Criteria:**
- [x] Generates all files for configured tools
- [x] Respects delivery mode
- [x] Filters by profile
- [x] Tracks results accurately
- [x] Handles errors gracefully

---

### P4-T5: Generator Tests
**Priority:** High  
**Estimated Time:** 6 hours  
**Dependencies:** P4-T4

**Description:**
Comprehensive tests for generator.

**Files to Create:**
- `src/core/generator/__tests__/generator.test.ts`
- `src/core/generator/__tests__/command-gen.test.ts`
- `src/core/generator/__tests__/skill-gen.test.ts`

**Acceptance Criteria:**
- [x] Tests for full generation flow
- [x] Tests for partial generation
- [x] Tests for error handling
- [x] Integration tests with real file system

---

## Phase 5: CLI Implementation (Week 4)

### P5-T1: Init Command
**Priority:** Critical  
**Estimated Time:** 8 hours  
**Dependencies:** P4-T5

**Description:**
Implement `ghostwire init` command.

**Files to Modify:**
- `src/cli/init.ts`

**Implementation Details:**
```typescript
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { detectAvailableTools } from '../core/discovery/detector.js';
import { createDefaultConfig, saveConfig } from '../core/config/loader.js';
import { Generator } from '../core/generator/index.js';
import type { GhostwireConfig } from '../core/config/schema.js';

interface InitOptions {
  tools?: string;
  profile?: string;
  delivery?: string;
  yes?: boolean;
}

export function createInitCommand(): Command {
  return new Command('init')
    .description('Initialize ghostwire in the current project')
    .option('-t, --tools <tools>', 'Comma-separated list of tools')
    .option('-p, --profile <profile>', 'Profile to use (core, extended, custom)')
    .option('-d, --delivery <delivery>', 'What to install (skills, commands, both)')
    .option('-y, --yes', 'Skip prompts and use defaults')
    .action(async (options: InitOptions) => {
      await executeInit(options);
    });
}

async function executeInit(options: InitOptions): Promise<void> {
  const projectPath = process.cwd();
  
  // Detect available tools
  const availableTools = await detectAvailableTools(projectPath);
  
  if (availableTools.length === 0) {
    console.log(chalk.yellow('No AI tools detected. Install a tool first (e.g., OpenCode).'));
    return;
  }
  
  // Determine tools to configure
  let selectedTools: string[];
  if (options.tools === 'all') {
    selectedTools = availableTools;
  } else if (options.tools) {
    selectedTools = options.tools.split(',');
  } else if (options.yes) {
    selectedTools = availableTools;
  } else {
    selectedTools = await promptToolSelection(availableTools);
  }
  
  // Create config
  const config: GhostwireConfig = {
    version: '1.0.0',
    tools: selectedTools as any,
    profile: (options.profile || 'core') as any,
    delivery: (options.delivery || 'both') as any
  };
  
  await saveConfig(config, projectPath);
  
  // Generate files
  const spinner = ora('Generating ghostwire files...').start();
  
  try {
    const generator = new Generator(config);
    const result = await generator.generateAll(projectPath);
    
    spinner.succeed(`Generated ${result.generated.length} files`);
    
    if (result.failed.length > 0) {
      console.log(chalk.red(`Failed: ${result.failed.length} files`));
    }
    
    console.log(chalk.green('\\n✨ Ghostwire initialized successfully!'));
    console.log(`\\nConfigured tools: ${selectedTools.join(', ')}`);
    console.log(`Profile: ${config.profile}`);
    console.log('\\nTry running one of these commands in your AI tool:');
    console.log('  /ghostwire:propose');
    console.log('  /ghostwire:planner');
  } catch (error) {
    spinner.fail('Failed to generate files');
    console.error(error);
    process.exit(1);
  }
}
```

**Acceptance Criteria:**
- [x] Detects available tools
- [x] Creates config file
- [x] Generates all files
- [x] Shows helpful output
- [x] Handles errors gracefully
- [x] Interactive and non-interactive modes

---

### P5-T2: Update Command
**Priority:** Critical  
**Estimated Time:** 6 hours  
**Dependencies:** P4-T5

**Description:**
Implement `ghostwire update` command.

**Files to Modify:**
- `src/cli/update.ts`

**Acceptance Criteria:**
- [x] Loads existing config
- [x] Regenerates all files
- [x] Shows what changed
- [x] Force flag for full regeneration
- [x] Handles missing config gracefully

---

### P5-T3: Config Command
**Priority:** Medium  
**Estimated Time:** 6 hours  
**Dependencies:** P4-T5

**Description:**
Implement `ghostwire config` subcommands.

**Files to Modify:**
- `src/cli/config.ts`

**Commands:**
- `ghostwire config show` - Display current config
- `ghostwire config profile <name>` - Change profile
- `ghostwire config tools --add <tool>` - Add tool
- `ghostwire config tools --remove <tool>` - Remove tool

**Acceptance Criteria:**
- [x] Show displays formatted config
- [x] Profile changes regenerate files
- [x] Tool add/remove regenerates files
- [x] Validates changes

---

### P5-T4: Validate Command
**Priority:** Low  
**Estimated Time:** 3 hours  
**Dependencies:** P4-T5

**Description:**
Implement `ghostwire validate` command to check installation.

**Files to Modify:**
- `src/cli/validate.ts`

**Acceptance Criteria:**
- [x] Checks config validity
- [x] Verifies all expected files exist
- [x] Reports missing/outdated files
- [x] Suggests fixes

---

### P5-T5: CLI Entry Point
**Priority:** Critical  
**Estimated Time:** 4 hours  
**Dependencies:** P5-T1, P5-T2, P5-T3

**Description:**
Create main CLI entry point.

**Files to Modify:**
- `src/cli/index.ts`
- `bin/ghostwire.js`

**Implementation:**
```typescript
#!/usr/bin/env node
import { Command } from 'commander';
import { createInitCommand } from './init.js';
import { createUpdateCommand } from './update.js';
import { createConfigCommand } from './config.js';
import { createValidateCommand } from './validate.js';
import { getGhostwireVersion } from '../core/utils/version.js';

const program = new Command();

program
  .name('ghostwire')
  .description('AI-native development workflows for any coding assistant')
  .version(getGhostwireVersion());

program.addCommand(createInitCommand());
program.addCommand(createUpdateCommand());
program.addCommand(createConfigCommand());
program.addCommand(createValidateCommand());

program.parse();
```

**Acceptance Criteria:**
- [x] All commands registered
- [x] Help text for each command
- [x] Version flag works
- [x] Error handling
- [x] Exit codes correct

---

### P5-T6: CLI Tests
**Priority:** Medium  
**Estimated Time:** 4 hours  
**Dependencies:** P5-T5

**Description:**
Integration tests for CLI commands.

**Files to Create:**
- `src/cli/__tests__/init.test.ts`
- `src/cli/__tests__/update.test.ts`
- `src/cli/__tests__/config.test.ts`

**Acceptance Criteria:**
- [x] Tests in temp directories
- [x] Tests full init flow
- [x] Tests config modifications
- [x] Tests error scenarios

---

## Phase 6: Testing & Polish (Week 5-6)

### P6-T1: Integration Tests
**Priority:** Critical  
**Estimated Time:** 8 hours  
**Dependencies:** P5-T6

**Description:**
End-to-end integration tests.

**Files to Create:**
- `test/integration/init.test.ts`
- `test/integration/update.test.ts`
- `test/integration/full-workflow.test.ts`

**Test Scenarios:**
1. Init with multiple tools
2. Update after config change
3. Tool detection accuracy
4. File generation for all tools
5. Coexistence with OpenSpec

**Acceptance Criteria:**
- [x] Tests run in isolated temp projects
- [x] Tests all 24 tools (or subset)
- [x] Tests error scenarios
- [x] Tests edge cases

---

### P6-T2: Documentation
**Priority:** High  
**Estimated Time:** 8 hours  
**Dependencies:** P5-T6

**Description:**
Create comprehensive documentation.

**Files to Create:**
- `README.md` - Main readme
- `docs/getting-started.md`
- `docs/commands.md`
- `docs/agents.md`
- `docs/configuration.md`
- `docs/migration.md`
- `CONTRIBUTING.md`

**Acceptance Criteria:**
- [x] Installation instructions
- [x] Quick start guide
- [x] All commands documented
- [x] Configuration reference
- [x] Migration guide
- [x] Architecture overview

---

### P6-T3: Examples
**Priority:** Medium  
**Estimated Time:** 4 hours  
**Dependencies:** P5-T6

**Description:**
Create example projects showing ghostwire usage.

**Files to Create:**
- `examples/node-project/` - Node.js example
- `examples/python-project/` - Python example
- `examples/ruby-project/` - Ruby example

**Each example includes:**
- `.ghostwire/config.yaml`
- Example workflow usage
- README explaining setup

**Acceptance Criteria:**
- [x] 3+ example projects
- [x] Each shows different use case
- [x] Clear documentation
- [x] Working configurations

---

### P6-T4: Performance Optimization
**Priority:** Low  
**Estimated Time:** 4 hours  
**Dependencies:** All previous

**Description:**
Optimize generation performance.

**Optimizations:**
- Parallel file generation
- Smart diffing (only update changed files)
- Caching

**Acceptance Criteria:**
- [x] Init completes in < 5 seconds for 5 tools
- [x] Update only touches changed files
- [x] No unnecessary I/O

---

### P6-T5: Final Review & Bug Fixes
**Priority:** Critical  
**Estimated Time:** 12 hours  
**Dependencies:** All previous

**Description:**
Comprehensive review and bug fixing.

**Activities:**
1. Code review all files
2. Run full test suite
3. Manual testing
4. Fix any issues
5. Verify all acceptance criteria

**Acceptance Criteria:**
- [x] All tests passing
- [x] Manual testing complete
- [x] No known bugs
- [x] Documentation complete
- [x] Ready for release

---

## Summary Statistics

| Phase | Tasks | Estimated Hours |
|-------|-------|----------------|
| Phase 1: Foundation | 6 tasks | 22 hours |
| Phase 2: Adapters | 25 tasks | 21 hours |
| Phase 3: Templates | 5 tasks | 70 hours |
| Phase 4: Generator | 5 tasks | 30 hours |
| Phase 5: CLI | 6 tasks | 27 hours |
| Phase 6: Testing | 5 tasks | 48 hours |
| **TOTAL** | **52 tasks** | **~234 hours (5.8 weeks)** (~5.8 weeks full-time) |

---

## Dependencies Graph

```
P1-T1 (Structure)
  ↓
P1-T2 (Types)
  ↓
  ├── P1-T3 (Utils)
  ├── P1-T4 (Tool Definitions)
  ├── P2-T1 (Adapter Interface)
  │     ↓
  │   P2-T2 (Adapter Registry)
  │     ↓
  │   P2-T3..26 (24 Adapters)
  │     ↓
  │   P2-T27 (Adapter Tests)
  │     ↓
  ├── P1-T5 (Tool Detection)
  ├── P1-T6 (Config)
  ├── P3-T1 (Template Registry)
  │     ↓
  │   P3-T2 (Command Templates)
  │   P3-T3 (Skill Templates)
  │   P3-T4 (Agent Templates)
  │     ↓
  │   P3-T5 (Template Tests)
  │     ↓
  ├── P4-T1 (Command Generator)
  ├── P4-T2 (Skill Generator)
  ├── P4-T3 (Agent Generator)
  │     ↓
  │   P4-T4 (Main Generator)
  │     ↓
  │   P4-T5 (Generator Tests)
  │     ↓
  ├── P5-T1 (Init Command)
  ├── P5-T2 (Update Command)
  ├── P5-T3 (Config Command)
  ├── P5-T4 (Validate Command)
  │     ↓
  │   P5-T5 (CLI Entry)
  │     ↓
  │   P5-T6 (CLI Tests)
  │     ↓
  ├── P6-T1 (Integration Tests)
  ├── P6-T2 (Documentation)
  ├── P6-T3 (Examples)
  ├── P6-T4 (Performance)
  │     ↓
  │   P6-T5 (Final Review)
```

---

**Document Version:** 1.0  
**Last Updated:** 2026-03-04  
**Total Tasks:** 52  
**Estimated Duration:** 4-6 weeks

---

## Appendix A: Complete Agent Inventory (39 Total)

Based on `src/agents/catalog.ts`, ghostwire has 39 agents organized by category:

### Planning & Strategy (2)
1. **advisor-strategy** - Pre-planning consultant analyzing intent
2. **planner** - Strategic planning consultant

### Architecture & Design (7)
3. **advisor-architecture** - Architecture reviewer
4. **analyzer-design** - Design specification verifier
5. **analyzer-patterns** - Pattern recognition specialist
6. **designer-builder** - Frontend interface builder
7. **designer-flow** - User flow analyzer
8. **designer-iterator** - Design refinement specialist
9. **designer-sync** - Figma synchronization

### Orchestration Controllers (3)
10. **do** - Primary execution coordinator
11. **research** - Research coordinator
12. **plan** - Strategic planning

### Research & Analysis (8)
13. **analyzer-media** - Media file analyzer
14. **researcher-codebase** - Codebase search specialist
15. **researcher-deep** - Deep research specialist
16. **researcher-web** - Web research specialist
17. **analyzer-dependencies** - Dependency analyzer
18. **analyzer-performance** - Performance analyzer
19. **analyzer-security** - Security analyzer
20. **analyzer-tests** - Test analyzer

### Code & Implementation (7)
21. **implementer-feature** - Feature implementer
22. **implementer-refactor** - Refactoring specialist
23. **implementer-optimize** - Optimization specialist
24. **implementer-tests** - Test implementer
25. **implementer-docs** - Documentation writer
26. **implementer-fix** - Bug fix specialist
27. **implementer-review** - Code reviewer

### Domain Specialists (8)
28. **specialist-frontend** - Frontend specialist
29. **specialist-backend** - Backend specialist
30. **specialist-devops** - DevOps specialist
31. **specialist-database** - Database specialist
32. **specialist-api** - API specialist
33. **specialist-mobile** - Mobile specialist
34. **specialist-ai** - AI/ML specialist
35. **specialist-security** - Security specialist

### Quality & Review (4)
36. **reviewer-code** - Code reviewer
37. **reviewer-architecture** - Architecture reviewer
38. **reviewer-security** - Security reviewer
39. **reviewer-performance** - Performance reviewer

**Note:** This inventory must be migrated in Phase 3, Task P3-T4. Each agent needs:
- AgentTemplate definition
- Harness-agnostic instructions
- Registration in template registry
- Unit test

