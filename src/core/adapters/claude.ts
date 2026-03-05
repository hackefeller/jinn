/**
 * Claude Code adapter
 *
 * Formats commands and skills for Claude Code.
 * Claude Code uses:
 * - Skills: .claude/skills/<name>/SKILL.md
 * - Commands: .claude/commands/ghostwire/<id>.md (nested directory)
 * - Format: YAML frontmatter with name, description, category, tags
 */

import path from 'path';
import type { ToolCommandAdapter, CommandContent } from './types.js';
import type { SkillTemplate } from '../templates/types.js';

function escapeYamlValue(value: string): string {
  const needsQuoting = /[:\n\r#{}\[\],&*!|>'"%@`]|^\s|\s$/.test(value);
  if (needsQuoting) {
    const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
    return `"${escaped}"`;
  }
  return value;
}

function formatTagsArray(tags: string[]): string {
  if (tags.length === 0) return '[]';
  const escapedTags = tags.map((tag) => escapeYamlValue(tag));
  return `[${escapedTags.join(', ')}]`;
}

export const claudeAdapter: ToolCommandAdapter = {
  toolId: 'claude',
  toolName: 'Claude Code',
  skillsDir: '.claude',

  getCommandPath(commandId: string): string {
    // Claude uses nested directory structure
    return path.join('.claude', 'commands', 'ghostwire', `${commandId}.md`);
  },

  getSkillPath(skillName: string): string {
    return path.join('.claude', 'skills', skillName, 'SKILL.md');
  },

  formatCommand(content: CommandContent): string {
    return `---
name: ${escapeYamlValue(content.name)}
description: ${escapeYamlValue(content.description)}
category: ${escapeYamlValue(content.category)}
tags: ${formatTagsArray(content.tags)}
---

${content.body}`;
  },

  formatSkill(template: SkillTemplate, version: string): string {
    const metadataLines = [
      `name: ${template.name}`,
      `description: ${template.description}`,
      `license: ${template.license || 'MIT'}`,
      `compatibility: ${template.compatibility || 'Requires ghostwire CLI.'}`,
      'metadata:',
      `  author: ${template.metadata?.author || 'ghostwire'}`,
      `  version: "${template.metadata?.version || '1.0'}"`,
      `  generatedBy: "${version}"`,
    ];

    if (template.metadata?.category) {
      metadataLines.push(`  category: ${template.metadata.category}`);
    }

    if (template.metadata?.tags && template.metadata.tags.length > 0) {
      metadataLines.push(`  tags: [${template.metadata.tags.join(', ')}]`);
    }

    return `---\n${metadataLines.join('\n')}\n---\n\n${template.instructions}`;
  },
};
