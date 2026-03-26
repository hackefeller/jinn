import { afterEach, beforeEach, describe, expect, it, spyOn } from "bun:test";
import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";
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

  it("installs global skills and agents with symlinks to tools", async () => {
    const { executeSync } = await import("../sync.js");
    await executeSync({ homePath: homeDir });
    expect(logs.some((l) => l.includes("~/.agents/skills/"))).toBe(true);
    expect(logs.some((l) => l.includes("agents to:"))).toBe(true);
    expect(logs.some((l) => l.includes("Linked skills to:"))).toBe(true);

    const skillName = getDefaultSkillTemplates("extended")[0].name;
    const agentsSkillDir = path.join(homeDir, ".agents", "skills", skillName);
    const claudeSkillLink = path.join(homeDir, ".claude", "skills", skillName);
    const stats = await fs.lstat(claudeSkillLink);

    expect(stats.isSymbolicLink()).toBe(true);
    expect(await fs.readlink(claudeSkillLink)).toBe(agentsSkillDir);
  });
});