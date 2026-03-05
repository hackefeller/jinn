/**
 * Generator types for file generation orchestration.
 *
 * The generator coordinates the creation of skill and command files
 * across all configured AI tools.
 */

import type { CommandTemplate, SkillTemplate, AgentTemplate } from '../templates/types.js';

/**
 * Generation options
 * Passed to the generator to control what gets generated
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
 * Returned by the generator after processing
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
 * Template registry entry with metadata
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

/**
 * Skill generation options
 */
export interface SkillGenerationOptions {
  template: SkillTemplate;
  toolId: string;
  version: string;
}

/**
 * Command generation options
 */
export interface CommandGenerationOptions {
  template: CommandTemplate;
  commandId: string;
  toolId: string;
  version: string;
}

/**
 * Agent generation options
 */
export interface AgentGenerationOptions {
  template: AgentTemplate;
  agentId: string;
  toolId: string;
  version: string;
}
