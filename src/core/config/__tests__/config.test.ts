import { describe, it, expect } from 'bun:test';

import { JinnConfigSchema } from '../schema.js';
import { performFullValidation } from '../validation.js';

describe('Config Schema', () => {
  it('imports schema', async () => {
    const schema = await import('../schema.js');
    expect(schema).toBeDefined();
  });

  it('accepts linear workflow configuration', () => {
    const result = JinnConfigSchema.safeParse({
      version: '0.0.1',
      tools: ['opencode'],
      profile: 'core',
      delivery: 'both',
      workflow: {
        backend: 'linear',
        linear: {
          team: 'ENG',
          defaultProjectNameTemplate: '{{changeName}}',
          mcpServerName: 'linear',
          issueStructure: 'project-issues-subissues',
        },
      },
    });

    expect(result.success).toBe(true);
  });

  it('rejects linear workflow configuration missing linear settings', () => {
    const result = JinnConfigSchema.safeParse({
      version: '0.0.1',
      tools: ['opencode'],
      profile: 'core',
      delivery: 'both',
      workflow: {
        backend: 'linear',
      },
    });

    expect(result.success).toBe(false);
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

  it('reports missing linear team in full validation', () => {
    const result = performFullValidation({
      version: '0.0.1',
      tools: ['opencode'],
      profile: 'core',
      delivery: 'both',
      workflow: {
        backend: 'linear',
        linear: {
          team: '',
          defaultProjectNameTemplate: '{{changeName}}',
          mcpServerName: 'linear',
          issueStructure: 'project-issues-subissues',
        },
      },
    } as any);

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.includes('workflow.linear.team'))).toBe(true);
  });
});

describe('Config Defaults', () => {
  it('imports defaults', async () => {
    const defaults = await import('../defaults.js');
    expect(defaults).toBeDefined();
  });
});
