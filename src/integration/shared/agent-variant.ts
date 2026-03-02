import type { GhostwireConfig } from "../../platform/config";
import { findCaseInsensitive } from "./case-insensitive";

export function resolveAgentVariant(
  config: GhostwireConfig,
  agentName?: string,
): string | undefined {
  if (!agentName) {
    return undefined;
  }

  const agentOverrides = config.agents as
    | Record<string, { variant?: string; category?: string }>
    | undefined;
  const agentOverride = agentOverrides ? findCaseInsensitive(agentOverrides, agentName) : undefined;
  if (!agentOverride) {
    return undefined;
  }

  if (agentOverride.variant) {
    return agentOverride.variant;
  }

  const categoryName = agentOverride.category;
  if (!categoryName) {
    return undefined;
  }

  return config.categories?.[categoryName]?.variant;
}

export function resolveVariantForModel(
  config: GhostwireConfig,
  agentName: string,
  _currentModel: { providerID: string; modelID: string },
): string | undefined {
  // Once model-based fallback chains were removed, variant resolution is
  // derived purely from explicit user configuration (agent/category overrides).
  return resolveAgentVariant(config, agentName);
}


export function applyAgentVariant(
  config: GhostwireConfig,
  agentName: string | undefined,
  message: { variant?: string },
): void {
  const variant = resolveAgentVariant(config, agentName);
  if (variant !== undefined && message.variant === undefined) {
    message.variant = variant;
  }
}
