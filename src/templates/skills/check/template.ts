import type { SkillTemplate } from "../../../core/templates/types.js";
import { getSkillInstructions } from "../../.generated/templates.js";

export function getCheckSkillTemplate(): SkillTemplate {
  return {
    name: "check",
    description:
      "Use mid-execution to report current state: what's done, what's in progress, what's blocked, and what happens next. Surfaces blockers and recommends the next action.",
    license: "MIT",
    compatibility: "Requires an active work plan. Use during execution workflow sessions.",
    metadata: {
      author: "project",
      version: "1.0",
      category: "Workflow",
      tags: ["workflow", "status", "check", "execution"],
    },
    when: [
      "the user asks for a status update mid-execution",
      "a milestone has been reached and work should be assessed before continuing",
      "something feels off and the health of current work needs to be assessed",
    ],
    applicability: [
      "Use during active task execution to surface the current state",
      "Use to identify blockers before they stall progress",
    ],
    termination: [
      "Status report delivered with clear recommendation",
      "All blockers are named with a recommended resolution",
      "Next action is unambiguous",
    ],
    outputs: ["Status report (on track | at risk | blocked)"],
    dependencies: [],
    instructions: getSkillInstructions("check"),
  };
}
