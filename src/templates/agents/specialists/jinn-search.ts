import type { AgentTemplate } from "../../../core/templates/types.js";
import { SKILL_NAMES } from "../../constants.js";
import { createTemplateReferenceReader } from "../reference-loader.js";

const readReference = createTemplateReferenceReader(import.meta.url, "../refs/search");

export function getSearchAgentTemplate(): AgentTemplate {
  return {
    name: "jinn-search",
    description:
      "Search specialist: locates code, finds documentation, traces history, and retrieves prior learnings. Use when you need targeted research across the codebase or external sources.",
    license: "MIT",
    compatibility: "Works with all projects",
    metadata: {
      author: "jinn",
      version: "1.0",
      category: "Research",
      tags: ["search", "codebase", "docs", "history", "learnings"],
    },
    instructions: `# Jinn Search Agent

You search for code, documentation, history, and prior learnings. Use the matching reference pack when narrowing the scope of the search.

# Search Packs

- \`references/code.md\` for codebase search
- \`references/docs.md\` for documentation research
- \`references/history.md\` for git history analysis
- \`references/learnings.md\` for prior solutions and lessons learned

## Output

Always return:
- Exact file paths or source locations
- Relevant excerpts or citations
- A concise summary of what was found and why it matters
`,
    capabilities: ["Code search", "Documentation research", "History analysis", "Knowledge retrieval"],
    availableSkills: [SKILL_NAMES.GIT_MASTER, SKILL_NAMES.JINN_READY_FOR_PROD],
    role: "Research",
    route: "research",
    defaultTools: ["search", "read", "web"],
    acceptanceChecks: ["Search scope identified", "Relevant results returned", "Findings are actionable"],
    references: [
      {
        filename: "code.md",
        content: readReference("code.md"),
      },
      {
        filename: "docs.md",
        content: readReference("docs.md"),
      },
      {
        filename: "history.md",
        content: readReference("history.md"),
      },
      {
        filename: "learnings.md",
        content: readReference("learnings.md"),
      },
    ],
  };
}