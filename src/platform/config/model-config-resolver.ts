import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import {
  ModelsConfigSchema,
  type ModelsConfig,
  type ModelResolutionResult,
  type ConfigurableAgent,
  type ConfigurableCategory,
  BUILTIN_FALLBACK_MODEL,
} from "./model-config";

// =============================================================================
// CONFIG FILE PATHS
// =============================================================================

const GLOBAL_CONFIG_PATH = join(
  homedir(),
  ".config",
  "opencode",
  "ghostwire.json"
);

const PROJECT_CONFIG_PATH = join(
  process.cwd(),
  ".opencode",
  "ghostwire.json"
);

// =============================================================================
// CONFIG LOADING
// =============================================================================

interface LoadedConfig {
  config: ModelsConfig | null;
  path: string;
  exists: boolean;
}

function loadConfigFile(path: string): LoadedConfig {
  if (!existsSync(path)) {
    return { config: null, path, exists: false };
  }

  try {
    const content = readFileSync(path, "utf-8");
    const parsed = JSON.parse(content);
    const models = parsed.models ?? {};
    const result = ModelsConfigSchema.safeParse(models);

    if (result.success) {
      return { config: result.data, path, exists: true };
    }

    console.warn(`[model-config] Invalid config at ${path}:`, result.error.message);
    return { config: null, path, exists: true };
  } catch (error) {
    console.warn(`[model-config] Failed to load ${path}:`, error);
    return { config: null, path, exists: true };
  }
}

// Cache loaded configs to avoid repeated file reads
let projectConfigCache: LoadedConfig | null = null;
let globalConfigCache: LoadedConfig | null = null;

export function clearConfigCache(): void {
  projectConfigCache = null;
  globalConfigCache = null;
}

function getProjectConfig(): LoadedConfig {
  if (!projectConfigCache) {
    projectConfigCache = loadConfigFile(PROJECT_CONFIG_PATH);
  }
  return projectConfigCache;
}

function getGlobalConfig(): LoadedConfig {
  if (!globalConfigCache) {
    globalConfigCache = loadConfigFile(GLOBAL_CONFIG_PATH);
  }
  return globalConfigCache;
}

// =============================================================================
// MODEL RESOLUTION
// =============================================================================

/**
 * Resolve model for a specific agent using the configuration hierarchy.
 *
 * Priority:
 * 1. Project config - agent-specific
 * 2. Project config - default agent model
 * 3. Global config - agent-specific
 * 4. Global config - default agent model
 * 5. Built-in fallback
 */
export function resolveAgentModel(
  agentId: ConfigurableAgent
): ModelResolutionResult {
  const project = getProjectConfig();
  const global = getGlobalConfig();

  // 1. Project agent-specific
  const projectAgent = project.config?.agents?.[agentId];
  if (projectAgent) {
    return { model: projectAgent, source: "project-agent" };
  }

  // 2. Project default
  const projectDefault = project.config?.defaults?.agent;
  if (projectDefault) {
    return { model: projectDefault, source: "project-default" };
  }

  // 3. Global agent-specific
  const globalAgent = global.config?.agents?.[agentId];
  if (globalAgent) {
    return { model: globalAgent, source: "global-agent" };
  }

  // 4. Global default
  const globalDefault = global.config?.defaults?.agent;
  if (globalDefault) {
    return { model: globalDefault, source: "global-default" };
  }

  // 5. Built-in fallback
  return { model: BUILTIN_FALLBACK_MODEL, source: "builtin-fallback" };
}

/**
 * Resolve model for a specific category using the configuration hierarchy.
 *
 * Priority:
 * 1. Project config - category-specific
 * 2. Project config - default category model
 * 3. Global config - category-specific
 * 4. Global config - default category model
 * 5. Built-in fallback
 */
export function resolveCategoryModel(
  categoryId: ConfigurableCategory
): ModelResolutionResult {
  const project = getProjectConfig();
  const global = getGlobalConfig();

  // 1. Project category-specific
  const projectCategory = project.config?.categories?.[categoryId];
  if (projectCategory) {
    return normalizeCategoryConfig(projectCategory, "project-category");
  }

  // 2. Project default
  const projectDefault = project.config?.defaults?.category;
  if (projectDefault) {
    return { model: projectDefault, source: "project-default" };
  }

  // 3. Global category-specific
  const globalCategory = global.config?.categories?.[categoryId];
  if (globalCategory) {
    return normalizeCategoryConfig(globalCategory, "global-category");
  }

  // 4. Global default
  const globalDefault = global.config?.defaults?.category;
  if (globalDefault) {
    return { model: globalDefault, source: "global-default" };
  }

  // 5. Built-in fallback
  return { model: BUILTIN_FALLBACK_MODEL, source: "builtin-fallback" };
}

function normalizeCategoryConfig(
  config: string | { model: string; variant?: "max" | "medium" | "min" },
  source: ModelResolutionResult["source"]
): ModelResolutionResult {
  if (typeof config === "string") {
    return { model: config, source };
  }
  return { model: config.model, variant: config.variant, source };
}

// =============================================================================
// DIAGNOSTICS
// =============================================================================

export interface ConfigDiagnostics {
  projectConfig: {
    path: string;
    exists: boolean;
    valid: boolean;
    agentCount: number;
    categoryCount: number;
  };
  globalConfig: {
    path: string;
    exists: boolean;
    valid: boolean;
    agentCount: number;
    categoryCount: number;
  };
  effectiveDefaults: {
    agent: string;
    category: string;
  };
}

export function getConfigDiagnostics(): ConfigDiagnostics {
  const project = getProjectConfig();
  const global = getGlobalConfig();

  return {
    projectConfig: {
      path: PROJECT_CONFIG_PATH,
      exists: project.exists,
      valid: project.config !== null,
      agentCount: Object.keys(project.config?.agents ?? {}).length,
      categoryCount: Object.keys(project.config?.categories ?? {}).length,
    },
    globalConfig: {
      path: GLOBAL_CONFIG_PATH,
      exists: global.exists,
      valid: global.config !== null,
      agentCount: Object.keys(global.config?.agents ?? {}).length,
      categoryCount: Object.keys(global.config?.categories ?? {}).length,
    },
    effectiveDefaults: {
      agent:
        project.config?.defaults?.agent ??
        global.config?.defaults?.agent ??
        BUILTIN_FALLBACK_MODEL,
      category:
        project.config?.defaults?.category ??
        global.config?.defaults?.category ??
        BUILTIN_FALLBACK_MODEL,
    },
  };
}
