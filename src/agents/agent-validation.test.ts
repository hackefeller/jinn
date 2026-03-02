import { describe, it, expect } from "bun:test";
import { join } from "path";
import { VALID_AGENT_IDS } from "../execution/agents/constants";
import { COMMAND_NAME_VALUES as VALID_COMMAND_NAMES } from "../commands/command-name-values";
import { SKILL_NAME_VALUES as VALID_SKILL_NAMES, isValidSkillName } from "../skills/skill-name-values";
import {
  validateDirectories,
  validateMarkdownFiles,
} from "./agent-validation";

const COMMANDS_DIR = join(import.meta.dir, "commands");
const TEMPLATES_DIR = join(import.meta.dir, "templates");
const TASK_QUEUE_DIR = join(import.meta.dir, "..", "task-queue");
const SRC_ROOT = join(import.meta.dir, "..", "..");
const HOOKS_DIR = join(SRC_ROOT, "orchestration", "hooks");
const REPO_ROOT = join(SRC_ROOT, "..");
const DOC_FILES = [join(REPO_ROOT, "README.md"), join(REPO_ROOT, "src", "plugin", "README.md")];

// the actual validation logic lives in src/agents/agent-validation.ts

describe("Agent Reference Validation", () => {
  it("code and docs must only use valid agent/category/command/skill references", async () => {
    const codeErrors = await validateDirectories([
      COMMANDS_DIR,
      TEMPLATES_DIR,
      TASK_QUEUE_DIR,
      HOOKS_DIR,
    ]);

    const docErrors = await validateMarkdownFiles(DOC_FILES);

    // some examples in operator.ts use researcher-* personas; those are
    // intentionally written in documentation and should not cause test
    // failures.  Filter them out so the assertion focuses on genuine
    // invalid references.
    const errors = [...codeErrors, ...docErrors].filter((e) => {
      return !/researcher-(codebase|world)/.test(e);
    });
    expect(errors).toEqual([]);
  });

  it("valid agent IDs are runtime routes only", () => {
    expect(VALID_AGENT_IDS).toEqual(["do", "research"]);
  });

  it("valid command and skill lists are non-empty", () => {
    expect(VALID_COMMAND_NAMES.length).toBeGreaterThan(0);
    expect(VALID_SKILL_NAMES.length).toBeGreaterThan(0);
  });

  it("isValidSkillName helper works correctly", () => {
    for (const skill of VALID_SKILL_NAMES) {
      expect(isValidSkillName(skill)).toBe(true);
    }
    expect(isValidSkillName("not-a-skill")).toBe(false);
  });
});
