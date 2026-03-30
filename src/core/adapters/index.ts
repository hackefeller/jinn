/**
 * Command adapters index
 *
 * Re-exports all tool command adapters and creates a populated registry.
 */

export { claudeAdapter } from "./claude.js";
export { codexAdapter } from "./codex.js";
export { cursorAdapter } from "./cursor.js";
export { geminiAdapter } from "./gemini.js";
export { githubCopilotAdapter } from "./github-copilot.js";
export { piAdapter } from "./pi.js";

export { createAdapterRegistry } from "./registry.js";
export type { AdapterRegistry, GeneratedFile, ToolCommandAdapter } from "./types.js";

import { claudeAdapter } from "./claude.js";
import { codexAdapter } from "./codex.js";
import { cursorAdapter } from "./cursor.js";
import { geminiAdapter } from "./gemini.js";
import { githubCopilotAdapter } from "./github-copilot.js";
import { piAdapter } from "./pi.js";
import { createAdapterRegistry } from "./registry.js";
import type { AdapterRegistry } from "./types.js";

/**
 * Create a fully populated adapter registry with all 6 supported tools
 */
export function createPopulatedAdapterRegistry(): AdapterRegistry {
  const registry = createAdapterRegistry();

  registry.register(claudeAdapter);
  registry.register(codexAdapter);
  registry.register(githubCopilotAdapter);
  registry.register(geminiAdapter);
  registry.register(cursorAdapter);
  registry.register(piAdapter);

  return registry;
}
