/**
 * Security utilities tests for Claude plugin import
 *
 * Tests path validation, namespace building, and filtering.
 */

import { describe, it, expect } from "bun:test";
import {
  validatePluginPath,
  PathSecurityError,
  buildNamespacedName,
  sanitizeNamespace,
  shouldIncludeComponent,
} from "./security";

describe("validatePluginPath", () => {
  it("allows valid relative paths", () => {
    //#given valid relative paths
    const basePath = "/home/user/plugins";
    const validPaths = ["my-plugin", "./my-plugin", "company/plugin", "plugins/my-plugin"];

    //#when / #then
    for (const path of validPaths) {
      expect(() => validatePluginPath(path, basePath)).not.toThrow();
    }
  });

  it("rejects paths with directory traversal", () => {
    //#given malicious paths
    const basePath = "/home/user/plugins";
    const maliciousPaths = ["../evil", "plugin/../../../etc/passwd", "..%2f..%2fetc%2fpasswd"];

    //#when / #then
    for (const path of maliciousPaths) {
      expect(() => validatePluginPath(path, basePath)).toThrow(PathSecurityError);
    }
  });

  it("rejects null byte injection attempts", () => {
    //#given null byte in path
    const basePath = "/home/user/plugins";
    const maliciousPath = "plugin.json\u0000../../etc/passwd";

    //#when / #then
    expect(() => validatePluginPath(maliciousPath, basePath)).toThrow(PathSecurityError);
  });
});

describe("buildNamespacedName", () => {
  it("builds namespaced names correctly", () => {
    //#given namespace and name
    const namespace = "ghostwire";
    const name = "security-sentinel";

    //#when building namespaced name
    const result = buildNamespacedName(namespace, name);

    //#then
    expect(result).toBe("ghostwire:security-sentinel");
  });

  it("applies namespace overrides", () => {
    //#given namespace with override
    const namespace = "ghostwire";
    const name = "security-sentinel";
    const overrides = { "security-sentinel": "custom-security" };

    //#when building with override
    const result = buildNamespacedName(namespace, name, overrides);

    //#then override is applied
    expect(result).toBe("custom-security");
  });

  it("sanitizes special characters", () => {
    //#given name with special characters
    const namespace = "My Plugin!";
    const name = "Agent@Home#";

    //#when building namespaced name
    const result = buildNamespacedName(namespace, name);

    //#then special chars are sanitized
    expect(result).toBe("my-plugin:agent-home");
  });
});

describe("sanitizeNamespace", () => {
  it("converts to lowercase", () => {
    expect(sanitizeNamespace("MyPlugin")).toBe("myplugin");
  });

  it("replaces special chars with hyphens", () => {
    expect(sanitizeNamespace("my@plugin#test")).toBe("my-plugin-test");
  });

  it("removes leading/trailing hyphens", () => {
    expect(sanitizeNamespace("-my-plugin-")).toBe("my-plugin");
  });

  it("collapses multiple hyphens", () => {
    expect(sanitizeNamespace("my--plugin")).toBe("my-plugin");
  });
});

describe("shouldIncludeComponent", () => {
  it("includes all when no filters", () => {
    //#given no filters
    const name = "security-sentinel";

    //#when checking inclusion
    const result = shouldIncludeComponent(name);

    //#then included
    expect(result).toBe(true);
  });

  it("respects include filter", () => {
    //#given include filter
    const name = "security-sentinel";
    const include = ["security-*", "performance-*"];

    //#when checking inclusion
    const result = shouldIncludeComponent(name, include);

    //#then included (matches security-*)
    expect(result).toBe(true);
  });

  it("respects exclude filter", () => {
    //#given exclude filter
    const name = "security-sentinel";
    const exclude = ["security-*"];

    //#when checking exclusion
    const result = shouldIncludeComponent(name, undefined, exclude);

    //#then excluded
    expect(result).toBe(false);
  });

  it("exclude filters out even if include matches", () => {
    //#given both filters that match
    const name = "security-sentinel";
    const include = ["security-*"];
    const exclude = ["*sentinel"];

    //#when checking
    const result = shouldIncludeComponent(name, include, exclude);

    //#then excluded (exclude acts as final filter)
    expect(result).toBe(false);
  });

  it("supports wildcard patterns", () => {
    //#given wildcard pattern
    const include = ["*reviewer*"];

    //#when checking
    expect(shouldIncludeComponent("code-reviewer", include)).toBe(true);
    expect(shouldIncludeComponent("security-sentinel", include)).toBe(false);
  });
});
