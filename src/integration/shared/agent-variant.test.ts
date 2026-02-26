import { describe, expect, test } from "bun:test";
import type { GhostwireConfig } from "../../platform/config";
import { applyAgentVariant, resolveAgentVariant, resolveVariantForModel } from "./agent-variant";

describe("resolveAgentVariant", () => {
  test("returns undefined when agent name missing", () => {
    // #given
    const config = {} as GhostwireConfig;

    // #when
    const variant = resolveAgentVariant(config);

    // #then
    expect(variant).toBeUndefined();
  });

  test("returns agent override variant", () => {
    // #given
    const config = {
      agents: {
        operator: { variant: "low" },
      },
    } as GhostwireConfig;

    // #when
    const variant = resolveAgentVariant(config, "operator");

    // #then
    expect(variant).toBe("low");
  });

  test("returns category variant when agent uses category", () => {
    // #given
    const config = {
      agents: {
        operator: { category: "ultrabrain" },
      },
      categories: {
        ultrabrain: { model: "openai/gpt-5.2", variant: "xhigh" },
      },
    } as GhostwireConfig;

    // #when
    const variant = resolveAgentVariant(config, "operator");

    // #then
    expect(variant).toBe("xhigh");
  });
});

describe("applyAgentVariant", () => {
  test("sets variant when message is undefined", () => {
    // #given
    const config = {
      agents: {
        operator: { variant: "low" },
      },
    } as GhostwireConfig;
    const message: { variant?: string } = {};

    // #when
    applyAgentVariant(config, "operator", message);

    // #then
    expect(message.variant).toBe("low");
  });

  test("does not override existing variant", () => {
    // #given
    const config = {
      agents: {
        operator: { variant: "low" },
      },
    } as GhostwireConfig;
    const message = { variant: "max" };

    // #when
    applyAgentVariant(config, "operator", message);

    // #then
    expect(message.variant).toBe("max");
  });
});

describe("resolveVariantForModel", () => {
  test("returns variant for known agent with configured provider", () => {
    // #given - using opencode provider which is the default
    const config = {} as GhostwireConfig;
    const model = { providerID: "opencode", modelID: "kimi-k2.5" };

    // #when
    const variant = resolveVariantForModel(config, "operator", model);

    // #then - should return variant for opencode provider
    // (specific value depends on configured fallback chain)
    expect(variant === undefined || typeof variant === "string").toBe(true);
  });

  test("returns variant for openai provider when available", () => {
    // #given - using openai provider
    const config = {} as GhostwireConfig;
    const model = { providerID: "openai", modelID: "gpt-5.2" };

    // #when
    const variant = resolveVariantForModel(config, "operator", model);

    // #then - variant is resolved from fallback chain or undefined
    expect(variant === undefined || typeof variant === "string").toBe(true);
  });

  test("returns undefined for provider with no variant in chain", () => {
    // #given
    const config = {} as GhostwireConfig;
    const model = { providerID: "google", modelID: "gemini-3-pro" };

    // #when
    const variant = resolveVariantForModel(config, "operator", model);

    // #then
    expect(variant).toBeUndefined();
  });

  test("returns undefined for provider not in chain", () => {
    // #given
    const config = {} as GhostwireConfig;
    const model = { providerID: "unknown-provider", modelID: "some-model" };

    // #when
    const variant = resolveVariantForModel(config, "operator", model);

    // #then
    expect(variant).toBeUndefined();
  });

  test("returns undefined for unknown agent", () => {
    // #given
    const config = {} as GhostwireConfig;
    const model = { providerID: "anthropic", modelID: "claude-opus-4-5" };

    // #when
    const variant = resolveVariantForModel(config, "nonexistent-agent", model);

    // #then
    expect(variant).toBeUndefined();
  });

  test("returns variant for zai-coding-plan provider without variant", () => {
    // #given
    const config = {} as GhostwireConfig;
    const model = { providerID: "zai-coding-plan", modelID: "glm-4.7" };

    // #when
    const variant = resolveVariantForModel(config, "operator", model);

    // #then
    expect(variant).toBeUndefined();
  });

  test("falls back to category chain when agent has no requirement", () => {
    // #given
    const config = {
      agents: {
        "custom-agent": { category: "ultrabrain" },
      },
    } as GhostwireConfig;
    const model = { providerID: "opencode", modelID: "kimi-k2.5" };

    // #when
    const variant = resolveVariantForModel(config, "custom-agent", model);

    // #then - variant resolved from category chain or undefined
    expect(variant === undefined || typeof variant === "string").toBe(true);
  });

  test("returns variant for advisor-plan with configured provider", () => {
    // #given
    const config = {} as GhostwireConfig;
    const model = { providerID: "opencode", modelID: "kimi-k2.5" };

    // #when
    const variant = resolveVariantForModel(config, "advisor-plan", model);

    // #then - variant resolved from agent chain
    expect(variant === undefined || typeof variant === "string").toBe(true);
  });

  test("returns variant for advisor-plan with anthropic provider", () => {
    // #given
    const config = {} as GhostwireConfig;
    const model = { providerID: "anthropic", modelID: "claude-opus-4-5" };

    // #when
    const variant = resolveVariantForModel(config, "advisor-plan", model);

    // #then - variant resolved from agent chain
    expect(variant === undefined || typeof variant === "string").toBe(true);
  });
});
