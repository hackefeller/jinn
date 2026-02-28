/**
 * Telemetry Tests
 */

import { describe, it, expect, beforeEach } from "bun:test";
import { ImportTelemetry, getImportTelemetry, resetImportTelemetry } from "./telemetry";

describe("Import Telemetry", () => {
  let telemetry: ImportTelemetry;

  beforeEach(() => {
    resetImportTelemetry();
    telemetry = new ImportTelemetry();
  });

  it("records import events", () => {
    //#given result
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
        pluginName: "test-plugin",
        path: "/test",
        converted: { commands: 1, skills: 0, agents: 0, mcps: 0, hooks: 0 },
        warnings: [],
        errors: [],
      },
    };

    //#when recording
    const event = telemetry.recordEvent(result as any, 100, { dryRun: false });

    //#then recorded
    expect(event).toBeDefined();
    expect(event.pluginName).toBe("test-plugin");
    expect(event.duration).toBe(100);
    expect(event.success).toBe(true);
  });

  it("calculates metrics correctly", () => {
    //#given recorded events
    const successResult = {
      components: {
        commands: { c: {} },
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

    const failResult = {
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
        pluginName: "test2",
        path: "/test2",
        converted: { commands: 0, skills: 0, agents: 0, mcps: 0, hooks: 0 },
        warnings: [],
        errors: ["Error"],
      },
    };

    telemetry.recordEvent(successResult as any, 100);
    telemetry.recordEvent(failResult as any, 200);

    //#when getting metrics
    const metrics = telemetry.getMetrics();

    //#then accurate
    expect(metrics.totalImports).toBe(2);
    expect(metrics.successfulImports).toBe(1);
    expect(metrics.failedImports).toBe(1);
    expect(metrics.successRate).toBe(50);
    expect(metrics.averageDuration).toBe(150);
  });

  it("returns recent events", () => {
    //#given recorded events
    for (let i = 0; i < 5; i++) {
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
          pluginName: `plugin-${i}`,
          path: `/test-${i}`,
          converted: { commands: 0, skills: 0, agents: 0, mcps: 0, hooks: 0 },
          warnings: [],
          errors: [],
        },
      };
      telemetry.recordEvent(result as any, 100);
    }

    //#when getting recent
    const recent = telemetry.getRecentEvents(3);

    //#then recent 3 in reverse order
    expect(recent.length).toBe(3);
    expect(recent[0].pluginName).toBe("plugin-4");
  });

  it("filters events by plugin", () => {
    //#given events from different plugins
    const result1 = {
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
        pluginName: "plugin-a",
        path: "/test",
        converted: { commands: 0, skills: 0, agents: 0, mcps: 0, hooks: 0 },
        warnings: [],
        errors: [],
      },
    };
    const result2 = {
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
        pluginName: "plugin-b",
        path: "/test",
        converted: { commands: 0, skills: 0, agents: 0, mcps: 0, hooks: 0 },
        warnings: [],
        errors: [],
      },
    };

    telemetry.recordEvent(result1 as any, 100);
    telemetry.recordEvent(result2 as any, 100);
    telemetry.recordEvent(result1 as any, 100);

    //#when filtering
    const forPluginA = telemetry.getEventsForPlugin("plugin-a");

    //#then only plugin-a events
    expect(forPluginA.length).toBe(2);
    expect(forPluginA.every((e) => e.pluginName === "plugin-a")).toBe(true);
  });

  it("respects max events limit", () => {
    //#given telemetry with limit
    const limitedTelemetry = new ImportTelemetry({ maxEvents: 3 });

    //#when recording more than limit
    for (let i = 0; i < 5; i++) {
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
          pluginName: `plugin-${i}`,
          path: `/test`,
          converted: { commands: 0, skills: 0, agents: 0, mcps: 0, hooks: 0 },
          warnings: [],
          errors: [],
        },
      };
      limitedTelemetry.recordEvent(result as any, 100);
    }

    //#then only last 3 kept
    const metrics = limitedTelemetry.getMetrics();
    expect(metrics.totalImports).toBe(3);
  });

  it("anonymizes paths when configured", () => {
    //#given telemetry with anonymization
    const anonTelemetry = new ImportTelemetry({ anonymizePaths: true });

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
        path: "/Users/john/plugins/test",
        converted: { commands: 0, skills: 0, agents: 0, mcps: 0, hooks: 0 },
        warnings: [],
        errors: [],
      },
    };

    //#when recording
    const event = anonTelemetry.recordEvent(result as any, 100);

    //#then path anonymized
    expect(event.path).toBe("/Users/<user>/plugins/test");
  });

  it("exports telemetry data", () => {
    //#given recorded event
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
        errors: [],
      },
    };
    telemetry.recordEvent(result as any, 100);

    //#when exporting
    const exported = telemetry.export();

    //#then exported
    expect(exported.events.length).toBe(1);
    expect(exported.metrics.totalImports).toBe(1);
    expect(exported.exportedAt).toBeDefined();
  });

  it("generates telemetry report", () => {
    //#given recorded event
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
        errors: [],
      },
    };
    telemetry.recordEvent(result as any, 100);

    //#when generating report
    const report = telemetry.generateReport();

    //#then report generated
    expect(report).toContain("Import Telemetry Report");
    expect(report).toContain("Total Imports: 1");
    expect(report).toContain("test");
  });

  it("clears all events", () => {
    //#given recorded event
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
        errors: [],
      },
    };
    telemetry.recordEvent(result as any, 100);

    //#when clearing
    telemetry.clear();

    //#then empty
    expect(telemetry.getMetrics().totalImports).toBe(0);
  });
});
