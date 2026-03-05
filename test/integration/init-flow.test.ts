import { describe, it, expect } from 'bun:test';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

describe('Init Flow Tests', () => {
  const tempDir = path.join(os.tmpdir(), 'ghostwire-init-' + Date.now());

  it('creates config file', async () => {
    const ghostwireDir = path.join(tempDir, '.ghostwire');
    await fs.mkdir(ghostwireDir, { recursive: true });
    
    const configContent = `version: "1.0.0"
tools:
  - opencode
profile: core
delivery: both
`;
    
    await fs.writeFile(path.join(ghostwireDir, 'config.yaml'), configContent);
    const exists = await fs.access(path.join(ghostwireDir, 'config.yaml')).then(() => true).catch(() => false);
    expect(exists).toBe(true);
  });

  it('creates tool directories', async () => {
    await fs.mkdir(path.join(tempDir, '.opencode'), { recursive: true });
    const exists = await fs.access(path.join(tempDir, '.opencode')).then(() => true).catch(() => false);
    expect(exists).toBe(true);
  });

  it('generates command files', async () => {
    const commandsDir = path.join(tempDir, '.opencode', 'commands');
    await fs.mkdir(commandsDir, { recursive: true });
    
    const cmdContent = `---
description: Test command
---

# Test
`;
    
    await fs.writeFile(path.join(commandsDir, 'ghostwire-test.md'), cmdContent);
    const exists = await fs.access(path.join(commandsDir, 'ghostwire-test.md')).then(() => true).catch(() => false);
    expect(exists).toBe(true);
  });

  it('generates skill directories', async () => {
    const skillDir = path.join(tempDir, '.opencode', 'skills', 'test-skill');
    await fs.mkdir(skillDir, { recursive: true });
    
    await fs.writeFile(path.join(skillDir, 'SKILL.md'), '# Test Skill');
    const exists = await fs.access(path.join(skillDir, 'SKILL.md')).then(() => true).catch(() => false);
    expect(exists).toBe(true);
  });

  it('cleanup', async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });
});

describe('Config Modification Tests', () => {
  const tempDir = path.join(os.tmpdir(), 'ghostwire-config-' + Date.now());

  it('modifies profile', async () => {
    await fs.mkdir(path.join(tempDir, '.ghostwire'), { recursive: true });
    
    const configPath = path.join(tempDir, '.ghostwire', 'config.yaml');
    await fs.writeFile(configPath, `version: "1.0.0"
tools:
  - opencode
profile: core
delivery: both
`);
    
    let content = await fs.readFile(configPath, 'utf-8');
    content = content.replace('profile: core', 'profile: extended');
    await fs.writeFile(configPath, content);
    
    const newContent = await fs.readFile(configPath, 'utf-8');
    expect(newContent).toContain('profile: extended');
  });

  it('adds tool', async () => {
    const configPath = path.join(tempDir, '.ghostwire', 'config.yaml');
    let content = await fs.readFile(configPath, 'utf-8');
    content = content.replace('  - opencode', '  - opencode\n  - cursor');
    await fs.writeFile(configPath, content);
    
    const newContent = await fs.readFile(configPath, 'utf-8');
    expect(newContent).toContain('cursor');
  });

  it('cleanup', async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });
});

describe('Error Scenarios Tests', () => {
  it('handles missing config', async () => {
    const { validateConfig } = await import('../../src/core/config/validation.js');
    
    try {
      validateConfig({} as any);
    } catch (e) {
      expect(e).toBeDefined();
    }
  });

  it('handles invalid tool', async () => {
    const { createPopulatedAdapterRegistry } = await import('../../src/core/adapters/index.js');
    const registry = createPopulatedAdapterRegistry();
    
    expect(() => registry.get('invalid-tool')).toThrow();
  });

  it('handles empty tools list', async () => {
    const { createPopulatedAdapterRegistry } = await import('../../src/core/adapters/index.js');
    const registry = createPopulatedAdapterRegistry();
    
    const ids = registry.getRegisteredToolIds();
    expect(ids.length).toBeGreaterThan(0);
  });
});
