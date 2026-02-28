import { describe, test, expect } from "bun:test";
import { join } from "node:path";
import { existsSync } from "node:fs";

describe("Learnings System - Foundation Tests", () => {
  describe("Learnings Command", () => {
    test("learnings command is registered", () => {
      // Verify the learnings command exists in schema
      const { CommandNameSchema } = require("../src/platform/config/schema");

      const result = CommandNameSchema.safeParse("ghostwire:workflows:learnings");
      expect(result.success).toBe(true);
    });
  });

  describe("Learnings Skill", () => {
    test("learnings skill is registered", () => {
      // Verify the learnings skill directory exists
      const fs = require("fs");

      const skillPath = "src/execution/skills/learnings/SKILL.md";
      expect(fs.existsSync(skillPath)).toBe(true);
      expect(fs.statSync(skillPath).isFile()).toBe(true);
    });

    test("learnings skill has valid frontmatter", () => {
      const { createSkills } = require("../src/execution/skills/skills");

      const skills = createSkills();
      const learningsSkill = skills.find((s) => s.name === "learnings");

      expect(learningsSkill).toBeDefined();
      expect(learningsSkill?.description).toBeDefined();
      expect(learningsSkill?.template).toBeDefined();
    });
  });

  describe("Copy Skills Script", () => {
    test("source skills directory exists with SKILL.md files", () => {
      // Verify the source path used by copy-skills.ts is correct
      const sourceSkillsDir = join(process.cwd(), "src", "execution", "skills");
      expect(existsSync(sourceSkillsDir)).toBe(true);

      // Verify at least one skill directory has SKILL.md
      const fs = require("fs");
      const entries = fs.readdirSync(sourceSkillsDir, { withFileTypes: true });
      const skillDirs = entries.filter((e: any) => e.isDirectory());

      const skillsWithManifest = skillDirs.filter((dir: any) => {
        return existsSync(join(sourceSkillsDir, dir.name, "SKILL.md"));
      });

      expect(skillsWithManifest.length).toBeGreaterThan(0);
    });
  });
});
