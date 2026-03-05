import { describe, it, expect } from 'bun:test';

describe('All Adapters Format Commands', () => {
  const adapters = [
    'opencode', 'cursor', 'claude', 'github-copilot', 'continue',
    'cline', 'amazon-q', 'windsurf', 'augment', 'supermaven',
    'tabnine', 'codeium', 'sourcegraph-cody', 'gemini', 'mistral',
    'ollama', 'lm-studio', 'text-generation-webui', 'koboldcpp',
    'tabby', 'gpt4all', 'jan', 'huggingface-chat', 'phind'
  ];

  for (const adapterName of adapters) {
    it(`${adapterName} adapter exists and works`, async () => {
      const { createPopulatedAdapterRegistry } = await import('../../src/core/adapters/index.js');
      const registry = createPopulatedAdapterRegistry();
      
      const adapter = registry.get(adapterName);
      expect(adapter).toBeDefined();
      expect(adapter.toolId).toBe(adapterName);
      expect(adapter.skillsDir).toBeDefined();
      
      const cmdPath = adapter.getCommandPath('test');
      expect(cmdPath).toBeDefined();
      
      const skillPath = adapter.getSkillPath('test-skill');
      expect(skillPath).toBeDefined();
    });
  }
});

describe('All Adapters Format Skills', () => {
  it('all adapters format skill correctly', async () => {
    const { createPopulatedAdapterRegistry } = await import('../../src/core/adapters/index.js');
    const registry = createPopulatedAdapterRegistry();
    const adapters = registry.getAll();
    
    const template = {
      name: 'test-skill',
      description: 'Test skill description',
      instructions: 'You are a test skill.',
      license: 'MIT',
    };
    
    for (const adapter of adapters) {
      const result = adapter.formatSkill(template as any, '1.0.0');
      expect(result).toContain('---');
      expect(result).toContain('test-skill');
    }
  });
});

describe('Adapter Path Formats', () => {
  it('different adapters use different paths', async () => {
    const { opencodeAdapter, cursorAdapter, claudeAdapter, githubCopilotAdapter } = await import('../../src/core/adapters/index.js');
    
    expect(opencodeAdapter.getCommandPath('test')).not.toBe(cursorAdapter.getCommandPath('test'));
    expect(opencodeAdapter.getCommandPath('test')).not.toBe(claudeAdapter.getCommandPath('test'));
    expect(opencodeAdapter.getCommandPath('test')).not.toBe(githubCopilotAdapter.getCommandPath('test'));
  });
});

describe('Tool Definitions Complete', () => {
  it('has all 24 tools', async () => {
    const { TOOL_DEFINITIONS } = await import('../../src/core/discovery/definitions.js');
    expect(TOOL_DEFINITIONS.length).toBe(24);
  });

  it('all tools have required fields', async () => {
    const { TOOL_DEFINITIONS } = await import('../../src/core/discovery/definitions.js');
    
    for (const tool of TOOL_DEFINITIONS) {
      expect(tool.id).toBeDefined();
      expect(tool.name).toBeDefined();
      expect(tool.skillsDir).toBeDefined();
    }
  });

  it('tools have human readable names', async () => {
    const { TOOL_DEFINITIONS } = await import('../../src/core/discovery/definitions.js');
    
    for (const tool of TOOL_DEFINITIONS) {
      expect(tool.name.length).toBeGreaterThan(0);
      expect(tool.name).toMatch(/^[A-Z]/);
    }
  });
});
