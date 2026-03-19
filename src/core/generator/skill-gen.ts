/**
 * Skill generator
 *
 * Generates skill files for all configured tools.
 */

import * as path from "path";
import type { ToolCommandAdapter, GeneratedFile } from "../adapters/types.js";
import type { SkillTemplate } from "../templates/types.js";

export function generateSkillForTool(
  template: SkillTemplate,
  adapter: ToolCommandAdapter,
  version: string,
): GeneratedFile[] {
  const filePath = adapter.getSkillPath(template.name);
  const fileContent = adapter.formatSkill(template, version);
  const fileDirectory = path.dirname(filePath);
  const files: GeneratedFile[] = [
    {
      path: filePath,
      content: fileContent,
    },
  ];

  for (const reference of template.references || []) {
    files.push({
      path: path.join(fileDirectory, "references", reference.filename),
      content: reference.content,
    });
  }

  return files;
}

export function generateSkillsForTool(
  templates: SkillTemplate[],
  adapter: ToolCommandAdapter,
  version: string,
): GeneratedFile[] {
  return templates.flatMap((template) => generateSkillForTool(template, adapter, version));
}

export function generateSkillsForAllTools(
  templates: SkillTemplate[],
  adapters: ToolCommandAdapter[],
  version: string,
): GeneratedFile[] {
  const results: GeneratedFile[] = [];

  for (const adapter of adapters) {
    const adapterResults = generateSkillsForTool(templates, adapter, version);
    results.push(...adapterResults);
  }

  return results;
}
