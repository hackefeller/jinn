import { describe, it, expect } from "bun:test";
import type { Task } from "./types";
import {
  calculateExecutionWaves,
  getTasksInWave,
  getMaxWave,
  applyAutoWaves,
  applyManualWaves,
  getTasksByWave,
  canExecuteTask,
  getExecutableTasksInWave,
  estimateExecutionDuration,
} from "./parallelization";

describe("parallelization", () => {
  //#given a simple linear task dependency chain
  //#when calculating waves
  //#then each task should be in its own wave
  it("should assign tasks to waves based on linear dependencies", () => {
    const tasks: Task[] = [
      {
        id: "task-1",
        subject: "Task 1",
        description: "First task",
        status: "pending",
        blocks: ["task-2"],
        blockedBy: [],
      },
      {
        id: "task-2",
        subject: "Task 2",
        description: "Second task",
        status: "pending",
        blocks: ["task-3"],
        blockedBy: ["task-1"],
      },
      {
        id: "task-3",
        subject: "Task 3",
        description: "Third task",
        status: "pending",
        blocks: [],
        blockedBy: ["task-2"],
      },
    ];

    const waveMap = calculateExecutionWaves(tasks);

    expect(waveMap["task-1"]).toBe(1);
    expect(waveMap["task-2"]).toBe(2);
    expect(waveMap["task-3"]).toBe(3);
  });

  //#given independent parallel tasks
  //#when calculating waves
  //#then all should be in wave 1
  it("should assign independent tasks to same wave", () => {
    const tasks: Task[] = [
      {
        id: "task-1",
        subject: "Task 1",
        description: "First task",
        status: "pending",
        blocks: [],
        blockedBy: [],
      },
      {
        id: "task-2",
        subject: "Task 2",
        description: "Second task",
        status: "pending",
        blocks: [],
        blockedBy: [],
      },
      {
        id: "task-3",
        subject: "Task 3",
        description: "Third task",
        status: "pending",
        blocks: [],
        blockedBy: [],
      },
    ];

    const waveMap = calculateExecutionWaves(tasks);

    expect(waveMap["task-1"]).toBe(1);
    expect(waveMap["task-2"]).toBe(1);
    expect(waveMap["task-3"]).toBe(1);
  });

  //#given a diamond dependency graph
  //#when calculating waves
  //#then tasks should be properly leveled
  it("should handle diamond dependencies correctly", () => {
    const tasks: Task[] = [
      {
        id: "task-1",
        subject: "Base",
        description: "Base task",
        status: "pending",
        blocks: ["task-2", "task-3"],
        blockedBy: [],
      },
      {
        id: "task-2",
        subject: "Left",
        description: "Left task",
        status: "pending",
        blocks: ["task-4"],
        blockedBy: ["task-1"],
      },
      {
        id: "task-3",
        subject: "Right",
        description: "Right task",
        status: "pending",
        blocks: ["task-4"],
        blockedBy: ["task-1"],
      },
      {
        id: "task-4",
        subject: "Final",
        description: "Final task",
        status: "pending",
        blocks: [],
        blockedBy: ["task-2", "task-3"],
      },
    ];

    const waveMap = calculateExecutionWaves(tasks);

    expect(waveMap["task-1"]).toBe(1);
    expect(waveMap["task-2"]).toBe(2);
    expect(waveMap["task-3"]).toBe(2);
    expect(waveMap["task-4"]).toBe(3);
  });

  //#given tasks with specific waves assigned
  //#when getting tasks in a wave
  //#then only those tasks are returned
  it("should filter tasks by wave number", () => {
    const tasks: Task[] = [
      {
        id: "task-1",
        subject: "Wave 1",
        description: "Task in wave 1",
        wave: 1,
        status: "pending",
        blocks: [],
        blockedBy: [],
      },
      {
        id: "task-2",
        subject: "Wave 2",
        description: "Task in wave 2",
        wave: 2,
        status: "pending",
        blocks: [],
        blockedBy: [],
      },
      {
        id: "task-3",
        subject: "Wave 1 again",
        description: "Another task in wave 1",
        wave: 1,
        status: "pending",
        blocks: [],
        blockedBy: [],
      },
    ];

    const wave1Tasks = getTasksInWave(tasks, 1);
    const wave2Tasks = getTasksInWave(tasks, 2);

    expect(wave1Tasks).toHaveLength(2);
    expect(wave2Tasks).toHaveLength(1);
    expect(wave1Tasks.map(t => t.id)).toEqual(["task-1", "task-3"]);
  });

  //#given a task list with waves
  //#when getting max wave
  //#then the highest wave number is returned
  it("should calculate max wave number", () => {
    const waveMap = {
      "task-1": 1,
      "task-2": 2,
      "task-3": 3,
      "task-4": 2,
    };

    const maxWave = getMaxWave(waveMap);

    expect(maxWave).toBe(3);
  });

  //#given tasks without wave assignments
  //#when applying auto waves
  //#then each task gets assigned based on dependencies
  it("should apply auto-calculated waves to tasks", () => {
    const tasks: Task[] = [
      {
        id: "task-1",
        subject: "Task 1",
        description: "First",
        status: "pending",
        blocks: ["task-2"],
        blockedBy: [],
      },
      {
        id: "task-2",
        subject: "Task 2",
        description: "Second",
        status: "pending",
        blocks: [],
        blockedBy: ["task-1"],
      },
    ];

    const result = applyAutoWaves(tasks);

    expect(result[0].wave).toBe(1);
    expect(result[1].wave).toBe(2);
  });

  //#given valid manual wave overrides
  //#when applying them
  //#then waves are updated without violating dependencies
  it("should apply valid manual wave overrides", () => {
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
        wave: 2,
      },
    ];

    const overrides = { "task-1": 1, "task-2": 3 };
    const result = applyManualWaves(tasks, overrides);

    expect(result[0].wave).toBe(1);
    expect(result[1].wave).toBe(3);
  });

  //#given invalid manual wave overrides that violate dependencies
  //#when applying them
  //#then an error is thrown
  it("should reject invalid wave overrides that violate dependencies", () => {
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
        wave: 2,
      },
    ];

    const invalidOverrides = { "task-1": 2, "task-2": 1 }; // task-1 must come before task-2

    expect(() => applyManualWaves(tasks, invalidOverrides)).toThrow();
  });

  //#given tasks with wave assignments
  //#when grouping by wave
  //#then arrays are returned in order
  it("should group tasks by wave in order", () => {
    const tasks: Task[] = [
      {
        id: "task-1",
        subject: "Wave 1",
        description: "First wave",
        status: "pending",
        blocks: [],
        blockedBy: [],
        wave: 1,
      },
      {
        id: "task-2",
        subject: "Wave 2",
        description: "Second wave",
        status: "pending",
        blocks: [],
        blockedBy: [],
        wave: 2,
      },
      {
        id: "task-3",
        subject: "Wave 1 again",
        description: "Also first wave",
        status: "pending",
        blocks: [],
        blockedBy: [],
        wave: 1,
      },
    ];

    const grouped = getTasksByWave(tasks);

    expect(grouped).toHaveLength(2);
    expect(grouped[0]).toHaveLength(2);
    expect(grouped[1]).toHaveLength(1);
  });

  //#given a task with all dependencies completed
  //#when checking if it can execute
  //#then true is returned
  it("should allow execution when dependencies are met", () => {
    const tasks: Task[] = [
      {
        id: "task-1",
        subject: "Blocker",
        description: "Blocking task",
        status: "completed",
        blocks: ["task-2"],
        blockedBy: [],
      },
      {
        id: "task-2",
        subject: "Blocked",
        description: "Blocked task",
        status: "pending",
        blocks: [],
        blockedBy: ["task-1"],
      },
    ];

    const completed = new Set(["task-1"]);
    const canExecute = canExecuteTask("task-2", tasks, completed);

    expect(canExecute).toBe(true);
  });

  //#given a task with unmet dependencies
  //#when checking if it can execute
  //#then false is returned
  it("should prevent execution when dependencies are unmet", () => {
    const tasks: Task[] = [
      {
        id: "task-1",
        subject: "Blocker",
        description: "Blocking task",
        status: "pending",
        blocks: ["task-2"],
        blockedBy: [],
      },
      {
        id: "task-2",
        subject: "Blocked",
        description: "Blocked task",
        status: "pending",
        blocks: [],
        blockedBy: ["task-1"],
      },
    ];

    const completed = new Set<string>([]);
    const canExecute = canExecuteTask("task-2", tasks, completed);

    expect(canExecute).toBe(false);
  });

  //#given a wave with mixed task states
  //#when getting executable tasks
  //#then only pending tasks with met dependencies are returned
  it("should return only executable tasks in a wave", () => {
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
      {
        id: "task-3",
        subject: "Task 3",
        description: "Third",
        status: "completed",
        blocks: [],
        blockedBy: [],
        wave: 1,
      },
    ];

    const completed = new Set<string>([]);
    const executable = getExecutableTasksInWave(tasks, 1, completed);

    expect(executable).toHaveLength(1);
    expect(executable[0].id).toBe("task-1");
  });

  //#given tasks with estimated effort values
  //#when estimating duration
  //#then wave durations and total are calculated
  it("should estimate execution duration with parallelization", () => {
    const tasks: Task[] = [
      {
        id: "task-1",
        subject: "Task 1",
        description: "30 min task",
        estimatedEffort: "30m",
        status: "pending",
        blocks: [],
        blockedBy: [],
        wave: 1,
      },
      {
        id: "task-2",
        subject: "Task 2",
        description: "30 min task parallel",
        estimatedEffort: "30m",
        status: "pending",
        blocks: [],
        blockedBy: [],
        wave: 1,
      },
      {
        id: "task-3",
        subject: "Task 3",
        description: "1 hour task sequential",
        estimatedEffort: "1h",
        status: "pending",
        blocks: [],
        blockedBy: [],
        wave: 2,
      },
    ];

    const estimate = estimateExecutionDuration(tasks);

    expect(estimate.perWave[1]).toBe("30m");
    expect(estimate.perWave[2]).toBe("60m");
    expect(estimate.total).toBe("1h 30m");
  });

  //#given tasks with mixed effort estimates
  //#when estimating duration
  //#then parallel tasks use max duration
  it("should calculate duration with parallel task max", () => {
    const tasks: Task[] = [
      {
        id: "task-1",
        subject: "Quick",
        description: "10 min",
        estimatedEffort: "10m",
        status: "pending",
        blocks: [],
        blockedBy: [],
        wave: 1,
      },
      {
        id: "task-2",
        subject: "Slow",
        description: "45 min",
        estimatedEffort: "45m",
        status: "pending",
        blocks: [],
        blockedBy: [],
        wave: 1,
      },
    ];

    const estimate = estimateExecutionDuration(tasks);

    // Wave 1 should use the max (45m), not sum (55m)
    expect(estimate.perWave[1]).toBe("45m");
    expect(estimate.total).toBe("45m");
  });

  //#given tasks without estimated effort
  //#when estimating duration
  //#then default 30m is used per task
  it("should use default effort when not specified", () => {
    const tasks: Task[] = [
      {
        id: "task-1",
        subject: "No estimate",
        description: "No effort specified",
        status: "pending",
        blocks: [],
        blockedBy: [],
        wave: 1,
      },
      {
        id: "task-2",
        subject: "No estimate 2",
        description: "No effort specified",
        status: "pending",
        blocks: [],
        blockedBy: [],
        wave: 2,
      },
    ];

    const estimate = estimateExecutionDuration(tasks);

    expect(estimate.perWave[1]).toBe("30m");
    expect(estimate.perWave[2]).toBe("30m");
    expect(estimate.total).toBe("1h 0m");
  });

  //#given hour estimates
  //#when estimating duration
  //#then hours are calculated correctly
  it("should parse hour estimates correctly", () => {
    const tasks: Task[] = [
      {
        id: "task-1",
        subject: "2 hours",
        description: "2h task",
        estimatedEffort: "2h",
        status: "pending",
        blocks: [],
        blockedBy: [],
        wave: 1,
      },
      {
        id: "task-2",
        subject: "1.5 hours",
        description: "1h 30m but specified as 1.5h (not supported)",
        estimatedEffort: "1h",
        status: "pending",
        blocks: [],
        blockedBy: [],
        wave: 2,
      },
    ];

    const estimate = estimateExecutionDuration(tasks);

    expect(estimate.perWave[1]).toBe("120m");
    expect(estimate.perWave[2]).toBe("60m");
    expect(estimate.total).toBe("3h 0m");
  });
});
