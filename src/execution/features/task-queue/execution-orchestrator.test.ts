import { describe, it, expect } from "bun:test";
import type { Task } from "./types";
import {
  initializeExecutionState,
  getNextTasksToExecute,
  advanceToNextWave,
  markTaskCompleted,
  markTaskFailed,
  isExecutionComplete,
  shouldHaltExecution,
  getExecutionSummary,
  buildExecutionPlan,
  formatExecutionPlan,
} from "./execution-orchestrator";

describe("execution-orchestrator", () => {
  //#given a list of tasks
  //#when initializing execution state
  //#then state is created with proper initial values
  it("should initialize execution state correctly", () => {
    const tasks: Task[] = [
      {
        id: "task-1",
        subject: "Task 1",
        description: "First",
        status: "pending",
        blocks: [],
        blockedBy: [],
        wave: 1,
      },
      {
        id: "task-2",
        subject: "Task 2",
        description: "Second",
        status: "pending",
        blocks: [],
        blockedBy: ["task-1"],
        wave: 2,
      },
    ];

    const state = initializeExecutionState("workflow-1", tasks);

    expect(state.workflowId).toBe("workflow-1");
    expect(state.totalTasks).toBe(2);
    expect(state.completedTasks).toBe(0);
    expect(state.failedTasks).toBe(0);
    expect(state.currentWave).toBe(1);
    expect(state.maxWave).toBe(2);
    expect(state.startedAt).toBeDefined();
    expect(state.completedTaskIds.size).toBe(0);
  });

  //#given execution state
  //#when getting next executable tasks
  //#then only pending tasks with met dependencies are returned
  it("should get next executable tasks from current wave", () => {
    const tasks: Task[] = [
      {
        id: "task-1",
        subject: "Task 1",
        description: "First",
        status: "pending",
        blocks: ["task-2"],
        blockedBy: [],
        wave: 1,
      },
      {
        id: "task-2",
        subject: "Task 2",
        description: "Second",
        status: "pending",
        blocks: [],
        blockedBy: ["task-1"],
        wave: 1,
      },
    ];

    const state = initializeExecutionState("workflow-1", tasks);
    const nextTasks = getNextTasksToExecute(tasks, state);

    expect(nextTasks).toHaveLength(1);
    expect(nextTasks[0].id).toBe("task-1");
  });

  //#given execution in first wave
  //#when advancing to next wave
  //#then current wave increments
  it("should advance to next wave", () => {
    const tasks: Task[] = [
      {
        id: "task-1",
        subject: "Task 1",
        description: "First",
        status: "pending",
        blocks: [],
        blockedBy: [],
        wave: 1,
      },
      {
        id: "task-2",
        subject: "Task 2",
        description: "Second",
        status: "pending",
        blocks: [],
        blockedBy: [],
        wave: 2,
      },
    ];

    const state = initializeExecutionState("workflow-1", tasks);
    expect(state.currentWave).toBe(1);

    const advanced = advanceToNextWave(state);

    expect(advanced).toBe(true);
    expect(state.currentWave).toBe(2);
  });

  //#given execution at last wave
  //#when advancing to next wave
  //#then false is returned
  it("should not advance beyond max wave", () => {
    const tasks: Task[] = [
      {
        id: "task-1",
        subject: "Task 1",
        description: "Single task",
        status: "pending",
        blocks: [],
        blockedBy: [],
        wave: 1,
      },
    ];

    const state = initializeExecutionState("workflow-1", tasks);
    const advanced = advanceToNextWave(state);

    expect(advanced).toBe(false);
  });

  //#given a task and execution state
  //#when marking task completed
  //#then task is added to completed set and counter incremented
  it("should mark task as completed", () => {
    const tasks: Task[] = [
      {
        id: "task-1",
        subject: "Task 1",
        description: "First",
        status: "pending",
        blocks: [],
        blockedBy: [],
      },
    ];

    const state = initializeExecutionState("workflow-1", tasks);
    expect(state.completedTasks).toBe(0);

    markTaskCompleted("task-1", state);

    expect(state.completedTasks).toBe(1);
    expect(state.completedTaskIds.has("task-1")).toBe(true);
  });

  //#given a task and execution state
  //#when marking task failed
  //#then task is added to failed set and counter incremented
  it("should mark task as failed", () => {
    const tasks: Task[] = [
      {
        id: "task-1",
        subject: "Task 1",
        description: "First",
        status: "pending",
        blocks: [],
        blockedBy: [],
      },
    ];

    const state = initializeExecutionState("workflow-1", tasks);
    expect(state.failedTasks).toBe(0);

    markTaskFailed("task-1", state);

    expect(state.failedTasks).toBe(1);
    expect(state.failedTaskIds.has("task-1")).toBe(true);
  });

  //#given execution with all tasks completed
  //#when checking if complete
  //#then true is returned
  it("should detect execution completion", () => {
    const tasks: Task[] = [
      {
        id: "task-1",
        subject: "Task 1",
        description: "First",
        status: "pending",
        blocks: [],
        blockedBy: [],
        wave: 1,
      },
    ];

    const state = initializeExecutionState("workflow-1", tasks);
    markTaskCompleted("task-1", state);
    state.currentWave = 1;

    const complete = isExecutionComplete(state);

    expect(complete).toBe(true);
  });

  //#given execution with pending tasks
  //#when checking if complete
  //#then false is returned
  it("should detect incomplete execution", () => {
    const tasks: Task[] = [
      {
        id: "task-1",
        subject: "Task 1",
        description: "First",
        status: "pending",
        blocks: [],
        blockedBy: [],
        wave: 1,
      },
      {
        id: "task-2",
        subject: "Task 2",
        description: "Second",
        status: "pending",
        blocks: [],
        blockedBy: [],
        wave: 2,
      },
    ];

    const state = initializeExecutionState("workflow-1", tasks);
    markTaskCompleted("task-1", state);

    const complete = isExecutionComplete(state);

    expect(complete).toBe(false);
  });

  //#given execution with many failures
  //#when checking if should halt
  //#then true is returned
  it("should halt on excessive failures", () => {
    const tasks: Task[] = [
      {
        id: "task-1",
        subject: "Task 1",
        description: "First",
        status: "pending",
        blocks: [],
        blockedBy: [],
      },
      {
        id: "task-2",
        subject: "Task 2",
        description: "Second",
        status: "pending",
        blocks: [],
        blockedBy: [],
      },
    ];

    const state = initializeExecutionState("workflow-1", tasks);
    markTaskFailed("task-1", state);

    const shouldHalt = shouldHaltExecution(state, 0.5);

    expect(shouldHalt).toBe(true);
  });

  //#given execution with few failures
  //#when checking if should halt
  //#then false is returned
  it("should not halt with low failure rate", () => {
    const tasks: Task[] = [
      {
        id: "task-1",
        subject: "Task 1",
        description: "First",
        status: "pending",
        blocks: [],
        blockedBy: [],
      },
      {
        id: "task-2",
        subject: "Task 2",
        description: "Second",
        status: "pending",
        blocks: [],
        blockedBy: [],
      },
      {
        id: "task-3",
        subject: "Task 3",
        description: "Third",
        status: "pending",
        blocks: [],
        blockedBy: [],
      },
    ];

    const state = initializeExecutionState("workflow-1", tasks);
    markTaskFailed("task-1", state);

    const shouldHalt = shouldHaltExecution(state, 0.5);

    expect(shouldHalt).toBe(false);
  });

  //#given completed execution state
  //#when getting summary
  //#then status is 'completed' and success rate is 100%
  it("should generate completed summary", () => {
    const tasks: Task[] = [
      {
        id: "task-1",
        subject: "Task 1",
        description: "First",
        status: "pending",
        blocks: [],
        blockedBy: [],
      },
    ];

    const state = initializeExecutionState("workflow-1", tasks);
    markTaskCompleted("task-1", state);
    state.completedAt = new Date();
    state.currentWave = 1;
    state.maxWave = 1;

    const summary = getExecutionSummary(state);

    expect(summary.status).toBe("completed");
    expect(summary.completedTasks).toBe(1);
    expect(summary.failedTasks).toBe(0);
    expect(summary.successRate).toBe(100);
  });

  //#given execution with mix of completed and failed
  //#when getting summary
  //#then status is 'failed' and success rate is partial
  it("should generate failed summary", () => {
    const tasks: Task[] = [
      {
        id: "task-1",
        subject: "Task 1",
        description: "First",
        status: "pending",
        blocks: [],
        blockedBy: [],
      },
      {
        id: "task-2",
        subject: "Task 2",
        description: "Second",
        status: "pending",
        blocks: [],
        blockedBy: [],
      },
    ];

    const state = initializeExecutionState("workflow-1", tasks);
    markTaskCompleted("task-1", state);
    markTaskFailed("task-2", state);
    state.completedAt = new Date();
    state.currentWave = 1;
    state.maxWave = 1;

    const summary = getExecutionSummary(state);

    expect(summary.status).toBe("failed");
    expect(summary.completedTasks).toBe(1);
    expect(summary.failedTasks).toBe(1);
    expect(summary.successRate).toBe(50);
  });

  //#given a workflow with tasks
  //#when building execution plan
  //#then plan organizes tasks by wave with delegation info
  it("should build execution plan with wave organization", () => {
    const tasks: Task[] = [
      {
        id: "task-1",
        subject: "Task 1",
        description: "Wave 1",
        category: "quick",
        status: "pending",
        blocks: ["task-2"],
        blockedBy: [],
        wave: 1,
      },
      {
        id: "task-2",
        subject: "Task 2",
        description: "Wave 2",
        category: "deep",
        status: "pending",
        blocks: [],
        blockedBy: ["task-1"],
        wave: 2,
      },
    ];

    const plan = buildExecutionPlan("workflow-1", tasks);

    expect(plan.workflowId).toBe("workflow-1");
    expect(plan.maxWave).toBe(2);
    expect(plan.totalTasks).toBe(2);
    expect(plan.validationErrors).toHaveLength(0);
    expect(plan.waveTaskMap[1]).toBeDefined();
    expect(plan.waveTaskMap[2]).toBeDefined();
  });

  //#given tasks with validation errors
  //#when building execution plan
  //#then plan includes validation errors
  it("should report validation errors in plan", () => {
    const tasks: any[] = [
      {
        id: "task-1",
        // missing subject and description
        status: "pending",
        blocks: [],
        blockedBy: [],
      },
    ];

    const plan = buildExecutionPlan("workflow-1", tasks);

    expect(plan.validationErrors.length).toBeGreaterThan(0);
    expect(plan.validationErrors[0]).toContain("task-1");
  });

  //#given execution plan
  //#when formatting for display
  //#then readable plan summary is generated
  it("should format execution plan for display", () => {
    const tasks: Task[] = [
      {
        id: "task-1",
        subject: "Task 1",
        description: "Description",
        category: "quick",
        status: "pending",
        blocks: [],
        blockedBy: [],
        wave: 1,
      },
    ];

    const plan = buildExecutionPlan("workflow-1", tasks);
    const formatted = formatExecutionPlan(plan);

    expect(formatted).toContain("Execution Plan");
    expect(formatted).toContain("workflow-1");
    expect(formatted).toContain("Wave 1");
    expect(formatted).toContain("task-1");
  });

  //#given execution plan with errors
  //#when formatting for display
  //#then errors section is included
  it("should include validation errors in formatted plan", () => {
    const tasks: any[] = [
      {
        id: "task-1",
        status: "pending",
        blocks: [],
        blockedBy: [],
      },
    ];

    const plan = buildExecutionPlan("workflow-1", tasks);
    const formatted = formatExecutionPlan(plan);

    expect(formatted).toContain("Validation Errors");
  });

  //#given time-stamped execution state
  //#when getting summary
  //#then duration is calculated and formatted
  it("should calculate execution duration", () => {
    const tasks: Task[] = [
      {
        id: "task-1",
        subject: "Task 1",
        description: "First",
        status: "pending",
        blocks: [],
        blockedBy: [],
      },
    ];

    const state = initializeExecutionState("workflow-1", tasks);
    markTaskCompleted("task-1", state);
    
    // Simulate 2 minutes duration
    state.startedAt = new Date(Date.now() - 120000);
    state.completedAt = new Date();

    const summary = getExecutionSummary(state);

    expect(summary.duration).toBeDefined();
    expect(summary.duration).toContain("m");
  });
});
