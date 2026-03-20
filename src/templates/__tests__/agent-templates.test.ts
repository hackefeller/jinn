import { describe, expect, it } from "bun:test";

import { SKILL_NAMES } from "../constants.js";
import { getDefaultAgentTemplates } from "../catalog.js";

import {
  ALL_AGENTS,
  getPlanAgentTemplate,
  getDoAgentTemplate,
  getCaptureAgentTemplate,
  getReviewAgentTemplate,
  getArchitectAgentTemplate,
  getDesignerAgentTemplate,
  getGitAgentTemplate,
  getSearchAgentTemplate,
} from "../agents/index.js";

const templates = [
  getPlanAgentTemplate(),
  getDoAgentTemplate(),
  getReviewAgentTemplate(),
  getArchitectAgentTemplate(),
  getDesignerAgentTemplate(),
  getGitAgentTemplate(),
  getSearchAgentTemplate(),
];

describe("agent templates", () => {
  it("expose available skills", () => {
    for (const template of templates) {
      expect(template.availableSkills?.length ?? 0).toBeGreaterThan(0);
    }
  });

  it("do not duplicate capability sections in instructions (added by formatAgent)", () => {
    for (const template of templates) {
      expect(template.instructions).not.toContain("## Available commands");
      expect(template.instructions).not.toContain("## Available skills");
    }
  });

  it("keeps review agent classified separately from orchestrators", () => {
    const review = getReviewAgentTemplate();
    expect(review.metadata?.category).toBe("Reviewer");
    expect(review.role).toBe("Reviewer");
  });

  it("assigns persona-aligned skills to specialist agents", () => {
    expect(getDesignerAgentTemplate().availableSkills).toEqual([
      SKILL_NAMES.DESIGN,
      SKILL_NAMES.CODE_QUALITY,
    ]);

    expect(getArchitectAgentTemplate().availableSkills).toEqual([
      SKILL_NAMES.CODE_QUALITY,
      SKILL_NAMES.CONVENTIONS,
      SKILL_NAMES.MAP_CODEBASE,
      SKILL_NAMES.JINN_READY_FOR_PROD,
    ]);

    expect(getGitAgentTemplate().availableSkills).toEqual([SKILL_NAMES.GIT_MASTER]);

    expect(getSearchAgentTemplate().availableSkills).toEqual([
      SKILL_NAMES.GIT_MASTER,
      SKILL_NAMES.MAP_CODEBASE,
      SKILL_NAMES.JINN_EXPLORE,
    ]);

    expect(getReviewAgentTemplate().availableSkills).toEqual([
      SKILL_NAMES.CODE_QUALITY,
      SKILL_NAMES.JINN_REVIEW,
      SKILL_NAMES.JINN_READY_FOR_PROD,
      SKILL_NAMES.GIT_MASTER,
    ]);
  });

  it("assigns orchestration skills to planning and execution agents", () => {
    expect(getPlanAgentTemplate().availableSkills).toEqual([
      SKILL_NAMES.GIT_MASTER,
      SKILL_NAMES.DESIGN,
      SKILL_NAMES.CONVENTIONS,
      SKILL_NAMES.MAP_CODEBASE,
      SKILL_NAMES.JINN_EXPLORE,
      SKILL_NAMES.JINN_PROPOSE,
      SKILL_NAMES.JINN_TRIAGE,
    ]);

    expect(getDoAgentTemplate().availableSkills).toEqual([
      SKILL_NAMES.GIT_MASTER,
      SKILL_NAMES.DESIGN,
      SKILL_NAMES.CODE_QUALITY,
      SKILL_NAMES.JINN_CHECK,
      SKILL_NAMES.JINN_REVIEW,
      SKILL_NAMES.JINN_APPLY,
      SKILL_NAMES.JINN_SYNC,
      SKILL_NAMES.JINN_TRIAGE,
      SKILL_NAMES.JINN_UNBLOCK,
      SKILL_NAMES.JINN_READY_FOR_PROD,
      SKILL_NAMES.PROJECT_INIT,
      SKILL_NAMES.BUILD,
      SKILL_NAMES.DEPLOY,
      SKILL_NAMES.CONVENTIONS,
      SKILL_NAMES.MAP_CODEBASE,
    ]);

    expect(getCaptureAgentTemplate().availableSkills).toEqual([
      SKILL_NAMES.GIT_MASTER,
      SKILL_NAMES.JINN_ARCHIVE,
    ]);
  });

  it("does not duplicate available skills within a template", () => {
    for (const template of templates) {
      expect(new Set(template.availableSkills).size).toBe(template.availableSkills?.length ?? 0);
    }
  });

  it("catalog ships every registered agent", () => {
    const defaultTemplates = getDefaultAgentTemplates();

    expect(defaultTemplates).toHaveLength(ALL_AGENTS.length);
    expect(defaultTemplates.map((template) => template.name)).toEqual(
      ALL_AGENTS.map((getAgentTemplate) => getAgentTemplate().name),
    );
  });
});
