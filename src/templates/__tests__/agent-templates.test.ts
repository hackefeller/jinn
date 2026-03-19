import { describe, expect, it } from "bun:test";

import {
  getPlanAgentTemplate,
  getDoAgentTemplate,
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
});
