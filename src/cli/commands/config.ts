/**
 * Jinn config command
 *
 * Manages jinn configuration with beautiful TUI.
 */

import * as fs from 'fs/promises';
import * as path from 'path';

import type { JinnConfig } from '../../core/config/schema.js';
import { parseConfig, serializeConfig } from './config-file.js';
import { colors } from '../ui/colors.js';
import { simpleTable } from '../ui/table.js';

export interface ConfigOptions {
  action?: string;
  key?: string;
  value?: string;
  projectPath?: string;
}

const CONFIG_DIR = '.jinn';

export async function executeConfig(options: ConfigOptions): Promise<void> {
  const projectPath = options.projectPath || process.cwd();
  const configPath = path.join(projectPath, CONFIG_DIR, 'config.yaml');

  try {
    const configContent = await fs.readFile(configPath, 'utf-8');
    const config = parseConfig(configContent);

    if (options.action === 'get' && options.key) {
      const value = (config as any)[options.key];
      if (value !== undefined) {
        console.log(colors.success(value));
      } else {
        console.log(colors.error(`Key "${options.key}" not found`));
      }
      return;
    }

    if (options.action === 'set' && options.key && options.value !== undefined) {
      (config as any)[options.key] = options.value;
      const newContent = serializeConfig(config);
      await fs.writeFile(configPath, newContent, 'utf-8');
      console.log(colors.success(`\n✓ Set ${options.key} = ${options.value}`));
      return;
    }

    console.log(colors.cyan('\n⚙️  Jinn Configuration\n'));
    
    const tableData = [
      [colors.dim('Key'), colors.dim('Value')],
      [colors.primary('version'), colors.success(config.version)],
      [colors.primary('tools'), colors.success(config.tools.join(', '))],
      [colors.primary('profile'), colors.success(config.profile)],
      [colors.primary('delivery'), colors.success(config.delivery)],
      [colors.primary('workflow.backend'), colors.success(config.workflow.backend)],
    ];
    simpleTable(tableData);
    
    console.log(colors.dim('\nUsage:'));
    console.log(colors.dim('  jinn config show        # Show configuration'));
    console.log(colors.dim('  jinn config get <key>   # Get a value'));
    console.log(colors.dim('  jinn config set <key> <value>  # Set a value'));
    console.log('');
  } catch (error) {
    console.error(colors.error('\nError:'), error);
    console.log(colors.dim('\nRun "jinn init" first to initialize jinn.'));
  }
}
