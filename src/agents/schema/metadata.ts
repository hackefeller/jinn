import { z } from "zod";

/**
 * Zod schema for validating agent metadata from YAML frontmatter
 * Ensures type safety and provides helpful error messages
 */

// Kebab-case validation regex
const kebabCaseRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

export const AgentMetadataSchema = z.object({
  // Required fields
  id: z
    .string()
    .min(2)
    .max(30)
    .regex(kebabCaseRegex, "Agent ID must be kebab-case (lowercase letters, numbers, hyphens only)")
    .describe("Unique agent identifier"),

  name: z.string().min(1).max(100).describe("Human-readable agent name"),

  purpose: z.string().min(1).max(500).describe("One-line purpose statement"),

  models: z
    .object({
      primary: z.string().min(1),
      fallback: z.string().optional(),
    })
    .describe("Language model configuration"),

  // Optional fields with defaults
  temperature: z
    .number()
    .min(0)
    .max(2)
    .optional()
    .default(0.1)
    .describe("LLM temperature (0.0-2.0)"),

  tags: z
    .array(z.string().min(2).max(20).regex(kebabCaseRegex, "Tags must be kebab-case"))
    .max(10)
    .optional()
    .default([])
    .describe("Searchable agent tags"),

  category: z
    .enum([
      "exploration",
      "specialist",
      "advisor",
      "utility",
      "review",
      "research",
      "design",
      "workflow",
      "documentation",
    ])
    .optional()
    .describe("Agent category"),

  cost: z
    .enum(["FREE", "CHEAP", "EXPENSIVE", "LOW", "MODERATE", "HIGH"])
    .optional()
    .default("MODERATE")
    .describe("Relative agent cost"),

  triggers: z
    .union([
      z.array(
        z.object({
          domain: z.string(),
          trigger: z.string(),
        }),
      ),
      z
        .object({
          domain: z.string(),
          trigger: z.string(),
        })
        .transform((value) => [value]),
    ])
    .optional()
    .transform((value) => value ?? [])
    .describe("When to use this agent"),

  useWhen: z
    .array(z.string().min(1).max(200))
    .max(50)
    .optional()
    .default([])
    .describe("Recommended use cases"),

  avoidWhen: z
    .array(z.string().min(1).max(200))
    .max(50)
    .optional()
    .default([])
    .describe("Avoid in these scenarios"),

  promptAlias: z
    .string()
    .min(1)
    .max(100)
    .optional()
    .describe("Optional display alias used in prompts"),

  keyTrigger: z.string().min(1).max(200).optional().describe("Key trigger for fast routing"),

  dedicatedSection: z.string().min(1).optional().describe("Optional dedicated prompt section"),
});

export type AgentMetadata = z.infer<typeof AgentMetadataSchema>;

// ---------- additional shared schemas ----------

export const AgentModeSchema = z.enum(["primary", "subagent", "all"]);
export type AgentMode = z.infer<typeof AgentModeSchema>;

export const AgentCategorySchema = z.enum([
  "exploration",
  "specialist",
  "advisor",
  "utility",
  "review",
  "research",
  "design",
  "workflow",
  "documentation",
]);
export type AgentCategory = z.infer<typeof AgentCategorySchema>;

export const AgentCostSchema = z.enum(["FREE", "CHEAP", "EXPENSIVE", "LOW", "MODERATE", "HIGH"]);
export type AgentCost = z.infer<typeof AgentCostSchema>;

export const DelegationTriggerSchema = z.object({
  domain: z.string(),
  trigger: z.string(),
});
export type DelegationTrigger = z.infer<typeof DelegationTriggerSchema>;

export const AgentPromptMetadataSchema = z.object({
  category: AgentCategorySchema,
  cost: AgentCostSchema,
  triggers: z.array(DelegationTriggerSchema).optional().default([]),
  useWhen: z.array(z.string()).optional().default([]),
  avoidWhen: z.array(z.string()).optional().default([]),
  dedicatedSection: z.string().optional(),
  promptAlias: z.string().optional(),
  keyTrigger: z.string().optional(),
});
export type AgentPromptMetadata = z.infer<typeof AgentPromptMetadataSchema>;

/**
 * Load and validate agent metadata from parsed YAML
 *
 * @param rawData - Parsed YAML object (unknown type)
 * @returns Validated AgentMetadata
 * @throws ZodError if validation fails
 */
export function validateAgentMetadata(rawData: unknown): AgentMetadata {
  return AgentMetadataSchema.parse(rawData);
}

/**
 * Safe validation that returns errors instead of throwing
 *
 * @param rawData - Parsed YAML object (unknown type)
 * @returns Zod SafeParseReturnType with either data or issues
 */
export function safeValidateAgentMetadata(rawData: unknown) {
  return AgentMetadataSchema.safeParse(rawData);
}
