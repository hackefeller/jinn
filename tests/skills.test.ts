import { describe, test, expect } from "bun:test";
import { createSkills } from "../src/execution/skills/skills";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import {
  enumerateScopedAgentSkillSources,
  discoverScopedAgentSkills,
} from "../src/execution/opencode-skill-loader/loader";
import { resolveDeterministicSkillsFirstWins } from "../src/execution/opencode-skill-loader/merger";
import {
  COLLISION_NEAREST_SKILLS_DIR,
  SKILL_SCOPES_FIXTURE_ROOT,
} from "./helpers/skill-discovery-fixtures";

describe("Learnings Skill", () => {
  test("learnings skill is defined in plugin skills", () => {
    //#given
    const skills = createSkills();

    //#when
    const learningsSkill = skills.find((s) => s.name === "learnings");

    //#then
    expect(learningsSkill).toBeDefined();
    expect(learningsSkill?.name).toBe("learnings");
  });

  test("learnings skill has description", () => {
    //#given
    const skills = createSkills();
    const learningsSkill = skills.find((s) => s.name === "learnings");

    //#when & #then
    expect(learningsSkill?.description).toBeDefined();
    expect(learningsSkill?.description.length).toBeGreaterThan(20);
  });

  test("learnings skill has template", () => {
    //#given
    const skills = createSkills();
    const learningsSkill = skills.find((s) => s.name === "learnings");

    //#when & #then
    expect(learningsSkill?.template).toBeDefined();
    expect(learningsSkill?.template.length).toBeGreaterThan(0);
  });
});

describe("Scoped skill discovery (US1)", () => {
  test("applies precedence matrix for nearest then parent scope", async () => {
    //#given
    const collisionsRoot = join(SKILL_SCOPES_FIXTURE_ROOT, "collisions");
    const nearestScopeRoot = join(collisionsRoot, "nearest");

    //#when
    const sources = await enumerateScopedAgentSkillSources({
      cwd: nearestScopeRoot,
      repoRoot: collisionsRoot,
      includeUserScope: false,
      includeSystemScope: false,
    });

    //#then
    expect(sources.length).toBeGreaterThanOrEqual(2);
    expect(sources[0]?.kind).toBe("project-local-nearest");
    expect(sources[0]?.skillsPath).toBe(COLLISION_NEAREST_SKILLS_DIR);
    expect(sources[1]?.kind).toBe("parent-scope");
    expect(sources[0]?.precedenceRank).toBeLessThan(sources[1]?.precedenceRank);
  });

  test("emits deterministic collision diagnostics with first-wins winner", async () => {
    //#given
    const collisionsRoot = join(SKILL_SCOPES_FIXTURE_ROOT, "collisions");
    const nearestScopeRoot = join(collisionsRoot, "nearest");

    //#when
    const { skills } = await discoverScopedAgentSkills({
      cwd: nearestScopeRoot,
      repoRoot: collisionsRoot,
      includeUserScope: false,
      includeSystemScope: false,
    });
    const resolution = resolveDeterministicSkillsFirstWins(skills);

    //#then
    expect(resolution.skills.filter((skill) => skill.name === "dup-skill").length).toBe(1);
    expect(resolution.collisions.length).toBeGreaterThanOrEqual(1);
    expect(resolution.collisions[0]?.reason).toBe("first-wins");
    expect(resolution.collisions[0]?.winnerPath?.includes("/nearest/")).toBe(true);
  });

  test("skips malformed SKILL.md boundary entries", async () => {
    //#given
    const root = mkdtempSync(join(tmpdir(), "malformed-scoped-skill-"));
    const malformedSkillDir = join(root, ".agents", "skills", "broken-skill");
    mkdirSync(malformedSkillDir, { recursive: true });
    writeFileSync(
      join(malformedSkillDir, "SKILL.md"),
      `---\nname: broken-skill\ndescription: [ malformed\n---\nBroken skill content.\n`,
    );

    try {
      //#when
      const { skills } = await discoverScopedAgentSkills({
        cwd: root,
        repoRoot: root,
        includeUserScope: false,
        includeSystemScope: false,
      });

      //#then
      expect(skills.some((skill) => skill.name === "broken-skill")).toBe(false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
