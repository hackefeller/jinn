#!/usr/bin/env bun

/**
 * Jinn CLI
 *
 * Harness-agnostic AI agent distribution platform.
 */

import { Command } from 'commander';
import { executeInit } from './init.js';
import { executeUpdate } from './update.js';
import { executeConfig } from './config.js';

const program = new Command();

program
  .name('jinn')
  .description('AI-native development workflows for any coding assistant')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize jinn in the current project')
  .option('-t, --tools <tools>', 'Comma-separated list of tools (or "all")')
  .option('-p, --profile <profile>', 'Profile to use (core, extended)', 'core')
  .option('-d, --delivery <delivery>', 'What to install (skills, commands, both)', 'both')
  .option('-y, --yes', 'Skip prompts and use defaults')
  .action(async (options) => {
    await executeInit({
      tools: options.tools,
      profile: options.profile,
      delivery: options.delivery,
      yes: options.yes,
    });
  });

program
  .command('update')
  .description('Update/regenerate jinn files')
  .option('-f, --force', 'Force regeneration')
  .option('-t, --tool <tool>', 'Update specific tool only')
  .action(async (options) => {
    await executeUpdate({
      force: options.force,
      tool: options.tool,
    });
  });

program
  .command('config')
  .description('Manage jinn configuration')
  .argument('[action]', 'Action: show, add-tool, remove-tool, set')
  .argument('[key]', 'Config key (for set)')
  .argument('[value]', 'Config value (for set)')
  .action(async (action, key, value) => {
    const validActions = ['show', 'add-tool', 'remove-tool', 'set'];
    const actualAction = validActions.includes(action) ? action : 'show';

    await executeConfig({
      action: actualAction as any,
      key,
      value,
    });
  });

program
  .command('detect')
  .description('Detect available AI tools in the project')
  .action(async () => {
    const { detectAvailableTools } = await import('../../core/discovery/detector.js');
    const tools = await detectAvailableTools(process.cwd());

    if (tools.length === 0) {
      console.log('No AI tools detected.');
    } else {
      console.log('Detected tools:', tools.join(', '));
    }
  });

program.parse();

export { program as jinnProgram };
