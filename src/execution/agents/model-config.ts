// This module replaces the deprecated `model-requirements.ts` file.  The
// old file exported hardcoded fallback chains and model requirements for
// agents and categories; those values are now sourced from configuration
// (ghostwire.json) and default overrides.  For backward compatibility we
// continue to export the same types and objects, but callers should gradually
// migrate to the configuration APIs instead of the static lists.
//
// Note: This file lives alongside `config-manager.ts` and may eventually be
// removed once the remaining consumers stop depending on the constants.

export type FallbackEntry = {
  providers: string[];
  model: string;
  variant?: string;
};

export type ModelRequirement = {
  fallbackChain: FallbackEntry[];
  variant?: string;
  requiresModel?: string;
};

// Because the configuration system hasn't been wired into every consumer yet,
// we keep a copy of the previous hardcoded requirements.  They mirror the
// values that used to live in the deprecated module; this allows a
// straightforward refactor of existing imports without changing behaviour.

export const AGENT_MODEL_REQUIREMENTS: Record<string, ModelRequirement> = {
  do: {
    fallbackChain: [
      {
        providers: ["opencode", "github-copilot"],
        model: "kimi-k2.5",
      },
    ],
  },
  research: {
    fallbackChain: [
      {
        providers: ["opencode", "github-copilot"],
        model: "kimi-k2.5",
      },
    ],
  },
};

export const CATEGORY_MODEL_REQUIREMENTS: Record<string, ModelRequirement> = {
  "visual-engineering": {
    fallbackChain: [
      {
        providers: ["opencode", "github-copilot"],
        model: "kimi-k2.5",
      },
    ],
  },
  ultrabrain: {
    fallbackChain: [
      {
        providers: ["opencode", "github-copilot"],
        model: "kimi-k2.5",
        variant: "max",
      },
    ],
  },
  deep: {
    fallbackChain: [
      {
        providers: ["opencode", "github-copilot"],
        model: "kimi-k2.5",
        variant: "medium",
      },
    ],
  },
  artistry: {
    fallbackChain: [
      {
        providers: ["opencode", "github-copilot"],
        model: "kimi-k2.5",
      },
    ],
  },
  quick: {
    fallbackChain: [
      {
        providers: ["opencode", "github-copilot"],
        model: "kimi-k2.5",
      },
    ],
  },
  "unspecified-low": {
    fallbackChain: [
      {
        providers: ["opencode", "github-copilot"],
        model: "kimi-k2.5",
      },
    ],
  },
  "unspecified-high": {
    fallbackChain: [
      {
        providers: ["opencode", "github-copilot"],
        model: "kimi-k2.5",
        variant: "max",
      },
    ],
  },
  writing: {
    fallbackChain: [
      {
        providers: ["opencode", "github-copilot"],
        model: "kimi-k2.5",
      },
    ],
  },
};
