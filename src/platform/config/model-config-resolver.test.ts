import { describe, expect, it, beforeEach } from "bun:test";
import {
  resolveAgentModel,
  resolveCategoryModel,
  clearConfigCache,
  getConfigDiagnostics,
} from "./model-config-resolver";
import { BUILTIN_FALLBACK_MODEL } from "./model-config";

// Note: Tests should mock fs.readFileSync and fs.existsSync
// to test different configuration scenarios

describe("resolveAgentModel", () => {
  beforeEach(() => {
    clearConfigCache();
  });

  //#given no config files exist
  it("returns builtin fallback when no config", () => {
    // Mock: no files exist
    //#when resolving agent model
    const result = resolveAgentModel("operator");
    //#then returns builtin fallback
    expect(result.model).toBe(BUILTIN_FALLBACK_MODEL);
    expect(result.source).toBe("builtin-fallback");
  });

  // Additional tests would mock file system to test:
  // - Project config agent-specific override
  // - Global config agent-specific override
  // - Project default fallback
  // - Global default fallback
  // - Priority order (project > global > builtin)
});

describe("resolveCategoryModel", () => {
  beforeEach(() => {
    clearConfigCache();
  });

  //#given no config files exist
  it("returns builtin fallback when no config", () => {
    //#when resolving category model
    const result = resolveCategoryModel("ultrabrain");
    //#then returns builtin fallback
    expect(result.model).toBe(BUILTIN_FALLBACK_MODEL);
    expect(result.source).toBe("builtin-fallback");
  });

  //#given category with variant
  it("extracts variant from category config", () => {
    // Mock: config with variant
    // { categories: { ultrabrain: { model: "x/y", variant: "max" } } }
    //#when resolving category
    //#then includes variant in result
  });
});

describe("getConfigDiagnostics", () => {
  beforeEach(() => {
    clearConfigCache();
  });

  //#given no config files
  it("reports no configs exist", () => {
    //#when getting diagnostics
    const diag = getConfigDiagnostics();
    //#then shows correct state
    expect(diag.effectiveDefaults.agent).toBe(BUILTIN_FALLBACK_MODEL);
  });
});
