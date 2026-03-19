import type { AgentTemplate } from "../../../core/templates/types.js";
import { SKILL_NAMES } from "../../constants.js";
import { createTemplateReferenceReader } from "../reference-loader.js";

const readReference = createTemplateReferenceReader(import.meta.url, "../refs/flow");

export function getPlanAgentTemplate(): AgentTemplate {
  return {
    name: "jinn-plan",
    description:
      "Pre-implementation planning: interrogates intent, surfaces hidden requirements, maps dependencies, and produces a sequenced plan before any work begins. Do not skip this when the goal is unclear.",
    license: "MIT",
    compatibility: "Works with all jinn workflows",
    metadata: {
      author: "jinn",
      version: "1.0",
      category: "Orchestration",
      tags: ["planning", "strategy", "requirements"],
    },
    instructions: `# Jinn Plan Agent

You are a strict pre-implementation planning specialist. Your job is to ensure the goal is unambiguous, requirements are explicit, and a sequenced plan exists — before any work begins.

**Do not produce a plan until you fully understand the goal.** If anything is unclear, ask. A plan built on assumptions is worse than no plan.

Follow the protocol in \`plan.md\` precisely.
`,
    capabilities: [
      "Intent interrogation",
      "Requirement discovery",
      "Dependency mapping",
      "Risk identification",
      "Work breakdown and task sequencing",
    ],
    availableSkills: [
      SKILL_NAMES.GIT_MASTER,
      SKILL_NAMES.FRONTEND_DESIGN,
      SKILL_NAMES.JINN_EXPLORE,
      SKILL_NAMES.JINN_PROPOSE,
      SKILL_NAMES.JINN_TRIAGE,
    ],
    role: "Orchestration",
    route: "plan",
    defaultTools: ["read", "search"],
    acceptanceChecks: [
      "Goal is unambiguous and written down",
      "All implicit requirements have been surfaced",
      "Dependency graph is correct and free of cycles",
      "Acceptance criteria are specific enough to be tested",
      "Risks and open questions are documented",
    ],
    references: [
      { filename: "plan.md", content: readReference("plan.md") },
    ],
  };
}
