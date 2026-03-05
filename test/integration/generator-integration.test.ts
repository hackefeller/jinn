import { describe, it, expect } from 'bun:test';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

describe('Generator Functions', () => {
  it('generateCommandsForTool works', async () => {
    const { generateCommandsForTool } = await import('../../src/core/generator/command-gen.js');
    const { opencodeAdapter } = await import('../../src/core/adapters/index.js');
    
    const template = {
      name: 'Test Command',
      description: 'Test description',
      category: 'Test',
      tags: ['test'],
      content: '# Test Content',
    };

    const result = generateCommandsForTool(template, 'test', opencodeAdapter, '1.0.0');
    expect(result.path).toContain('.opencode');
    expect(result.content).toContain('description: Test description');
  });

  it('generateSkillForTool works', async () => {
    const { generateSkillForTool } = await import('../../src/core/generator/skill-gen.js');
    const { opencodeAdapter } = await import('../../src/core/adapters/index.js');
    
    const template = {
      name: 'ghostwire-test',
      description: 'Test skill',
      instructions: '# Test\n\nYou are a test skill.',
    };

    const result = generateSkillForTool(template, opencodeAdapter, '1.0.0');
    expect(result.path).toContain('.opencode');
    expect(result.content).toContain('ghostwire-test');
  });

  it('generateAgentForTool works', async () => {
    const { generateAgentForTool } = await import('../../src/core/generator/agent-gen.js');
    const { opencodeAdapter } = await import('../../src/core/adapters/index.js');
    
    const template = {
      name: 'ghostwire-tester',
      description: 'Test agent',
      instructions: '# Tester\n\nYou are a test agent.',
      role: 'Testing',
    };

    const result = generateAgentForTool(template, 'tester', opencodeAdapter, '1.0.0');
    expect(result.path).toContain('.opencode');
    expect(result.content).toContain('ghostwire-tester');
  });
});

describe('File Operations', () => {
  const tempDir = path.join(os.tmpdir(), 'ghostwire-test-' + Date.now());

  it('creates directories', async () => {
    await fs.mkdir(tempDir, { recursive: true });
    const exists = await fs.access(tempDir).then(() => true).catch(() => false);
    expect(exists).toBe(true);
  });

  it('writes and reads files', async () => {
    const filePath = path.join(tempDir, 'test.txt');
    await fs.writeFile(filePath, 'Hello World');
    const content = await fs.readFile(filePath, 'utf-8');
    expect(content).toBe('Hello World');
  });

  it('cleans up', async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
    const exists = await fs.access(tempDir).then(() => true).catch(() => false);
    expect(exists).toBe(false);
  });
});

describe('Error Handling', () => {
  it('handles missing adapter', async () => {
    const { createPopulatedAdapterRegistry } = await import('../../src/core/adapters/index.js');
    const registry = createPopulatedAdapterRegistry();
    
    expect(() => registry.get('nonexistent')).toThrow();
  });

  it('returns all tool ids', async () => {
    const { createPopulatedAdapterRegistry } = await import('../../src/core/adapters/index.js');
    const registry = createPopulatedAdapterRegistry();
    
    const ids = registry.getRegisteredToolIds();
    expect(ids.length).toBe(24);
    expect(ids).toContain('opencode');
    expect(ids).toContain('cursor');
    expect(ids).toContain('claude');
    expect(ids).toContain('github-copilot');
  });
});
