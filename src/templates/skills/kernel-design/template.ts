import type { SkillTemplate } from "../../../core/templates/types.js";
import { parseFrontmatter } from "../../../core/templates/frontmatter.js";
import designSkillMarkdown from "./instructions.md";
import {
  getSkillReferences,
} from "../../.generated/templates.js";

const { frontmatter, body } = parseFrontmatter<Omit<SkillTemplate, "instructions" | "references">>(
  designSkillMarkdown,
);

export function getDesignSkillTemplate(): SkillTemplate {
  return {
    references: getSkillReferences(
      frontmatter.name,
      "references/standards.md",
      "references/foundations.md",
      "references/motion.md",
      "references/components.md",
      "references/patterns.md",
      "references/chat.md"
    ),
    ...frontmatter,
    instructions: body,
  };
}
