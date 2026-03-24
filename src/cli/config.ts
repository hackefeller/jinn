/**
 * Config command
 *
 * Manages global kernel configuration.
 */

import * as fs from "fs/promises";
import { loadConfig, saveConfig, getConfigPath } from "../core/config/loader.js";
import { ToolIdSchema, ConfigSchema } from "../core/config/schema.js";
import { ZodError } from "zod";

export interface ConfigOptions {
  action: "show" | "get" | "set" | "add-tool" | "remove-tool";
  key?: string;
  value?: string;
  configRootPath?: string;
}

export async function executeConfig(options: ConfigOptions): Promise<void> {
  if (options.action === "show") {
    await showConfig(options.configRootPath);
  } else if (options.action === "add-tool" && options.value) {
    await modifyTools(options.configRootPath, "add", options.value);
  } else if (options.action === "remove-tool" && options.value) {
    await modifyTools(options.configRootPath, "remove", options.value);
  } else if (options.action === "set" && options.key && options.value) {
    await setConfig(options.configRootPath, options.key, options.value);
  }
}

async function showConfig(configRootPath?: string): Promise<void> {
  try {
    const content = await fs.readFile(getConfigPath(configRootPath), "utf-8");
    console.log(content);
  } catch {
    console.log("No kernel configuration found.");
    console.log('Run "kernel init" to initialize kernel.');
  }
}

async function modifyTools(
  configRootPath: string | undefined,
  action: "add" | "remove",
  tool: string,
): Promise<void> {
  const config = await loadConfig(configRootPath);
  if (!config) {
    console.log('No kernel configuration found. Run "kernel init" to initialize kernel.');
    return;
  }

  let validatedTool: ReturnType<typeof ToolIdSchema.parse>;
  try {
    validatedTool = ToolIdSchema.parse(tool);
  } catch (err) {
    if (err instanceof ZodError) {
      console.error(`Unknown tool: "${tool}". Valid tools: ${ToolIdSchema.options.join(", ")}`);
      return;
    }
    throw err;
  }

  const tools = config.tools;

  if (action === "add") {
    if (tools.includes(validatedTool)) {
      console.log(`Tool already configured: ${validatedTool}`);
      return;
    }
    await saveConfig({ ...config, tools: [...tools, validatedTool] }, configRootPath);
    console.log(`Added tool: ${validatedTool}`);
  } else {
    if (!tools.includes(validatedTool)) {
      console.log(`Tool not found: ${validatedTool}`);
      return;
    }
    await saveConfig({ ...config, tools: tools.filter((t) => t !== validatedTool) }, configRootPath);
    console.log(`Removed tool: ${validatedTool}`);
  }
}

async function setConfig(configRootPath: string | undefined, key: string, value: string): Promise<void> {
  const config = await loadConfig(configRootPath);
  if (!config) {
    console.log('No kernel configuration found. Run "kernel init" to initialize kernel.');
    return;
  }

  if (key === "delivery" && value === "commands") {
    console.warn('Warning: delivery "commands" is deprecated and has been removed.');
    console.warn('Use "skills" or "both" instead.');
    return;
  }

  const updated = { ...config, [key]: value };
  try {
    const validated = ConfigSchema.parse(updated);
    await saveConfig(validated, configRootPath);
    console.log(`Set ${key} = ${value}`);
  } catch (err) {
    if (err instanceof ZodError) {
      console.error(`Invalid value for "${key}":`, err.issues.map((i) => i.message).join(", "));
      return;
    }
    throw err;
  }
}
