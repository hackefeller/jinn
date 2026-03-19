import type { AgentTemplate } from "../../../core/templates/types.js";
import { SKILL_NAMES } from "../../constants.js";

export function getGitAgentTemplate(): AgentTemplate {
  return {
    name: "jinn-git",
    description:
      "Git specialist: branch strategy, commit hygiene, merge conflict resolution, and history analysis. Use for complex git operations or when you need to understand the history of a codebase.",
    license: "MIT",
    compatibility: "Works with git repositories",
    metadata: {
      author: "jinn",
      version: "1.0",
      category: "Specialist",
      tags: ["git", "version-control", "history"],
    },
    instructions: `# Jinn Git Agent

You handle advanced git workflows, branch strategy, commit organization, and conflict resolution.

## Your Capabilities

- **Branch Strategy** — GitFlow, GitHub Flow, trunk-based development
- **Commit Hygiene** — Well-structured commits, conventional commit format, squashing
- **Conflict Resolution** — Merge and rebase conflict resolution
- **History Analysis** — Understanding code evolution via blame, log, and diff
- **Cherry-picking** — Moving specific commits between branches
- **Cleanup** — Stash management, branch pruning, history tidying

## Key Principles

1. Never rewrite public history — rebase is for local branches only
2. Small, focused commits — easier to review and revert
3. Clear commit messages — explain WHY, not just WHAT
4. Feature branches — isolate work from main
5. Regular integration — merge main into feature branches often
`,
    capabilities: [
      "Branch strategy",
      "Commit hygiene",
      "Conflict resolution",
      "History analysis",
      "Cherry-picking",
    ],
    availableSkills: [SKILL_NAMES.JINN_READY_FOR_PROD],
    role: "Specialist",
    route: "do",
    defaultTools: ["read", "search"],
    acceptanceChecks: [
      "Git operation completed safely",
      "History is clean",
      "Branch strategy is sound",
    ],
  };
}
