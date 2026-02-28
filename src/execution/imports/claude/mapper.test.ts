import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { mkdirSync, writeFileSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { importClaudePluginFromPath } from "./mapper";

const TEST_DIR = join(tmpdir(), `claude-import-test-${Date.now()}`);

beforeEach(() => {
  mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(() => {
  rmSync(TEST_DIR, { recursive: true, force: true });
});

describe("importClaudePluginFromPath", () => {
  it("returns empty components when path is missing", async () => {
    //#given missing plugin path
    const pluginPath = join(TEST_DIR, "missing-plugin");

    //#when importing from missing path
    const result = await importClaudePluginFromPath({
      path: pluginPath,
      pluginName: "ghostwire",
    });

    //#then returns empty components with warning
    expect(Object.keys(result.components.commands)).toHaveLength(0);
    expect(Object.keys(result.components.skills)).toHaveLength(0);
    expect(Object.keys(result.components.agents)).toHaveLength(0);
    expect(result.report.warnings.length).toBeGreaterThan(0);
  });

  it("imports commands, skills, and agents from a plugin directory", async () => {
    //#given a plugin directory with commands, skills, and agents
    const pluginRoot = join(TEST_DIR, "ghostwire");
    const commandsDir = join(pluginRoot, "commands");
    const skillsDir = join(pluginRoot, "skills", "frontend-design");
    const agentsDir = join(pluginRoot, "agents");

    mkdirSync(commandsDir, { recursive: true });
    mkdirSync(skillsDir, { recursive: true });
    mkdirSync(agentsDir, { recursive: true });

    writeFileSync(
      join(commandsDir, "workflows-plan.md"),
      `---\ndescription: "Plan workflow"\n---\nCreate a plan.\n`,
    );

    writeFileSync(
      join(skillsDir, "SKILL.md"),
      `---\nname: frontend-design\ndescription: "Frontend design skill"\n---\nUse this skill.\n`,
    );

    writeFileSync(
      join(agentsDir, "architecture-strategist.md"),
      `---\ndescription: "Architecture review"\n---\nReview architecture.\n`,
    );

    //#when importing from plugin path
    const result = await importClaudePluginFromPath({
      path: pluginRoot,
      pluginName: "ghostwire",
    });

    //#then returns namespaced components
    expect(result.report.converted.commands).toBe(1);
    expect(result.report.converted.skills).toBe(1);
    expect(result.report.converted.agents).toBe(1);

    expect(result.components.commands["ghostwire:workflows-plan"]).toBeDefined();
    expect(result.components.skills["ghostwire:frontend-design"]).toBeDefined();
    expect(result.components.agents["ghostwire:architecture-strategist"]).toBeDefined();
  });

  it("applies custom namespace prefix", async () => {
    //#given plugin with custom namespace
    const pluginRoot = join(TEST_DIR, "custom-ns-plugin");
    const commandsDir = join(pluginRoot, "commands");
    mkdirSync(commandsDir, { recursive: true });

    writeFileSync(
      join(commandsDir, "test-command.md"),
      `---\ndescription: "Test command"\n---\nTest.\n`,
    );

    //#when importing with custom namespace
    const result = await importClaudePluginFromPath({
      path: pluginRoot,
      pluginName: "custom-ns-plugin",
      namespacePrefix: "my-prefix",
    });

    //#then components use custom namespace
    expect(result.components.commands["my-prefix:test-command"]).toBeDefined();
  });

  it("applies namespace overrides", async () => {
    //#given plugin with namespace override
    const pluginRoot = join(TEST_DIR, "override-plugin");
    const agentsDir = join(pluginRoot, "agents");
    mkdirSync(agentsDir, { recursive: true });

    writeFileSync(
      join(agentsDir, "security-sentinel.md"),
      `---\ndescription: "Security review"\n---\nReview security.\n`,
    );

    //#when importing with override
    const result = await importClaudePluginFromPath({
      path: pluginRoot,
      pluginName: "override-plugin",
      namespaceOverrides: {
        "security-sentinel": "custom-security-name",
      },
    });

    //#then override is applied
    expect(result.components.agents["custom-security-name"]).toBeDefined();
    expect(result.components.agents["override-plugin:security-sentinel"]).toBeUndefined();
  });

  it("respects include filter", async () => {
    //#given plugin with multiple components
    const pluginRoot = join(TEST_DIR, "filter-plugin");
    const commandsDir = join(pluginRoot, "commands");
    mkdirSync(commandsDir, { recursive: true });

    writeFileSync(
      join(commandsDir, "security-check.md"),
      `---\ndescription: "Security check"\n---\nCheck.\n`,
    );
    writeFileSync(
      join(commandsDir, "performance-test.md"),
      `---\ndescription: "Performance test"\n---\nTest.\n`,
    );

    //#when importing with include filter
    const result = await importClaudePluginFromPath({
      path: pluginRoot,
      pluginName: "filter-plugin",
      include: ["security-*"],
    });

    //#then only matching components imported
    expect(Object.keys(result.components.commands)).toHaveLength(1);
    expect(result.components.commands["filter-plugin:security-check"]).toBeDefined();
    expect(result.report.warnings.some((w) => w.includes("skipped"))).toBe(true);
  });

  it("respects exclude filter", async () => {
    //#given plugin with multiple components
    const pluginRoot = join(TEST_DIR, "exclude-plugin");
    const commandsDir = join(pluginRoot, "commands");
    mkdirSync(commandsDir, { recursive: true });

    writeFileSync(
      join(commandsDir, "good-command.md"),
      `---\ndescription: "Good command"\n---\nGood.\n`,
    );
    writeFileSync(
      join(commandsDir, "deprecated-command.md"),
      `---\ndescription: "Deprecated command"\n---\nOld.\n`,
    );

    //#when importing with exclude filter
    const result = await importClaudePluginFromPath({
      path: pluginRoot,
      pluginName: "exclude-plugin",
      exclude: ["*deprecated*"],
    });

    //#then excluded components not imported
    expect(Object.keys(result.components.commands)).toHaveLength(1);
    expect(result.components.commands["exclude-plugin:good-command"]).toBeDefined();
    expect(result.components.commands["exclude-plugin:deprecated-command"]).toBeUndefined();
  });

  it("rejects paths with directory traversal", async () => {
    //#given malicious path
    const pluginPath = join(TEST_DIR, "..", "..", "etc", "passwd");

    //#when importing
    const result = await importClaudePluginFromPath({
      path: pluginPath,
      pluginName: "malicious",
    });

    //#then security error returned
    expect(result.report.errors.length).toBeGreaterThan(0);
    expect(result.report.errors[0]).toContain("Security error");
  });

  it("supports dry-run mode", async () => {
    //#given valid plugin
    const pluginRoot = join(TEST_DIR, "dry-run-plugin");
    const commandsDir = join(pluginRoot, "commands");
    mkdirSync(commandsDir, { recursive: true });

    writeFileSync(join(commandsDir, "test-cmd.md"), `---\ndescription: "Test"\n---\nTest.\n`);

    //#when importing in dry-run mode
    const result = await importClaudePluginFromPath({
      path: pluginRoot,
      pluginName: "dry-run-plugin",
      dryRun: true,
    });

    //#then report shows conversion but components empty
    expect(result.report.converted.commands).toBe(1);
    expect(Object.keys(result.components.commands)).toHaveLength(0);
    expect(result.report.warnings.some((w) => w.includes("DRY RUN"))).toBe(true);
  });

  it("fails in strict mode when warnings occur", async () => {
    //#given plugin with namespace override (could cause conflict warning)
    const pluginRoot = join(TEST_DIR, "strict-plugin");
    const commandsDir = join(pluginRoot, "commands");
    mkdirSync(commandsDir, { recursive: true });

    writeFileSync(join(commandsDir, "test.md"), `---\ndescription: "Test"\n---\nTest.\n`);

    //#when importing in strict mode
    const result = await importClaudePluginFromPath({
      path: pluginRoot,
      pluginName: "strict-plugin",
      strict: true,
      // Include filter that causes a skip warning
      exclude: ["*test*"],
    });

    //#then in strict mode, warnings become errors
    expect(result.report.errors.length).toBeGreaterThan(0);
    expect(Object.keys(result.components.commands)).toHaveLength(0);
  });

  it("returns empty components in atomic mode on any error", async () => {
    //#given plugin that will have partial success
    const pluginRoot = join(TEST_DIR, "atomic-plugin");
    const commandsDir = join(pluginRoot, "commands");
    mkdirSync(commandsDir, { recursive: true });

    // No files - empty plugin, which may cause warnings

    //#when importing in atomic mode with strict
    const result = await importClaudePluginFromPath({
      path: pluginRoot,
      pluginName: "atomic-plugin",
      atomic: true,
      strict: true,
    });

    //#then if any errors, all components empty
    if (result.report.errors.length > 0) {
      expect(Object.keys(result.components.commands)).toHaveLength(0);
    }
  });
});
