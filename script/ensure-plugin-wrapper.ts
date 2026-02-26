#!/usr/bin/env bun
/**
 * Ensures the global plugin wrapper exists for local development
 * Creates ~/.config/opencode/plugins/ghostwire.mjs if it doesn't exist
 *
 * This allows the dev environment to work without manual setup
 */

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const pluginsDir = join(homedir(), ".config/opencode/plugins");
const wrapperFile = join(pluginsDir, "ghostwire.mjs");

// Get the absolute path to the ghostwire dist directory
const ghostwireRepo = process.cwd();
const ghostwireDist = join(ghostwireRepo, "dist/index.js");

const wrapperContent = `// Local development wrapper for ghostwire plugin
// Auto-imports from the local dist/ directory during development
// This allows \`bun run dev\` changes to be immediately available in OpenCode

import ghostwire from "${ghostwireDist}";
export default ghostwire;
`;

try {
  // Create plugins directory if it doesn't exist
  if (!existsSync(pluginsDir)) {
    mkdirSync(pluginsDir, { recursive: true });
    console.log(`✅ Created ${pluginsDir}`);
  }

  // Create or update the wrapper
  writeFileSync(wrapperFile, wrapperContent);
  console.log(`✅ Plugin wrapper created: ${wrapperFile}`);
  console.log(`   Points to: ${ghostwireDist}`);
} catch (error) {
  console.error(`❌ Failed to create plugin wrapper:`, error);
  process.exit(1);
}
