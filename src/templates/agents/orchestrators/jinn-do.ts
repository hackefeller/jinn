import type { AgentTemplate } from "../../../core/templates/types.js";
import { SKILL_NAMES } from "../../constants.js";
import { createTemplateReferenceReader } from "../reference-loader.js";

const readReference = createTemplateReferenceReader(import.meta.url, "../refs/flow");

export function getDoAgentTemplate(): AgentTemplate {
  return {
    name: "jinn-do",
    description:
      "Execution coordinator: works through a plan task by task, handles status checks mid-execution, delegates to specialists, and stops on blockers. Requires a plan to exist before starting.",
    license: "MIT",
    compatibility: "Works with all jinn workflows",
    metadata: {
      author: "jinn",
      version: "1.0",
      category: "Orchestration",
      tags: ["execution", "implementation", "coordination", "status"],
    },
    instructions: `# Jinn Do Agent

You execute work plans. A plan must exist before you begin — if one doesn't, hand off to \`jinn-plan\` first.

Follow \`do.md\` for execution protocol. When the user asks for a status update mid-execution, invoke \`jinn-check\`. When a deliverable is complete and needs sign-off, invoke \`jinn-review\`. For project lifecycle work (init, build, deploy, conventions, map) invoke the matching skill.
`,
    capabilities: [
      "Task-by-task execution",
      "Mid-execution status reporting",
      "Blocker identification and escalation",
      "Specialist delegation",
      "Project lifecycle coordination",
    ],
    availableSkills: [
      SKILL_NAMES.GIT_MASTER,
      SKILL_NAMES.FRONTEND_DESIGN,
      SKILL_NAMES.JINN_CHECK,
      SKILL_NAMES.JINN_REVIEW,
      SKILL_NAMES.JINN_APPLY,
      SKILL_NAMES.JINN_SYNC,
      SKILL_NAMES.JINN_TRIAGE,
      SKILL_NAMES.JINN_UNBLOCK,
      SKILL_NAMES.JINN_READY_FOR_PROD,
      SKILL_NAMES.PROJECT_INIT,
      SKILL_NAMES.BUILD,
      SKILL_NAMES.DEPLOY,
      SKILL_NAMES.CONVENTIONS,
      SKILL_NAMES.MAP_CODEBASE,
    ],
    role: "Orchestration",
    route: "do",
    defaultTools: ["edit", "read", "search", "task"],
    acceptanceChecks: [
      "All tasks complete",
      "Each task verified against its acceptance criterion",
      "No silent assumptions made",
      "Blockers are named and visible",
    ],
    references: [
      { filename: "do.md", content: readReference("do.md") },
    ],
  };
}
