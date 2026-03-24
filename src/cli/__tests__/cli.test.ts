import { describe, it, expect, beforeEach, afterEach, spyOn } from "bun:test";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";

async function mkTmpDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "cli-test-"));
}

describe("executeSync", () => {
  let tmpDir: string;
  let configRootDir: string;
  let logs: string[];

  beforeEach(async () => {
    tmpDir = await mkTmpDir();
    configRootDir = await mkTmpDir();
    logs = [];
    spyOn(console, "log").mockImplementation((...args: any[]) => {
      logs.push(args.join(" "));
    });
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
    await fs.rm(configRootDir, { recursive: true, force: true });
    spyOn(console, "log").mockImplementation((...args: any[]) => console.log(...args));
  });

  it("reports no tools when dir is empty and no config", async () => {
    const { executeSync } = await import("../sync.js");
    await executeSync({ projectPath: tmpDir, configRootPath: configRootDir });
    expect(logs.some((l) => l.includes("No AI tools detected"))).toBe(true);
  });

  it("initializes and generates files when tools detected", async () => {
    await fs.mkdir(path.join(tmpDir, ".opencode"), { recursive: true });
    const { executeSync } = await import("../sync.js");
    await executeSync({ projectPath: tmpDir, configRootPath: configRootDir });
    expect(logs.some((l) => l.includes("initialized successfully"))).toBe(true);
    expect(logs.some((l) => l.includes("Generated"))).toBe(true);
  });

  it("updates when config already exists", async () => {
    await fs.mkdir(path.join(tmpDir, ".opencode"), { recursive: true });
    const { executeSync } = await import("../sync.js");
    await executeSync({ projectPath: tmpDir, configRootPath: configRootDir });
    logs = [];
    await executeSync({ projectPath: tmpDir, configRootPath: configRootDir });
    expect(logs.some((l) => l.includes("updated successfully"))).toBe(true);
  });

  it("installs global skills to ~/.agents/skills", async () => {
    await fs.mkdir(path.join(tmpDir, ".opencode"), { recursive: true });
    const { executeSync } = await import("../sync.js");
    await executeSync({ projectPath: tmpDir, configRootPath: configRootDir });
    expect(logs.some((l) => l.includes("~/.agents/skills"))).toBe(true);
  });
});