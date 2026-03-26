import { describe, expect, it } from "bun:test";

import { getApplySkillTemplate } from "../skills/kernel-apply/template.js";
import { getArchiveSkillTemplate } from "../skills/kernel-archive/template.js";
import { getBoardSkillTemplate } from "../skills/kernel-board/template.js";
import { getExploreSkillTemplate } from "../skills/kernel-explore/template.js";
import { getProposeSkillTemplate } from "../skills/kernel-propose/template.js";
import { getReviewSkillTemplate } from "../skills/kernel-review/template.js";
import { getSyncSkillTemplate } from "../skills/kernel-sync/template.js";
import { getTriageSkillTemplate } from "../skills/kernel-triage/template.js";
import { getUnblockSkillTemplate } from "../skills/kernel-unblock/template.js";

const templates = [
  getProposeSkillTemplate().instructions,
  getExploreSkillTemplate().instructions,
  getApplySkillTemplate().instructions,
  getBoardSkillTemplate().instructions,
  getArchiveSkillTemplate().instructions,
  getTriageSkillTemplate().instructions,
  getSyncSkillTemplate().instructions,
  getUnblockSkillTemplate().instructions,
  getReviewSkillTemplate().instructions,
];

describe("workflow issue templates", () => {
  it("reference the project task directory", () => {
    for (const template of templates) {
      expect(template).toContain(".kernel/");
    }
  });

  it("do not depend on Linear MCP patterns or legacy planning artifacts", () => {
    for (const template of templates) {
      expect(template.includes("mcp_linear")).toBe(false);
      expect(template.includes("tasks.md")).toBe(false);
      expect(template.includes("spec.md")).toBe(false);
      expect(template.includes("openspec/changes")).toBe(false);
    }
  });

  it("describe issue-file operations explicitly", () => {
    expect(getProposeSkillTemplate().outputs?.join(" ") ?? "").toContain("issue file");
    expect(getApplySkillTemplate().instructions).toContain("state: todo");
    expect(getBoardSkillTemplate().instructions).toContain(".kernel/BOARD.md");
  });
});
