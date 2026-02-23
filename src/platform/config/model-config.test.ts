import { describe, expect, it } from "bun:test";
import {
  ModelsConfigSchema,
  BUILTIN_FALLBACK_MODEL,
  DEFAULT_MODELS_CONFIG,
} from "./model-config";

describe("ModelsConfigSchema", () => {
  //#given valid model ID format
  it("validates provider/model format", () => {
    //#when parsing valid model ID
    const result = ModelsConfigSchema.safeParse({
      agents: { operator: "opencode/kimi-k2.5" },
    });
    //#then succeeds
    expect(result.success).toBe(true);
  });

  //#given invalid model ID format
  it("rejects model without provider", () => {
    //#when parsing model without slash
    const result = ModelsConfigSchema.safeParse({
      agents: { operator: "kimi-k2.5" },
    });
    //#then fails with format error
    expect(result.success).toBe(false);
  });

  //#given category with variant
  it("validates category with variant object", () => {
    //#when parsing category with variant
    const result = ModelsConfigSchema.safeParse({
      categories: {
        ultrabrain: { model: "opencode/kimi-k2.5", variant: "max" },
      },
    });
    //#then succeeds
    expect(result.success).toBe(true);
  });

  //#given category as string
  it("validates category as simple string", () => {
    //#when parsing category as string
    const result = ModelsConfigSchema.safeParse({
      categories: { quick: "opencode/kimi-k2.5" },
    });
    //#then succeeds
    expect(result.success).toBe(true);
  });

  //#given invalid agent name
  it("rejects unknown agent names", () => {
    //#when parsing with invalid agent
    const result = ModelsConfigSchema.safeParse({
      agents: { "unknown-agent": "opencode/kimi-k2.5" },
    });
    //#then fails
    expect(result.success).toBe(false);
  });
});

describe("DEFAULT_MODELS_CONFIG", () => {
  //#given default configuration
  it("validates against schema", () => {
    //#when parsing default config
    const result = ModelsConfigSchema.safeParse(DEFAULT_MODELS_CONFIG);
    //#then succeeds
    expect(result.success).toBe(true);
  });

  //#given default config
  it("has all configurable agents", () => {
    //#when checking agents
    const agents = DEFAULT_MODELS_CONFIG.agents;
    //#then all expected agents present
    expect(agents?.operator).toBe("opencode/kimi-k2.5");
    expect(agents?.planner).toBe("opencode/kimi-k2.5");
    expect(agents?.["analyzer-media"]).toBe("google/gemini-3-flash");
  });

  //#given default config
  it("has all configurable categories", () => {
    //#when checking categories
    const categories = DEFAULT_MODELS_CONFIG.categories;
    //#then all expected categories present
    expect(categories?.ultrabrain).toEqual({
      model: "opencode/kimi-k2.5",
      variant: "max",
    });
    expect(categories?.deep).toEqual({
      model: "opencode/kimi-k2.5",
      variant: "medium",
    });
  });
});

describe("BUILTIN_FALLBACK_MODEL", () => {
  //#given builtin fallback
  it("is opencode/kimi-k2.5", () => {
    //#when checking value
    expect(BUILTIN_FALLBACK_MODEL).toBe("opencode/kimi-k2.5");
  });
});
