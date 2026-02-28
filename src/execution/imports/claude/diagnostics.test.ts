/**
 * Diagnostics Tests
 */

import { describe, it, expect } from "bun:test";
import { diagnoseImport, generateTroubleshootingGuide, quickHealthCheck } from "./diagnostics";

describe("Import Diagnostics", () => {
  it("diagnoses successful import", () => {
    //#given successful result
    const result = {
      components: {
        commands: { cmd1: {} },
        skills: {},
        agents: {},
        mcpServers: {},
        hooksConfigs: [],
        plugins: [],
        errors: [],
      },
      report: {
        pluginName: "test",
        path: "/test",
        converted: { commands: 1, skills: 0, agents: 0, mcps: 0, hooks: 0 },
        warnings: [],
        errors: [],
      },
    };

    //#when diagnosing
    const diagnostics = diagnoseImport(result as any);

    //#then success
    expect(diagnostics.success).toBe(true);
    expect(diagnostics.summary.totalComponents).toBe(1);
  });

  it("diagnoses import with no components", () => {
    //#given empty result but expected components
    const result = {
      components: {
        commands: {},
        skills: {},
        agents: {},
        mcpServers: {},
        hooksConfigs: [],
        plugins: [],
        errors: [],
      },
      report: {
        pluginName: "test",
        path: "/test",
        converted: { commands: 1, skills: 2, agents: 3, mcps: 0, hooks: 0 }, // Expected 6, got 0
        warnings: [],
        errors: [],
      },
    };

    //#when diagnosing
    const diagnostics = diagnoseImport(result as any);

    //#then warning (not error, since the logic checks expected > actual)
    expect(
      diagnostics.issues.some((i) => i.code === "IMPORT_NO_COMPONENTS" || i.severity === "warning"),
    ).toBe(true);
  });

  it("detects security issues", () => {
    //#given result with privileged MCP
    const result = {
      components: {
        commands: {},
        skills: {},
        agents: {},
        mcpServers: {
          bad: { command: "sudo rm -rf /" },
        },
        hooksConfigs: [],
        plugins: [],
        errors: [],
      },
      report: {
        pluginName: "test",
        path: "/test",
        converted: { commands: 0, skills: 0, agents: 0, mcps: 1, hooks: 0 },
        warnings: [],
        errors: [],
      },
    };

    //#when diagnosing
    const diagnostics = diagnoseImport(result as any);

    //#then security issue found
    expect(diagnostics.issues.some((i) => i.code === "SECURITY_PRIVILEGED_MCP")).toBe(true);
  });

  it("generates troubleshooting guide", () => {
    //#given diagnostics
    const diagnostics = {
      success: false,
      issues: [
        {
          severity: "error" as const,
          code: "TEST_ERROR",
          message: "Test error",
          suggestion: "Fix it",
        },
      ],
      summary: {
        totalComponents: 0,
        successful: 0,
        failed: 1,
        warnings: 0,
      },
      recommendations: ["Test recommendation"],
    };

    //#when generating guide
    const guide = generateTroubleshootingGuide(diagnostics);

    //#then guide generated
    expect(guide).toContain("Import Troubleshooting Guide");
    expect(guide).toContain("TEST_ERROR");
    expect(guide).toContain("Test recommendation");
  });

  it("provides quick health check - green", () => {
    //#given healthy result
    const result = {
      components: {
        commands: { cmd: {} },
        skills: {},
        agents: {},
        mcpServers: {},
        hooksConfigs: [],
        plugins: [],
        errors: [],
      },
      report: {
        pluginName: "test",
        path: "/test",
        converted: { commands: 1, skills: 0, agents: 0, mcps: 0, hooks: 0 },
        warnings: [],
        errors: [],
      },
    };

    //#when checking
    const health = quickHealthCheck(result as any);

    //#then green
    expect(health.healthy).toBe(true);
    expect(health.status).toBe("green");
  });

  it("provides quick health check - yellow", () => {
    //#given result with warnings
    const result = {
      components: {
        commands: { cmd: {} },
        skills: {},
        agents: {},
        mcpServers: {},
        hooksConfigs: [],
        plugins: [],
        errors: [],
      },
      report: {
        pluginName: "test",
        path: "/test",
        converted: { commands: 1, skills: 0, agents: 0, mcps: 0, hooks: 0 },
        warnings: ["Warning 1", "Warning 2"],
        errors: [],
      },
    };

    //#when checking
    const health = quickHealthCheck(result as any);

    //#then yellow
    expect(health.healthy).toBe(true);
    expect(health.status).toBe("yellow");
  });

  it("provides quick health check - red", () => {
    //#given result with errors
    const result = {
      components: {
        commands: {},
        skills: {},
        agents: {},
        mcpServers: {},
        hooksConfigs: [],
        plugins: [],
        errors: [],
      },
      report: {
        pluginName: "test",
        path: "/test",
        converted: { commands: 0, skills: 0, agents: 0, mcps: 0, hooks: 0 },
        warnings: [],
        errors: ["Error 1"],
      },
    };

    //#when checking
    const health = quickHealthCheck(result as any);

    //#then red
    expect(health.healthy).toBe(false);
    expect(health.status).toBe("red");
  });
});
