/**
 * Hook Translator Tests
 */

import { describe, it, expect } from "bun:test";
import {
  getHookMapping,
  isHookFullyMapped,
  getUnmappedHooks,
  getMappingStats,
  translateHookContext,
  validateClaudeHookConfig,
  generateHookReport,
  HOOK_MAPPINGS,
} from "./hook-translator";

describe("Hook Translation", () => {
  it("returns mapping for known hooks", () => {
    //#given known hook
    const mapping = getHookMapping("PreToolUse");

    //#then mapping found
    expect(mapping).toBeDefined();
    expect(mapping?.claudeHook).toBe("PreToolUse");
    expect(mapping?.openCodeHook).toBe("tool.execute.before");
    expect(mapping?.status).toBe("mapped");
  });

  it("returns undefined for unknown hooks", () => {
    //#given unknown hook
    const mapping = getHookMapping("UnknownHook" as any);

    //#then undefined
    expect(mapping).toBeUndefined();
  });

  it("identifies fully mapped hooks", () => {
    //#given mapped hook
    expect(isHookFullyMapped("PreToolUse")).toBe(true);
    expect(isHookFullyMapped("PostToolUse")).toBe(true);

    //#given partial hook
    expect(isHookFullyMapped("PreCompact")).toBe(false);
  });

  it("returns unmapped hooks list", () => {
    //#when getting unmapped hooks
    const unmapped = getUnmappedHooks();

    //#then array (may be empty if all mapped)
    expect(Array.isArray(unmapped)).toBe(true);
  });

  it("provides accurate mapping stats", () => {
    //#when getting stats
    const stats = getMappingStats();

    //#then accurate
    expect(stats.total).toBe(HOOK_MAPPINGS.length);
    expect(stats.mapped).toBeGreaterThanOrEqual(0);
    expect(stats.partial).toBeGreaterThanOrEqual(0);
    expect(stats.notMapped).toBeGreaterThanOrEqual(0);
    expect(stats.mapped + stats.partial + stats.notMapped).toBe(stats.total);
  });

  it("translates hook contexts", () => {
    //#given PreToolUse context
    const context = { toolName: "test", input: { arg: 1 } };

    //#when translating
    const translated = translateHookContext("PreToolUse", context);

    //#then translated
    expect(translated).toBeDefined();
    expect((translated as any).toolName).toBe("test");
    expect((translated as any).timestamp).toBeDefined();
  });

  it("returns null for unmapped hooks", () => {
    //#when translating unknown hook
    const result = translateHookContext("UnknownHook" as any, {});

    //#then null
    expect(result).toBeNull();
  });

  it("validates hook configurations", () => {
    //#given valid config
    const valid = validateClaudeHookConfig("PreToolUse", {});

    //#then valid
    expect(valid.valid).toBe(true);
    expect(valid.errors).toHaveLength(0);
  });

  it("detects unknown hooks in validation", () => {
    //#given unknown hook
    const result = validateClaudeHookConfig("UnknownHook" as any, {});

    //#then invalid
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Unknown Claude hook: UnknownHook");
  });

  it("warns about partial mappings", () => {
    //#given partial hook
    const result = validateClaudeHookConfig("PreCompact", {});

    //#then warning
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain("partial compatibility");
  });

  it("generates hook report", () => {
    //#when generating report
    const report = generateHookReport();

    //#then report generated
    expect(report).toContain("Claude Code → OpenCode Hook Translation Report");
    expect(report).toContain("Total Hooks:");
    expect(report).toContain("PreToolUse");
  });
});
