import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { CheckResult, CheckDefinition, ConfigInfo } from "../types";
import { CHECK_IDS, CHECK_NAMES } from "../constants";
import { parseConfig as parseJinnConfig } from "../../commands/config-file.js";
import { performFullValidation } from "../../../core/config/validation.js";

function findConfigPath(): string | null {
  const configPath = join(process.cwd(), ".jinn", "config.yaml");
  return existsSync(configPath) ? configPath : null;
}

export function validateConfig(configPath: string): {
  valid: boolean;
  errors: string[];
} {
  try {
    const content = readFileSync(configPath, "utf-8");
    const config = parseJinnConfig(content);
    const result = performFullValidation(config);
    return {
      valid: result.valid,
      errors: result.errors,
    };
  } catch (err) {
    return {
      valid: false,
      errors: [err instanceof Error ? err.message : "Failed to parse config"],
    };
  }
}

export function getConfigInfo(): ConfigInfo {
  const configPath = findConfigPath();

  if (!configPath) {
    return {
      exists: false,
      path: null,
      format: null,
      valid: true,
      errors: [],
    };
  }

  const validation = validateConfig(configPath);

  return {
    exists: true,
    path: configPath,
    format: "json",
    valid: validation.valid,
    errors: validation.errors,
  };
}

export async function checkConfigValidity(): Promise<CheckResult> {
  const info = getConfigInfo();

  if (!info.exists) {
    return {
      name: CHECK_NAMES[CHECK_IDS.CONFIG_VALIDATION],
      status: "fail",
      message: "Jinn config file not found",
      details: ["Run: jinn init"],
    };
  }

  if (!info.valid) {
    return {
      name: CHECK_NAMES[CHECK_IDS.CONFIG_VALIDATION],
      status: "fail",
      message: "Configuration has validation errors",
      details: [`Path: ${info.path}`, ...info.errors.map((e) => `Error: ${e}`)],
    };
  }

  return {
    name: CHECK_NAMES[CHECK_IDS.CONFIG_VALIDATION],
    status: "pass",
    message: "Valid Jinn config",
    details: [`Path: ${info.path}`],
  };
}

export function getConfigCheckDefinition(): CheckDefinition {
  return {
    id: CHECK_IDS.CONFIG_VALIDATION,
    name: CHECK_NAMES[CHECK_IDS.CONFIG_VALIDATION],
    category: "configuration",
    check: checkConfigValidity,
    critical: false,
  };
}
