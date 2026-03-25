import type { SkillTemplate } from "../../../core/templates/types.js";
import { SKILL_NAMES } from "../../constants.js";
import { getSkillInstructions } from "../../.generated/templates.js";

export function getApplySkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.APPLY,
    profile: "core",
    description:
      "Executes implementation work from Linear issues and sub-issues, following the plan and updating issue status as work progresses. Use when tasks are ready to implement, sub-issues need execution, or users say 'start on this', 'do this', or 'implement'.",
    license: "MIT",
    compatibility: "Requires the CLI and a configured Linear MCP server.",
    metadata: {
      author: "project",
      version: "1.0",
      category: "Workflow",
      tags: ["workflow", "apply", "linear", "execute"],
    },
    when: [
      "user wants to implement work from a Linear issue or sub-issue",
      "there is an unblocked Linear task ready for implementation",
      'user says "work on", "implement", "build", or "start" a Linear issue',
    ],
    applicability: [
      "Use when executing implementation tasks tracked in Linear",
      "Use when the plan is clear and the next unblocked issue is ready",
    ],
    termination: [
      "All sub-issues in scope are implemented and verified",
      "Linear issue status updated to reflect completion or blockers",
    ],
    outputs: ["Implemented code changes", "Updated Linear issue statuses"],
    dependencies: [SKILL_NAMES.EXPLORE, SKILL_NAMES.PROPOSE],
    disableModelInvocation: true,
    instructions: getSkillInstructions(SKILL_NAMES.APPLY),
  };
}
