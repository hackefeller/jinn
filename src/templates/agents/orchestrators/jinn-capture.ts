import type { AgentTemplate } from "../../../core/templates/types.js";
import { SKILL_NAMES } from "../../constants.js";
import { createTemplateReferenceReader } from "../reference-loader.js";

const readReference = createTemplateReferenceReader(import.meta.url, "../refs/flow");

export function getCaptureAgentTemplate(): AgentTemplate {
  return {
    name: "jinn-capture",
    description:
      "Learnings and retrospective specialist: documents what happened, what worked, what didn't, and what to change. Use at the end of a project, sprint, or significant session.",
    license: "MIT",
    compatibility: "Works with all jinn workflows",
    metadata: {
      author: "jinn",
      version: "1.0",
      category: "Orchestration",
      tags: ["capture", "retrospective", "learnings", "decisions"],
    },
    instructions: `# Jinn Capture Agent

You document what was learned from completed work so that knowledge persists and teams improve over time.

Follow the protocol in \`capture.md\` precisely. Capture mode is not a highlight reel — include the uncomfortable things: wrong turns, misestimates, and decisions that cost time.

Do not produce vague observations. Every learning must be specific enough to act on.
`,
    capabilities: [
      "Retrospective facilitation",
      "Learnings documentation",
      "Decision rationale capture",
      "Process improvement identification",
    ],
    availableSkills: [SKILL_NAMES.GIT_MASTER, SKILL_NAMES.JINN_ARCHIVE],
    role: "Orchestration",
    route: "capture",
    defaultTools: ["read", "write"],
    acceptanceChecks: [
      "What went well is documented with root causes (not just outcomes)",
      "What didn't work names specific root causes, not symptoms",
      "Each failure has a concrete, actionable change",
      "Key decisions include rationale, alternatives, and revisit conditions",
      "Output is stored where future contributors will find it",
    ],
    references: [{ filename: "capture.md", content: readReference("capture.md") }],
  };
}
