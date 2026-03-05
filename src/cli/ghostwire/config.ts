/**
 * Ghostwire config command
 *
 * Manages ghostwire configuration.
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export interface ConfigOptions {
  action: 'show' | 'get' | 'set' | 'add-tool' | 'remove-tool';
  key?: string;
  value?: string;
  projectPath?: string;
}

export async function executeConfig(options: ConfigOptions): Promise<void> {
  const projectPath = options.projectPath || process.cwd();
  const configPath = path.join(projectPath, '.ghostwire', 'config.yaml');

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
    console.log('No ghostwire configuration found.');
    console.log('Run "ghostwire init" to initialize.');
  }
}

async function addTool(configPath: string, tool: string): Promise<void> {
  try {
    const content = await fs.readFile(configPath, 'utf-8');
    const lines = content.split('\n');
    const toolsIndex = lines.findIndex((l) => l.trim() === 'tools:');

    if (toolsIndex === -1) {
      console.log('No tools section in config.');
      return;
    }

    const toolLine = `  - ${tool}`;
    if (!lines.includes(toolLine)) {
      lines.splice(toolsIndex + 1, 0, toolLine);
      await fs.writeFile(configPath, lines.join('\n'));
      console.log(`Added tool: ${tool}`);
    } else {
      console.log(`Tool already configured: ${tool}`);
    }
  } catch {
    console.log('No ghostwire configuration found.');
  }
}

async function removeTool(configPath: string, tool: string): Promise<void> {
  try {
    const content = await fs.readFile(configPath, 'utf-8');
    const lines = content.split('\n');
    const toolLine = `  - ${tool}`;
    const filtered = lines.filter((l) => l.trim() !== toolLine);

    if (filtered.length === lines.length) {
      console.log(`Tool not found: ${tool}`);
      return;
    }

    await fs.writeFile(configPath, filtered.join('\n'));
    console.log(`Removed tool: ${tool}`);
  } catch {
    console.log('No ghostwire configuration found.');
  }
}

async function setConfig(configPath: string, key: string, value: string): Promise<void> {
  try {
    const content = await fs.readFile(configPath, 'utf-8');
    const lines = content.split('\n');
    const keyLine = `${key}:`;

    const existingIndex = lines.findIndex((l) => l.trim().startsWith(keyLine));

    if (existingIndex !== -1) {
      lines[existingIndex] = `${key}: ${value}`;
    } else {
      lines.push(`${key}: ${value}`);
    }

    await fs.writeFile(configPath, lines.join('\n'));
    console.log(`Set ${key} = ${value}`);
  } catch {
    console.log('No ghostwire configuration found.');
  }
}
