import { describe, expect, it } from "bun:test";

import { getApplySkillTemplate } from "../skills/apply/template.js";
import { getArchiveSkillTemplate } from "../skills/archive/template.js";
import { getExploreSkillTemplate } from "../skills/explore/template.js";
import { getProposeSkillTemplate } from "../skills/propose/template.js";

const templates = [
  getProposeSkillTemplate().instructions,
  getExploreSkillTemplate().instructions,
  getApplySkillTemplate().instructions,
  getArchiveSkillTemplate().instructions,
];

describe("linear workflow templates", () => {
  it("reference Linear as the system of record", () => {
    for (const template of templates) {
      expect(template).toContain("Linear");
    }
  });

  it("do not depend on local planning artifacts", () => {
    for (const template of templates) {
      expect(template.includes("tasks.md")).toBe(false);
      expect(template.includes("spec.md")).toBe(false);
      expect(template.includes("openspec/changes")).toBe(false);
    }
  });
});
