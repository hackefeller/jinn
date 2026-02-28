// postinstall.mjs
// Runs after npm install to verify the package is ready

import { existsSync } from "node:fs";
import { join } from "node:path";

function main() {
  const distPath = join(process.cwd(), "dist", "cli", "index.js");

  if (!existsSync(distPath)) {
    console.warn(`⚠ ghostwire: CLI not built. Run 'bun run build' first.`);
    console.warn(`  To use the CLI: bun run src/cli/index.ts <command>`);
    return;
  }

  console.log(`✓ ghostwire CLI ready`);
}

main();
