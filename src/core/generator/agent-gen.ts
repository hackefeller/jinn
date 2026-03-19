/**
 * Agent generator
 *
 * Generates agent files for all configured tools.
 * Agents are special skills with additional metadata.
 */

import * as path from "path";
import type { ToolCommandAdapter, GeneratedFile } from "../adapters/types.js";
import type { AgentTemplate } from "../templates/types.js";

export function generateAgentForTool(
  template: AgentTemplate,
  agentId: string,
  adapter: ToolCommandAdapter,
  version: string,
): GeneratedFile[] {
  const filePath = adapter.getAgentPath
    ? adapter.getAgentPath(template.name)
    : adapter.getSkillPath(template.name);
  const fileDirectory = path.dirname(filePath);

  const fileContent = adapter.formatAgent
    ? adapter.formatAgent(template, version)
    : adapter.formatSkill(template, version);

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

export function generateAgentsForTool(
  templates: AgentTemplate[],
  adapter: ToolCommandAdapter,
  version: string,
): GeneratedFile[] {
  return templates.flatMap((template) =>
    generateAgentForTool(template, template.name, adapter, version),
  );
}

export function generateAgentsForAllTools(
  templates: AgentTemplate[],
  adapters: ToolCommandAdapter[],
  version: string,
): GeneratedFile[] {
  const results: GeneratedFile[] = [];

  for (const adapter of adapters) {
    const adapterResults = generateAgentsForTool(templates, adapter, version);
    results.push(...adapterResults);
  }

  return results;
}
