import { describe, it, expect, beforeEach, afterEach, spyOn } from "bun:test";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { getDefaultSkillTemplates } from "../../templates/catalog.js";

async function mkTmpDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "cli-test-"));
}

describe("executeSync", () => {
  let tmpDir: string;
  let configRootDir: string;
  let homeDir: string;
  let logs: string[];

  beforeEach(async () => {
    tmpDir = await mkTmpDir();
    configRootDir = await mkTmpDir();
    homeDir = await mkTmpDir();
    logs = [];
    spyOn(console, "log").mockImplementation((...args: any[]) => {
      logs.push(args.join(" "));
    });
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
    await fs.rm(configRootDir, { recursive: true, force: true });
    await fs.rm(homeDir, { recursive: true, force: true });
    spyOn(console, "log").mockImplementation((...args: any[]) => console.log(...args));
  });

  it("reports no tools when dir is empty and no config", async () => {
    const { executeSync } = await import("../sync.js");
    await executeSync({ projectPath: tmpDir, configRootPath: configRootDir, homePath: homeDir });
    expect(logs.some((l) => l.includes("No AI tools detected"))).toBe(true);
  });

  it("initializes and generates files when tools detected", async () => {
    await fs.mkdir(path.join(tmpDir, ".opencode"), { recursive: true });
    const { executeSync } = await import("../sync.js");
    await executeSync({ projectPath: tmpDir, configRootPath: configRootDir, homePath: homeDir });
    expect(logs.some((l) => l.includes("initialized successfully"))).toBe(true);
    expect(logs.some((l) => l.includes("Generated"))).toBe(true);
  });

  it("updates when config already exists", async () => {
    await fs.mkdir(path.join(tmpDir, ".opencode"), { recursive: true });
    const { executeSync } = await import("../sync.js");
    await executeSync({ projectPath: tmpDir, configRootPath: configRootDir, homePath: homeDir });
    logs = [];
    await executeSync({ projectPath: tmpDir, configRootPath: configRootDir, homePath: homeDir });
    expect(logs.some((l) => l.includes("updated successfully"))).toBe(true);
  });

  it("installs global skills and Claude symlinks", async () => {
    await fs.mkdir(path.join(tmpDir, ".opencode"), { recursive: true });
    const { executeSync } = await import("../sync.js");
    await executeSync({ projectPath: tmpDir, configRootPath: configRootDir, homePath: homeDir });
    expect(logs.some((l) => l.includes("~/.agents/skills/"))).toBe(true);
    expect(logs.some((l) => l.includes("~/.claude/skills/"))).toBe(true);
    expect(logs.some((l) => l.includes("~/.agents/agents/"))).toBe(true);

    const skillName = getDefaultSkillTemplates("extended")[0].name;
    const agentsSkillDir = path.join(homeDir, ".agents", "skills", skillName);
    const claudeSkillLink = path.join(homeDir, ".claude", "skills", skillName);
    const stats = await fs.lstat(claudeSkillLink);

    expect(stats.isSymbolicLink()).toBe(true);
    expect(await fs.readlink(claudeSkillLink)).toBe(agentsSkillDir);
  });

  it("links project .github dirs when present", async () => {
    await fs.mkdir(path.join(tmpDir, ".github"), { recursive: true });
    const { executeSync } = await import("../sync.js");
    await executeSync({ projectPath: tmpDir, configRootPath: configRootDir, homePath: homeDir });

    const githubAgentsLink = path.join(tmpDir, ".github", "agents");
    const githubSkillsLink = path.join(tmpDir, ".github", "skills");
    const agentsTarget = path.join(homeDir, ".agents", "agents");
    const skillsTarget = path.join(homeDir, ".agents", "skills");

    expect((await fs.lstat(githubAgentsLink)).isSymbolicLink()).toBe(true);
    expect((await fs.lstat(githubSkillsLink)).isSymbolicLink()).toBe(true);
    expect(await fs.readlink(githubAgentsLink)).toBe(agentsTarget);
    expect(await fs.readlink(githubSkillsLink)).toBe(skillsTarget);
    expect(logs.some((l) => l.includes("✓ Linked project .github directories to:"))).toBe(true);
    expect(logs.some((l) => l.includes(".github/agents ->"))).toBe(true);
    expect(logs.some((l) => l.includes(".github/skills ->"))).toBe(true);
  });
});