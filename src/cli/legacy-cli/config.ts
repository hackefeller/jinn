/**
 * Jinn config command
 *
 * Manages jinn configuration.
 */

import * as fs from 'fs/promises';
import * as path from 'path';

import { parseConfig, serializeConfig } from '../commands/config-file.js';

export interface ConfigOptions {
  action: 'show' | 'get' | 'set' | 'add-tool' | 'remove-tool';
  key?: string;
  value?: string;
  projectPath?: string;
}

export async function executeConfig(options: ConfigOptions): Promise<void> {
  const projectPath = options.projectPath || process.cwd();
  const configPath = path.join(projectPath, '.jinn', 'config.yaml');

  if (options.action === 'show') {
    await showConfig(configPath);
  } else if (options.action === 'add-tool' && options.value) {
    await addTool(configPath, options.value);
  } else if (options.action === 'remove-tool' && options.value) {
    await removeTool(configPath, options.value);
  } else if (options.action === 'set' && options.key && options.value) {
    await setConfig(configPath, options.key, options.value);
  }
}

async function showConfig(configPath: string): Promise<void> {
  try {
    const content = await fs.readFile(configPath, 'utf-8');
    console.log(content);
  } catch {
    console.log('No jinn configuration found.');
    console.log('Run "jinn init" to initialize.');
  }
}

async function addTool(configPath: string, tool: string): Promise<void> {
  try {
    const content = await fs.readFile(configPath, 'utf-8');
    const config = parseConfig(content);

    if (!config.tools.includes(tool as any)) {
      config.tools = [...config.tools, tool as any];
      await fs.writeFile(configPath, serializeConfig(config));
      console.log(`Added tool: ${tool}`);
    } else {
      console.log(`Tool already configured: ${tool}`);
    }
  } catch {
    console.log('No jinn configuration found.');
  }
}

async function removeTool(configPath: string, tool: string): Promise<void> {
  try {
    const content = await fs.readFile(configPath, 'utf-8');
    const config = parseConfig(content);
    const filtered = config.tools.filter((configuredTool) => configuredTool !== tool);

    if (filtered.length === config.tools.length) {
      console.log(`Tool not found: ${tool}`);
      return;
    }

    config.tools = filtered as typeof config.tools;
    await fs.writeFile(configPath, serializeConfig(config));
    console.log(`Removed tool: ${tool}`);
  } catch {
    console.log('No jinn configuration found.');
  }
}

async function setConfig(configPath: string, key: string, value: string): Promise<void> {
  try {
    const content = await fs.readFile(configPath, 'utf-8');
    const config = parseConfig(content) as Record<string, unknown>;
    config[key] = value;
    await fs.writeFile(configPath, serializeConfig(config as any));
    console.log(`Set ${key} = ${value}`);
  } catch {
    console.log('No jinn configuration found.');
  }
}
