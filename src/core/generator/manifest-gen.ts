/**
 * Manifest generator
 *
 * Generates a skills-index discovery manifest per tool. Agents read this file
 * at session start to discover available skills and perform intent-to-skill
 * routing without a static command list (Metadata Reflection pattern).
 */

import type { ToolCommandAdapter, GeneratedFile } from "../adapters/types.js";
import type { SkillTemplate } from "../templates/types.js";

export function generateManifestForTool(
  skills: SkillTemplate[],
  adapter: ToolCommandAdapter,
  version: string,
): GeneratedFile | null {
  if (!adapter.getManifestPath || !adapter.formatManifest) {
    return null;
  }

  return {
    path: adapter.getManifestPath(),
    content: adapter.formatManifest(skills, version),
  };
}

export function generateManifestsForAllTools(
  skills: SkillTemplate[],
  adapters: ToolCommandAdapter[],
  version: string,
): GeneratedFile[] {
  const results: GeneratedFile[] = [];

  for (const adapter of adapters) {
    const manifest = generateManifestForTool(skills, adapter, version);
    if (manifest) {
      results.push(manifest);
    }
  }

  return results;
}
