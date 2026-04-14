import { describe, expect, it } from "bun:test";
import { loadTemplateRegistry } from "../index.js";
import { resolveCatalog } from "../resolver.js";

describe("template registry", () => {
  const registry = loadTemplateRegistry();

  it("discovers skills, agents, and commands from disk", () => {
    expect(registry.skills.some((template) => template.name === "kernel-review")).toBe(true);
    expect(registry.agents.some((template) => template.name === "kernel-plan")).toBe(true);
    expect(registry.commands.some((template) => template.name === "kernel-work-plan")).toBe(true);
  });

  it("resolves catalog with all templates", () => {
    const catalog = resolveCatalog(registry);
    expect(catalog.skills.length).toBeGreaterThan(0);
    expect(catalog.agents.length).toBeGreaterThan(0);
    expect(catalog.commands.length).toBeGreaterThan(0);
  });
});
