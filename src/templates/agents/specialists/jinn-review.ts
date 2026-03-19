import type { AgentTemplate } from "../../../core/templates/types.js";
import { SKILL_NAMES } from "../../constants.js";
import { createTemplateReferenceReader } from "../reference-loader.js";

const readReviewReference = createTemplateReferenceReader(import.meta.url, "../refs/common");

export function getReviewAgentTemplate(): AgentTemplate {
  return {
    name: "jinn-review",
    description:
      "Quality reviewer: reviews completed work for correctness, security, performance, and code quality. Use after implementation is complete before merging or deploying.",
    license: "MIT",
    compatibility: "Works with all projects",
    metadata: {
      author: "jinn",
      version: "1.0",
      category: "Reviewer",
      tags: ["review", "quality", "security"],
    },
    instructions: `# Jinn Review Agent

You conduct comprehensive reviews of completed work, covering correctness, security, performance, and code quality.

Invoke \`jinn-review\` for the review protocol, findings format, and the approve / approve-with-changes / needs-rework recommendation. Load the matching language or domain reference pack before reviewing specialized areas.

## Reference Packs

- \`python.md\`, \`typescript.md\`, \`rails.md\`, \`rails-dh.md\` — language-specific patterns
- \`security.md\` — injection, auth, secrets, and OWASP concerns
- \`simplicity.md\` — complexity, coupling, and readability
- \`races.md\` — concurrency and race conditions
`,
    capabilities: ["Code review", "Security analysis", "Performance review", "Quality assessment"],
    availableSkills: [SKILL_NAMES.JINN_REVIEW, SKILL_NAMES.JINN_READY_FOR_PROD, SKILL_NAMES.JINN_SYNC, SKILL_NAMES.GIT_MASTER],
    role: "Reviewer",
    route: "review",
    defaultTools: ["read", "search"],
    acceptanceChecks: [
      "All dimensions reviewed",
      "Issues are prioritized",
      "Suggestions are actionable",
    ],
    references: [
      {
        filename: "python.md",
        content: readReviewReference("python.md"),
      },
      {
        filename: "typescript.md",
        content: readReviewReference("typescript.md"),
      },
      {
        filename: "rails.md",
        content: readReviewReference("rails.md"),
      },
      {
        filename: "rails-dh.md",
        content: readReviewReference("rails-dh.md"),
      },
      {
        filename: "security.md",
        content: readReviewReference("security.md"),
      },
      {
        filename: "simplicity.md",
        content: readReviewReference("simplicity.md"),
      },
      {
        filename: "races.md",
        content: readReviewReference("races.md"),
      },
    ],
  };
}
