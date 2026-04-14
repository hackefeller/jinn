import { describe, expect, it } from "bun:test";

import { getDefaultAgentTemplates } from "../catalog.js";
import { AGENT_NAMES, SKILL_NAMES } from "../constants.js";

describe("agent templates", () => {
  const templates = getDefaultAgentTemplates();
  const byName = new Map(templates.map((template) => [template.name, template]));

  it("use kernel-prefixed agent identifiers", () => {
    expect(new Set(templates.map((template) => template.name))).toEqual(
      new Set([
        AGENT_NAMES.PLAN,
        AGENT_NAMES.DO,
        AGENT_NAMES.CAPTURE,
        AGENT_NAMES.REVIEW,
        AGENT_NAMES.ARCHITECT,
        AGENT_NAMES.DESIGNER,
        AGENT_NAMES.GIT,
        AGENT_NAMES.SEARCH,
      ]),
    );
  });

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
    const review = byName.get(AGENT_NAMES.REVIEW)!;
    expect(review.metadata?.category).toBe("Reviewer");
    expect(review.role).toBe("Reviewer");
  });

  it("assigns persona-aligned skills to specialist agents", () => {
    expect(byName.get(AGENT_NAMES.DESIGNER)?.availableSkills).toEqual([
      SKILL_NAMES.DESIGN,
      SKILL_NAMES.REVIEW,
    ]);

    expect(byName.get(AGENT_NAMES.ARCHITECT)?.availableSkills).toEqual([
      SKILL_NAMES.REVIEW,
      SKILL_NAMES.MAP_CODEBASE,
    ]);

    expect(byName.get(AGENT_NAMES.GIT)?.availableSkills).toEqual([SKILL_NAMES.GIT_MASTER]);

    expect(byName.get(AGENT_NAMES.SEARCH)?.availableSkills).toEqual([
      SKILL_NAMES.GIT_MASTER,
      SKILL_NAMES.MAP_CODEBASE,
      SKILL_NAMES.PROJECT_SETUP,
    ]);

    expect(byName.get(AGENT_NAMES.REVIEW)?.availableSkills).toEqual([
      SKILL_NAMES.REVIEW,
      SKILL_NAMES.MAP_CODEBASE,
      SKILL_NAMES.GIT_MASTER,
    ]);
  });

  it("assigns orchestration skills to planning and execution agents", () => {
    expect(byName.get(AGENT_NAMES.PLAN)?.availableSkills).toEqual([
      SKILL_NAMES.GIT_MASTER,
      SKILL_NAMES.MAP_CODEBASE,
      SKILL_NAMES.PROJECT_SETUP,
      SKILL_NAMES.REVIEW,
    ]);

    expect(byName.get(AGENT_NAMES.DO)?.availableSkills).toEqual([
      SKILL_NAMES.GIT_MASTER,
      SKILL_NAMES.REVIEW,
      SKILL_NAMES.PROJECT_INIT,
      SKILL_NAMES.BUILD,
      SKILL_NAMES.MAP_CODEBASE,
      SKILL_NAMES.PROJECT_SETUP,
    ]);

    expect(byName.get(AGENT_NAMES.CAPTURE)?.availableSkills).toEqual([
      SKILL_NAMES.GIT_MASTER,
      SKILL_NAMES.CLOSE,
    ]);
  });

  it("does not duplicate available skills within a template", () => {
    for (const template of templates) {
      expect(new Set(template.availableSkills).size).toBe(template.availableSkills?.length ?? 0);
    }
  });

  it("discovers every agent from source markdown", () => {
    expect(templates).toHaveLength(8);
    expect(templates.every((template) => template.kind === "agent")).toBe(true);
  });
});
