/**
 * Version utilities
 *
 * Version management and comparison helpers.
 */

import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/**
 * Get the current ghostwire version from package.json
 */
export function getGhostwireVersion(): string {
  try {
    const { version } = require('../../package.json');
    return version;
  } catch {
    return '0.0.0';
  }
}

/**
 * Compare two version strings
 * @returns -1 if v1 < v2, 0 if equal, 1 if v1 > v2
 */
export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;

    if (p1 < p2) return -1;
    if (p1 > p2) return 1;
  }

  return 0;
}

/**
 * Check if version1 is greater than version2
 */
export function isVersionGreater(v1: string, v2: string): boolean {
  return compareVersions(v1, v2) > 0;
}

/**
 * Check if version1 is less than version2
 */
export function isVersionLess(v1: string, v2: string): boolean {
  return compareVersions(v1, v2) < 0;
}

/**
 * Check if versions are equal
 */
export function isVersionEqual(v1: string, v2: string): boolean {
  return compareVersions(v1, v2) === 0;
}

/**
 * Check if a version satisfies a minimum requirement
 */
export function satisfiesMinVersion(version: string, minVersion: string): boolean {
  return compareVersions(version, minVersion) >= 0;
}

/**
 * Parse version into components
 */
export function parseVersion(version: string): {
  major: number;
  minor: number;
  patch: number;
  prerelease?: string;
} {
  const [main, prerelease] = version.split('-');
  const [major, minor, patch] = main.split('.').map(Number);

  return {
    major: major || 0,
    minor: minor || 0,
    patch: patch || 0,
    prerelease,
  };
}

/**
 * Format version from components
 */
export function formatVersion(major: number, minor: number, patch: number, prerelease?: string): string {
  let version = `${major}.${minor}.${patch}`;
  if (prerelease) {
    version += `-${prerelease}`;
  }
  return version;
}

/**
 * Increment major version
 */
export function incrementMajor(version: string): string {
  const { major } = parseVersion(version);
  return `${major + 1}.0.0`;
}

/**
 * Increment minor version
 */
export function incrementMinor(version: string): string {
  const { major, minor } = parseVersion(version);
  return `${major}.${minor + 1}.0`;
}

/**
 * Increment patch version
 */
export function incrementPatch(version: string): string {
  const { major, minor, patch } = parseVersion(version);
  return `${major}.${minor}.${patch + 1}`;
}
