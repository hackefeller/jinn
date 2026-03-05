/**
 * Adapter types for tool-specific formatting.
 *
 * The adapter pattern is the core of ghostwire's harness-agnostic architecture.
 * Each AI tool implements ToolCommandAdapter to format content for its specific
 * requirements while the core templates remain tool-agnostic.
 */

import type { SkillTemplate } from '../templates/types.js';

/**
 * Tool-agnostic command content
 * Generated from CommandTemplate, fed to adapters for formatting
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
 * Per-tool formatting strategy.
 * Each AI tool implements this interface to handle its specific file path
 * and frontmatter format requirements.
 */
export interface ToolCommandAdapter {
  /** Tool identifier matching ToolId (e.g., 'opencode', 'cursor') */
  toolId: string;

  /** Human-readable tool name */
  toolName: string;

  /** Skill directory name (e.g., '.opencode', '.cursor') */
  skillsDir: string;

  /**
   * Returns the file path for a command.
   * @param commandId - The command identifier (e.g., 'propose')
   * @returns Path from project root (e.g., '.opencode/commands/ghostwire-propose.md')
   */
  getCommandPath(commandId: string): string;

  /**
   * Returns the skill directory path.
   * @param skillName - The skill name (e.g., 'ghostwire-planner')
   * @returns Path from project root (e.g., '.opencode/skills/ghostwire-planner/SKILL.md')
   */
  getSkillPath(skillName: string): string;

  /**
   * Formats command file content including frontmatter.
   * @param content - The tool-agnostic command content
   * @returns Complete file content ready to write
   */
  formatCommand(content: CommandContent): string;

  /**
   * Formats skill file content including frontmatter.
   * @param template - The skill template
   * @param version - Ghostwire version
   * @returns Complete file content ready to write
   */
  formatSkill(template: SkillTemplate, version: string): string;

  /**
   * Optional: Transform command references for this tool.
   * E.g., OpenCode uses /ghostwire:propose, others might use different syntax.
   * @param text - The text to transform
   * @returns Transformed text with tool-appropriate command references
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

/**
 * Adapter registry for managing tool adapters
 */
export interface AdapterRegistry {
  /** Register an adapter */
  register(adapter: ToolCommandAdapter): void;

  /** Get adapter by tool ID */
  get(toolId: string): ToolCommandAdapter;

  /** Check if adapter exists */
  has(toolId: string): boolean;

  /** Get all registered adapters */
  getAll(): ToolCommandAdapter[];

  /** Get all registered tool IDs */
  getRegisteredToolIds(): string[];
}
