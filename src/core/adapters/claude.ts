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
 * Agent frontmatter fields (https://code.claude.com/docs/en/sub-agents):
 * - name             unique identifier (required)
 * - description      when Claude should delegate (required)
 * - tools            comma-separated allowlist; inherits all if omitted
 * - disallowedTools  tools to deny; removed from inherited or specified list
 * - model            sonnet | opus | haiku | <full-id> | inherit  (default: inherit)
 * - permissionMode   default | acceptEdits | dontAsk | bypassPermissions | plan
 * - maxTurns         max agentic turns before agent stops
 * - skills           skill names to FULLY INJECT into agent context at startup
 * - memory           user | project | local
 * - background       true to always run as background task
 * - mcpServers       MCP servers scoped to this agent
 * - hooks            lifecycle hooks scoped to this agent
 *
 * IMPORTANT: skills listed in the `skills:` frontmatter have their full SKILL.md
 * content injected at startup — they are preloaded, not just made available.
 *
 * Skill frontmatter fields (https://code.claude.com/docs/en/skills):
 * - name                      display name
 * - description               when to use; always in context
 * - disable-model-invocation  true = only user can invoke; removed from model context
 * - user-invocable            false = hide from / menu; model-only
 * - allowed-tools             tools agent can use without per-use approval
 * - model                     model override when skill is active
 * - context                   fork = run in isolated subagent
 * - agent                     which agent to use with context: fork
 * - hooks                     hooks scoped to skill lifecycle
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
    look_at: ["Read", "Glob"],
    delegate_task: ["Agent"],
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
    ];

    if (template.disallowedTools && template.disallowedTools.length > 0) {
      frontmatterLines.push(`disallowedTools: ${template.disallowedTools.join(", ")}`);
    }

    // model defaults to inherit; only emit if template explicitly sets one
    if (template.model) {
      frontmatterLines.push(`model: ${template.model}`);
    }

    if (template.permissionMode) {
      frontmatterLines.push(`permissionMode: ${template.permissionMode}`);
    }

    if (template.maxTurns !== undefined) {
      frontmatterLines.push(`maxTurns: ${template.maxTurns}`);
    }

    if (template.memory) {
      frontmatterLines.push(`memory: ${template.memory}`);
    }

    if (template.availableSkills && template.availableSkills.length > 0) {
      frontmatterLines.push(`skills:\n  - ${template.availableSkills.join("\n  - ")}`);
    }

    return `---\n${frontmatterLines.join("\n")}\n---\n\n${template.instructions}`;
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

    if (template.disableModelInvocation) {
      metadataLines.push("disable-model-invocation: true");
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
