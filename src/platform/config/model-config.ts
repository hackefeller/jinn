import { z } from "zod";

// =============================================================================
// CONSTANTS
// =============================================================================

/** Built-in fallback when no config exists anywhere */
export const BUILTIN_FALLBACK_MODEL = "opencode/kimi-k2.5";

/** Valid agent IDs that can have model overrides */
export const CONFIGURABLE_AGENTS = [
  "operator",
  "executor",
  "planner",
  "orchestrator",
  "advisor-plan",
  "advisor-strategy",
  "validator-audit",
  "researcher-codebase",
  "researcher-data",
  "analyzer-media",
] as const;

/** Valid category names */
export const CONFIGURABLE_CATEGORIES = [
  "visual-engineering",
  "ultrabrain",
  "deep",
  "artistry",
  "quick",
  "unspecified-low",
  "unspecified-high",
  "writing",
] as const;

// =============================================================================
// ZOD SCHEMAS
// =============================================================================

/** Model ID format: provider/model-name */
const ModelIdSchema = z
  .string()
  .regex(
    /^[a-z0-9-]+\/[a-z0-9-_.]+$/i,
    "Model ID must be in format: provider/model-name"
  );

/** Category model configuration with optional variant */
const CategoryModelConfigSchema = z.union([
  ModelIdSchema,
  z.object({
    model: ModelIdSchema,
    variant: z.enum(["max", "medium", "min"]).optional(),
  }),
]);

/** Default model settings */
const ModelDefaultsSchema = z.object({
  /** Default model for agents without specific config */
  agent: ModelIdSchema.default(BUILTIN_FALLBACK_MODEL),
  /** Default model for categories without specific config */
  category: ModelIdSchema.default(BUILTIN_FALLBACK_MODEL),
});

/** Per-agent model overrides */
const AgentModelsSchema = z.record(
  z.enum(CONFIGURABLE_AGENTS),
  ModelIdSchema
).optional();

/** Per-category model overrides */
const CategoryModelsSchema = z.record(
  z.enum(CONFIGURABLE_CATEGORIES),
  CategoryModelConfigSchema
).optional();

/** Root models configuration schema */
export const ModelsConfigSchema = z.object({
  /** Default model settings */
  defaults: ModelDefaultsSchema.optional(),
  /** Agent-specific model overrides */
  agents: AgentModelsSchema,
  /** Category-specific model overrides */
  categories: CategoryModelsSchema,
});

// =============================================================================
// TYPES
// =============================================================================

export type ModelId = z.infer<typeof ModelIdSchema>;
export type CategoryModelConfig = z.infer<typeof CategoryModelConfigSchema>;
export type ModelDefaults = z.infer<typeof ModelDefaultsSchema>;
export type AgentModels = z.infer<typeof AgentModelsSchema>;
export type CategoryModels = z.infer<typeof CategoryModelsSchema>;
export type ModelsConfig = z.infer<typeof ModelsConfigSchema>;

export type ConfigurableAgent = (typeof CONFIGURABLE_AGENTS)[number];
export type ConfigurableCategory = (typeof CONFIGURABLE_CATEGORIES)[number];

/** Result of model resolution */
export interface ModelResolutionResult {
  model: ModelId;
  variant?: "max" | "medium" | "min";
  source:
    | "project-agent"
    | "project-category"
    | "global-agent"
    | "global-category"
    | "project-default"
    | "global-default"
    | "builtin-fallback";
}

// =============================================================================
// DEFAULT CONFIGURATION
// =============================================================================

/** Default configuration written during installation */
export const DEFAULT_MODELS_CONFIG: ModelsConfig = {
  defaults: {
    agent: "opencode/kimi-k2.5",
    category: "opencode/kimi-k2.5",
  },
  agents: {
    operator: "opencode/kimi-k2.5",
    executor: "opencode/kimi-k2.5",
    planner: "opencode/kimi-k2.5",
    orchestrator: "opencode/kimi-k2.5",
    "advisor-plan": "opencode/kimi-k2.5",
    "advisor-strategy": "opencode/kimi-k2.5",
    "validator-audit": "opencode/kimi-k2.5",
    "researcher-codebase": "opencode/kimi-k2.5",
    "researcher-data": "opencode/kimi-k2.5",
    "analyzer-media": "google/gemini-3-flash",
  },
  categories: {
    ultrabrain: { model: "opencode/kimi-k2.5", variant: "max" },
    deep: { model: "opencode/kimi-k2.5", variant: "medium" },
    artistry: "opencode/kimi-k2.5",
    quick: "opencode/kimi-k2.5",
    "unspecified-low": "opencode/kimi-k2.5",
    "unspecified-high": { model: "opencode/kimi-k2.5", variant: "max" },
    writing: "opencode/kimi-k2.5",
    "visual-engineering": "opencode/kimi-k2.5",
  },
};
