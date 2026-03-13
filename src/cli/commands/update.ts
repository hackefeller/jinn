/**
 * Jinn update command
 *
 * Updates/regenerates jinn files with beautiful TUI.
 */

import * as fs from 'fs/promises';
import * as path from 'path';

import type { JinnConfig } from '../../core/config/schema.js';
import { generateFiles } from '../../core/generator/index.js';
import { parseConfig, serializeConfig } from './config-file.js';
import { startSpinner, successSpinner, errorSpinner } from '../ui/spinner.js';
import { colors } from '../ui/colors.js';
import { simpleTable } from '../ui/table.js';

export interface UpdateOptions {
  force?: boolean;
  tool?: string;
  projectPath?: string;
  yes?: boolean;
}

const CONFIG_DIR = '.jinn';

export async function executeUpdate(options: UpdateOptions): Promise<void> {
  const projectPath = options.projectPath || process.cwd();
  const configPath = path.join(projectPath, CONFIG_DIR, 'config.yaml');

  console.log(colors.cyan('\n📦 Updating Jinn...\n'));

  try {
    const configContent = await fs.readFile(configPath, 'utf-8');
    const config = parseConfig(configContent);

    if (options.tool) {
      config.tools = [options.tool] as any;
    }

    console.log(colors.dim('Tools:'), colors.primary(config.tools.join(', ')));
    console.log(colors.dim('Profile:'), colors.primary(config.profile));
    console.log(colors.dim('Delivery:'), colors.primary(config.delivery));
    console.log(colors.dim('Workflow:'), colors.primary(config.workflow.backend));
    console.log('');

    const generateSpinner = startSpinner('Regenerating jinn files...');
    const result = await generateFiles(config, projectPath);
    
    const tableData = [
      ['Action', 'Count'],
      [colors.success('Generated'), String(result.generated.length)],
      [colors.warning('Failed'), String(result.failed.length)],
      [colors.dim('Skipped'), String(result.skipped.length)],
      [colors.dim('Removed'), String(result.removed.length)],
    ];
    simpleTable(tableData);
    
    if (result.failed.length > 0) {
      console.log(colors.warning('\nFailed files:'));
      for (const { path: filePath, error } of result.failed) {
        console.log(colors.error(`  - ${filePath}: ${error}`));
      }
    }

    successSpinner(generateSpinner, 'Files regenerated');

    console.log(colors.success('\n✓ Jinn updated successfully!'));
  } catch (error) {
    console.error(colors.error('\nError:'), error);
    console.log(colors.dim('\nRun "jinn init" first to initialize jinn.'));
  }
}
