import { describe, it, expect } from 'bun:test';

describe('Config Schema', () => {
  it('imports schema', async () => {
    const schema = await import('../schema.js');
    expect(schema).toBeDefined();
  });
});

describe('Config Loader', () => {
  it('imports loader', async () => {
    const loader = await import('../loader.js');
    expect(loader).toBeDefined();
  });
});

describe('Config Validation', () => {
  it('imports validation', async () => {
    const validation = await import('../validation.js');
    expect(validation).toBeDefined();
  });
});

describe('Config Defaults', () => {
  it('imports defaults', async () => {
    const defaults = await import('../defaults.js');
    expect(defaults).toBeDefined();
  });
});
