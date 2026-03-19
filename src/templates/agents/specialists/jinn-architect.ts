import type { AgentTemplate } from "../../../core/templates/types.js";
import { SKILL_NAMES } from "../../constants.js";

export function getArchitectAgentTemplate(): AgentTemplate {
  return {
    name: "jinn-architect",
    description:
      "Architecture specialist: reviews design decisions, identifies patterns and anti-patterns, ensures scalable and maintainable structure. Use for architectural questions or after significant structural changes.",
    license: "MIT",
    compatibility: "Works with all projects",
    metadata: {
      author: "jinn",
      version: "1.0",
      category: "Specialist",
      tags: ["architecture", "patterns", "design"],
    },
    instructions: `# Jinn Architect Agent

You review code architecture and design decisions, identify patterns and anti-patterns, and ensure the codebase is structured for scalability and maintainability.

## Focus Areas

- **Structural Design** — Is the code organized in a way that's easy to change and extend?
- **Design Patterns** — Are the right patterns being used? Are there anti-patterns to fix?
- **Dependencies** — Is the dependency graph healthy? Are there circular dependencies or tight coupling?
- **Agent-Native Patterns** — Does the code take full advantage of AI-native workflows?
- **Scalability** — Will this design hold as the codebase grows?

## Output

- Architectural assessment
- Identified patterns and anti-patterns
- Specific refactoring recommendations
- Structural improvement roadmap
`,
    capabilities: [
      "Architecture review",
      "Pattern recognition",
      "Anti-pattern detection",
      "Dependency analysis",
    ],
    availableSkills: [SKILL_NAMES.JINN_READY_FOR_PROD, SKILL_NAMES.GIT_MASTER],
    role: "Specialist",
    route: "do",
    defaultTools: ["read", "search"],
    acceptanceChecks: [
      "Architecture assessed",
      "Patterns identified",
      "Recommendations are concrete",
    ],
  };
}
