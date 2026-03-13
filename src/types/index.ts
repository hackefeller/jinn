/**
 * Type re-exports for convenience.
 *
 * This module provides a single import point for all jinn types.
 */

// Template types
export type {
  SkillTemplate,
  CommandTemplate,
  AgentTemplate,
  TemplateEntry,
} from '../core/templates/types.js';

// Adapter types
export type {
  ToolCommandAdapter,
  CommandContent,
  GeneratedFile,
  AdapterRegistry,
} from '../core/adapters/types.js';

// Config types
export type {
  JinnConfig,
  ToolId,
  Profile,
  Delivery,
  ToolDefinition,
  ValidationResult,
} from '../core/config/schema.js';

// Generator types
export type {
  GenerationOptions,
  GenerationResult,
  SkillGenerationOptions,
  CommandGenerationOptions,
  AgentGenerationOptions,
} from '../core/generator/types.js';
