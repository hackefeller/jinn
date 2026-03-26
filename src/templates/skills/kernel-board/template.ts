import type { SkillTemplate } from "../../../core/templates/types.js";
import { getSkillInstructions } from "../../.generated/templates.js";
import { SKILL_NAMES } from "../../constants.js";

export function getBoardSkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.BOARD,
    profile: "core",
    description:
      "Generates and refreshes the project task board from markdown issue files. Use when the board needs to be rebuilt, issue states changed, or users ask to see the current work queue without opening individual files.",
    license: "MIT",
    compatibility: "Requires access to the project .kernel/ directory.",
    metadata: {
      author: "project",
      version: "1.0",
      category: "Workflow",
      tags: ["workflow", "board", "tasks", "markdown"],
    },
    when: [
      "the task board needs to be regenerated from issue files",
      "issue states, priorities, or relations have changed",
      "the user asks for a current board view of the project",
    ],
    applicability: [
      "Use to rebuild the canonical board from .kernel/issues/*.md",
      "Use after triage, apply, archive, or sync changes issue state",
    ],
    termination: [
      ".kernel/BOARD.md reflects the current issue files",
      "Blocked, in-progress, todo, done, and cancelled groups are current",
    ],
    outputs: ["Refreshed .kernel/BOARD.md", "Grouped task board markdown"],
    dependencies: [],
    disableModelInvocation: true,
    instructions: getSkillInstructions(SKILL_NAMES.BOARD),
  };
}