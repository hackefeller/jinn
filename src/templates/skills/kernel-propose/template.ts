import type { SkillTemplate } from "../../../core/templates/types.js";
import { parseFrontmatter } from "../../../core/templates/frontmatter.js";
import proposeSkillMarkdown from "./instructions.md";
import { getSkillReferences } from "../../.generated/templates.js";

const { frontmatter, body } = parseFrontmatter<Omit<SkillTemplate, "instructions" | "references">>(
  proposeSkillMarkdown,
);

export function getProposeSkillTemplate(): SkillTemplate {
  return {
    references: getSkillReferences(
      frontmatter.name,
      "references/plan-template.md",
      "references/parent-issue-template.md",
      "references/phase-template.md",
      "references/task-template.md",
      "references/milestone-template.md",
      "references/sub-issue-template.md",
    ),
    ...frontmatter,
    instructions: body,
  };
}
