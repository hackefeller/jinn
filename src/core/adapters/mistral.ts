/**
 * Mistral adapter
 *
 * Formats commands and skills for Mistral.
 * Mistral uses:
 * - Skills: .mistral/skills/<name>/SKILL.md
 * - Commands: .mistral/commands/<name>.md
 * - Format: YAML frontmatter with description
 */

import path from 'path';
import type { ToolCommandAdapter, CommandContent } from './types.js';
import type { SkillTemplate } from '../templates/types.js';

export const mistralAdapter: ToolCommandAdapter = {
  toolId: 'mistral',
  toolName: 'Mistral',
  skillsDir: '.mistral',

  getCommandPath(commandId: string): string {
    return path.join('.mistral', 'commands', `ghostwire-${commandId}.md`);
  },

  getSkillPath(skillName: string): string {
    return path.join('.mistral', 'skills', skillName, 'SKILL.md');
  },

  formatCommand(content: CommandContent): string {
    return `---
description: ${content.description}
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

  transformCommandReferences(text: string): string {
    return text;
  },
};
