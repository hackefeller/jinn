/**
 * Cursor adapter
 *
 * Formats commands and skills for Cursor.
 * Cursor uses:
 * - Skills: .cursor/skills/<name>/SKILL.md
 * - Commands: .cursor/commands/<name>.md
 * - Format: YAML frontmatter with name, id, category
 */

import path from 'path';
import type { ToolCommandAdapter, CommandContent } from './types.js';
import type { SkillTemplate } from '../templates/types.js';

function escapeYamlValue(value: string): string {
  // Check if value needs quoting (contains special YAML characters)
  const needsQuoting = /[:\n\r#{}\[\],&*!|>'"%@`]|^\s|\s$/.test(value);
  if (needsQuoting) {
    // Use double quotes and escape internal double quotes and backslashes
    const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
    return `"${escaped}"`;
  }
  return value;
}

export const cursorAdapter: ToolCommandAdapter = {
  toolId: 'cursor',
  toolName: 'Cursor',
  skillsDir: '.cursor',

  getCommandPath(commandId: string): string {
    return path.join('.cursor', 'commands', `ghostwire-${commandId}.md`);
  },

  getSkillPath(skillName: string): string {
    return path.join('.cursor', 'skills', skillName, 'SKILL.md');
  },

  formatCommand(content: CommandContent): string {
    return `---
name: /ghostwire-${content.id}
id: ghostwire-${content.id}
category: ${escapeYamlValue(content.category)}
description: ${escapeYamlValue(content.description)}
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
