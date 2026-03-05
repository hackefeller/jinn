/**
 * Continue adapter
 *
 * Formats commands and skills for Continue.
 */

import path from 'path';
import type { ToolCommandAdapter, CommandContent } from './types.js';
import type { SkillTemplate } from '../templates/types.js';

export const continueAdapter: ToolCommandAdapter = {
  toolId: 'continue',
  toolName: 'Continue',
  skillsDir: '.continue',

  getCommandPath(commandId: string): string {
    return path.join('.continue', 'prompts', `ghostwire-${commandId}.prompt`);
  },

  getSkillPath(skillName: string): string {
    return path.join('.continue', 'skills', skillName, 'SKILL.md');
  },

  formatCommand(content: CommandContent): string {
    return `---
description: ${content.description}
---

${content.body}`;
  },

  formatSkill(template: SkillTemplate, version: string): string {
    return `---
name: ${template.name}
description: ${template.description}
license: ${template.license || 'MIT'}
compatibility: ${template.compatibility || 'Requires ghostwire CLI.'}
metadata:
  author: ${template.metadata?.author || 'ghostwire'}
  version: "${template.metadata?.version || '1.0'}"
  generatedBy: "${version}"
---

${template.instructions}`;
  },
};
