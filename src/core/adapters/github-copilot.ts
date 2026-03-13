/**
 * GitHub Copilot adapter
 *
 * Formats commands and skills for GitHub Copilot.
 * Copilot uses:
 * - Skills: .github/skills/<name>/SKILL.md
 * - Commands: .github/prompts/<name>.prompt.md
 * - Format: Simple YAML frontmatter with description
 */

import path from 'path';
import type { ToolCommandAdapter, CommandContent } from './types.js';
import type { SkillTemplate } from '../templates/types.js';

export const githubCopilotAdapter: ToolCommandAdapter = {
  toolId: 'github-copilot',
  toolName: 'GitHub Copilot',
  skillsDir: '.github',

  getCommandPath(commandId: string): string {
    // Copilot uses .prompt.md extension
    return path.join('.github', 'prompts', `jinn-${commandId}.prompt.md`);
  },

  getSkillPath(skillName: string): string {
    return path.join('.github', 'skills', skillName, 'SKILL.md');
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
      `compatibility: ${template.compatibility || 'Requires jinn CLI.'}`,
      'metadata:',
      `  author: ${template.metadata?.author || 'jinn'}`,
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
