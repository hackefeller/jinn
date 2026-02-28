import { describe, test, expect } from "bun:test";
import { CommandNameSchema } from "../src/platform/config/schema";
import { COMMAND_NAME_VALUES } from "../src/execution/commands/command-name-values";
import { COMMANDS_MANIFEST } from "../src/execution/commands/commands-manifest";

describe("Plugin Commands", () => {
  describe("Command Schema Validation", () => {
    test("all command-name values are valid", () => {
      //#when
      const results = COMMAND_NAME_VALUES.map((cmd) => CommandNameSchema.safeParse(cmd));

      //#then
      const failures = results.filter((r) => !r.success);
      expect(failures.length).toBe(0);
    });

    test("rejects unknown command names", () => {
      //#when
      const result = CommandNameSchema.safeParse("ghostwire:project:test");

      //#then
      expect(result.success).toBe(false);
    });
  });

  describe("Command Organization", () => {
    test("generated commands are represented in command-name values", () => {
      //#given
      const generatedNames = COMMANDS_MANIFEST.map((entry) => entry.name);
      const allCommandValues = new Set(COMMAND_NAME_VALUES);

      //#when
      const allGeneratedIncluded = generatedNames.every((name) => allCommandValues.has(name));

      //#then
      expect(allGeneratedIncluded).toBe(true);
    });

    test("core workflow commands exist", () => {
      //#given
      const requiredWorkflowCommands = [
        "ghostwire:workflows:create",
        "ghostwire:workflows:execute",
        "ghostwire:workflows:complete",
        "ghostwire:workflows:learnings",
      ];

      //#when
      const results = requiredWorkflowCommands.map((cmd) => CommandNameSchema.safeParse(cmd));

      //#then
      expect(results.every((r) => r.success)).toBe(true);
    });

    test("core project commands exist", () => {
      //#given
      const requiredProjectCommands = [
        "ghostwire:project:init",
        "ghostwire:project:build",
        "ghostwire:project:deploy",
      ];

      //#when
      const results = requiredProjectCommands.map((cmd) => CommandNameSchema.safeParse(cmd));

      //#then
      expect(results.every((r) => r.success)).toBe(true);
    });

    test("all generated commands use ghostwire namespace", () => {
      //#given
      const namespacePattern = /^ghostwire:/;

      //#when
      const namespaced = COMMANDS_MANIFEST.every((entry) => namespacePattern.test(entry.name));

      //#then
      expect(namespaced).toBe(true);
    });
  });

  describe("No Duplicate Commands", () => {
    test("command-name values are unique", () => {
      //#given & #when
      const uniqueCommands = new Set(COMMAND_NAME_VALUES);

      //#then
      expect(uniqueCommands.size).toBe(COMMAND_NAME_VALUES.length);
    });
  });
});
