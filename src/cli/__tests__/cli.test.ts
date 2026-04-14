import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";
import { saveBrainConfig } from "../../core/brain/config.js";
import { syncKernelBrain } from "../../core/brain/sync.js";
import { getDefaultAgentTemplates, getDefaultSkillTemplates } from "../../templates/catalog.js";

async function mkTmpDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "cli-test-"));
}

describe("kernel sync", () => {
  let homeDir: string;

  beforeEach(async () => {
    homeDir = await mkTmpDir();
    await saveBrainConfig({ version: "2.0.0", hosts: ["claude", "codex", "copilot", "opencode", "pi"], packages: [] }, homeDir);
  });

  afterEach(async () => {
    await fs.rm(homeDir, { recursive: true, force: true });
  });

  it("syncs canonical .agents catalog and enabled hosts", async () => {
    const result = await syncKernelBrain(homeDir);

    expect(result.catalogPath).toBe(path.join(homeDir, ".agents"));

    const skillName = getDefaultSkillTemplates()[0]!.name;
    const agentName = getDefaultAgentTemplates()[0]!.name;

    const canonicalSkillPath = path.join(homeDir, ".agents", "skills", skillName, "SKILL.md");
    const canonicalAgentPath = path.join(homeDir, ".agents", "agents", agentName, "AGENT.md");
    const canonicalCommandPath = path.join(homeDir, ".agents", "commands", "kernel-sync.yaml");

    expect((await fs.stat(canonicalSkillPath)).isFile()).toBe(true);
    expect((await fs.stat(canonicalAgentPath)).isFile()).toBe(true);
    expect((await fs.stat(canonicalCommandPath)).isFile()).toBe(true);

    const claudeSkillLink = path.join(homeDir, ".claude", "skills", skillName);
    const codexSkillLink = path.join(homeDir, ".codex", "skills", skillName);
    const copilotSkillLink = path.join(homeDir, ".copilot", "skills", skillName);
    const opencodeSkillLink = path.join(homeDir, ".config", "opencode", "skills", skillName);
    const piSkillLink = path.join(homeDir, ".pi", "skills", skillName);

    expect((await fs.lstat(claudeSkillLink)).isSymbolicLink()).toBe(true);
    expect(await fs.readlink(claudeSkillLink)).toBe(path.join(homeDir, ".agents", "skills", skillName));
    expect((await fs.lstat(codexSkillLink)).isSymbolicLink()).toBe(true);
    expect((await fs.lstat(copilotSkillLink)).isSymbolicLink()).toBe(true);
    expect((await fs.lstat(opencodeSkillLink)).isSymbolicLink()).toBe(true);
    expect((await fs.lstat(piSkillLink)).isSymbolicLink()).toBe(true);

    expect((await fs.stat(path.join(homeDir, ".claude", "agents", `${agentName}.md`))).isFile()).toBe(true);
    expect((await fs.stat(path.join(homeDir, ".codex", "agents", `${agentName}.toml`))).isFile()).toBe(true);
    expect((await fs.stat(path.join(homeDir, ".copilot", "agents", `${agentName}.agent.md`))).isFile()).toBe(true);
    expect((await fs.stat(path.join(homeDir, ".config", "opencode", "agents", `${agentName}.md`))).isFile()).toBe(true);
  });

  it("removes legacy openspec skill symlinks from enabled hosts", async () => {
    const staleSkillDir = path.join(homeDir, ".claude", "skills");
    await fs.mkdir(staleSkillDir, { recursive: true });
    await fs.symlink(
      path.join(homeDir, ".agents", "skills", "kernel-openspec-explore"),
      path.join(staleSkillDir, "kernel-openspec-explore"),
      "dir",
    );

    await syncKernelBrain(homeDir);

    await expect(fs.lstat(path.join(staleSkillDir, "kernel-openspec-explore"))).rejects.toThrow();
    expect((await fs.lstat(path.join(staleSkillDir, "kernel-change-explore"))).isSymbolicLink()).toBe(true);
  });
});

describe("program", () => {
  it("registers the kernel workflow command surface", async () => {
    const { program } = await import("../index.js");
    const commandNames = new Set(program.commands.map((command) => command.name()));

    expect(commandNames.has("init")).toBe(true);
    expect(commandNames.has("sync")).toBe(true);
    expect(commandNames.has("doctor")).toBe(true);
    expect(commandNames.has("package")).toBe(true);
    expect(commandNames.has("host")).toBe(true);
    expect(commandNames.has("work")).toBe(true);
  });
});
