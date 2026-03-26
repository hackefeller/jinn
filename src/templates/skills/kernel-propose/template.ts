import type { SkillTemplate } from "../../../core/templates/types.js";
import { getSkillInstructions } from "../../.generated/templates.js";
import { SKILL_NAMES } from "../../constants.js";

export function getProposeSkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.PROPOSE,
    profile: "core",
    description:
      "Turns a change request or product idea into a project issue set with seeded parent and child markdown files. Use when planning new work, when a user describes a feature or initiative that needs to be structured, or when users say 'plan this', 'create a project for', or 'break this down'.",
    license: "MIT",
    compatibility: "Requires the CLI and access to the project .kernel/ directory.",
    metadata: {
      author: "project",
      version: "1.0",
      category: "Workflow",
      tags: ["workflow", "propose", "tasks", "planning"],
    },
    when: [
      "user wants to plan new work or a new feature",
      "user describes a change request or product idea",
      "a new project or initiative needs to be structured into issue files",
    ],
    applicability: [
      "Use when turning a vague change request into structured markdown issue work",
      "Use when a project or initiative needs a proposal with seeded parent and child issues",
    ],
    termination: [
      "Parent issue file created with description and context",
      "Child issue files seeded for each workstream",
      "Sub-issues created for immediately actionable tasks",
    ],
    outputs: ["Parent issue file", "Seeded child issue files"],
    dependencies: [SKILL_NAMES.EXPLORE],
    argumentHint: "feature description or change request",
    instructions: getSkillInstructions(SKILL_NAMES.PROPOSE),
  };
}
