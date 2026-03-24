/**
 * Sync command
 *
 * Initializes project if no config exists, otherwise updates/regenerates files.
 */

import type { Config } from "../core/config/schema.js";
import { createDefaultConfig, loadConfig } from "../core/config/loader.js";
import { generateFiles } from "../core/generator/index.js";
import { detectAvailableTools } from "../core/discovery/detector.js";
import { getDefaultSkillTemplates } from "../templates/catalog.js";
import { ZodError } from "zod";
import { homedir } from "node:os";
import { join } from "node:path";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";

export interface SyncOptions {
  projectPath?: string;
  configRootPath?: string;
}

export async function executeSync(options: SyncOptions): Promise<void> {
  const projectPath = options.projectPath || process.cwd();
  const loadedConfig = await loadConfig(options.configRootPath);

  if (!loadedConfig) {
    await runInit(projectPath, options.configRootPath);
  } else {
    await runUpdate(loadedConfig, projectPath);
  }

  await installGlobalSkills();
}

async function runInit(projectPath: string, configRootPath?: string): Promise<void> {
  console.log("Initializing project...\n");

  const availableTools = await detectAvailableTools(projectPath);

  if (availableTools.length === 0) {
    console.log("No AI tools detected. Install a tool first (e.g., OpenCode, Cursor).");
    console.log("\nSupported tool layouts:");
    console.log("  - OpenCode (.opencode/)");
    console.log("  - Cursor (.cursor/)");
    console.log("  - Claude Code (.claude/)");
    console.log("  - GitHub Copilot (.github/)");
    console.log("  - And 20+ more tools\n");
    return;
  }

  console.log(`Detected tools: ${availableTools.join(", ")}\n`);

  const config = await createDefaultConfig(configRootPath, {
    tools: availableTools,
  });

  console.log("Generating project files...");
  const result = await generateFiles(config, projectPath);

  console.log(`\nGenerated ${result.generated.length} files`);

  if (result.failed.length > 0) {
    console.log(`\nFailed to generate ${result.failed.length} files:`);
    for (const { path: filePath, error } of result.failed) {
      console.log(`  - ${filePath}: ${error}`);
    }
  }

  console.log("\n✓ Project initialized successfully!");
  console.log("\nTry running one of these commands in your AI tool:");
  console.log("  /propose");
  console.log("  /explore");
  console.log("  /plan");
}

async function runUpdate(
  config: Config,
  projectPath: string,
): Promise<void> {
  console.log("Updating project files...\n");

  try {
    console.log(`Tools: ${config.tools.join(", ")}\n`);

    const result = await generateFiles(config, projectPath);

    console.log(`Generated ${result.generated.length} files`);

    if (result.failed.length > 0) {
      console.log(`\nFailed to generate ${result.failed.length} files:`);
      for (const { path: filePath, error } of result.failed) {
        console.log(`  - ${filePath}: ${error}`);
      }
    }

    console.log("\n✓ Project updated successfully!");
  } catch (error) {
    if (error instanceof ZodError) {
      console.error(error.issues.map((i) => i.message).join(", "));
    } else {
      console.error("Error:", error);
    }
  }
}

async function installGlobalSkills(): Promise<void> {
  const agentsDir = join(homedir(), ".agents", "skills");
  if (!existsSync(agentsDir)) {
    mkdirSync(agentsDir, { recursive: true });
  }

  const templates = getDefaultSkillTemplates("extended");
  let installedCount = 0;

  for (const template of templates) {
    const skillDir = join(agentsDir, template.name);
    if (!existsSync(skillDir)) {
      mkdirSync(skillDir, { recursive: true });
    }

    const skillPath = join(skillDir, "SKILL.md");
    writeFileSync(skillPath, template.instructions);
    installedCount++;
  }

  if (installedCount > 0) {
    console.log(`\n✓ Installed ${installedCount} skills to ~/.agents/skills/`);
  }
}