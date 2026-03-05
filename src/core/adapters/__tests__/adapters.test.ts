import { describe, it, expect } from 'bun:test';
import {
  opencodeAdapter,
  cursorAdapter,
  claudeAdapter,
  githubCopilotAdapter,
  continueAdapter,
  clineAdapter,
  amazonQAdapter,
  windsurfAdapter,
  augmentAdapter,
  supermavenAdapter,
  tabnineAdapter,
  codeiumAdapter,
  sourcegraphCodyAdapter,
  geminiAdapter,
  mistralAdapter,
  ollamaAdapter,
  lmStudioAdapter,
  textGenerationWebuiAdapter,
  koboldcppAdapter,
  tabbyAdapter,
  gpt4allAdapter,
  janAdapter,
  huggingfaceChatAdapter,
  phindAdapter,
  type ToolCommandAdapter,
} from '../index.js';
import type { CommandContent } from '../types.js';

const allAdapters: ToolCommandAdapter[] = [
  opencodeAdapter,
  cursorAdapter,
  claudeAdapter,
  githubCopilotAdapter,
  continueAdapter,
  clineAdapter,
  amazonQAdapter,
  windsurfAdapter,
  augmentAdapter,
  supermavenAdapter,
  tabnineAdapter,
  codeiumAdapter,
  sourcegraphCodyAdapter,
  geminiAdapter,
  mistralAdapter,
  ollamaAdapter,
  lmStudioAdapter,
  textGenerationWebuiAdapter,
  koboldcppAdapter,
  tabbyAdapter,
  gpt4allAdapter,
  janAdapter,
  huggingfaceChatAdapter,
  phindAdapter,
];

const testCommandContent: CommandContent = {
  id: 'propose',
  fullId: 'ghostwire:propose',
  name: 'Ghostwire: Propose',
  description: 'Propose a new change',
  category: 'Workflow',
  tags: ['planning', 'workflow'],
  body: '# Propose a New Change\n\nStart a new change proposal.',
};

const testSkillTemplate = {
  name: 'ghostwire-planner',
  description: 'Planning agent',
  instructions: 'You are a planner agent.',
  license: 'MIT',
  compatibility: 'Works with ghostwire CLI',
  metadata: {
    author: 'ghostwire',
    version: '1.0.0',
    category: 'Orchestration',
    tags: ['planning'],
  },
};

describe('Adapter Registry', () => {
  it('has all 24 adapters', () => {
    expect(allAdapters).toHaveLength(24);
  });

  it('each adapter has unique toolId', () => {
    const toolIds = allAdapters.map((a) => a.toolId);
    const uniqueIds = new Set(toolIds);
    expect(uniqueIds.size).toBe(24);
  });
});

describe('OpenCode Adapter', () => {
  it('uses .opencode directory', () => {
    expect(opencodeAdapter.skillsDir).toBe('.opencode');
    expect(opencodeAdapter.getCommandPath('test')).toBe('.opencode/commands/ghostwire-test.md');
  });

  it('generates correct skill path', () => {
    const path = opencodeAdapter.getSkillPath('ghostwire-planner');
    expect(path).toBe('.opencode/skills/ghostwire-planner/SKILL.md');
  });

  it('formats command with frontmatter', () => {
    const result = opencodeAdapter.formatCommand(testCommandContent);
    expect(result).toContain('---');
    expect(result).toContain('description: Propose a new change');
    expect(result).toContain('# Propose a New Change');
  });

  it('formats skill with frontmatter', () => {
    const result = opencodeAdapter.formatSkill(testSkillTemplate as any, '1.0.0');
    expect(result).toContain('---');
    expect(result).toContain('name: ghostwire-planner');
    expect(result).toContain('generatedBy: "1.0.0"');
  });
});

describe('Cursor Adapter', () => {
  it('uses .cursor directory', () => {
    expect(cursorAdapter.skillsDir).toBe('.cursor');
    expect(cursorAdapter.getCommandPath('test')).toBe('.cursor/commands/ghostwire-test.md');
  });

  it('generates correct skill path', () => {
    const path = cursorAdapter.getSkillPath('ghostwire-planner');
    expect(path).toBe('.cursor/skills/ghostwire-planner/SKILL.md');
  });

  it('formats command with frontmatter', () => {
    const result = cursorAdapter.formatCommand(testCommandContent);
    expect(result).toContain('---');
    expect(result).toContain('description: Propose a new change');
  });
});

describe('Claude Adapter', () => {
  it('uses .claude directory', () => {
    expect(claudeAdapter.skillsDir).toBe('.claude');
    expect(claudeAdapter.getCommandPath('test')).toBe('.claude/commands/ghostwire/test.md');
  });

  it('generates correct skill path', () => {
    const path = claudeAdapter.getSkillPath('ghostwire-planner');
    expect(path).toBe('.claude/skills/ghostwire-planner/SKILL.md');
  });
});

describe('GitHub Copilot Adapter', () => {
  it('uses .github directory with prompt extension', () => {
    expect(githubCopilotAdapter.skillsDir).toBe('.github');
    expect(githubCopilotAdapter.getCommandPath('test')).toBe('.github/prompts/ghostwire-test.prompt.md');
  });

  it('generates correct skill path', () => {
    const path = githubCopilotAdapter.getSkillPath('ghostwire-planner');
    expect(path).toBe('.github/skills/ghostwire-planner/SKILL.md');
  });
});

describe('Continue Adapter', () => {
  it('uses .continue directory', () => {
    expect(continueAdapter.skillsDir).toBe('.continue');
  });
});

describe('Cline Adapter', () => {
  it('uses .cline directory', () => {
    expect(clineAdapter.skillsDir).toBe('.cline');
  });
});

describe('Amazon Q Adapter', () => {
  it('uses .amazonq directory', () => {
    expect(amazonQAdapter.skillsDir).toBe('.amazonq');
  });
});

describe('Windsurf Adapter', () => {
  it('uses .windsurf directory', () => {
    expect(windsurfAdapter.skillsDir).toBe('.windsurf');
  });
});

describe('Augment Adapter', () => {
  it('uses .augment directory', () => {
    expect(augmentAdapter.skillsDir).toBe('.augment');
  });
});

describe('Supermaven Adapter', () => {
  it('uses .supermaven directory', () => {
    expect(supermavenAdapter.skillsDir).toBe('.supermaven');
  });
});

describe('Tabnine Adapter', () => {
  it('uses .tabnine directory', () => {
    expect(tabnineAdapter.skillsDir).toBe('.tabnine');
  });
});

describe('Codeium Adapter', () => {
  it('uses .codeium directory', () => {
    expect(codeiumAdapter.skillsDir).toBe('.codeium');
  });
});

describe('Sourcegraph Cody Adapter', () => {
  it('uses .cody directory', () => {
    expect(sourcegraphCodyAdapter.skillsDir).toBe('.cody');
  });
});

describe('Gemini Adapter', () => {
  it('uses .gemini directory', () => {
    expect(geminiAdapter.skillsDir).toBe('.gemini');
  });
});

describe('Mistral Adapter', () => {
  it('uses .mistral directory', () => {
    expect(mistralAdapter.skillsDir).toBe('.mistral');
  });
});

describe('Ollama Adapter', () => {
  it('uses .ollama directory', () => {
    expect(ollamaAdapter.skillsDir).toBe('.ollama');
  });
});

describe('LM Studio Adapter', () => {
  it('uses .lmstudio directory', () => {
    expect(lmStudioAdapter.skillsDir).toBe('.lmstudio');
  });
});

describe('Text Generation WebUI Adapter', () => {
  it('uses .webui directory', () => {
    expect(textGenerationWebuiAdapter.skillsDir).toBe('.webui');
  });
});

describe('KoboldCpp Adapter', () => {
  it('uses .koboldcpp directory', () => {
    expect(koboldcppAdapter.skillsDir).toBe('.koboldcpp');
  });
});

describe('Tabby Adapter', () => {
  it('uses .tabby directory', () => {
    expect(tabbyAdapter.skillsDir).toBe('.tabby');
  });
});

describe('GPT4All Adapter', () => {
  it('uses .gpt4all directory', () => {
    expect(gpt4allAdapter.skillsDir).toBe('.gpt4all');
  });
});

describe('Jan Adapter', () => {
  it('uses .jan directory', () => {
    expect(janAdapter.skillsDir).toBe('.jan');
  });
});

describe('Hugging Face Chat Adapter', () => {
  it('uses .hfchat directory', () => {
    expect(huggingfaceChatAdapter.skillsDir).toBe('.hfchat');
  });
});

describe('Phind Adapter', () => {
  it('uses .phind directory', () => {
    expect(phindAdapter.skillsDir).toBe('.phind');
  });
});
