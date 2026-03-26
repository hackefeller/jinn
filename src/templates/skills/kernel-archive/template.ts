import type { SkillTemplate } from "../../../core/templates/types.js";
import { getSkillInstructions } from "../../.generated/templates.js";
import { SKILL_NAMES } from "../../constants.js";

export function getArchiveSkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.ARCHIVE,
    profile: "extended",
    description:
      "Closes and cleans up completed project issue files and associated follow-up work. Use when a project milestone is done, stale work needs cleanup, or users ask to archive, close, or wrap up completed items.",
    license: "MIT",
    compatibility: "Requires the CLI and access to the project .kernel/ directory.",
    metadata: {
      author: "project",
      version: "1.0",
      category: "Workflow",
      tags: ["workflow", "archive", "tasks", "done"],
    },
    when: [
      "a project issue group or milestone is complete",
      "user wants to clean up or close finished work",
      'user says "wrap up", "close", "archive", or "done" for a project task group',
    ],
    applicability: [
      "Use when closing completed project issue groups and resolving remaining issues",
      "Use when surfacing follow-up work before archiving a project",
    ],
    termination: [
      "Project issue group marked complete",
      "All open issues resolved, deferred, or captured as follow-up",
    ],
    outputs: ["Completed project issue group", "Follow-up issue files for deferred work"],
    dependencies: [SKILL_NAMES.APPLY],
    disableModelInvocation: true,
    argumentHint: "project name or issue file path",
    instructions: getSkillInstructions(SKILL_NAMES.ARCHIVE),
  };
}
