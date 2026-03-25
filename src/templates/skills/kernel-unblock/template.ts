import type { SkillTemplate } from "../../../core/templates/types.js";
import { SKILL_NAMES } from "../../constants.js";
import { getSkillInstructions } from "../../.generated/templates.js";

export function getUnblockSkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.UNBLOCK,
    profile: "extended",
    description:
      "Diagnoses blocked Linear issues and determines how to resolve them. Use when an issue is in Blocked status, implementation has stopped on a dependency, or a blockedBy relationship hasn't resolved — decides whether to resolve, defer, or split, and updates Linear.",
    license: "MIT",
    compatibility: "Requires the CLI and a configured Linear MCP server.",
    metadata: {
      author: "project",
      version: "1.0",
      category: "Workflow",
      tags: ["workflow", "unblock", "linear", "blocked"],
    },
    when: [
      "a Linear issue is in Blocked status",
      "implementation stopped due to a blocker",
      "a blockedBy dependency has not been resolved",
    ],
    applicability: [
      "Use to diagnose and resolve blocked Linear issues",
      "Use when a blocker must be classified and actioned before implementation can resume",
    ],
    termination: [
      "Blocker classified and resolution action taken",
      "Blocked issue transitioned to the correct new status",
      "Parent issue updated if timeline or scope is affected",
    ],
    outputs: [
      "Updated Linear issue status",
      "Comment explaining blocker resolution",
      "Unblock report",
    ],
    dependencies: [SKILL_NAMES.EXPLORE, SKILL_NAMES.SYNC],
    disableModelInvocation: true,
    argumentHint: "blocked issue URL or issue ID",
    instructions: getSkillInstructions(SKILL_NAMES.UNBLOCK),
  };
}
