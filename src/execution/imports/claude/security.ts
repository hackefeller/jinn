/**
 * Security utilities for Claude plugin import/mapping
 *
 * Provides path traversal prevention, validation, and security checks.
 */

import { resolve } from "path";

export class PathSecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PathSecurityError";
  }
}

/**
 * Validates and sanitizes a plugin path to prevent directory traversal attacks
 *
 * @param userInput - The user-provided path string
 * @param basePath - The base directory that must contain the resolved path
 * @returns The resolved safe path
 * @throws PathSecurityError if path is unsafe
 */
export function validatePluginPath(userInput: string, basePath: string): string {
  // Decode URL encoding first (prevents %2e%2e%2f bypasses)
  let decoded = userInput;
  try {
    decoded = decodeURIComponent(userInput);
    // Handle double encoding
    decoded = decodeURIComponent(decoded);
  } catch {
    // If decoding fails, use original
  }

  // Normalize to handle mixed path separators
  decoded = decoded.replace(/\\/g, "/");

  // Block dangerous patterns
  const blockedPatterns = [
    /^\.\./, // Starts with ..
    /\.\./, // Contains ..
    /[<>:"|?*]/, // Windows reserved characters
    /\0/, // Null bytes
  ];

  for (const pattern of blockedPatterns) {
    if (pattern.test(decoded)) {
      throw new PathSecurityError(`Path contains blocked pattern: ${decoded}`);
    }
  }

  // Resolve the path
  const resolved = resolve(basePath, decoded);

  // Ensure path is within base directory
  const baseWithSep = basePath.endsWith("/") ? basePath : basePath + "/";
  if (!resolved.startsWith(baseWithSep) && resolved !== basePath) {
    throw new PathSecurityError(`Path traversal detected: ${resolved} is outside ${basePath}`);
  }

  return resolved;
}

/**
 * Checks if a path is absolute (not allowed for security)
 */
export function isAbsolutePath(path: string): boolean {
  return path.startsWith("/") || /^[a-zA-Z]:[\\/]/.test(path);
}

/**
 * Sanitizes a component name for use as a namespace
 */
export function sanitizeNamespace(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Builds a namespaced component name
 */
export function buildNamespacedName(
  namespace: string,
  name: string,
  overrides: Record<string, string> = {},
): string {
  // Check for namespace override
  if (overrides[name]) {
    return overrides[name];
  }

  const sanitizedNamespace = sanitizeNamespace(namespace);
  const sanitizedName = sanitizeNamespace(name);

  return `${sanitizedNamespace}:${sanitizedName}`;
}

/**
 * Validates component names against include/exclude filters
 */
export function shouldIncludeComponent(
  name: string,
  include?: string[],
  exclude?: string[],
): boolean {
  // If include list provided, name must match
  if (include && include.length > 0) {
    const included = include.some((pattern) => matchPattern(name, pattern));
    if (!included) return false;
  }

  // If exclude list provided, name must not match
  if (exclude && exclude.length > 0) {
    const excluded = exclude.some((pattern) => matchPattern(name, pattern));
    if (excluded) return false;
  }

  return true;
}

/**
 * Matches a name against a pattern (supports * wildcard)
 */
function matchPattern(name: string, pattern: string): boolean {
  if (pattern === "*") return true;
  if (pattern.includes("*")) {
    const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
    return regex.test(name);
  }
  return name === pattern;
}
