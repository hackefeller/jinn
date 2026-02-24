import { describe, it, expect } from "bun:test";
import { TaskSchema, TaskStatusSchema, DelegationCategorySchema, WorkflowTaskListSchema, type Task } from "./types";

describe("TaskSchema", () => {
  //#given a valid task object
  //#when parsing with TaskSchema
  //#then it should succeed
  it("parses valid task object", () => {
    const validTask = {
      id: "1",
      subject: "Fix authentication bug",
      description: "Users report 401 errors",
      status: "pending",
      blocks: [],
      blockedBy: [],
    };

    const result = TaskSchema.safeParse(validTask);
    expect(result.success).toBe(true);
  });

  //#given a task with all optional fields including delegation fields
  //#when parsing with TaskSchema
  //#then it should succeed
  it("parses task with optional delegation fields", () => {
    const taskWithOptionals = {
      id: "2",
      subject: "Add unit tests",
      description: "Write tests for auth module",
      activeForm: "Adding unit tests",
      owner: "backend",
      category: "ultrabrain",
      skills: ["typescript", "testing"],
      estimatedEffort: "2h",
      wave: 2,
      status: "in_progress",
      blocks: ["3"],
      blockedBy: ["1"],
      createdAt: "2026-02-24T00:00:00Z",
      startedAt: "2026-02-24T01:00:00Z",
      metadata: { priority: "high", labels: ["bug"] },
    };

    const result = TaskSchema.safeParse(taskWithOptionals);
    expect(result.success).toBe(true);
  });

  //#given an invalid status value
  //#when parsing with TaskSchema
  //#then it should fail
  it("rejects invalid status", () => {
    const invalidTask = {
      id: "1",
      subject: "Test",
      description: "Test",
      status: "invalid_status",
      blocks: [],
      blockedBy: [],
    };

    const result = TaskSchema.safeParse(invalidTask);
    expect(result.success).toBe(false);
  });

  //#given an invalid delegation category
  //#when parsing with TaskSchema
  //#then it should fail
  it("rejects invalid delegation category", () => {
    const invalidTask = {
      id: "1",
      subject: "Test",
      description: "Test",
      status: "pending",
      blocks: [],
      blockedBy: [],
      category: "invalid-category",
    };

    const result = TaskSchema.safeParse(invalidTask);
    expect(result.success).toBe(false);
  });

  //#given missing required fields
  //#when parsing with TaskSchema
  //#then it should fail
  it("rejects missing required fields", () => {
    const invalidTask = {
      id: "1",
      // missing subject, description, status, blocks, blockedBy
    };

    const result = TaskSchema.safeParse(invalidTask);
    expect(result.success).toBe(false);
  });
});

describe("DelegationCategorySchema", () => {
  //#given valid delegation categories
  //#when parsing
  //#then all should succeed
  it("accepts valid delegation categories", () => {
    expect(DelegationCategorySchema.safeParse("visual-engineering").success).toBe(true);
    expect(DelegationCategorySchema.safeParse("ultrabrain").success).toBe(true);
    expect(DelegationCategorySchema.safeParse("quick").success).toBe(true);
    expect(DelegationCategorySchema.safeParse("deep").success).toBe(true);
    expect(DelegationCategorySchema.safeParse("artistry").success).toBe(true);
    expect(DelegationCategorySchema.safeParse("writing").success).toBe(true);
  });
});

describe("TaskStatusSchema", () => {
  //#given valid status values
  //#when parsing
  //#then all should succeed
  it("accepts valid statuses", () => {
    expect(TaskStatusSchema.safeParse("pending").success).toBe(true);
    expect(TaskStatusSchema.safeParse("in_progress").success).toBe(true);
    expect(TaskStatusSchema.safeParse("completed").success).toBe(true);
  });
});

describe("WorkflowTaskListSchema", () => {
  //#given a valid workflow task list
  //#when parsing with WorkflowTaskListSchema
  //#then it should succeed
  it("parses valid workflow task list", () => {
    const taskList = {
      plan_id: "plan-001",
      plan_name: "Add JWT Auth",
      tasks: [
        {
          id: "task-001",
          subject: "Set up database",
          description: "Create auth tables",
          status: "pending",
          blocks: ["task-002"],
          blockedBy: [],
          category: "ultrabrain",
          skills: ["database-design"],
          wave: 1,
        },
        {
          id: "task-002",
          subject: "Create middleware",
          description: "Auth middleware for Express",
          status: "pending",
          blocks: [],
          blockedBy: ["task-001"],
          category: "ultrabrain",
          skills: ["express"],
          wave: 2,
        },
      ],
      created_at: "2026-02-24T00:00:00Z",
      breakdown_at: "2026-02-24T01:00:00Z",
      auto_parallelization: true,
    };

    const result = WorkflowTaskListSchema.safeParse(taskList);
    expect(result.success).toBe(true);
  });
});
