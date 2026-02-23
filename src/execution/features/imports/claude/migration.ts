/**
 * Migration Tool for Configuration Upgrades
 *
 * Helps users migrate from older configuration formats to the current ghostwire
 * unified architecture in v3.2.0+.
 *
 * Note: All ghostwire components are now natively integrated and available
 * through the `grid:` namespace prefix.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { homedir } from "os";

export interface MigrationConfig {
  fromPath: string;
  toPath: string;
  backupExisting: boolean;
  dryRun: boolean;
}

export interface MigrationResult {
  success: boolean;
  migrated: boolean;
  backupPath?: string;
  changes: string[];
  errors: string[];
  warnings: string[];
}

/**
 * Check if migration is needed
 */
export function checkMigrationNeeded(configPath?: string): {
  needed: boolean;
  reason?: string;
  existingConfig?: string;
} {
  const opencodeConfigPath = configPath ?? join(homedir(), ".config", "opencode", "config.json");

  if (!existsSync(opencodeConfigPath)) {
    return { needed: false, reason: "No existing config found" };
  }

  try {
    const content = readFileSync(opencodeConfigPath, "utf-8");
    const config = JSON.parse(content);

    // Check if already migrated
    if (config.imports?.claude?.enabled) {
      return { needed: false, reason: "Already using unified plugin architecture" };
    }

    // Check if using old separate config
    if (config.claude_import?.enabled) {
      return {
        needed: true,
        reason: "Using legacy configuration format",
        existingConfig: opencodeConfigPath,
      };
    }

    return { needed: false, reason: "No legacy configuration detected" };
  } catch {
    return { needed: false, reason: "Could not parse existing config" };
  }
}

/**
 * Migrate configuration from legacy format to unified format
 */
export function migrateConfig(config: MigrationConfig): MigrationResult {
  const result: MigrationResult = {
    success: false,
    migrated: false,
    changes: [],
    errors: [],
    warnings: [],
  };

  if (!existsSync(config.fromPath)) {
    result.errors.push(`Source config not found: ${config.fromPath}`);
    return result;
  }

  try {
    // Read existing config
    const content = readFileSync(config.fromPath, "utf-8");
    const oldConfig = JSON.parse(content);

    // Create backup if requested
    if (config.backupExisting && !config.dryRun) {
      const backupPath = `${config.fromPath}.backup-${Date.now()}`;
      writeFileSync(backupPath, content);
      result.backupPath = backupPath;
      result.changes.push(`Created backup at ${backupPath}`);
    }

    // Transform config
    const newConfig = transformConfig(oldConfig);

    // Write new config if not dry run
    if (!config.dryRun) {
      // Ensure directory exists
      const dir = dirname(config.toPath);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }

      writeFileSync(config.toPath, JSON.stringify(newConfig, null, 2));
      result.migrated = true;
    }

    result.changes.push("Migrated from legacy configuration format");
    result.changes.push("Added imports.claude section");
    result.success = true;

    // Add warnings for deprecated fields
    if (oldConfig.claude_import) {
      result.warnings.push("Legacy 'claude_import' field migrated to 'imports.claude'");
    }
  } catch (error) {
    result.errors.push(
      `Migration failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  return result;
}

/**
 * Transform legacy config to new unified format
 */
function transformConfig(oldConfig: Record<string, unknown>): Record<string, unknown> {
  const newConfig: Record<string, unknown> = { ...oldConfig };

  // Move claude_import to imports.claude
  if (oldConfig.claude_import) {
    newConfig.imports = {
      ...(newConfig.imports as Record<string, unknown>),
      claude: {
        enabled: true,
        ...(oldConfig.claude_import as Record<string, unknown>),
      },
    };
    delete newConfig.claude_import;
  }

  // Add unified plugin settings if not present
  const importsConfig = newConfig.imports as Record<string, unknown> | undefined;
  if (!importsConfig?.claude) {
    newConfig.imports = {
      ...importsConfig,
      claude: {
        enabled: true,
        strict: false,
        warnings: true,
      },
    };
  }

  return newConfig;
}

/**
 * Generate migration report
 */
export function generateMigrationReport(result: MigrationResult): string {
  const lines = [
    "=".repeat(70),
    "Migration Report",
    "=".repeat(70),
    "",
    `Status: ${result.success ? "✓ SUCCESS" : "✗ FAILED"}`,
    `Migrated: ${result.migrated ? "Yes" : "No"}`,
    "",
  ];

  if (result.backupPath) {
    lines.push(`Backup created: ${result.backupPath}`, "");
  }

  if (result.changes.length > 0) {
    lines.push("Changes Made:", "-".repeat(70));
    for (const change of result.changes) {
      lines.push(`  • ${change}`);
    }
    lines.push("");
  }

  if (result.warnings.length > 0) {
    lines.push("Warnings:", "-".repeat(70));
    for (const warning of result.warnings) {
      lines.push(`  ⚠ ${warning}`);
    }
    lines.push("");
  }

  if (result.errors.length > 0) {
    lines.push("Errors:", "-".repeat(70));
    for (const error of result.errors) {
      lines.push(`  ✗ ${error}`);
    }
    lines.push("");
  }

  lines.push("=".repeat(70));
  return lines.join("\n");
}

/**
 * Validate migrated configuration
 */
export function validateMigratedConfig(configPath: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!existsSync(configPath)) {
    return { valid: false, errors: [`Config file not found: ${configPath}`] };
  }

  try {
    const content = readFileSync(configPath, "utf-8");
    const config = JSON.parse(content);

    // Check required sections
    if (!config.imports?.claude) {
      errors.push("Missing 'imports.claude' section");
    }

    // Validate imports.claude structure
    if (config.imports?.claude) {
      const claude = config.imports.claude;
      if (typeof claude.enabled !== "boolean") {
        errors.push("imports.claude.enabled must be a boolean");
      }
    }

    return { valid: errors.length === 0, errors };
  } catch (error) {
    return {
      valid: false,
      errors: [`Failed to parse config: ${error instanceof Error ? error.message : String(error)}`],
    };
  }
}

/**
 * Rollback migration
 */
export function rollbackMigration(backupPath: string, configPath: string): boolean {
  if (!existsSync(backupPath)) {
    console.error(`Backup not found: ${backupPath}`);
    return false;
  }

  try {
    const backup = readFileSync(backupPath, "utf-8");
    writeFileSync(configPath, backup);
    console.log(`Rolled back to backup: ${backupPath}`);
    return true;
  } catch (error) {
    console.error(`Rollback failed: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

/**
 * Interactive migration wizard
 */
export async function runMigrationWizard(): Promise<void> {
  console.log("=".repeat(70));
  console.log("Unified Plugin Migration Wizard");
  console.log("=".repeat(70));
  console.log("");

  // Check if migration is needed
  const check = checkMigrationNeeded();

  if (!check.needed) {
    console.log("✓ No migration needed:", check.reason);
    return;
  }

  console.log("Migration needed:", check.reason);
  console.log("Config path:", check.existingConfig);
  console.log("");

  // Perform dry run first
  console.log("Performing dry run migration...");
  const dryRunResult = migrateConfig({
    fromPath: check.existingConfig!,
    toPath: check.existingConfig!,
    backupExisting: false,
    dryRun: true,
  });

  console.log(generateMigrationReport(dryRunResult));
  console.log("");

  if (dryRunResult.success) {
    console.log("Dry run successful. Run with dryRun: false to apply changes.");
  }
}
