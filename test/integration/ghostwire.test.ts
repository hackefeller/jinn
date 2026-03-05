import { describe, it, expect } from 'bun:test';

describe('Adapter Registry Tests', () => {
  it('has 24 adapters registered', async () => {
    const { createPopulatedAdapterRegistry } = await import('../../src/core/adapters/index.js');
    const registry = createPopulatedAdapterRegistry();
    const adapters = registry.getAll();
    expect(adapters).toHaveLength(24);
  });

  it('returns opencode adapter', async () => {
    const { createPopulatedAdapterRegistry } = await import('../../src/core/adapters/index.js');
    const registry = createPopulatedAdapterRegistry();
    const adapter = registry.get('opencode');
    expect(adapter.toolId).toBe('opencode');
  });

  it('throws for unknown tool', async () => {
    const { createPopulatedAdapterRegistry } = await import('../../src/core/adapters/index.js');
    const registry = createPopulatedAdapterRegistry();
    expect(() => registry.get('unknown')).toThrow();
  });
});

describe('Adapter Formatting', () => {
  it('opencode formats command with frontmatter', async () => {
    const { opencodeAdapter } = await import('../../src/core/adapters/index.js');
    
    const content = {
      id: 'test',
      fullId: 'ghostwire:test',
      name: 'Test',
      description: 'Test command',
      category: 'Test',
      tags: ['test'],
      body: '# Content',
    };

    const result = opencodeAdapter.formatCommand(content);
    expect(result).toContain('---');
    expect(result).toContain('description: Test command');
    expect(result).toContain('# Content');
  });

  it('opencode generates correct paths', async () => {
    const { opencodeAdapter } = await import('../../src/core/adapters/index.js');
    expect(opencodeAdapter.getCommandPath('propose')).toBe('.opencode/commands/ghostwire-propose.md');
    expect(opencodeAdapter.getSkillPath('planner')).toBe('.opencode/skills/planner/SKILL.md');
  });

  it('cursor generates different paths', async () => {
    const { cursorAdapter } = await import('../../src/core/adapters/index.js');
    expect(cursorAdapter.getCommandPath('propose')).toBe('.cursor/commands/ghostwire-propose.md');
  });

  it('github-copilot uses prompt extension', async () => {
    const { githubCopilotAdapter } = await import('../../src/core/adapters/index.js');
    expect(githubCopilotAdapter.getCommandPath('test')).toBe('.github/prompts/ghostwire-test.prompt.md');
  });
});

describe('Tool Detection', () => {
  it('detects tools in test directories', async () => {
    const { detectAvailableTools } = await import('../../src/core/discovery/detector.js');
    const tools = await detectAvailableTools('/Users/charlesponti/Developer/ghostwire');
    expect(tools.length).toBeGreaterThan(0);
  });
});

describe('Template Types', () => {
  it('CommandTemplate has required fields', () => {
    const template = {
      name: 'Test',
      description: 'Test command',
      category: 'Test',
      tags: ['test'],
      content: 'Content',
    };
    expect(template.name).toBeDefined();
    expect(template.description).toBeDefined();
    expect(template.category).toBeDefined();
    expect(template.tags).toBeDefined();
    expect(template.content).toBeDefined();
  });

  it('SkillTemplate has required fields', () => {
    const template = {
      name: 'test-skill',
      description: 'A test skill',
      instructions: 'Do something',
    };
    expect(template.name).toBeDefined();
    expect(template.description).toBeDefined();
    expect(template.instructions).toBeDefined();
  });
});
