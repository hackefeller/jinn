import type { SkillTemplate } from "../../../core/templates/types.js";
import { getSkillInstructions } from "../../.generated/templates.js";
import { SKILL_NAMES } from "../../constants.js";

export function getExploreSkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.EXPLORE,
    profile: "core",
    description:
      "Investigates tradeoffs, risks, and missing context inside an existing project issue or issue group. Use when planning work that needs deeper investigation, technical decisions are unclear, or users ask to explore options before committing to an approach.",
    license: "MIT",
    compatibility: "Requires the CLI and access to the project .kernel/ directory.",
    metadata: {
      author: "project",
      version: "1.0",
      category: "Workflow",
      tags: ["workflow", "explore", "tasks", "investigation"],
    },
    when: [
      "user wants to investigate tradeoffs or risks before implementing",
      "there is missing context or open decisions in an issue file or project group",
      "user needs to explore options without committing to implementation",
    ],
    applicability: [
      "Use when exploring tradeoffs, risks, or dependencies in existing issue-file work",
      "Use before implementation when context or direction is unclear",
    ],
    termination: [
      "Options, risks, and open decisions documented in the issue file",
      "Recommendation or decision written back to the project task record",
    ],
    outputs: [
      "Updated issue file with decisions",
      "Risk and tradeoff analysis",
    ],
    dependencies: [],
    argumentHint: "issue file path, issue ID, or topic to investigate",
    instructions: getSkillInstructions(SKILL_NAMES.EXPLORE),
  };
}
