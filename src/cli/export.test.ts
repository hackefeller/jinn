import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { exportGenius } from "./export";

describe("export CLI", () => {
  let tempDir: string;
  const mockConsoleLog = mock(() => {});
  const mockConsoleError = mock(() => {});
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;

  beforeEach(() => {
    //#given temporary project directory
    tempDir = join(
      tmpdir(),
      `ghostwire-export-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );
    mkdirSync(tempDir, { recursive: true });
    console.log = mockConsoleLog;
    console.error = mockConsoleError;
    mockConsoleLog.mockClear();
    mockConsoleError.mockClear();
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test("exports copilot instructions to .github/copilot-instructions.md", async () => {
    //#when
    const exitCode = await exportGenius({
      target: "copilot",
      directory: tempDir,
    });

    //#then
    const outputPath = join(tempDir, ".github", "copilot-instructions.md");
    expect(exitCode).toBe(0);
    expect(existsSync(outputPath)).toBe(true);
    const content = readFileSync(outputPath, "utf-8");
    expect(content).toContain("Ghostwire Intelligence Export");
    expect(content).toContain("operator");
  });

  test("exports codex instructions to AGENTS.md", async () => {
    //#when
    const exitCode = await exportGenius({
      target: "codex",
      directory: tempDir,
    });

    //#then
    const outputPath = join(tempDir, "AGENTS.md");
    expect(exitCode).toBe(0);
    expect(existsSync(outputPath)).toBe(true);
    const content = readFileSync(outputPath, "utf-8");
    expect(content).toContain("Ghostwire Intelligence Export");
    expect(content).toContain("technical and scientific language");
  });

  test("does not overwrite existing files without --force", async () => {
    //#given
    const outputPath = join(tempDir, "AGENTS.md");
    writeFileSync(outputPath, "existing-content", "utf-8");

    //#when
    const exitCode = await exportGenius({
      target: "codex",
      directory: tempDir,
      force: false,
    });

    //#then
    expect(exitCode).toBe(1);
    expect(readFileSync(outputPath, "utf-8")).toBe("existing-content");
  });

  test("overwrites existing files with --force", async () => {
    //#given
    const outputPath = join(tempDir, "AGENTS.md");
    writeFileSync(outputPath, "existing-content", "utf-8");

    //#when
    const exitCode = await exportGenius({
      target: "codex",
      directory: tempDir,
      force: true,
    });

    //#then
    expect(exitCode).toBe(0);
    expect(readFileSync(outputPath, "utf-8")).not.toBe("existing-content");
  });
});
