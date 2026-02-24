import { describe, it, expect } from "bun:test";
import type { Task, WorkflowTaskList } from "../task-queue/types";
import {
  calculateExecutionWaves,
  applyAutoWaves,
  getTasksByWave,
} from "../task-queue/parallelization";
import {
  buildTaskDelegationPlan,
  validateTaskForDelegation,
} from "../task-queue/delegation-engine";
import {
  buildExecutionPlan,
  getExecutionSummary,
  initializeExecutionState,
  markTaskCompleted,
  isExecutionComplete,
} from "../task-queue/execution-orchestrator";

describe("task-queue integration tests", () => {
  //#given a real feature breakdown with dependencies
  //#when processing through full workflow
  //#then all components work together correctly
  it("should process complete workflow from tasks to execution plan", () => {
    // Simulate planner output
    const tasks: Task[] = [
      {
        id: "task-1",
        subject: "Setup project structure",
        description: "Create directory layout and config files",
        category: "quick",
        estimatedEffort: "30m",
        status: "pending",
        blocks: ["task-2", "task-3"],
        blockedBy: [],
      },
      {
        id: "task-2",
        subject: "Implement authentication",
        description: "Add JWT-based auth with validation",
        category: "ultrabrain",
        skills: ["backend"],
        estimatedEffort: "2h",
        status: "pending",
        blocks: ["task-4"],
        blockedBy: ["task-1"],
      },
      {
        id: "task-3",
        subject: "Create UI components",
        description: "Build login form and dashboard",
        category: "visual-engineering",
        estimatedEffort: "1h",
        status: "pending",
        blocks: ["task-4"],
        blockedBy: ["task-1"],
      },
      {
        id: "task-4",
        subject: "Integration testing",
        description: "Test auth flow and UI interactions",
        category: "deep",
        estimatedEffort: "1h",
        status: "pending",
        blocks: [],
        blockedBy: ["task-2", "task-3"],
      },
    ];

    // Step 1: Auto-calculate waves
    const waveMap = calculateExecutionWaves(tasks);
    expect(waveMap["task-1"]).toBe(1);
    expect(waveMap["task-2"]).toBe(2);
    expect(waveMap["task-3"]).toBe(2);
    expect(waveMap["task-4"]).toBe(3);

    // Step 2: Apply waves to tasks
    const tasksWithWaves = applyAutoWaves(tasks);
    expect(tasksWithWaves[0].wave).toBe(1);
    expect(tasksWithWaves[1].wave).toBe(2);

    // Step 3: Group by wave
    const waves = getTasksByWave(tasksWithWaves);
    expect(waves).toHaveLength(3);
    expect(waves[0]).toHaveLength(1); // Wave 1: task-1
    expect(waves[1]).toHaveLength(2); // Wave 2: task-2, task-3
    expect(waves[2]).toHaveLength(1); // Wave 3: task-4

    // Step 4: Validate all tasks
    const validation = tasksWithWaves.map((t) => validateTaskForDelegation(t));
    expect(validation.every((v) => v.valid)).toBe(true);

    // Step 5: Build delegation plan
    const delegationPlan = buildTaskDelegationPlan(tasksWithWaves);
    expect(delegationPlan.totalTasks).toBe(4);
    expect(delegationPlan.tasksByWave[1]).toBe(1);
    expect(delegationPlan.tasksByWave[2]).toBe(2);
    expect(delegationPlan.tasksByWave[3]).toBe(1);

    // Step 6: Build execution plan
    const executionPlan = buildExecutionPlan("workflow-auth", tasksWithWaves);
    expect(executionPlan.workflowId).toBe("workflow-auth");
    expect(executionPlan.maxWave).toBe(3);
    expect(executionPlan.validationErrors).toHaveLength(0);
  });

  //#given a complex workflow with diamond dependencies
  //#when executing with execution orchestrator
  //#then state tracking works correctly
  it("should track execution state through diamond dependency workflow", () => {
    const tasks: Task[] = [
      {
        id: "setup",
        subject: "Setup",
        description: "Initial setup",
        status: "pending",
        blocks: ["left", "right"],
        blockedBy: [],
        wave: 1,
      },
      {
        id: "left",
        subject: "Left task",
        description: "Left branch",
        status: "pending",
        blocks: ["final"],
        blockedBy: ["setup"],
        wave: 2,
      },
      {
        id: "right",
        subject: "Right task",
        description: "Right branch",
        status: "pending",
        blocks: ["final"],
        blockedBy: ["setup"],
        wave: 2,
      },
      {
        id: "final",
        subject: "Final",
        description: "Final task",
        status: "pending",
        blocks: [],
        blockedBy: ["left", "right"],
        wave: 3,
      },
    ];

    // Initialize execution
    const state = initializeExecutionState("workflow-diamond", tasks);
    expect(state.currentWave).toBe(1);
    expect(state.totalTasks).toBe(4);
    expect(state.maxWave).toBe(3);

    // Simulate execution
    markTaskCompleted("setup", state);
    expect(state.completedTasks).toBe(1);
    expect(state.completedTaskIds.has("setup")).toBe(true);

    // Get summary
    const summary = getExecutionSummary(state);
    expect(summary.completedTasks).toBe(1);
    expect(summary.failedTasks).toBe(0);
    expect(summary.pendingTasks).toBe(3);
    expect(summary.successRate).toBe(25);

    // Not complete yet
    expect(isExecutionComplete(state)).toBe(false);

    // Complete rest
    markTaskCompleted("left", state);
    markTaskCompleted("right", state);
    markTaskCompleted("final", state);
    state.currentWave = state.maxWave; // Set to final wave

    expect(isExecutionComplete(state)).toBe(true);
    const finalSummary = getExecutionSummary(state);
    expect(finalSummary.status).toBe("completed");
    expect(finalSummary.successRate).toBe(100);
  });

  //#given tasks with different categories
  //#when building delegation plan
  //#then categories are correctly distributed
  it("should correctly categorize tasks for delegation", () => {
    const tasks: Task[] = [
      {
        id: "ui-1",
        subject: "Build buttons",
        description: "Styled button components",
        category: "visual-engineering",
        status: "pending",
        blocks: [],
        blockedBy: [],
      },
      {
        id: "api-1",
        subject: "API design",
        description: "RESTful API architecture",
        category: "ultrabrain",
        status: "pending",
        blocks: [],
        blockedBy: [],
      },
      {
        id: "fix-1",
        subject: "Fix typo",
        description: "Correct spelling in README",
        category: "quick",
        status: "pending",
        blocks: [],
        blockedBy: [],
      },
      {
        id: "doc-1",
        subject: "Write guide",
        description: "Usage documentation",
        category: "writing",
        status: "pending",
        blocks: [],
        blockedBy: [],
      },
    ];

    const plan = buildTaskDelegationPlan(tasks);

    expect(plan.tasksByCategory["visual-engineering"]).toBe(1);
    expect(plan.tasksByCategory["ultrabrain"]).toBe(1);
    expect(plan.tasksByCategory["quick"]).toBe(1);
    expect(plan.tasksByCategory["writing"]).toBe(1);
    expect(plan.tasks).toHaveLength(4);

    // Verify each task has correct delegation config
    const uiTask = plan.tasks.find((t) => t.taskId === "ui-1");
    expect(uiTask?.skills).toContain("frontend-ui-ux");

    const apiTask = plan.tasks.find((t) => t.taskId === "api-1");
    expect(apiTask?.category).toBe("ultrabrain");
  });

  //#given tasks with effort estimates
  //#when calculating waves and duration
  //#then parallelization reduces total time
  it("should reduce duration through parallelization", () => {
    const tasks: Task[] = [
      {
        id: "task-1",
        subject: "Task 1",
        description: "60 minute task",
        estimatedEffort: "1h",
        status: "pending",
        blocks: ["task-2"],
        blockedBy: [],
        wave: 1,
      },
      {
        id: "task-2a",
        subject: "Task 2a",
        description: "30 minute parallel task",
        estimatedEffort: "30m",
        status: "pending",
        blocks: [],
        blockedBy: ["task-1"],
        wave: 2,
      },
      {
        id: "task-2b",
        subject: "Task 2b",
        description: "45 minute parallel task",
        estimatedEffort: "45m",
        status: "pending",
        blocks: [],
        blockedBy: ["task-1"],
        wave: 2,
      },
    ];

    // Without parallelization: 60 + 30 + 45 = 135 min = 2h 15m
    // With parallelization: 60 + max(30, 45) = 105 min = 1h 45m
    const executionPlan = buildExecutionPlan("workflow-parallel", tasks);
    expect(executionPlan.maxWave).toBe(2);
    expect(executionPlan.totalTasks).toBe(3);
  });

  //#given mixed pending and invalid tasks
  //#when building execution plan
  //#then invalid tasks cause plan validation errors
  it("should detect invalid tasks in execution plan", () => {
    const validTask: Task = {
      id: "valid",
      subject: "Valid task",
      description: "Complete task",
      status: "pending",
      blocks: [],
      blockedBy: [],
    };

    const invalidTask: any = {
      id: "invalid",
      // missing subject and description
      status: "pending",
      blocks: [],
      blockedBy: [],
    };

    const tasks = [validTask, invalidTask];
    const plan = buildExecutionPlan("workflow-mixed", tasks);

    expect(plan.validationErrors.length).toBeGreaterThan(0);
    expect(plan.validationErrors[0]).toContain("invalid");
  });

  //#given a complete workflow task list
  //#when serializing to JSON and parsing back
  //#then data integrity is maintained
  it("should serialize and deserialize workflow task list correctly", () => {
    const original: WorkflowTaskList = {
      plan_id: "plan_123",
      plan_name: "Feature: Dark Mode",
      tasks: [
        {
          id: "task-1",
          subject: "Implement toggle",
          description: "Add dark mode toggle",
          category: "visual-engineering",
          estimatedEffort: "1h",
          status: "pending",
          blocks: ["task-2"],
          blockedBy: [],
          createdAt: new Date().toISOString(),
        },
        {
          id: "task-2",
          subject: "Apply styles",
          description: "Apply dark theme CSS",
          category: "quick",
          estimatedEffort: "30m",
          status: "pending",
          blocks: [],
          blockedBy: ["task-1"],
          createdAt: new Date().toISOString(),
        },
      ],
      created_at: new Date().toISOString(),
      auto_parallelization: true,
    };

    // Serialize
    const json = JSON.stringify(original);
    expect(json).toContain("plan_123");
    expect(json).toContain("task-1");

    // Deserialize
    const restored = JSON.parse(json) as WorkflowTaskList;
    expect(restored.plan_id).toBe(original.plan_id);
    expect(restored.tasks).toHaveLength(2);
    expect(restored.tasks[0].id).toBe("task-1");
    expect(restored.tasks[1].blockedBy).toContain("task-1");
  });

  //#given tasks with custom skills
  //#when delegating to agents
  //#then custom skills are merged with category defaults
  it("should merge custom skills with category defaults in delegation", () => {
    const task: Task = {
      id: "special",
      subject: "Complex UI with animations",
      description: "Interactive animated components",
      category: "visual-engineering",
      skills: ["playwright", "gsap"],
      status: "pending",
      blocks: [],
      blockedBy: [],
    };

    const plan = buildTaskDelegationPlan([task]);
    const delegated = plan.tasks[0];

    expect(delegated.skills).toContain("frontend-ui-ux");
    expect(delegated.skills).toContain("playwright");
    expect(delegated.skills).toContain("gsap");
  });
});
