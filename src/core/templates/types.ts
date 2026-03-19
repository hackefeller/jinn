/**
 * Core template types for skills, commands, and agents.
 *
 * These types define the structure of jinn's content templates,
 * which are tool-agnostic and get formatted for specific AI tools by adapters.
 */

/**
 * Skill template - defines agent skill content
 * Skills are installed to <tool>/skills/<name>/SKILL.md
 */
export interface SkillTemplate {
  /** Unique skill identifier (e.g., 'jinn-git-master') */
  name: string;

  /** Human-readable description */
  description: string;

  /** Full instructions for the AI */
  instructions: string;

  /** License for the skill */
  license?: string;

  /** Compatibility notes */
  compatibility?: string;

  /** Additional metadata */
  metadata?: {
    author?: string;
    version?: string;
    category?: string;
    tags?: string[];
  };

  /** Natural-language trigger conditions — when this skill should be invoked */
  when?: string[];

  /** Conditions under which this skill applies */
  applicability?: string[];

  /** Deterministic completion signals — when this skill's intent is fulfilled */
  termination?: string[];

  /** Artifacts or results this skill produces */
  outputs?: string[];

  /** Other skill names this skill orchestrates or depends on */
  dependencies?: string[];

  /** Agent role category (e.g. 'Orchestration', 'Specialist', 'Reviewer') */
  role?: string;

  /** What this skill/agent is capable of when acting as an orchestrator */
  capabilities?: string[];

  /** Skills this skill/agent can reference or delegate to */
  availableSkills?: string[];

  /** Routing key for intent-based dispatch (e.g. 'plan', 'do', 'research') */
  route?: string;
}

/**
 * Agent template - special skill for reasoning entities that orchestrate workflows
 */
export interface AgentTemplate extends SkillTemplate {
  /** Default tools available to agent */
  defaultTools?: string[];

  /** Acceptance criteria for agent completion */
  acceptanceChecks?: string[];

  /** Additional prompt content */
  promptAppend?: string;
}
