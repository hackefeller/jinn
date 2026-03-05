import { describe, it, expect } from 'bun:test';

describe('CLI Commands', () => {
  it('imports init command', async () => {
    const mod = await import('../../src/cli/ghostwire/init.js');
    expect(mod).toBeDefined();
  });

  it('imports update command', async () => {
    const mod = await import('../../src/cli/ghostwire/update.js');
    expect(mod).toBeDefined();
  });

  it('imports config command', async () => {
    const mod = await import('../../src/cli/ghostwire/config.js');
    expect(mod).toBeDefined();
  });

  it('imports main program', async () => {
    const mod = await import('../../src/cli/ghostwire/index.js');
    expect(mod).toBeDefined();
  });
});

describe('Generator', () => {
  it('imports generator', async () => {
    const mod = await import('../../src/core/generator/index.js');
    expect(mod).toBeDefined();
  });

  it('imports command generator', async () => {
    const mod = await import('../../src/core/generator/command-gen.js');
    expect(mod).toBeDefined();
  });

  it('imports skill generator', async () => {
    const mod = await import('../../src/core/generator/skill-gen.js');
    expect(mod).toBeDefined();
  });

  it('imports agent generator', async () => {
    const mod = await import('../../src/core/generator/agent-gen.js');
    expect(mod).toBeDefined();
  });
});

describe('Generator Types', () => {
  it('imports types', async () => {
    const mod = await import('../../src/core/generator/types.js');
    expect(mod).toBeDefined();
  });
});

describe('Adapter Types', () => {
  it('imports types', async () => {
    const mod = await import('../../src/core/adapters/types.js');
    expect(mod).toBeDefined();
  });
});
