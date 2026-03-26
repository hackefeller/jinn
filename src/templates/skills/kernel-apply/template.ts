import type { SkillTemplate } from "../../../core/templates/types.js";
import { getSkillInstructions } from "../../.generated/templates.js";
import { SKILL_NAMES } from "../../constants.js";

export function getApplySkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.APPLY,
    profile: "core",
    description:
      "Executes implementation work from project issue files and sub-issues, following the plan and updating issue status as work progresses. Use when tasks are ready to implement, sub-issues need execution, or users say 'start on this', 'do this', or 'implement'.",
    license: "MIT",
    compatibility: "Requires the CLI and access to the project .kernel/ directory.",
    metadata: {
      author: "project",
      version: "1.0",
      category: "Workflow",
      tags: ["workflow", "apply", "tasks", "execute"],
    },
    when: [
      "user wants to implement work from an issue file or sub-issue",
      "there is an unblocked task file ready for implementation",
      'user says "work on", "implement", "build", or "start" an issue',
    ],
    applicability: [
      "Use when executing implementation tasks tracked in markdown issue files",
      "Use when the plan is clear and the next unblocked issue is ready",
    ],
    termination: [
      "All sub-issues in scope are implemented and verified",
      "Issue file status updated to reflect completion or blockers",
    ],
    outputs: ["Implemented code changes", "Updated issue file statuses"],
    dependencies: [SKILL_NAMES.EXPLORE, SKILL_NAMES.PROPOSE],
    disableModelInvocation: true,
    instructions: getSkillInstructions(SKILL_NAMES.APPLY),
  };
}
