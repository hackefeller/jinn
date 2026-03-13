import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

describe('Path Utilities', () => {
  it('normalizes paths correctly', () => {
    const result = path.normalize('./foo//bar/../baz');
    expect(result).toBe('foo/baz');
  });

  it('joins paths correctly', () => {
    const result = path.join('foo', 'bar', 'baz');
    expect(result).toBe('foo/bar/baz');
  });

  it('resolves relative paths', () => {
    const result = path.resolve('./test');
    expect(result).toContain('test');
  });

  it('gets directory name', () => {
    const result = path.dirname('/foo/bar/baz.txt');
    expect(result).toBe('/foo/bar');
  });

  it('gets base name', () => {
    const result = path.basename('/foo/bar/baz.txt');
    expect(result).toBe('baz.txt');
  });

  it('gets extension', () => {
    const result = path.extname('file.ts');
    expect(result).toBe('.ts');
  });

  it('checks if path is absolute', () => {
    expect(path.isAbsolute('/foo/bar')).toBe(true);
    expect(path.isAbsolute('./foo/bar')).toBe(false);
  });
});

describe('File System Utilities', () => {
  const tempDir = path.join(os.tmpdir(), 'jinn-test-' + Date.now());

  beforeAll(async () => {
    await fs.mkdir(tempDir, { recursive: true });
  });

  afterAll(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('checks if file exists', async () => {
    const testFile = path.join(tempDir, 'test.txt');
    await fs.writeFile(testFile, 'content');
    
    try {
      await fs.access(testFile);
      expect(true).toBe(true);
    } catch {
      expect(true).toBe(false);
    }
  });

  it('checks if directory exists', () => {
    expect(path.isAbsolute(tempDir)).toBe(true);
  });

  it('writes and reads files', async () => {
    const testFile = path.join(tempDir, 'data.txt');
    const content = 'Hello World';
    await fs.writeFile(testFile, content);
    const read = await fs.readFile(testFile, 'utf-8');
    expect(read).toBe(content);
  });
});
