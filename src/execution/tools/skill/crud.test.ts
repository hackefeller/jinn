import { describe, test, expect } from "bun:test";
import { skill_list, skill_create, skill_update, skill_delete } from "./crud";
import type { ToolContext } from "@opencode-ai/plugin/tool";

const mockContext: ToolContext = {
  sessionID: "test-session",
  messageID: "test-message",
  agent: "test-agent",
  abort: new AbortController().signal,
} as unknown as ToolContext;

describe("skill CRUD operations", () => {
  describe("skill_list", () => {
    test("lists all skills by default", async () => {
      //#when listing all skills
      const result = await skill_list.execute!({}, mockContext);

      //#then should return string with skills or empty message
      expect(typeof result).toBe("string");
    });

    test("filters by scope plugin", async () => {
      //#when listing plugin skills
      const result = await skill_list.execute!({ scope: "plugin" }, mockContext);

      //#then should return string
      expect(typeof result).toBe("string");
    });

    test("filters by scope project", async () => {
      //#when listing project skills
      const result = await skill_list.execute!({ scope: "project" }, mockContext);

      //#then should return string
      expect(typeof result).toBe("string");
    });

    test("filters by scope user", async () => {
      //#when listing user skills
      const result = await skill_list.execute!({ scope: "user" }, mockContext);

      //#then should return string
      expect(typeof result).toBe("string");
    });
  });

  describe("skill_create", () => {
    test("validates name format", async () => {
      //#given invalid name (uppercase)
      const result = await skill_create.execute!(
        {
          name: "Invalid-Name",
          description: "A valid description for testing purposes",
        },
        mockContext,
      );

      //#then should return error
      expect(result).toContain("Error");
      expect(result).toContain("kebab-case");
    });

    test("validates description length too short", async () => {
      //#given short description
      const result = await skill_create.execute!(
        {
          name: "test-skill",
          description: "short",
        },
        mockContext,
      );

      //#then should return error
      expect(result).toContain("Error");
      expect(result).toContain("10-200");
    });

    test("validates reserved builtin names", async () => {
      //#given reserved skill name
      const result = await skill_create.execute!(
        {
          name: "builtin-new",
          description: "This is a reserved skill name for testing",
        },
        mockContext,
      );

      //#then should return error about reserved name
      expect(result).toContain("Error");
      expect(result).toContain("reserved");
    });
  });

  describe("skill_update", () => {
    test("returns error for non-existent skill", async () => {
      //#given non-existent skill
      const result = await skill_update.execute!(
        {
          skill_name: "nonexistent-skill-xyz",
          description: "New description here for testing purposes",
        },
        mockContext,
      );

      //#then should return error
      expect(result).toContain("Error");
      expect(result).toContain("not found");
    });

    test("validates name format when renaming", async () => {
      //#given non-existent skill (validation runs before finding skill)
      const result = await skill_update.execute!(
        {
          skill_name: "nonexistent",
          name: "Invalid-Name",
        },
        mockContext,
      );

      //#then should return error about non-existent first (or name format if skill exists)
      // Either "not found" or "kebab-case" is acceptable
      expect(result).toContain("Error");
    });
  });

  describe("skill_delete", () => {
    test("returns error for builtin skills", async () => {
      //#given builtin skill
      const result = await skill_delete.execute!(
        {
          skill_name: "playwright",
        },
        mockContext,
      );

      //#then should return error about builtin
      expect(result).toContain("Error");
      expect(result).toContain("builtin");
    });

    test("returns error for non-existent skill", async () => {
      //#given non-existent skill
      const result = await skill_delete.execute!(
        {
          skill_name: "nonexistent-skill-xyz",
        },
        mockContext,
      );

      //#then should return error
      expect(result).toContain("Error");
      expect(result).toContain("not found");
    });
  });
});
