import { describe, it, expect } from "bun:test";
import type { Task } from "./types";
import {
  buildTaskDelegationPrompt,
  getTaskDelegationConfig,
  buildTaskDelegationInstruction,
  validateTaskForDelegation,
  buildTaskDelegationPlan,
  DELEGATION_CONFIGS,
} from "./delegation-engine";

describe("delegation-engine", () => {
  //#given a task with all required fields
  //#when building delegation prompt
  //#then prompt contains task info and dependencies
  it("should build delegation prompt with task details", () => {
    const task: Task = {
      id: "task-1",
      subject: "Implement authentication",
      description: "Add JWT-based authentication to the API",
      estimatedEffort: "2h",
      status: "pending",
      blocks: ["task-2", "task-3"],
      blockedBy: [],
    };

    const prompt = buildTaskDelegationPrompt(task);

    expect(prompt).toContain("task-1");
    expect(prompt).toContain("Implement authentication");
    expect(prompt).toContain("Add JWT-based authentication");
    expect(prompt).toContain("2h");
    expect(prompt).toContain("task-2");
    expect(prompt).toContain("task-3");
  });

  //#given a task with blocking dependencies
  //#when building delegation prompt
  //#then prompt warns about blocked status
  it("should indicate blocked status in prompt", () => {
    const task: Task = {
      id: "task-2",
      subject: "Add auth routes",
      description: "Add routes for login/logout",
      status: "pending",
      blocks: [],
      blockedBy: ["task-1"],
    };

    const prompt = buildTaskDelegationPrompt(task);

    expect(prompt).toContain("blocked by");
    expect(prompt).toContain("task-1");
  });

  //#given a task with metadata
  //#when building delegation prompt
  //#then metadata is included in prompt
  it("should include metadata in delegation prompt", () => {
    const task: Task = {
      id: "task-1",
      subject: "Test task",
      description: "Description",
      status: "pending",
      blocks: [],
      blockedBy: [],
      metadata: {
        "file-path": "src/auth/controller.ts",
        "estimated-lines": "150-200",
      },
    };

    const prompt = buildTaskDelegationPrompt(task);

    expect(prompt).toContain("file-path");
    expect(prompt).toContain("src/auth/controller.ts");
    expect(prompt).toContain("estimated-lines");
  });

  //#given a task with visual-engineering category
  //#when getting delegation config
  //#then frontend-ui-ux skill is included
  it("should assign frontend-ui-ux skill to visual-engineering", () => {
    const task: Task = {
      id: "task-1",
      subject: "Add dark mode",
      description: "Implement dark mode toggle",
      category: "visual-engineering",
      status: "pending",
      blocks: [],
      blockedBy: [],
    };

    const config = getTaskDelegationConfig(task);

    expect(config.skills).toContain("frontend-ui-ux");
    expect(config.category).toBe("visual-engineering");
  });

  //#given a task with custom skills
  //#when getting delegation config
  //#then custom skills are merged with category skills
  it("should merge custom skills with category skills", () => {
    const task: Task = {
      id: "task-1",
      subject: "Task",
      description: "Description",
      category: "visual-engineering",
      skills: ["playwright", "custom-skill"],
      status: "pending",
      blocks: [],
      blockedBy: [],
    };

    const config = getTaskDelegationConfig(task);

    expect(config.skills).toContain("frontend-ui-ux");
    expect(config.skills).toContain("playwright");
    expect(config.skills).toContain("custom-skill");
  });

  //#given a task without category
  //#when getting delegation config
  //#then unspecified-high config is used
  it("should use unspecified-high for tasks without category", () => {
    const task: Task = {
      id: "task-1",
      subject: "Generic task",
      description: "No category specified",
      status: "pending",
      blocks: [],
      blockedBy: [],
    };

    const config = getTaskDelegationConfig(task);

    expect(config.category).toBe("unspecified-high");
  });

  //#given a task with invalid category
  //#when getting delegation config
  //#then unspecified-high config is used and warning issued
  it("should fallback to unspecified-high for invalid category", () => {
    const task: Task = {
      id: "task-1",
      subject: "Invalid category",
      description: "Has bad category",
      category: "invalid-category" as any,
      status: "pending",
      blocks: [],
      blockedBy: [],
    };

    const config = getTaskDelegationConfig(task);

    expect(config.category).toBe("unspecified-high");
  });

  //#given a task with all required fields
  //#when building delegation instruction
  //#then instruction contains correct delegation info
  it("should build delegation instruction with correct fields", () => {
    const task: Task = {
      id: "task-1",
      subject: "Feature implementation",
      description: "Implement new feature",
      category: "ultrabrain",
      estimatedEffort: "4h",
      status: "pending",
      blocks: [],
      blockedBy: [],
    };

    const instruction = buildTaskDelegationInstruction(task);

    expect(instruction.taskId).toBe("task-1");
    expect(instruction.category).toBe("ultrabrain");
    expect(instruction.backgroundTask).toBe(true);
    expect(instruction.estimatedDuration).toBe("4h");
    expect(instruction.prompt).toContain("task-1");
  });

  //#given workflow context
  //#when building delegation instruction
  //#then context is included in prompt
  it("should include workflow context in delegation instruction", () => {
    const task: Task = {
      id: "task-1",
      subject: "Test task",
      description: "Test description",
      status: "pending",
      blocks: [],
      blockedBy: [],
    };

    const context = "This is part of the user authentication workflow";
    const instruction = buildTaskDelegationInstruction(task, context);

    expect(instruction.prompt).toContain("Workflow Context");
    expect(instruction.prompt).toContain(context);
  });

  //#given a valid task
  //#when validating for delegation
  //#then validation succeeds
  it("should validate correct tasks for delegation", () => {
    const task: Task = {
      id: "task-1",
      subject: "Valid task",
      description: "Has all required fields",
      status: "pending",
      blocks: [],
      blockedBy: [],
    };

    const result = validateTaskForDelegation(task);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  //#given a task missing required fields
  //#when validating for delegation
  //#then validation fails with errors
  it("should reject tasks missing required fields", () => {
    const incompleteTask: any = {
      id: "task-1",
      // missing subject and description
      status: "pending",
      blocks: [],
      blockedBy: [],
    };

    const result = validateTaskForDelegation(incompleteTask);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some(e => e.includes("subject"))).toBe(true);
    expect(result.errors.some(e => e.includes("description"))).toBe(true);
  });

  //#given a task with invalid category
  //#when validating for delegation
  //#then validation fails
  it("should reject tasks with invalid category", () => {
    const task: any = {
      id: "task-1",
      subject: "Invalid category",
      description: "Has bad category",
      category: "not-a-real-category",
      status: "pending",
      blocks: [],
      blockedBy: [],
    };

    const result = validateTaskForDelegation(task);

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes("category"))).toBe(true);
  });

  //#given multiple tasks with different categories and waves
  //#when building delegation plan
  //#then plan summarizes distribution
  it("should build delegation plan with task distribution", () => {
    const tasks: Task[] = [
      {
        id: "task-1",
        subject: "UI implementation",
        description: "Implement buttons",
        category: "visual-engineering",
        status: "pending",
        blocks: ["task-2"],
        blockedBy: [],
        wave: 1,
      },
      {
        id: "task-2",
        subject: "API endpoint",
        description: "Create API",
        category: "ultrabrain",
        status: "pending",
        blocks: [],
        blockedBy: ["task-1"],
        wave: 2,
      },
      {
        id: "task-3",
        subject: "Documentation",
        description: "Write docs",
        category: "writing",
        status: "pending",
        blocks: [],
        blockedBy: [],
        wave: 1,
      },
    ];

    const plan = buildTaskDelegationPlan(tasks, "3h 30m");

    expect(plan.totalTasks).toBe(3);
    expect(plan.tasksByCategory["visual-engineering"]).toBe(1);
    expect(plan.tasksByCategory["ultrabrain"]).toBe(1);
    expect(plan.tasksByCategory["writing"]).toBe(1);
    expect(plan.tasksByWave[1]).toBe(2);
    expect(plan.tasksByWave[2]).toBe(1);
    expect(plan.estimatedTotalDuration).toBe("3h 30m");
    expect(plan.tasks).toHaveLength(3);
  });

  //#given tasks in multiple waves with different efforts
  //#when building delegation plan
  //#then plan correctly aggregates by wave
  it("should aggregate tasks by wave in plan", () => {
    const tasks: Task[] = [
      {
        id: "task-1",
        subject: "Task 1",
        description: "Wave 1 task 1",
        status: "pending",
        blocks: [],
        blockedBy: [],
        wave: 1,
      },
      {
        id: "task-2",
        subject: "Task 2",
        description: "Wave 1 task 2",
        status: "pending",
        blocks: [],
        blockedBy: [],
        wave: 1,
      },
      {
        id: "task-3",
        subject: "Task 3",
        description: "Wave 2 task",
        status: "pending",
        blocks: [],
        blockedBy: [],
        wave: 2,
      },
    ];

    const plan = buildTaskDelegationPlan(tasks);

    expect(plan.tasksByWave[1]).toBe(2);
    expect(plan.tasksByWave[2]).toBe(1);
  });

  //#given all delegation configs
  //#when checking configs
  //#then each category has proper config
  it("should have valid configs for all categories", () => {
    const categories = [
      "visual-engineering",
      "ultrabrain",
      "quick",
      "deep",
      "artistry",
      "writing",
      "unspecified-low",
      "unspecified-high",
    ] as const;

    for (const category of categories) {
      const config = DELEGATION_CONFIGS[category];
      expect(config).toBeDefined();
      expect(config.category).toBe(category);
      expect(config.description).toBeTruthy();
      expect(Array.isArray(config.skills)).toBe(true);
    }
  });

  //#given a task with no effort estimate
  //#when building delegation plan
  //#then estimated duration is still captured
  it("should handle tasks without effort estimates", () => {
    const tasks: Task[] = [
      {
        id: "task-1",
        subject: "No estimate",
        description: "Task without effort",
        status: "pending",
        blocks: [],
        blockedBy: [],
      },
    ];

    const plan = buildTaskDelegationPlan(tasks);

    expect(plan.totalTasks).toBe(1);
    expect(plan.tasks[0].estimatedDuration).toBeUndefined();
  });
});
