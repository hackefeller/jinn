import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";
import { getDefaultAgentTemplates } from "../../../templates/catalog.js";
import { AGENT_NAMES } from "../../../templates/constants.js";
import type { Config } from "../../config/schema.js";
import { generateFiles } from "../index.js";

const defaultAgentFileNames = getDefaultAgentTemplates()
  .map((template) => `${template.name}.md`)
  .sort();

async function mkTmpDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "template-integ-"));
}

async function dirExists(p: string): Promise<boolean> {
  try {
    const s = await fs.stat(p);
    return s.isDirectory();
  } catch {
    return false;
  }
}

async function fileExists(p: string): Promise<boolean> {
  try {
    const s = await fs.stat(p);
    return s.isFile();
  } catch {
    return false;
  }
}

async function countDirsInDir(dir: string): Promise<number> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries.filter((entry) => entry.isDirectory()).length;
  } catch {
    return 0;
  }
}

describe("Generator integration", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkTmpDir();
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("generates claude agents and skills", async () => {
    const config: Config = { version: "1.0.0", tools: ["claude"] };
    await generateFiles(config, tmpDir);

    const agentsDir = path.join(tmpDir, ".claude", "agents");
    const files = (await fs.readdir(agentsDir)).filter((file) => file.endsWith(".md")).sort();

    expect(files).toEqual(defaultAgentFileNames);
    expect(await fileExists(path.join(tmpDir, ".claude", "agents", `${AGENT_NAMES.PLAN}.md`))).toBe(true);
    expect(await dirExists(path.join(tmpDir, ".claude", "skills"))).toBe(true);
  });

  it("generates opencode agents in .config/opencode/agents", async () => {
    const config: Config = { version: "1.0.0", tools: ["opencode"] };
    await generateFiles(config, tmpDir);

    expect(await dirExists(path.join(tmpDir, ".config", "opencode", "agents"))).toBe(true);
    expect(await countDirsInDir(path.join(tmpDir, ".opencode", "skills"))).toBeGreaterThan(0);
  });

  it("generates copilot agents with .agent.md extension", async () => {
    const config: Config = { version: "1.0.0", tools: ["copilot"] };
    await generateFiles(config, tmpDir);

    const agentsDir = path.join(tmpDir, ".github", "agents");
    const files = await fs.readdir(agentsDir);
    expect(files.some((file) => file.endsWith(".agent.md"))).toBe(true);
  });

  it("generates pi skills without native agents", async () => {
    const config: Config = { version: "1.0.0", tools: ["pi"] };
    await generateFiles(config, tmpDir);

    expect(await countDirsInDir(path.join(tmpDir, ".pi", "skills"))).toBeGreaterThan(0);
    expect(await dirExists(path.join(tmpDir, ".pi", "agents"))).toBe(false);
  });

  it("generates outputs for multiple tools without cross contamination", async () => {
    const config: Config = {
      version: "1.0.0",
      tools: ["claude", "copilot", "opencode", "pi"],
    };

    await generateFiles(config, tmpDir);

    expect(await dirExists(path.join(tmpDir, ".claude", "skills"))).toBe(true);
    expect(await dirExists(path.join(tmpDir, ".github", "skills"))).toBe(true);
    expect(await dirExists(path.join(tmpDir, ".opencode", "skills"))).toBe(true);
    expect(await dirExists(path.join(tmpDir, ".pi", "skills"))).toBe(true);
    expect(await dirExists(path.join(tmpDir, ".config", "opencode", "agents"))).toBe(true);
  });
});
