/**
 * Jinn update command
 *
 * Updates/regenerates jinn files.
 */

import * as fs from 'fs/promises';
import * as path from 'path';

import type { JinnConfig } from '../../core/config/schema.js';
import { generateFiles } from '../../core/generator/index.js';
import { parseConfig } from '../commands/config-file.js';

export interface UpdateOptions {
  force?: boolean;
  tool?: string;
  projectPath?: string;
}

export async function executeUpdate(options: UpdateOptions): Promise<void> {
  const projectPath = options.projectPath || process.cwd();
  const configPath = path.join(projectPath, '.jinn', 'config.yaml');

  console.log('Updating jinn...\n');

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

    console.log('\n✓ Jinn updated successfully!');
  } catch (error) {
    console.error('Error:', error);
    console.log('\nRun "jinn init" first to initialize jinn.');
  }
}
