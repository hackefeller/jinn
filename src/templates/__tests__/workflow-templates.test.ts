import { describe, expect, it } from "bun:test";

import { getBuiltInCatalog } from "../../core/brain/catalog.js";
import { getDefaultSkillTemplates } from "../catalog.js";

describe("workflow skill templates", () => {
  it("v2 built-in catalog exposes skills with tags", () => {
    const catalog = getBuiltInCatalog();
    expect(catalog.skills.length).toBeGreaterThan(0);
    for (const skill of catalog.skills) {
      expect(skill.tags).toBeDefined();
      expect(skill.tags!.length).toBeGreaterThan(0);
    }
  });

  it("local review skill has non-empty instructions", () => {
    const review = getDefaultSkillTemplates().find((template) => template.name === "kernel-review")!;
    expect(review.instructions.length).toBeGreaterThan(0);
  });

  it("local review skill allows the core inspection toolchain", () => {
    const review = getDefaultSkillTemplates().find((template) => template.name === "kernel-review")!;
    expect(review.allowedTools).toEqual(["Read", "Grep", "Glob", "Bash"]);
  });

  it("local review skill no longer depends on Linear language", () => {
    const review = getDefaultSkillTemplates().find((template) => template.name === "kernel-review")!;
    expect(review.instructions.toLowerCase()).not.toContain("linear");
  });

  it("no longer ships the legacy change workflow skills", () => {
    const skillNames = new Set(getDefaultSkillTemplates().map((template) => template.name));

    expect(skillNames.has("kernel-change-propose")).toBe(false);
    expect(skillNames.has("kernel-change-explore")).toBe(false);
    expect(skillNames.has("kernel-change-apply")).toBe(false);
    expect(skillNames.has("kernel-change-archive")).toBe(false);
  });
});
