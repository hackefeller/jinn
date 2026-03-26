import type { SkillTemplate } from "../../../core/templates/types.js";
import { getSkillInstructions } from "../../.generated/templates.js";
import { SKILL_NAMES } from "../../constants.js";

export function getTriageSkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.TRIAGE,
    profile: "extended",
    description:
      "Assesses and classifies incoming bugs, ad-hoc requests, and unplanned issues before work begins. Use when a new bug report arrives, an unstructured request needs sizing, or work needs to be placed into the correct position in the project issue hierarchy.",
    license: "MIT",
    compatibility: "Requires the CLI and access to the project .kernel/ directory.",
    metadata: {
      author: "project",
      version: "1.0",
      category: "Workflow",
      tags: ["workflow", "triage", "tasks", "intake"],
    },
    when: [
      "a bug report or ad-hoc request arrives outside the current plan",
      "user reports something broken or missing",
      "a new item needs to be assessed and placed into the issue hierarchy",
    ],
    applicability: [
      "Use to intake and correctly position new bugs or requests in the task board",
      "Use before implementation to ensure the item is properly scoped and sequenced",
    ],
    termination: [
      "Issue file created with correct parent_id and priority",
      "blocked_by / blocks relations set to maintain correct phase ordering",
      "Triage report delivered with issue file path and position in hierarchy",
    ],
    outputs: ["New issue file with parent_id, priority, and relations set", "Triage report"],
    dependencies: [SKILL_NAMES.EXPLORE, SKILL_NAMES.PROPOSE],
    argumentHint: "bug description, issue file path, or request summary",
    instructions: getSkillInstructions(SKILL_NAMES.TRIAGE),
  };
}
