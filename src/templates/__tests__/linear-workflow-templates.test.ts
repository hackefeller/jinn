import { describe, expect, it } from "bun:test";

import { getJinnApplySkillTemplate } from "../skills/workflow/jinn-apply.js";
import { getJinnArchiveSkillTemplate } from "../skills/workflow/jinn-archive.js";
import { getJinnExploreSkillTemplate } from "../skills/workflow/jinn-explore.js";
import { getJinnProposeSkillTemplate } from "../skills/workflow/jinn-propose.js";

const templates = [
  getJinnProposeSkillTemplate().instructions,
  getJinnExploreSkillTemplate().instructions,
  getJinnApplySkillTemplate().instructions,
  getJinnArchiveSkillTemplate().instructions,
];

describe("linear workflow templates", () => {
  it("reference Linear as the system of record", () => {
    for (const template of templates) {
      expect(template).toContain("Linear");
    }
  });

  it("do not depend on local spec artifacts", () => {
    for (const template of templates) {
      expect(template.includes("tasks.md")).toBe(false);
      expect(template.includes("spec.md")).toBe(false);
      expect(template.includes("openspec/changes")).toBe(false);
    }
  });
});
