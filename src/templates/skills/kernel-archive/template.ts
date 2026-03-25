import type { SkillTemplate } from "../../../core/templates/types.js";
import { SKILL_NAMES } from "../../constants.js";
import { getSkillInstructions } from "../../.generated/templates.js";

export function getArchiveSkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.ARCHIVE,
    profile: "extended",
    description:
      "Closes and cleans up completed Linear projects, issues, and associated follow-up work. Use when a project milestone is done, stale work needs cleanup, or users ask to archive, close, or wrap up completed items.",
    license: "MIT",
    compatibility: "Requires the CLI and a configured Linear MCP server.",
    metadata: {
      author: "project",
      version: "1.0",
      category: "Workflow",
      tags: ["workflow", "archive", "linear", "done"],
    },
    when: [
      "a Linear project or milestone is complete",
      "user wants to clean up or close finished work",
      'user says "wrap up", "close", "archive", or "done" for a Linear project',
    ],
    applicability: [
      "Use when closing completed Linear projects and resolving remaining issues",
      "Use when surfacing follow-up work before archiving a project",
    ],
    termination: [
      "Linear project marked complete",
      "All open issues resolved, deferred, or captured as follow-up",
    ],
    outputs: ["Completed Linear project", "Follow-up issues for deferred work"],
    dependencies: [SKILL_NAMES.APPLY],
    disableModelInvocation: true,
    argumentHint: "project name or Linear project URL",
    instructions: getSkillInstructions(SKILL_NAMES.ARCHIVE),
  };
}
