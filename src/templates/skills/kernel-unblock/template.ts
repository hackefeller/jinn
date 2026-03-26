import type { SkillTemplate } from "../../../core/templates/types.js";
import { getSkillInstructions } from "../../.generated/templates.js";
import { SKILL_NAMES } from "../../constants.js";

export function getUnblockSkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.UNBLOCK,
    profile: "extended",
    description:
      "Diagnoses blocked project issues and determines how to resolve them. Use when an issue is in blocked status, implementation has stopped on a dependency, or a blocked_by relationship hasn't resolved — decides whether to resolve, defer, or split, and updates the issue file.",
    license: "MIT",
    compatibility: "Requires the CLI and access to the project .kernel/ directory.",
    metadata: {
      author: "project",
      version: "1.0",
      category: "Workflow",
      tags: ["workflow", "unblock", "tasks", "blocked"],
    },
    when: [
      "an issue file is in blocked status",
      "implementation stopped due to a blocker",
      "a blocked_by dependency has not been resolved",
    ],
    applicability: [
      "Use to diagnose and resolve blocked issue files",
      "Use when a blocker must be classified and actioned before implementation can resume",
    ],
    termination: [
      "Blocker classified and resolution action taken",
      "Blocked issue transitioned to the correct new status",
      "Parent issue updated if timeline or scope is affected",
    ],
    outputs: [
      "Updated issue file status",
      "Comment explaining blocker resolution",
      "Unblock report",
    ],
    dependencies: [SKILL_NAMES.EXPLORE, SKILL_NAMES.SYNC],
    disableModelInvocation: true,
    argumentHint: "blocked issue file path or issue ID",
    instructions: getSkillInstructions(SKILL_NAMES.UNBLOCK),
  };
}
