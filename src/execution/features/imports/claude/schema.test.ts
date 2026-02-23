/**
 * ClaudeImportConfigSchema tests
 *
 * Tests the extended schema with new fields.
 */

import { describe, it, expect } from "bun:test";
import { ClaudeImportConfigSchema } from "../../../../platform/config/schema";

describe("ClaudeImportConfigSchema", () => {
  it("accepts valid full config", () => {
    //#given valid config with all fields
    const config = {
      enabled: true,
      strict: true,
      warnings: true,
      atomic: false,
      dry_run: true,
      path: "/plugin",
      namespace_prefix: "learnings",
      namespace_overrides: {
        "security-sentinel": "custom-security",
      },
      include: ["security-*", "performance-*"],
      exclude: ["*deprecated*"],
    };

    //#when validating
    const result = ClaudeImportConfigSchema.safeParse(config);

    //#then valid
    expect(result.success).toBe(true);
  });

  it("accepts minimal config", () => {
    //#given minimal config
    const config = {
      enabled: true,
    };

    //#when validating
    const result = ClaudeImportConfigSchema.safeParse(config);

    //#then valid
    expect(result.success).toBe(true);
  });

  it("accepts empty config", () => {
    //#given empty config
    const config = {};

    //#when validating
    const result = ClaudeImportConfigSchema.safeParse(config);

    //#then valid (all fields optional)
    expect(result.success).toBe(true);
  });

  it("validates boolean fields", () => {
    //#given invalid boolean
    const config = {
      enabled: "yes", // Should be boolean
    };

    //#when validating
    const result = ClaudeImportConfigSchema.safeParse(config);

    //#then invalid
    expect(result.success).toBe(false);
  });

  it("validates path is string", () => {
    //#given invalid path
    const config = {
      path: 123, // Should be string
    };

    //#when validating
    const result = ClaudeImportConfigSchema.safeParse(config);

    //#then invalid
    expect(result.success).toBe(false);
  });

  it("validates namespace_overrides is record", () => {
    //#given invalid overrides
    const config = {
      namespace_overrides: ["invalid"], // Should be record
    };

    //#when validating
    const result = ClaudeImportConfigSchema.safeParse(config);

    //#then invalid
    expect(result.success).toBe(false);
  });

  it("validates include is array of strings", () => {
    //#given valid include
    const config = {
      include: ["agent-*", "command-*"],
    };

    //#when validating
    const result = ClaudeImportConfigSchema.safeParse(config);

    //#then valid
    expect(result.success).toBe(true);
  });

  it("validates exclude is array of strings", () => {
    //#given valid exclude
    const config = {
      exclude: ["*test*", "*deprecated*"],
    };

    //#when validating
    const result = ClaudeImportConfigSchema.safeParse(config);

    //#then valid
    expect(result.success).toBe(true);
  });

  it("parses successfully with defaults for missing fields", () => {
    //#given partial config
    const config = {
      enabled: true,
      strict: true,
    };

    //#when parsing
    const result = ClaudeImportConfigSchema.safeParse(config);

    //#then success with partial data
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.enabled).toBe(true);
      expect(result.data.strict).toBe(true);
      // Other fields undefined
      expect(result.data.atomic).toBeUndefined();
      expect(result.data.dry_run).toBeUndefined();
    }
  });
});
