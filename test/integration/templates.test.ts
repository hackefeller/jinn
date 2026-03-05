import { describe, it, expect } from 'bun:test';

describe('Command Templates', () => {
  it('imports workflows commands', async () => {
    const mod = await import('../../src/templates/commands/workflows.js');
    expect(mod).toBeDefined();
  });

  it('imports code commands', async () => {
    const mod = await import('../../src/templates/commands/code.js');
    expect(mod).toBeDefined();
  });

  it('imports git commands', async () => {
    const mod = await import('../../src/templates/commands/git.js');
    expect(mod).toBeDefined();
  });

  it('imports docs commands', async () => {
    const mod = await import('../../src/templates/commands/docs.js');
    expect(mod).toBeDefined();
  });

  it('imports project commands', async () => {
    const mod = await import('../../src/templates/commands/project.js');
    expect(mod).toBeDefined();
  });

  it('imports util commands', async () => {
    const mod = await import('../../src/templates/commands/util.js');
    expect(mod).toBeDefined();
  });

  it('imports work commands', async () => {
    const mod = await import('../../src/templates/commands/work.js');
    expect(mod).toBeDefined();
  });

  it('imports lint commands', async () => {
    const mod = await import('../../src/templates/commands/lint.js');
    expect(mod).toBeDefined();
  });

  it('imports refactor commands', async () => {
    const mod = await import('../../src/templates/commands/refactor.js');
    expect(mod).toBeDefined();
  });
});

describe('Skill Templates', () => {
  it('imports skills', async () => {
    const mod = await import('../../src/templates/skills/index.js');
    expect(mod).toBeDefined();
  });
});

describe('Agent Templates', () => {
  it('imports agents', async () => {
    const mod = await import('../../src/templates/agents/index.js');
    expect(mod).toBeDefined();
  });

  it('imports reviewers agents', async () => {
    const mod = await import('../../src/templates/agents/reviewers.js');
    expect(mod).toBeDefined();
  });
});

describe('Template Registry', () => {
  it('imports registry', async () => {
    const mod = await import('../../src/core/templates/registry.js');
    expect(mod).toBeDefined();
    expect(mod.createTemplateRegistry).toBeDefined();
  });
});

describe('Template Types', () => {
  it('imports types', async () => {
    const mod = await import('../../src/core/templates/types.js');
    expect(mod).toBeDefined();
  });
});
