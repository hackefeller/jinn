import { describe, it, expect } from "bun:test";
import { readdir, readFile } from "fs/promises";
import { join } from "path";
import {
  VALID_AGENT_IDS,
  VALID_CATEGORIES,
  VALID_COMMAND_NAMES,
  VALID_SKILL_NAMES,
  isValidAgentId,
  isValidCommandName,
  isValidSkillName,
  // Agent constants
  AGENT_PLANNER,
  AGENT_ADVISOR_PLAN,
  AGENT_ADVISOR_STRATEGY,
  AGENT_ADVISOR_ARCHITECTURE,
  AGENT_RESEARCHER_CODEBASE,
  AGENT_RESEARCHER_DATA,
  AGENT_RESEARCHER_DOCS,
  AGENT_RESEARCHER_GIT,
  AGENT_RESEARCHER_LEARNINGS,
  AGENT_RESEARCHER_PRACTICES,
  AGENT_RESEARCHER_REPO,
  AGENT_REVIEWER_RAILS,
  AGENT_REVIEWER_PYTHON,
  AGENT_REVIEWER_TYPESCRIPT,
  AGENT_REVIEWER_RAILS_DH,
  AGENT_REVIEWER_SECURITY,
  AGENT_REVIEWER_SIMPLICITY,
  AGENT_REVIEWER_RACES,
  AGENT_DESIGNER_BUILDER,
  AGENT_DESIGNER_FLOW,
  AGENT_DESIGNER_ITERATOR,
  AGENT_DESIGNER_SYNC,
  AGENT_VALIDATOR_AUDIT,
  AGENT_VALIDATOR_BUGS,
  AGENT_VALIDATOR_DEPLOYMENT,
  AGENT_WRITER_README,
  AGENT_WRITER_GEM,
  AGENT_EDITOR_STYLE,
  AGENT_OPERATOR,
  AGENT_EXECUTOR,
  AGENT_ORCHESTRATOR,
  AGENT_ANALYZER_DESIGN,
  AGENT_ANALYZER_MEDIA,
  AGENT_ANALYZER_PATTERNS,
  AGENT_ORACLE_PERFORMANCE,
  AGENT_GUARDIAN_DATA,
  AGENT_EXPERT_MIGRATIONS,
  AGENT_RESOLVER_PR,
  // Category constants
  CATEGORY_VISUAL_ENGINEERING,
  CATEGORY_ULTRABRAIN,
  CATEGORY_DEEP,
  CATEGORY_ARTISTRY,
  CATEGORY_QUICK,
  CATEGORY_UNSPECIFIED_LOW,
  CATEGORY_UNSPECIFIED_HIGH,
  CATEGORY_WRITING,
} from "../../../orchestration/agents/constants";

const COMMANDS_DIR = join(import.meta.dir, "commands");
const TEMPLATES_DIR = join(import.meta.dir, "templates");

// Constant mapping for resolving ${CONSTANT_NAME} references
// Key = constant name (e.g., "AGENT_RESEARCHER_CODEBASE"), Value = actual agent ID (e.g., "researcher-codebase")
const AGENT_CONSTANT_MAP: Record<string, string> = {
  "AGENT_PLANNER": AGENT_PLANNER,
  "AGENT_ADVISOR_PLAN": AGENT_ADVISOR_PLAN,
  "AGENT_ADVISOR_STRATEGY": AGENT_ADVISOR_STRATEGY,
  "AGENT_ADVISOR_ARCHITECTURE": AGENT_ADVISOR_ARCHITECTURE,
  "AGENT_RESEARCHER_CODEBASE": AGENT_RESEARCHER_CODEBASE,
  "AGENT_RESEARCHER_DATA": AGENT_RESEARCHER_DATA,
  "AGENT_RESEARCHER_DOCS": AGENT_RESEARCHER_DOCS,
  "AGENT_RESEARCHER_GIT": AGENT_RESEARCHER_GIT,
  "AGENT_RESEARCHER_LEARNINGS": AGENT_RESEARCHER_LEARNINGS,
  "AGENT_RESEARCHER_PRACTICES": AGENT_RESEARCHER_PRACTICES,
  "AGENT_RESEARCHER_REPO": AGENT_RESEARCHER_REPO,
  "AGENT_REVIEWER_RAILS": AGENT_REVIEWER_RAILS,
  "AGENT_REVIEWER_PYTHON": AGENT_REVIEWER_PYTHON,
  "AGENT_REVIEWER_TYPESCRIPT": AGENT_REVIEWER_TYPESCRIPT,
  "AGENT_REVIEWER_RAILS_DH": AGENT_REVIEWER_RAILS_DH,
  "AGENT_REVIEWER_SECURITY": AGENT_REVIEWER_SECURITY,
  "AGENT_REVIEWER_SIMPLICITY": AGENT_REVIEWER_SIMPLICITY,
  "AGENT_REVIEWER_RACES": AGENT_REVIEWER_RACES,
  "AGENT_DESIGNER_BUILDER": AGENT_DESIGNER_BUILDER,
  "AGENT_DESIGNER_FLOW": AGENT_DESIGNER_FLOW,
  "AGENT_DESIGNER_ITERATOR": AGENT_DESIGNER_ITERATOR,
  "AGENT_DESIGNER_SYNC": AGENT_DESIGNER_SYNC,
  "AGENT_VALIDATOR_AUDIT": AGENT_VALIDATOR_AUDIT,
  "AGENT_VALIDATOR_BUGS": AGENT_VALIDATOR_BUGS,
  "AGENT_VALIDATOR_DEPLOYMENT": AGENT_VALIDATOR_DEPLOYMENT,
  "AGENT_WRITER_README": AGENT_WRITER_README,
  "AGENT_WRITER_GEM": AGENT_WRITER_GEM,
  "AGENT_EDITOR_STYLE": AGENT_EDITOR_STYLE,
  "AGENT_OPERATOR": AGENT_OPERATOR,
  "AGENT_EXECUTOR": AGENT_EXECUTOR,
  "AGENT_ORCHESTRATOR": AGENT_ORCHESTRATOR,
  "AGENT_ANALYZER_DESIGN": AGENT_ANALYZER_DESIGN,
  "AGENT_ANALYZER_MEDIA": AGENT_ANALYZER_MEDIA,
  "AGENT_ANALYZER_PATTERNS": AGENT_ANALYZER_PATTERNS,
  "AGENT_ORACLE_PERFORMANCE": AGENT_ORACLE_PERFORMANCE,
  "AGENT_GUARDIAN_DATA": AGENT_GUARDIAN_DATA,
  "AGENT_EXPERT_MIGRATIONS": AGENT_EXPERT_MIGRATIONS,
  "AGENT_RESOLVER_PR": AGENT_RESOLVER_PR,
};

const CATEGORY_CONSTANT_MAP: Record<string, string> = {
  "CATEGORY_VISUAL_ENGINEERING": CATEGORY_VISUAL_ENGINEERING,
  "CATEGORY_ULTRABRAIN": CATEGORY_ULTRABRAIN,
  "CATEGORY_DEEP": CATEGORY_DEEP,
  "CATEGORY_ARTISTRY": CATEGORY_ARTISTRY,
  "CATEGORY_QUICK": CATEGORY_QUICK,
  "CATEGORY_UNSPECIFIED_LOW": CATEGORY_UNSPECIFIED_LOW,
  "CATEGORY_UNSPECIFIED_HIGH": CATEGORY_UNSPECIFIED_HIGH,
  "CATEGORY_WRITING": CATEGORY_WRITING,
};

/**
 * Resolve a constant reference like ${AGENT_PLANNER} to its actual value
 */
function resolveConstant(value: string): string {
  // Check if it's a constant reference like ${CONSTANT_NAME}
  const constantMatch = value.match(/^\$\{([^}]+)\}$/);
  if (constantMatch) {
    const constantName = constantMatch[1];
    // Try to find the constant value
    if (AGENT_CONSTANT_MAP[constantName]) {
      return AGENT_CONSTANT_MAP[constantName];
    }
    if (CATEGORY_CONSTANT_MAP[constantName]) {
      return CATEGORY_CONSTANT_MAP[constantName];
    }
  }
  return value;
}

/**
 * Extract all agent, category, command, and skill references from a file
 */
function extractReferences(content: string): {
  subagentTypes: { value: string; line: number }[];
  categories: { value: string; line: number }[];
  commands: { value: string; line: number }[];
  skills: { value: string; line: number }[];
} {
  const subagentTypes: { value: string; line: number }[] = [];
  const categories: { value: string; line: number }[] = [];
  const commands: { value: string; line: number }[] = [];
  const skills: { value: string; line: number }[] = [];

  const lines = content.split("\n");
  lines.forEach((line, index) => {
    const lineNum = index + 1;

    // Match subagent_type="value" or subagent_type='value'
    const subagentTypeRegex = /subagent_type\s*=\s*["']([^"']+)["']/g;
    let match;
    while ((match = subagentTypeRegex.exec(line)) !== null) {
      // Resolve constant references like ${AGENT_PLANNER}
      const resolvedValue = resolveConstant(match[1]);
      subagentTypes.push({ value: resolvedValue, line: lineNum });
    }

    // Match category: "value" or category: 'value' (YAML style) or category="value"
    const categoryRegex = /(?:category\s*:\s*|category\s*=\s*)["']([^"']+)["']/g;
    while ((match = categoryRegex.exec(line)) !== null) {
      // Resolve constant references like ${CATEGORY_ULTRABRAIN}
      const resolvedValue = resolveConstant(match[1]);
      categories.push({ value: resolvedValue, line: lineNum });
    }

    // Match command names (ghostwire:xxx)
    const commandRegex = /ghostwire:[a-z0-9:-]+/g;
    while ((match = commandRegex.exec(line)) !== null) {
      commands.push({ value: match[0], line: lineNum });
    }

    // Match skill names in load_skills: ["..."] or skills: ["..."]
    const skillRegex = /(?:load_skills|skills)\s*:\s*\[[^\]]*"([^"]+)"[^\]]*\]/g;
    while ((match = skillRegex.exec(line)) !== null) {
      skills.push({ value: match[1], line: lineNum });
    }
  });

  return { subagentTypes, categories, commands, skills };
}

/**
 * Get all TypeScript files in a directory recursively
 */
async function getTsFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getTsFiles(fullPath)));
    } else if (entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts")) {
      files.push(fullPath);
    }
  }

  return files;
}

describe("Agent Reference Validation", () => {
  it("commands/ must use only valid agent IDs in subagent_type", async () => {
    const files = await getTsFiles(COMMANDS_DIR);
    const errors: string[] = [];

    for (const file of files) {
      const content = await readFile(file, "utf-8");
      const { subagentTypes } = extractReferences(content);

      for (const { value, line } of subagentTypes) {
        if (!isValidAgentId(value)) {
          errors.push(`${file}:${line}: Invalid subagent_type="${value}"`);
        }
      }
    }

    expect(errors).toEqual([]);
  });

  it("templates/ must use only valid agent IDs in subagent_type", async () => {
    const files = await getTsFiles(TEMPLATES_DIR);
    const errors: string[] = [];

    for (const file of files) {
      const content = await readFile(file, "utf-8");
      const { subagentTypes } = extractReferences(content);

      for (const { value, line } of subagentTypes) {
        if (!isValidAgentId(value)) {
          errors.push(`${file}:${line}: Invalid subagent_type="${value}"`);
        }
      }
    }

    expect(errors).toEqual([]);
  });

  it("commands/ must use valid categories", async () => {
    const files = await getTsFiles(COMMANDS_DIR);
    const errors: string[] = [];

    for (const file of files) {
      const content = await readFile(file, "utf-8");
      const { categories } = extractReferences(content);

      for (const { value, line } of categories) {
        if (!VALID_CATEGORIES.includes(value as any)) {
          errors.push(`${file}:${line}: Invalid category="${value}"`);
        }
      }
    }

    expect(errors).toEqual([]);
  });

  it("templates/ must use valid categories", async () => {
    const files = await getTsFiles(TEMPLATES_DIR);
    const errors: string[] = [];

    for (const file of files) {
      const content = await readFile(file, "utf-8");
      const { categories } = extractReferences(content);

      for (const { value, line } of categories) {
        if (!VALID_CATEGORIES.includes(value as any)) {
          errors.push(`${file}:${line}: Invalid category="${value}"`);
        }
      }
    }

    expect(errors).toEqual([]);
  });

  it("commands/ must use valid command names", async () => {
    const files = await getTsFiles(COMMANDS_DIR);
    const errors: string[] = [];

    for (const file of files) {
      const content = await readFile(file, "utf-8");
      const { commands } = extractReferences(content);

      for (const { value, line } of commands) {
        if (!isValidCommandName(value)) {
          errors.push(`${file}:${line}: Invalid command="${value}"`);
        }
      }
    }

    expect(errors).toEqual([]);
  });

  it("templates/ must use valid command names", async () => {
    const files = await getTsFiles(TEMPLATES_DIR);
    const errors: string[] = [];

    for (const file of files) {
      const content = await readFile(file, "utf-8");
      const { commands } = extractReferences(content);

      for (const { value, line } of commands) {
        if (!isValidCommandName(value)) {
          errors.push(`${file}:${line}: Invalid command="${value}"`);
        }
      }
    }

    expect(errors).toEqual([]);
  });

  it("commands/ must use valid skill names", async () => {
    const files = await getTsFiles(COMMANDS_DIR);
    const errors: string[] = [];

    for (const file of files) {
      const content = await readFile(file, "utf-8");
      const { skills } = extractReferences(content);

      for (const { value, line } of skills) {
        if (!isValidSkillName(value)) {
          errors.push(`${file}:${line}: Invalid skill="${value}"`);
        }
      }
    }

    expect(errors).toEqual([]);
  });

  it("templates/ must use valid skill names", async () => {
    const files = await getTsFiles(TEMPLATES_DIR);
    const errors: string[] = [];

    for (const file of files) {
      const content = await readFile(file, "utf-8");
      const { skills } = extractReferences(content);

      for (const { value, line } of skills) {
        if (!isValidSkillName(value)) {
          errors.push(`${file}:${line}: Invalid skill="${value}"`);
        }
      }
    }

    expect(errors).toEqual([]);
  });
});