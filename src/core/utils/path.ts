/**
 * Path utilities
 *
 * Cross-platform path manipulation helpers.
 */

import * as path from 'path';

/**
 * Normalize a file path
 */
export function normalizePath(filePath: string): string {
  return path.normalize(filePath);
}

/**
 * Join path segments
 */
export function joinPaths(...segments: string[]): string {
  return path.join(...segments);
}

/**
 * Get relative path from one location to another
 */
export function relativePath(from: string, to: string): string {
  return path.relative(from, to);
}

/**
 * Get the current working directory (project root)
 */
export function getProjectRoot(): string {
  return process.cwd();
}

/**
 * Get directory name from path
 */
export function getDirName(filePath: string): string {
  return path.dirname(filePath);
}

/**
 * Get base name from path
 */
export function getBaseName(filePath: string, ext?: string): string {
  return path.basename(filePath, ext);
}

/**
 * Get file extension
 */
export function getExtension(filePath: string): string {
  return path.extname(filePath);
}

/**
 * Check if path is absolute
 */
export function isAbsolutePath(filePath: string): boolean {
  return path.isAbsolute(filePath);
}

/**
 * Resolve path segments to absolute path
 */
export function resolvePath(...segments: string[]): string {
  return path.resolve(...segments);
}

/**
 * Get parent directory
 */
export function getParentDir(filePath: string): string {
  return path.dirname(filePath);
}

/**
 * Add extension to path if not present
 */
export function ensureExtension(filePath: string, ext: string): string {
  const currentExt = path.extname(filePath);
  if (currentExt === ext) {
    return filePath;
  }
  return filePath + ext;
}

/**
 * Remove extension from path
 */
export function removeExtension(filePath: string): string {
  const ext = path.extname(filePath);
  if (!ext) {
    return filePath;
  }
  return filePath.slice(0, -ext.length);
}

/**
 * Convert to kebab-case
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Convert to snake_case
 */
export function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

/**
 * Convert to camelCase
 */
export function toCamelCase(str: string): string {
  return str
    .replace(/(?:^|[-_\s]+)([a-zA-Z])/g, (_, char) => char.toUpperCase())
    .replace(/^[A-Z]/, (char) => char.toLowerCase());
}
