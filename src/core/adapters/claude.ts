/**
 * Claude Code adapter
 *
 * Formats skills and agents for Claude Code.
 *
 * Directory conventions (open agent skills standard + Claude-native):
 * - Skills:         .claude/skills/<name>/SKILL.md
 * - Commands:       .claude/commands/jinn/<id>.md  (also creates /jinn-<id> slash command)
 * - Agents:         .claude/agents/<name>.md  (YAML frontmatter + markdown body)
 *
 * Agent frontmatter fields:
 * - name           display name (used in @ mentions)
 * - description    when/why to use this agent
 * - tools          explicit allowlist (e.g. Read, Grep, Glob, Bash)
 * - model          model override (default: sonnet)
 * - skills         YAML list of skills to preload at agent startup
 *
 * Skills are referenced by their bare name (e.g. skills: [jinn-git-master]).
 * Claude Code resolves skill paths as .claude/skills/<name>/SKILL.md.
 */

import path from "path";
import type { ToolCommandAdapter } from "./types.js";
import type { AgentTemplate, SkillTemplate } from "../templates/types.js";

/** Maps AgentTemplate.defaultTools values to Claude Code tool names */
function resolveClaudeTools(defaultTools: string[] = []): string {
  const toolMap: Record<string, string[]> = {
    read: ["Read"],
    search: ["Grep", "Glob"],
    edit: ["Edit", "Write"],
    web: ["WebSearch", "WebFetch"],
    task: ["Bash"],
    look_at: ["Read"],
    delegate_task: ["Bash"],
  };
  const resolved = new Set<string>();
  for (const tool of defaultTools) {
    for (const mapped of toolMap[tool] ?? []) {
      resolved.add(mapped);
    }
  }
  return [...resolved].join(", ") || "Read, Grep, Glob";
}

function escapeYamlValue(value: string): string {
  const needsQuoting = /[:\n\r#{}\[\],&*!|>'"%@`]|^\s|\s$/.test(value);
  if (needsQuoting) {
    const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
    return `"${escaped}"`;
  }
  return value;
}

function formatTagsArray(tags: string[]): string {
  if (tags.length === 0) return "[]";
  const escapedTags = tags.map((tag) => escapeYamlValue(tag));
  return `[${escapedTags.join(", ")}]`;
}

function formatYamlList(key: string, items: string[]): string {
  return `${key}:\n${items.map((item) => `  - ${item}`).join("\n")}`;
}

export const claudeAdapter: ToolCommandAdapter = {
  toolId: "claude",
  toolName: "Claude Code",
  skillsDir: ".claude",

  getAgentPath(agentName: string): string {
    return path.join(".claude", "agents", `${agentName}.md`);
  },

  getSkillPath(skillName: string): string {
    return path.join(".claude", "skills", skillName, "SKILL.md");
  },

  formatAgent(template: AgentTemplate, version: string): string {
    const tools = resolveClaudeTools(template.defaultTools);
    const frontmatterLines = [
      `name: ${template.name}`,
      `description: ${escapeYamlValue(template.description)}`,
      `tools: ${tools}`,
      `model: sonnet`,
    ];
    if (template.availableSkills && template.availableSkills.length > 0) {
      frontmatterLines.push(`skills:\n  - ${template.availableSkills.join("\n  - ")}`);
    }
    const bodySections: string[] = [template.instructions];
    if (template.availableSkills && template.availableSkills.length > 0) {
      bodySections.push(
        `## Related skills\n\n${template.availableSkills.map((s) => `- ${s}`).join("\n")}`,
      );
    }
    return `---\n${frontmatterLines.join("\n")}\n---\n\n${bodySections.join("\n\n")}`;
  },

  formatSkill(template: SkillTemplate, version: string): string {
    const metadataLines = [
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
      metadataLines.push(`  category: ${template.metadata.category}`);
    }

    if (template.metadata?.tags && template.metadata.tags.length > 0) {
      metadataLines.push(`  tags: [${template.metadata.tags.join(", ")}]`);
    }

    if (template.when && template.when.length > 0) {
      metadataLines.push(formatYamlList("when", template.when));
    }

    if (template.applicability && template.applicability.length > 0) {
      metadataLines.push(formatYamlList("applicability", template.applicability));
    }

    if (template.termination && template.termination.length > 0) {
      metadataLines.push(formatYamlList("termination", template.termination));
    }

    if (template.outputs && template.outputs.length > 0) {
      metadataLines.push(formatYamlList("outputs", template.outputs));
    }

    if (template.dependencies && template.dependencies.length > 0) {
      metadataLines.push(formatYamlList("dependencies", template.dependencies));
    }

    return `---\n${metadataLines.join("\n")}\n---\n\n${template.instructions}`;
  },

  getManifestPath(): string {
    return path.join(".claude", "skills-index.md");
  },

  formatManifest(skills: SkillTemplate[], version: string): string {
    const lines = [
      "---",
      "generated: true",
      `version: "${version}"`,
      "---",
      "",
      "# Skills Index",
      "",
      "This file is auto-generated by jinn. Agents can read it at session start",
      "to discover available skills and route user goals without slash commands.",
      "",
    ];

    for (const skill of skills) {
      lines.push(`## ${skill.name}`);
      lines.push("");
      lines.push(`**Description**: ${skill.description}`);
      if (skill.when && skill.when.length > 0) {
        lines.push(`**When**: ${skill.when.join("; ")}`);
      }
      if (skill.applicability && skill.applicability.length > 0) {
        lines.push(`**Applicability**: ${skill.applicability.join("; ")}`);
      }
      if (skill.outputs && skill.outputs.length > 0) {
        lines.push(`**Outputs**: ${skill.outputs.join(", ")}`);
      }
      if (skill.termination && skill.termination.length > 0) {
        lines.push(`**Done when**: ${skill.termination.join("; ")}`);
      }
      if (skill.dependencies && skill.dependencies.length > 0) {
        lines.push(`**Depends on**: ${skill.dependencies.join(", ")}`);
      }
      lines.push("");
    }

    return lines.join("\n");
  },
};
