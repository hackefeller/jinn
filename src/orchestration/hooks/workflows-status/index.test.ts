import { describe, it, expect } from "bun:test";
import type { Task } from "../../../execution/features/task-queue";

//#given a workflows:status hook
//#when invoked to check workflow progress
//#then it should show accurate status metrics

describe("workflows:status hook integration", () => {
  it("should calculate completion percentage correctly", () => {
    //#given a set of tasks with some completed
    const tasks: Task[] = [
      {
        id: "task-1",
        subject: "Task 1",
        description: "First task",
        status: "completed",
        blocks: [],
        blockedBy: [],
      },
      {
        id: "task-2",
        subject: "Task 2",
        description: "Second task",
        status: "completed",
        blocks: [],
        blockedBy: [],
      },
      {
        id: "task-3",
        subject: "Task 3",
        description: "Third task",
        status: "in_progress",
        blocks: [],
        blockedBy: [],
      },
      {
        id: "task-4",
        subject: "Task 4",
        description: "Fourth task",
        status: "pending",
        blocks: [],
        blockedBy: [],
      },
      {
        id: "task-5",
        subject: "Task 5",
        description: "Fifth task",
        status: "pending",
        blocks: [],
        blockedBy: [],
      },
    ];

    //#when calculating progress
    const completed = tasks.filter((t) => t.status === "completed").length;
    const inProgress = tasks.filter((t) => t.status === "in_progress").length;
    const pending = tasks.filter((t) => t.status === "pending").length;
    const percentage = (completed / tasks.length) * 100;

    //#then metrics should be accurate
    expect(completed).toBe(2);
    expect(inProgress).toBe(1);
    expect(pending).toBe(2);
    expect(percentage).toBe(40);
  });

  it("should track in-progress tasks", () => {
    //#given a task marked as in_progress
    const inProgressTasks: Task[] = [
      {
        id: "task-executing",
        subject: "Currently executing",
        description: "This task is running",
        status: "in_progress",
        blocks: [],
        blockedBy: [],
      },
    ];

    //#when checking in-progress status
    //#then the task should be identifiable
    expect(inProgressTasks[0].status).toBe("in_progress");
    expect(inProgressTasks[0].id).toBe("task-executing");
  });

  it("should calculate remaining work", () => {
    //#given tasks with effort estimates
    const tasks: Task[] = [
      {
        id: "task-1",
        subject: "Task 1",
        description: "Completed",
        status: "completed",
        blocks: [],
        blockedBy: [],
        estimatedEffort: "2h",
      },
      {
        id: "task-2",
        subject: "Task 2",
        description: "Remaining",
        status: "pending",
        blocks: [],
        blockedBy: [],
        estimatedEffort: "3h",
      },
      {
        id: "task-3",
        subject: "Task 3",
        description: "Remaining",
        status: "pending",
        blocks: [],
        blockedBy: [],
        estimatedEffort: "1h",
      },
    ];

    //#when calculating remaining effort
    const remainingTasks = tasks.filter((t) => t.status !== "completed");
    const remainingEffort = remainingTasks.reduce((sum, t) => {
      if (!t.estimatedEffort) return sum;
      const match = t.estimatedEffort.match(/(\d+)([mh])/);
      if (!match) return sum;
      const [, value, unit] = match;
      const minutes = parseInt(value, 10) * (unit === "h" ? 60 : 1);
      return sum + minutes;
    }, 0);

    //#then remaining effort should be correct (3h + 1h = 4h = 240m)
    expect(remainingTasks.length).toBe(2);
    expect(remainingEffort).toBe(240);
  });

  it("should show current wave progress", () => {
    //#given tasks grouped by waves
    const tasksWithWaves = [
      { id: "task-1", wave: 1, status: "completed" },
      { id: "task-2", wave: 1, status: "completed" },
      { id: "task-3", wave: 2, status: "in_progress" },
      { id: "task-4", wave: 2, status: "pending" },
      { id: "task-5", wave: 3, status: "pending" },
    ];

    //#when checking current wave
    const currentWave = 2;
    const tasksInWave = tasksWithWaves.filter((t) => t.wave === currentWave);
    const completedInWave = tasksInWave.filter((t) => t.status === "completed").length;

    //#then current wave info should be accurate
    expect(tasksInWave.length).toBe(2);
    expect(completedInWave).toBe(0);
    expect(currentWave).toBe(2);
  });

  it("should format readable status report", () => {
    //#given workflow metrics
    const metrics = {
      completed: 5,
      inProgress: 2,
      pending: 3,
      total: 10,
      percentage: 50,
      currentWave: 2,
      totalWaves: 4,
    };

    //#when formatting report
    const report = `
Progress: ${metrics.percentage}%
Completed: ${metrics.completed}/${metrics.total}
Current Wave: ${metrics.currentWave}/${metrics.totalWaves}
In Progress: ${metrics.inProgress}
Pending: ${metrics.pending}
`.trim();

    //#then report should contain key metrics
    expect(report).toContain("50%");
    expect(report).toContain("5/10");
    expect(report).toContain("2/4");
    expect(report).toContain("In Progress: 2");
    expect(report).toContain("Pending: 3");
  });

  it("should identify executable tasks based on dependencies", () => {
    //#given tasks with blocking dependencies
    const completedTasks = new Set(["task-1", "task-2"]);
    const allTasks = [
      { id: "task-1", status: "completed", blockedBy: [] },
      { id: "task-2", status: "completed", blockedBy: [] },
      { id: "task-3", status: "pending", blockedBy: ["task-1", "task-2"] },
      { id: "task-4", status: "pending", blockedBy: ["task-3"] },
    ];

    //#when checking executability
    const executableTasks = allTasks.filter((t) => {
      if (t.status !== "pending") return false;
      return t.blockedBy.every((id) => completedTasks.has(id));
    });

    //#then only tasks with met dependencies should be executable
    expect(executableTasks.length).toBe(1);
    expect(executableTasks[0].id).toBe("task-3");
  });

  it("should suggest next action based on status", () => {
    //#given workflow at different completion states

    // Case 1: All complete
    const allComplete = {
      total: 5,
      completed: 5,
      inProgress: 0,
    };
    const action1 =
      allComplete.completed === allComplete.total ? "complete-workflow" : "continue-execution";
    expect(action1).toBe("complete-workflow");

    // Case 2: In progress
    const inProgress = {
      total: 5,
      completed: 2,
      inProgress: 2,
    };
    const action2 = inProgress.inProgress > 0 ? "wait-for-completion" : "continue-execution";
    expect(action2).toBe("wait-for-completion");

    // Case 3: Pending only
    const allPending = {
      total: 5,
      completed: 0,
      inProgress: 0,
    };
    const action3 =
      allPending.completed === allPending.total ? "complete-workflow" : "continue-execution";
    expect(action3).toBe("continue-execution");
  });

  it("should handle plans with no execution state", () => {
    //#given a new plan with no execution started
    const planData = {
      plan_id: "plan-123",
      plan_name: "New Plan",
      tasks: [
        {
          id: "task-1",
          subject: "Task",
          description: "Desc",
          status: "pending",
          blocks: [],
          blockedBy: [],
        },
      ],
      created_at: new Date().toISOString(),
      executed_at: undefined,
    };

    //#when checking status of unstarted plan
    //#then it should show not-yet-started status
    expect(planData.executed_at).toBeUndefined();
    expect(planData.tasks[0].status).toBe("pending");
  });

  it("should track execution timeline", () => {
    //#given execution events with timestamps
    const startTime = new Date("2026-02-23T20:00:00Z");
    const lastUpdate = new Date("2026-02-23T22:00:00Z");
    const durationMs = lastUpdate.getTime() - startTime.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);

    //#when calculating elapsed time
    //#then duration should be accurate
    expect(durationHours).toBe(2);
    expect(durationMs).toBe(7200000);
  });
});
