/**
 * Base adapter factory
 *
 * Creates ToolCommandAdapter instances from a config object.
 * Eliminates boilerplate across the 20+ adapters that share identical
 * formatSkill logic and differ only in paths and IDs.
 */

import path from "path";
import type { ToolCommandAdapter } from "./types.js";
import type { SkillTemplate } from "../templates/types.js";
import type { ToolId } from "../config/schema.js";

export interface BaseAdapterConfig {
  toolId: ToolId;
  toolName: string;
  /** Root config directory, e.g. '.amazonq' */
  skillsDir: string;
}

function formatYamlList(key: string, items: string[]): string {
  return `${key}:\n${items.map((item) => `  - ${item}`).join("\n")}`;
}

function formatSkill(template: SkillTemplate, version: string): string {
  const lines = [
    `name: ${template.name}`,
    `description: ${template.description}`,
    `license: ${template.license || "MIT"}`,
    `compatibility: ${template.compatibility || "Requires jinn CLI."}`,
    "metadata:",
    `  author: ${template.metadata?.author || "jinn"}`,
    `  version: "${template.metadata?.version || "1.0"}"`,
    `  generatedBy: "${version}"`,
  ];

  if (template.metadata?.category) {
    lines.push(`  category: ${template.metadata.category}`);
  }

  if (template.metadata?.tags && template.metadata.tags.length > 0) {
    lines.push(`  tags: [${template.metadata.tags.join(", ")}]`);
  }

  if (template.when && template.when.length > 0) {
    lines.push(formatYamlList("when", template.when));
  }

  if (template.applicability && template.applicability.length > 0) {
    lines.push(formatYamlList("applicability", template.applicability));
  }

  if (template.termination && template.termination.length > 0) {
    lines.push(formatYamlList("termination", template.termination));
  }

  if (template.outputs && template.outputs.length > 0) {
    lines.push(formatYamlList("outputs", template.outputs));
  }

  if (template.dependencies && template.dependencies.length > 0) {
    lines.push(formatYamlList("dependencies", template.dependencies));
  }

  return `---\n${lines.join("\n")}\n---\n\n${template.instructions}`;
}

export function createAdapter(config: BaseAdapterConfig): ToolCommandAdapter {
  const { toolId, toolName, skillsDir } = config;

  return {
    toolId,
    toolName,
    skillsDir,

    getSkillPath(skillName: string): string {
      return path.join(skillsDir, "skills", skillName, "SKILL.md");
    },

    formatSkill(template: SkillTemplate, version: string): string {
      return formatSkill(template, version);
    },
  };
}
