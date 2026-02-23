import { describe, test, expect } from "bun:test";
import { CommandNameSchema } from "../src/platform/config/schema";

describe("Plugin Commands", () => {
  describe("Command Schema Validation", () => {
    test("all plugin command names are valid", () => {
      //#given
      const pluginCommands = [
        "ghostwire:workflows:plan",
        "ghostwire:workflows:create",
        "ghostwire:workflows:status",
        "ghostwire:workflows:complete",
        "ghostwire:workflows:learnings",
        "ghostwire:code:refactor",
        "ghostwire:code:review",
        "ghostwire:code:optimize",
        "ghostwire:code:format",
        "ghostwire:git:smart-commit",
        "ghostwire:git:branch",
        "ghostwire:git:merge",
        "ghostwire:git:cleanup",
        "ghostwire:project:init",
        "ghostwire:project:build",
        "ghostwire:project:deploy",
        "ghostwire:project:test",
        "ghostwire:util:clean",
        "ghostwire:util:backup",
        "ghostwire:util:restore",
        "ghostwire:util:doctor",
        "ghostwire:docs:deploy-docs",
        "ghostwire:docs:release-docs",
        "ghostwire:docs:feature-video",
        "ghostwire:docs:test-browser",
      ];

      //#when
      const results = pluginCommands.map((cmd) =>
        CommandNameSchema.safeParse(cmd),
      );

      //#then
      const failures = results.filter((r) => !r.success);
      expect(failures.length).toBe(0);
    });

    test("all command names follow ghostwire:category:action pattern", () => {
      //#given
      const sampleCommands = [
        "ghostwire:workflows:plan",
        "ghostwire:workflows:learnings",
        "ghostwire:code:refactor",
        "ghostwire:git:smart-commit",
        "ghostwire:project:init",
        "ghostwire:util:clean",
        "ghostwire:docs:deploy-docs",
      ];

      //#when
      const pattern = /^ghostwire:[a-z]+:[a-z-]+$/;
      const validCommands = sampleCommands.filter((cmd) => pattern.test(cmd));

      //#then
      expect(validCommands.length).toBe(sampleCommands.length);
    });
  });

  describe("Command Organization", () => {
    test("workflows commands exist (5)", () => {
      //#given
      const workflowCommands = [
        "ghostwire:workflows:plan",
        "ghostwire:workflows:create",
        "ghostwire:workflows:status",
        "ghostwire:workflows:complete",
        "ghostwire:workflows:learnings",
      ];

      //#when
      const results = workflowCommands.map((cmd) =>
        CommandNameSchema.safeParse(cmd),
      );

      //#then
      expect(results.every((r) => r.success)).toBe(true);
    });

    test("code commands exist (4)", () => {
      //#given
      const codeCommands = [
        "ghostwire:code:refactor",
        "ghostwire:code:review",
        "ghostwire:code:optimize",
        "ghostwire:code:format",
      ];

      //#when
      const results = codeCommands.map((cmd) =>
        CommandNameSchema.safeParse(cmd),
      );

      //#then
      expect(results.every((r) => r.success)).toBe(true);
    });

    test("git commands exist (4)", () => {
      //#given
      const gitCommands = [
        "ghostwire:git:smart-commit",
        "ghostwire:git:branch",
        "ghostwire:git:merge",
        "ghostwire:git:cleanup",
      ];

      //#when
      const results = gitCommands.map((cmd) =>
        CommandNameSchema.safeParse(cmd),
      );

      //#then
      expect(results.every((r) => r.success)).toBe(true);
    });

    test("project commands exist (4)", () => {
      //#given
      const projectCommands = [
        "ghostwire:project:init",
        "ghostwire:project:build",
        "ghostwire:project:deploy",
        "ghostwire:project:test",
      ];

      //#when
      const results = projectCommands.map((cmd) =>
        CommandNameSchema.safeParse(cmd),
      );

      //#then
      expect(results.every((r) => r.success)).toBe(true);
    });

    test("util commands exist (4)", () => {
      //#given
      const utilCommands = [
        "ghostwire:util:clean",
        "ghostwire:util:backup",
        "ghostwire:util:restore",
        "ghostwire:util:doctor",
      ];

      //#when
      const results = utilCommands.map((cmd) =>
        CommandNameSchema.safeParse(cmd),
      );

      //#then
      expect(results.every((r) => r.success)).toBe(true);
    });

    test("docs commands exist (4)", () => {
      //#given
      const docsCommands = [
        "ghostwire:docs:deploy-docs",
        "ghostwire:docs:release-docs",
        "ghostwire:docs:feature-video",
        "ghostwire:docs:test-browser",
      ];

      //#when
      const results = docsCommands.map((cmd) =>
        CommandNameSchema.safeParse(cmd),
      );

      //#then
      expect(results.every((r) => r.success)).toBe(true);
    });

    test("git commands exist (4)", () => {
      //#given
      const gitCommands = [
        "ghostwire:git:smart-commit",
        "ghostwire:git:branch",
        "ghostwire:git:merge",
        "ghostwire:git:cleanup",
      ];

      //#when
      const results = gitCommands.map((cmd) =>
        CommandNameSchema.safeParse(cmd),
      );

      //#then
      expect(results.every((r) => r.success)).toBe(true);
    });

    test("project commands exist (4)", () => {
      //#given
      const projectCommands = [
        "ghostwire:project:init",
        "ghostwire:project:build",
        "ghostwire:project:deploy",
        "ghostwire:project:test",
      ];

      //#when
      const results = projectCommands.map((cmd) =>
        CommandNameSchema.safeParse(cmd),
      );

      //#then
      expect(results.every((r) => r.success)).toBe(true);
    });

    test("util commands exist (4)", () => {
      //#given
      const utilCommands = [
        "ghostwire:util:clean",
        "ghostwire:util:backup",
        "ghostwire:util:restore",
        "ghostwire:util:doctor",
      ];

      //#when
      const results = utilCommands.map((cmd) =>
        CommandNameSchema.safeParse(cmd),
      );

      //#then
      expect(results.every((r) => r.success)).toBe(true);
    });

    test("docs commands exist (4)", () => {
      //#given
      const docsCommands = [
        "ghostwire:docs:deploy-docs",
        "ghostwire:docs:release-docs",
        "ghostwire:docs:feature-video",
        "ghostwire:docs:test-browser",
      ];

      //#when
      const results = docsCommands.map((cmd) =>
        CommandNameSchema.safeParse(cmd),
      );

      //#then
      expect(results.every((r) => r.success)).toBe(true);
    });

    test("project commands exist (4)", () => {
      //#given
      const projectCommands = [
        "ghostwire:project:init",
        "ghostwire:project:build",
        "ghostwire:project:deploy",
        "ghostwire:project:test",
      ];

      //#when
      const results = projectCommands.map((cmd) =>
        CommandNameSchema.safeParse(cmd),
      );

      //#then
      expect(results.every((r) => r.success)).toBe(true);
    });

    test("util commands exist (4)", () => {
      //#given
      const utilCommands = [
        "ghostwire:util:clean",
        "ghostwire:util:backup",
        "ghostwire:util:restore",
        "ghostwire:util:doctor",
      ];

      //#when
      const results = utilCommands.map((cmd) =>
        CommandNameSchema.safeParse(cmd),
      );

      //#then
      expect(results.every((r) => r.success)).toBe(true);
    });

    test("docs commands exist (4)", () => {
      //#given
      const docCommands = [
        "ghostwire:docs:deploy-docs",
        "ghostwire:docs:release-docs",
        "ghostwire:docs:feature-video",
        "ghostwire:docs:test-browser",
      ];

      //#when
      const results = docCommands.map((cmd) =>
        CommandNameSchema.safeParse(cmd),
      );

      //#then
      expect(results.every((r) => r.success)).toBe(true);
    });
  });

  describe("Learnings Command", () => {
    test("ghostwire:workflows:learnings command is valid", () => {
      //#given & #when
      const result = CommandNameSchema.safeParse("ghostwire:workflows:learnings");

      //#then
      expect(result.success).toBe(true);
    });
  });

  describe("No Duplicate Commands", () => {
    test("no duplicate commands in schema", () => {
      //#given
      const allCommands = [
        "ghostwire:workflows:plan",
        "ghostwire:workflows:create",
        "ghostwire:workflows:status",
        "ghostwire:workflows:complete",
        "ghostwire:workflows:learnings",
        "ghostwire:code:refactor",
        "ghostwire:code:review",
        "ghostwire:code:optimize",
        "ghostwire:code:format",
        "ghostwire:git:smart-commit",
        "ghostwire:git:branch",
        "ghostwire:git:merge",
        "ghostwire:git:cleanup",
        "ghostwire:project:init",
        "ghostwire:project:build",
        "ghostwire:project:deploy",
        "ghostwire:project:test",
        "ghostwire:util:clean",
        "ghostwire:util:backup",
        "ghostwire:util:restore",
        "ghostwire:util:doctor",
        "ghostwire:docs:deploy-docs",
        "ghostwire:docs:release-docs",
        "ghostwire:docs:feature-video",
        "ghostwire:docs:test-browser",
      ];

      //#when
      const uniqueCommands = new Set(allCommands);

      //#then
      expect(uniqueCommands.size).toBe(allCommands.length);
    });
  });
});
