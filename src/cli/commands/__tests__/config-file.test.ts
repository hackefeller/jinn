import { describe, expect, it } from 'bun:test';

import { parseConfig, serializeConfig } from '../config-file.js';

describe('config-file', () => {
  it('parses linear workflow settings from yaml', () => {
    const config = parseConfig(`
version: "0.0.1"
tools:
  - opencode
profile: core
delivery: both
workflow:
  backend: linear
  linear:
    team: ENG
    defaultProjectNameTemplate: "{{changeName}}"
    mcpServerName: linear
    issueStructure: project-issues-subissues
`);

    expect(config.workflow?.backend).toBe('linear');
    expect(config.workflow?.linear?.team).toBe('ENG');
    expect(config.workflow?.linear?.mcpServerName).toBe('linear');
  });

  it('round-trips linear workflow settings through serialization', () => {
    const content = serializeConfig({
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

    const parsed = parseConfig(content);
    expect(parsed.workflow).toEqual({
      backend: 'linear',
      linear: {
        team: 'ENG',
        defaultProjectNameTemplate: '{{changeName}}',
        mcpServerName: 'linear',
        issueStructure: 'project-issues-subissues',
      },
    });
  });
});
