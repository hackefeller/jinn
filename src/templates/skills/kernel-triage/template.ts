import type { SkillTemplate } from "../../../core/templates/types.js";
import { SKILL_NAMES } from "../../constants.js";
import { getSkillInstructions } from "../../.generated/templates.js";

export function getTriageSkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.TRIAGE,
    profile: "extended",
    description:
      "Assesses and classifies incoming bugs, ad-hoc requests, and unplanned issues before work begins. Use when a new bug report arrives, an unstructured request needs sizing, or work needs to be placed into the correct position in the Linear hierarchy.",
    license: "MIT",
    compatibility: "Requires the CLI and a configured Linear MCP server.",
    metadata: {
      author: "project",
      version: "1.0",
      category: "Workflow",
      tags: ["workflow", "triage", "linear", "intake"],
    },
    when: [
      "a bug report or ad-hoc request arrives outside the current plan",
      "user reports something broken or missing",
      "a new item needs to be assessed and placed into the Linear hierarchy",
    ],
    applicability: [
      "Use to intake and correctly position new bugs or requests in Linear",
      "Use before implementation to ensure the item is properly scoped and sequenced",
    ],
    termination: [
      "Issue created in Linear with correct parentId and priority",
      "blockedBy / blocks relations set to maintain correct phase ordering",
      "Triage report delivered with issue URL and position in hierarchy",
    ],
    outputs: ["New Linear issue with parentId, priority, and relations set", "Triage report"],
    dependencies: [SKILL_NAMES.EXPLORE, SKILL_NAMES.PROPOSE],
    argumentHint: "bug description, issue URL, or request summary",
    instructions: getSkillInstructions(SKILL_NAMES.TRIAGE),
  };
}
