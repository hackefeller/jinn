import { describe, it, expect } from 'bun:test';

describe('Commands All Categories', () => {
  it('workflows commands exist', async () => {
    const mod = await import('../../src/templates/commands/workflows.js');
    expect(mod).toBeDefined();
  });

  it('code commands exist', async () => {
    const mod = await import('../../src/templates/commands/code.js');
    expect(mod).toBeDefined();
  });

  it('git commands exist', async () => {
    const mod = await import('../../src/templates/commands/git.js');
    expect(mod).toBeDefined();
  });

  it('docs commands exist', async () => {
    const mod = await import('../../src/templates/commands/docs.js');
    expect(mod).toBeDefined();
  });

  it('project commands exist', async () => {
    const mod = await import('../../src/templates/commands/project.js');
    expect(mod).toBeDefined();
  });

  it('util commands exist', async () => {
    const mod = await import('../../src/templates/commands/util.js');
    expect(mod).toBeDefined();
  });

  it('work commands exist', async () => {
    const mod = await import('../../src/templates/commands/work.js');
    expect(mod).toBeDefined();
  });

  it('lint commands exist', async () => {
    const mod = await import('../../src/templates/commands/lint.js');
    expect(mod).toBeDefined();
  });

  it('refactor commands exist', async () => {
    const mod = await import('../../src/templates/commands/refactor.js');
    expect(mod).toBeDefined();
  });
});

describe('Skills All Categories', () => {
  it('skills exist', async () => {
    const mod = await import('../../src/templates/skills/index.js');
    expect(mod).toBeDefined();
  });
});

describe('Agents All Categories', () => {
  it('agents exist', async () => {
    const mod = await import('../../src/templates/agents/index.js');
    expect(mod).toBeDefined();
  });

  it('reviewer agents exist', async () => {
    const mod = await import('../../src/templates/agents/reviewers.js');
    expect(mod).toBeDefined();
  });
});

describe('All Generator Types Work', () => {
  it('command-gen works', async () => {
    const { generateCommandsForAllTools } = await import('../../src/core/generator/command-gen.js');
    const { createPopulatedAdapterRegistry } = await import('../../src/core/adapters/index.js');
    
    const registry = createPopulatedAdapterRegistry();
    const adapters = registry.getAll();
    
    const template = {
      name: 'Test',
      description: 'Test',
      category: 'Test',
      tags: ['test'],
      content: 'Test',
    };
    
    const results = generateCommandsForAllTools(template, 'test', adapters, '1.0.0');
    expect(results.length).toBe(24);
  });

  it('skill-gen works', async () => {
    const { generateSkillsForAllTools } = await import('../../src/core/generator/skill-gen.js');
    const { createPopulatedAdapterRegistry } = await import('../../src/core/adapters/index.js');
    
    const registry = createPopulatedAdapterRegistry();
    const adapters = registry.getAll();
    
    const templates = [
      { name: 'skill1', description: 'Test', instructions: 'Test' }
    ];
    
    const results = generateSkillsForAllTools(templates as any, adapters, '1.0.0');
    expect(results.length).toBe(24);
  });

  it('agent-gen works', async () => {
    const { generateAgentsForAllTools } = await import('../../src/core/generator/agent-gen.js');
    const { createPopulatedAdapterRegistry } = await import('../../src/core/adapters/index.js');
    
    const registry = createPopulatedAdapterRegistry();
    const adapters = registry.getAll();
    
    const templates = [
      { name: 'agent1', description: 'Test', instructions: 'Test', role: 'Test' }
    ];
    
    const results = generateAgentsForAllTools(templates as any, adapters, '1.0.0');
    expect(results.length).toBe(24);
  });
});

describe('CLI Commands', () => {
  it('init exports executeInit', async () => {
    const { executeInit } = await import('../../src/cli/ghostwire/init.js');
    expect(typeof executeInit).toBe('function');
  });

  it('update exports executeUpdate', async () => {
    const { executeUpdate } = await import('../../src/cli/ghostwire/update.js');
    expect(typeof executeUpdate).toBe('function');
  });

  it('config exports executeConfig', async () => {
    const { executeConfig } = await import('../../src/cli/ghostwire/config.js');
    expect(typeof executeConfig).toBe('function');
  });
});
