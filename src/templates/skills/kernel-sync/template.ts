import type { SkillTemplate } from "../../../core/templates/types.js";
import { getSkillInstructions } from "../../.generated/templates.js";
import { SKILL_NAMES } from "../../constants.js";

export function getSyncSkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.SYNC,
    profile: "core",
    description:
      "Reconciles project issue files with what actually happened — updates stale in-progress issues, marks completed work done, and fills in missing board entries. Use when the task board has drifted from reality, work was completed without updates, or users ask to sync or clean up the board.",
    license: "MIT",
    compatibility: "Requires the CLI and access to the project .kernel/ directory.",
    metadata: {
      author: "project",
      version: "1.0",
      category: "Workflow",
      tags: ["workflow", "sync", "tasks", "reconcile"],
    },
    when: [
      'Issue files are stuck in "in-progress" with no recent activity',
      "work was completed without updating issue files",
      "the board state does not match the codebase",
      "before starting a new implementation session",
    ],
    applicability: [
      "Use when issue-file state has drifted from the actual state of the codebase",
      "Use to audit and reconcile stale, missing, or mis-classified issues",
    ],
    termination: [
      "All in-progress issues classified and transitioned correctly",
      "Undocumented work back-filled in the issue files",
      "Sync report delivered",
    ],
    outputs: [
      "Updated issue file statuses",
      "Back-filled issues for undocumented work",
      "Sync summary report",
    ],
    disableModelInvocation: true,
    dependencies: [],
    instructions: getSkillInstructions(SKILL_NAMES.SYNC),
  };
}
