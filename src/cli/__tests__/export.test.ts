import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it, spyOn, afterEach } from "bun:test";

import { exportGenius } from "../export.js";

const consoleLogSpy = spyOn(console, "log").mockImplementation(() => {});
const consoleErrorSpy = spyOn(console, "error").mockImplementation(() => {});

afterEach(() => {
  consoleLogSpy.mockClear();
  consoleErrorSpy.mockClear();
});

describe("exportGenius", () => {
  it("exports Codex artifacts to AGENTS.md and .agents skills", async () => {
    const directory = mkdtempSync(join(tmpdir(), "jinn-export-"));

    try {
      const result = await exportGenius({
        target: "codex",
        directory,
        strict: true,
      });

      expect(result).toBe(0);

      const agents = readFileSync(join(directory, "AGENTS.md"), "utf-8");
      const workflowSkill = readFileSync(
        join(directory, ".agents/skills/jinn-propose/SKILL.md"),
        "utf-8",
      );

      expect(agents).toContain("## Workflow Commands");
      expect(agents).toContain("`jinn:propose`");
      expect(agents).toContain("## Agents");
      expect(agents).toContain("`jinn-planner`");
      expect(agents).toContain(".agents/skills/");
      expect(agents.includes(".github/")).toBe(false);

      const frontmatter = workflowSkill.split("---")[1] ?? "";
      expect(frontmatter).toContain("name: jinn-propose");
      expect(frontmatter).toContain("description: Use when");
      expect(frontmatter.includes("license:")).toBe(false);
      expect(frontmatter.includes("compatibility:")).toBe(false);
      expect(frontmatter.includes("metadata:")).toBe(false);
      expect(frontmatter.includes("generatedBy:")).toBe(false);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});
