/**
 * Ghostwire update command
 *
 * Updates/regenerates ghostwire files.
 */

import * as fs from 'fs/promises';
import * as path from 'path';

import type { GhostwireConfig } from '../../core/config/schema.js';
import { generateFiles } from '../../core/generator/index.js';

export interface UpdateOptions {
  force?: boolean;
  tool?: string;
  projectPath?: string;
}

export async function executeUpdate(options: UpdateOptions): Promise<void> {
  const projectPath = options.projectPath || process.cwd();
  const configPath = path.join(projectPath, '.ghostwire', 'config.yaml');

  console.log('Updating ghostwire...\n');

  try {
    const configContent = await fs.readFile(configPath, 'utf-8');
    const config = parseConfig(configContent);

    if (options.tool) {
      config.tools = [options.tool] as any;
    }

    console.log(`Tools: ${config.tools.join(', ')}`);
    console.log(`Profile: ${config.profile}`);
    console.log(`Delivery: ${config.delivery}\n`);

    const result = await generateFiles(config, projectPath);

    console.log(`Generated ${result.generated.length} files`);

    if (result.failed.length > 0) {
      console.log(`\nFailed to generate ${result.failed.length} files:`);
      for (const { path: filePath, error } of result.failed) {
        console.log(`  - ${filePath}: ${error}`);
      }
    }

    console.log('\n✓ Ghostwire updated successfully!');
  } catch (error) {
    console.error('Error:', error);
    console.log('\nRun "ghostwire init" first to initialize ghostwire.');
  }
}

function parseConfig(content: string): GhostwireConfig {
  const lines = content.split('\n');
  const config: any = {
    version: '1.0.0',
    tools: [],
    profile: 'core',
    delivery: 'both',
  };

  let currentKey = '';
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    if (trimmed.startsWith('version:')) {
      config.version = trimmed.split(':')[1].trim().replace(/"/g, '');
    } else if (trimmed.startsWith('tools:')) {
      currentKey = 'tools';
    } else if (trimmed.startsWith('profile:')) {
      config.profile = trimmed.split(':')[1].trim();
    } else if (trimmed.startsWith('delivery:')) {
      config.delivery = trimmed.split(':')[1].trim();
    } else if (currentKey === 'tools' && trimmed.startsWith('-')) {
      config.tools.push(trimmed.replace('-', '').trim());
    }
  }

  return config as GhostwireConfig;
}
