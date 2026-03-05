import { describe, it, expect } from 'bun:test';

describe('Adapter Formatting Tests', () => {
  it('all adapters format commands with frontmatter', async () => {
    const { createPopulatedAdapterRegistry } = await import('../../src/core/adapters/index.js');
    const registry = createPopulatedAdapterRegistry();
    const adapters = registry.getAll();

    const commandContent = {
      id: 'test',
      fullId: 'ghostwire:test',
      name: 'Test Command',
      description: 'Test description',
      category: 'Test',
      tags: ['test'],
      body: '# Test Content',
    };

    for (const adapter of adapters) {
      const result = adapter.formatCommand(commandContent);
      expect(result).toContain('---');
      expect(result).toContain('description:');
    }
  });

  it('all adapters format skills with frontmatter', async () => {
    const { createPopulatedAdapterRegistry } = await import('../../src/core/adapters/index.js');
    const registry = createPopulatedAdapterRegistry();
    const adapters = registry.getAll();

    const skillTemplate = {
      name: 'ghostwire-test',
      description: 'Test skill',
      instructions: 'You are a test skill.',
      license: 'MIT',
    };

    for (const adapter of adapters) {
      const result = adapter.formatSkill(skillTemplate as any, '1.0.0');
      expect(result).toContain('---');
      expect(result).toContain('name:');
      expect(result).toContain('ghostwire-test');
    }
  });

  it('all adapters generate valid paths', async () => {
    const { createPopulatedAdapterRegistry } = await import('../../src/core/adapters/index.js');
    const registry = createPopulatedAdapterRegistry();
    const adapters = registry.getAll();

    for (const adapter of adapters) {
      const cmdPath = adapter.getCommandPath('mycommand');
      expect(cmdPath).toBeTruthy();
      expect(cmdPath.length).toBeGreaterThan(0);

      const skillPath = adapter.getSkillPath('myskill');
      expect(skillPath).toBeTruthy();
      expect(skillPath.length).toBeGreaterThan(0);
    }
  });

  it('all adapters have unique skillsDir', async () => {
    const { createPopulatedAdapterRegistry } = await import('../../src/core/adapters/index.js');
    const registry = createPopulatedAdapterRegistry();
    const adapters = registry.getAll();

    const dirs = adapters.map(a => a.skillsDir);
    const unique = new Set(dirs);
    expect(unique.size).toBe(dirs.length);
  });
});

describe('Tool ID Coverage', () => {
  it('has all major tools', async () => {
    const { createPopulatedAdapterRegistry } = await import('../../src/core/adapters/index.js');
    const registry = createPopulatedAdapterRegistry();
    
    const tools = ['opencode', 'cursor', 'claude', 'github-copilot', 'continue', 'cline', 'amazon-q', 'windsurf'];
    for (const tool of tools) {
      expect(registry.has(tool)).toBe(true);
    }
  });

  it('has all 24 tools', async () => {
    const { createPopulatedAdapterRegistry } = await import('../../src/core/adapters/index.js');
    const registry = createPopulatedAdapterRegistry();
    const adapters = registry.getAll();
    expect(adapters.length).toBe(24);
  });
});

describe('Adapter Transformations', () => {
  it('transformCommandReferences works', async () => {
    const { opencodeAdapter } = await import('../../src/core/adapters/index.js');
    const text = '/ghostwire:propose /ghostwire:explore';
    const result = opencodeAdapter.transformCommandReferences(text);
    expect(result).toBeDefined();
  });
});
