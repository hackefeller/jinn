import { describe, expect, it } from 'bun:test';

import { validateLinearWorkflowMcpServer } from '../mcp.js';

describe('Linear MCP readiness', () => {
  it('passes when configured linear server exists', () => {
    const result = validateLinearWorkflowMcpServer(
      {
        backend: 'linear',
        linear: {
          team: 'ENG',
          defaultProjectNameTemplate: '{{changeName}}',
          mcpServerName: 'linear',
          issueStructure: 'project-issues-subissues',
        },
      },
      {
        linear: { command: 'npx', args: ['linear-mcp'] },
      },
    );

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('fails when configured linear server is missing', () => {
    const result = validateLinearWorkflowMcpServer(
      {
        backend: 'linear',
        linear: {
          team: 'ENG',
          defaultProjectNameTemplate: '{{changeName}}',
          mcpServerName: 'linear',
          issueStructure: 'project-issues-subissues',
        },
      },
      {},
    );

    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('linear');
  });
});
