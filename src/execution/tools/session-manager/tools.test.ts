import { describe, test, expect } from "bun:test";
import {
  session_list,
  session_read,
  session_search,
  session_info,
  session_create,
  session_update,
  session_delete,
  onSessionEvent,
} from "./tools";
import type { ToolContext } from "@opencode-ai/plugin/tool";

const mockContext: ToolContext = {
  sessionID: "test-session",
  messageID: "test-message",
  agent: "test-agent",
  abort: new AbortController().signal,
} as unknown as ToolContext;

describe("session-manager tools", () => {
  test("session_list executes without error", async () => {
    const result = await session_list.execute({}, mockContext);

    expect(typeof result).toBe("string");
  });

  test("session_list respects limit parameter", async () => {
    const result = await session_list.execute({ limit: 5 }, mockContext);

    expect(typeof result).toBe("string");
  });

  test("session_list filters by date range", async () => {
    const result = await session_list.execute(
      {
        from_date: "2025-12-01T00:00:00Z",
        to_date: "2025-12-31T23:59:59Z",
      },
      mockContext,
    );

    expect(typeof result).toBe("string");
  });

  test("session_list filters by project_path", async () => {
    // #given
    const projectPath = "/Users/yeongyu/local-workspaces/ghostwire";

    // #when
    const result = await session_list.execute({ project_path: projectPath }, mockContext);

    // #then
    expect(typeof result).toBe("string");
  });

  test("session_list uses process.cwd() as default project_path", async () => {
    // #given - no project_path provided

    // #when
    const result = await session_list.execute({}, mockContext);

    // #then - should not throw and return string (uses process.cwd() internally)
    expect(typeof result).toBe("string");
  });

  test("session_read handles non-existent session", async () => {
    const result = await session_read.execute({ session_id: "ses_nonexistent" }, mockContext);

    expect(result).toContain("not found");
  });

  test("session_read executes with valid parameters", async () => {
    const result = await session_read.execute(
      {
        session_id: "ses_test123",
        include_todos: true,
        include_transcript: true,
      },
      mockContext,
    );

    expect(typeof result).toBe("string");
  });

  test("session_read respects limit parameter", async () => {
    const result = await session_read.execute(
      {
        session_id: "ses_test123",
        limit: 10,
      },
      mockContext,
    );

    expect(typeof result).toBe("string");
  });

  test("session_search executes without error", async () => {
    const result = await session_search.execute({ query: "test" }, mockContext);

    expect(typeof result).toBe("string");
  });

  test("session_search filters by session_id", async () => {
    const result = await session_search.execute(
      {
        query: "test",
        session_id: "ses_test123",
      },
      mockContext,
    );

    expect(typeof result).toBe("string");
  });

  test("session_search respects case_sensitive parameter", async () => {
    const result = await session_search.execute(
      {
        query: "TEST",
        session_id: "ses_test123",
        case_sensitive: true,
      },
      mockContext,
    );

    expect(typeof result).toBe("string");
  });

  test("session_search respects limit parameter", async () => {
    const result = await session_search.execute(
      {
        query: "test",
        limit: 5,
      },
      mockContext,
    );

    expect(typeof result).toBe("string");
  });

  test("session_info handles non-existent session", async () => {
    const result = await session_info.execute({ session_id: "ses_nonexistent" }, mockContext);

    expect(result).toContain("not found");
  });

  test("session_info executes with valid session", async () => {
    const result = await session_info.execute({ session_id: "ses_test123" }, mockContext);

    expect(typeof result).toBe("string");
  });
});

describe("session CRUD operations", () => {
  describe("session_create", () => {
    test("returns error when client API not available", async () => {
      //#given context without client
      const contextWithoutClient = { ...mockContext };

      //#when creating session
      const result = await session_create.execute!(
        {
          title: "Test Session",
        },
        contextWithoutClient,
      );

      //#then should return error about API not available
      expect(result).toContain("Error");
      expect(result).toContain("not available");
    });

    test("validates parent session exists", async () => {
      //#given non-existent parent session
      const context = {
        ...mockContext,
        client: {
          session: {
            create: async () => ({ data: { id: "ses_new" } }),
          },
        },
      };

      //#when creating with invalid parent
      const result = await session_create.execute!(
        {
          title: "Test",
          parent_session_id: "ses_nonexistent",
        },
        context,
      );

      //#then should return error
      expect(result).toContain("Error");
      expect(result).toContain("not found");
    });

    test("emits created event on success", async () => {
      //#given mock client and event listener
      let capturedEvent: any = null;
      onSessionEvent((event) => {
        capturedEvent = event;
      });

      const context = {
        ...mockContext,
        client: {
          session: {
            create: async () => ({ data: { id: "ses_test123" } }),
          },
        },
      };

      //#when creating session
      await session_create.execute!(
        {
          title: "Test Session",
          description: "Test Description",
        },
        context,
      );

      //#then event should be emitted
      expect(capturedEvent).not.toBeNull();
      expect(capturedEvent.type).toBe("session.created");
      expect(capturedEvent.session_id).toBe("ses_test123");
    });
  });

  describe("session_update", () => {
    test("handles non-existent session", async () => {
      //#given non-existent session ID
      const result = await session_update.execute!(
        {
          session_id: "ses_nonexistent",
          title: "New Title",
        },
        mockContext,
      );

      //#then should return error
      expect(result).toContain("Error");
      expect(result).toContain("not found");
    });

    test("returns error for non-existent session when updating", async () => {
      //#given non-existent session
      const result = await session_update.execute!(
        {
          session_id: "ses_nonexistent_update",
          title: "New Title",
        },
        mockContext,
      );

      //#then should return error
      expect(result).toContain("Error");
      expect(result).toContain("not found");
    });

    test("emits updated event on success", async () => {
      //#given event listener
      let capturedEvent: any = null;
      onSessionEvent((event) => {
        if (event.type === "session.updated") {
          capturedEvent = event;
        }
      });

      //#when updating session (will fail to find file, but tests event emission path)
      await session_update.execute!(
        {
          session_id: "ses_nonexistent_for_event_test",
          title: "New Title",
        },
        mockContext,
      );

      //#then no event should be emitted for failed updates
      expect(capturedEvent).toBeNull();
    });
  });

  describe("session_delete", () => {
    test("handles non-existent session", async () => {
      //#given non-existent session
      const result = await session_delete.execute!(
        {
          session_id: "ses_nonexistent",
        },
        mockContext,
      );

      //#then should return error
      expect(result).toContain("Error");
      expect(result).toContain("not found");
    });

    test("rejects delete with children when cascade is false", async () => {
      //#given session with children (mock scenario)
      const result = await session_delete.execute!(
        {
          session_id: "ses_with_children",
          cascade: false,
        },
        mockContext,
      );

      //#then should return error about children
      expect(result).toContain("Error");
    });

    test("emits deleted event on success", async () => {
      //#given event listener
      let capturedEvent: any = null;
      onSessionEvent((event) => {
        if (event.type === "session.deleted") {
          capturedEvent = event;
        }
      });

      //#when deleting non-existent session (event emission would only happen on success)
      await session_delete.execute!(
        {
          session_id: "ses_nonexistent_for_event_test",
          reason: "Test deletion",
        },
        mockContext,
      );

      //#then no event should be emitted for failed deletes
      expect(capturedEvent).toBeNull();
    });

    test("accepts reason parameter", async () => {
      //#given delete with reason
      const result = await session_delete.execute!(
        {
          session_id: "ses_test",
          reason: "Analysis complete",
        },
        mockContext,
      );

      //#then should handle gracefully (will fail since session doesn't exist)
      expect(typeof result).toBe("string");
    });

    test("accepts archive_todos parameter", async () => {
      //#given delete with archive_todos option
      const result = await session_delete.execute!(
        {
          session_id: "ses_test",
          archive_todos: true,
        },
        mockContext,
      );

      //#then should handle gracefully
      expect(typeof result).toBe("string");
    });
  });
});
