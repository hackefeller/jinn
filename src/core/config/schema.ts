/**
 * Configuration schema and types for jinn.
 *
 * Jinn uses Zod for runtime validation and TypeScript type inference.
 */

import { z } from 'zod';

/**
 * Profile determines which commands/skills are installed
 * - core: Essential workflows only
 * - extended: All workflows
 * - custom: User-selected subset
 */
export const ProfileSchema = z.enum(['core', 'extended', 'custom']);
export type Profile = z.infer<typeof ProfileSchema>;

/**
 * Delivery mode: what gets installed
 * - skills: Skills only
 * - commands: Commands only
 * - both: Both skills and commands
 */
export const DeliverySchema = z.enum(['skills', 'commands', 'both']);
export type Delivery = z.infer<typeof DeliverySchema>;

export const WorkflowBackendSchema = z.enum(['filesystem', 'linear']);
export type WorkflowBackend = z.infer<typeof WorkflowBackendSchema>;

export const LinearIssueStructureSchema = z.enum(['project-issues-subissues']);
export type LinearIssueStructure = z.infer<typeof LinearIssueStructureSchema>;

export const LinearWorkflowConfigSchema = z.object({
  team: z.string().min(1, 'Linear team is required'),
  defaultProjectNameTemplate: z.string().min(1, 'Linear project name template is required'),
  mcpServerName: z.string().min(1, 'Linear MCP server name is required'),
  issueStructure: LinearIssueStructureSchema,
});
export type LinearWorkflowConfig = z.infer<typeof LinearWorkflowConfigSchema>;

export const WorkflowConfigSchema = z
  .object({
    backend: WorkflowBackendSchema.default('filesystem'),
    linear: LinearWorkflowConfigSchema.optional(),
  })
  .superRefine((value, ctx) => {
    if (value.backend === 'linear' && !value.linear) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['linear'],
        message: 'Linear workflow settings are required when workflow.backend is linear',
      });
    }
  });
export type WorkflowConfig = z.infer<typeof WorkflowConfigSchema>;

/**
 * Supported AI tool identifiers
 * This list covers 24 popular AI coding assistants
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
]);
export type ToolId = z.infer<typeof ToolIdSchema>;

/**
 * Main configuration schema
 * This defines the structure of .jinn/config.yaml
 */
export const JinnConfigSchema = z.object({
  /** Configuration schema version */
  version: z.string().default('1.0.0'),

  /** Which AI tools to configure */
  tools: z.array(ToolIdSchema).min(1, 'At least one tool must be configured'),

  /** Which profile of commands/skills to install */
  profile: ProfileSchema.default('core'),

  /** Custom workflows (when profile is 'custom') */
  customWorkflows: z.array(z.string()).optional(),

  /** What to install: skills, commands, or both */
  delivery: DeliverySchema.default('both'),

  /** Feature flags for experimental features */
  featureFlags: z.record(z.string(), z.boolean()).optional(),

  /** Project-specific metadata */
  metadata: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    version: z.string().optional(),
  }).optional(),

  /** Workflow backend configuration */
  workflow: WorkflowConfigSchema.default({
    backend: 'filesystem',
  }),
});

export type JinnConfig = z.infer<typeof JinnConfigSchema>;

/**
 * Tool definition metadata
 * Used for tool discovery and adapter selection
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

/**
 * Configuration validation result
 */
export interface ValidationResult {
  /** Whether configuration is valid */
  valid: boolean;

  /** Validation error messages */
  errors: string[];
}

/**
 * Configuration file paths
 */
export const JINN_DIR_NAME = '.jinn';
export const CONFIG_FILENAME = 'config.yaml';
