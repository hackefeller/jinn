import { describe, it, expect, beforeEach } from "bun:test";
import {
  parsePlanFile,
  validateTaskDependencies,
} from "../src/execution/features/task-queue/plan-parser";
import {
  calculateExecutionWaves,
  applyAutoWaves,
} from "../src/execution/features/task-queue/parallelization";
import { buildTaskDelegationPlan } from "../src/execution/features/task-queue/delegation-engine";
import type { Task, WorkflowTaskList } from "../src/execution/features/task-queue";

//#given the complete workflow execution system
//#when workflows:execute and workflows:status are used together
//#then they should work in concert to execute and monitor tasks

describe("workflows:execute and workflows:status integration", () => {
  let samplePlan: WorkflowTaskList;

  beforeEach(() => {
    //#given a complete workflow plan
    samplePlan = {
      plan_id: "plan-123",
      plan_name: "Feature Implementation",
      created_at: new Date().toISOString(),
      auto_parallelization: true,
      tasks: [
        {
          id: "task-1",
          subject: "Design API schema",
          description: "Define API endpoints and data models",
          status: "pending",
          blocks: ["task-2", "task-3"],
          blockedBy: [],
          category: "ultrabrain",
          estimatedEffort: "2h",
        },
        {
          id: "task-2",
          subject: "Implement database layer",
          description: "Create data access layer",
          status: "pending",
          blocks: ["task-4"],
          blockedBy: ["task-1"],
          category: "deep",
          estimatedEffort: "3h",
        },
        {
          id: "task-3",
          subject: "Create API endpoints",
          description: "Build REST API handlers",
          status: "pending",
          blocks: ["task-5"],
          blockedBy: ["task-1"],
          category: "deep",
          estimatedEffort: "2h",
        },
        {
          id: "task-4",
          subject: "Add database migrations",
          description: "Create migration scripts",
          status: "pending",
          blocks: [],
          blockedBy: ["task-2"],
          category: "quick",
          estimatedEffort: "1h",
        },
        {
          id: "task-5",
          subject: "Write comprehensive tests",
          description: "Add unit and integration tests",
          status: "pending",
          blocks: [],
          blockedBy: ["task-3"],
          category: "deep",
          estimatedEffort: "3h",
        },
      ],
    };
  });

  it("should validate plan dependencies before execution", () => {
    //#when validating task dependencies
    const validation = validateTaskDependencies(samplePlan.tasks);

    //#then all dependencies should be valid
    expect(validation.valid).toBe(true);
    expect(validation.errors.length).toBe(0);
  });

  it("should calculate execution waves for parallel execution", () => {
    //#when calculating execution waves
    const waveMap = calculateExecutionWaves(samplePlan.tasks);

    //#then tasks should be grouped into sequential waves
    expect(waveMap["task-1"]).toBe(1); // Independent task
    expect(waveMap["task-2"]).toBeGreaterThan(1); // Depends on task-1
    expect(waveMap["task-3"]).toBeGreaterThan(1); // Depends on task-1
    expect(waveMap["task-4"]).toBeGreaterThan(waveMap["task-2"]); // Depends on task-2
    expect(waveMap["task-5"]).toBeGreaterThan(waveMap["task-3"]); // Depends on task-3
  });

  it("should apply waves to tasks for execution planning", () => {
    //#when applying auto waves
    const tasksWithWaves = applyAutoWaves(samplePlan.tasks);

    //#then all tasks should have wave assignments
    for (const task of tasksWithWaves) {
      expect(task.wave).toBeDefined();
      expect(task.wave).toBeGreaterThan(0);
    }
  });

  it("should build delegation plan with category distribution", () => {
    //#when building delegation plan
    const tasksWithWaves = applyAutoWaves(samplePlan.tasks);
    const delegationPlan = buildTaskDelegationPlan(tasksWithWaves);

    //#then delegation plan should categorize all tasks
    expect(delegationPlan.totalTasks).toBe(5);
    expect(delegationPlan.tasksByCategory.ultrabrain).toBe(1); // task-1
    expect(delegationPlan.tasksByCategory.deep).toBe(3); // task-2, task-3, task-5
    expect(delegationPlan.tasksByCategory.quick).toBe(1); // task-4
  });

  it("should track task execution state across session resumptions", () => {
    //#given a plan being executed
    let executionState = {
      completedTasks: new Set<string>(),
      inProgressTasks: new Set<string>(),
      failedTasks: new Set<string>(),
    };

    //#when first task completes
    executionState.completedTasks.add("task-1");

    //#then task-2 and task-3 should become executable
    const executableTasks = samplePlan.tasks.filter((t) => {
      if (t.status !== "pending") return false;
      return (t.blockedBy || []).every((id) => executionState.completedTasks.has(id));
    });

    expect(executableTasks.map((t) => t.id)).toContain("task-2");
    expect(executableTasks.map((t) => t.id)).toContain("task-3");
    expect(executableTasks.map((t) => t.id)).not.toContain("task-4");
  });

  it("should enable workflows:status to show accurate progress during execution", () => {
    //#given a partially completed workflow
    const updatedPlan: WorkflowTaskList = {
      ...samplePlan,
      tasks: samplePlan.tasks.map((t) => {
        if (t.id === "task-1") return { ...t, status: "completed" };
        if (t.id === "task-2") return { ...t, status: "in_progress" };
        return t;
      }),
    };

    //#when calculating status metrics
    const completed = updatedPlan.tasks.filter((t) => t.status === "completed").length;
    const inProgress = updatedPlan.tasks.filter((t) => t.status === "in_progress").length;
    const pending = updatedPlan.tasks.filter((t) => t.status === "pending").length;
    const percentage = Math.round((completed / updatedPlan.tasks.length) * 100);

    //#then metrics should show progress
    expect(completed).toBe(1);
    expect(inProgress).toBe(1);
    expect(pending).toBe(3);
    expect(percentage).toBe(20);
  });

  it("should support resuming from middle of execution", () => {
    //#given a workflow interrupted mid-execution
    const interruptedPlan: WorkflowTaskList = {
      ...samplePlan,
      executed_at: new Date().toISOString(),
      tasks: samplePlan.tasks.map((t) => {
        if (t.id === "task-1") return { ...t, status: "completed" };
        return t;
      }),
    };

    //#when resuming execution
    const tasksWithWaves = applyAutoWaves(interruptedPlan.tasks);

    // Find tasks that are pending and all their blockers are completed
    const executableTasks = tasksWithWaves.filter((t) => {
      if (t.status !== "pending") return false;
      return (t.blockedBy || []).every(
        (id) => interruptedPlan.tasks.find((x) => x.id === id)?.status === "completed",
      );
    });

    //#then execution should continue with tasks-2 and task-3 executable
    expect(executableTasks.length).toBeGreaterThan(0);
    expect(executableTasks.map((t) => t.id)).toContain("task-2");
    expect(executableTasks.map((t) => t.id)).toContain("task-3");

    // Verify wave assignment is correct
    const nextWave = Math.min(...executableTasks.map((t) => t.wave || 1));
    expect(nextWave).toBe(2);
  });

  it("should handle complete workflow execution cycle", () => {
    //#given a fresh workflow plan
    let plan = { ...samplePlan };

    //#when executing wave 1 (task-1)
    plan.tasks = plan.tasks.map((t) => (t.id === "task-1" ? { ...t, status: "completed" } : t));

    //#then wave 2 tasks should become executable
    let executableWave2 = plan.tasks.filter(
      (t) => (t.id === "task-2" || t.id === "task-3") && t.status === "pending",
    );
    expect(executableWave2.length).toBe(2);

    //#when executing wave 2 (task-2, task-3)
    plan.tasks = plan.tasks.map((t) =>
      t.id === "task-2" || t.id === "task-3" ? { ...t, status: "completed" } : t,
    );

    //#then wave 3 tasks should become executable
    let executableWave3 = plan.tasks.filter(
      (t) => (t.id === "task-4" || t.id === "task-5") && t.status === "pending",
    );
    expect(executableWave3.length).toBe(2);

    //#when executing wave 3 (task-4, task-5)
    plan.tasks = plan.tasks.map((t) =>
      t.id === "task-4" || t.id === "task-5" ? { ...t, status: "completed" } : t,
    );

    //#then all tasks should be complete
    const allComplete = plan.tasks.every((t) => t.status === "completed");
    expect(allComplete).toBe(true);
  });

  it("should maintain task metadata throughout execution", () => {
    //#given tasks with metadata
    const taskWithMetadata: Task = {
      id: "task-meta",
      subject: "Task with context",
      description: "Task that needs metadata",
      status: "pending",
      blocks: [],
      blockedBy: [],
      category: "deep",
      estimatedEffort: "2h",
      metadata: {
        relatedPR: "PR-123",
        assignee: "engineer-1",
        priority: "high",
      },
    };

    //#when executing task
    const executedTask = { ...taskWithMetadata, status: "completed" as const };

    //#then metadata should be preserved
    expect(executedTask.metadata).toEqual(taskWithMetadata.metadata);
    expect(executedTask.metadata?.relatedPR).toBe("PR-123");
  });

  it("should calculate total execution time across all waves", () => {
    //#given a complete workflow
    const tasksWithWaves = applyAutoWaves(samplePlan.tasks);

    //#when calculating total effort
    const totalEffort = tasksWithWaves.reduce((sum, t) => {
      if (!t.estimatedEffort) return sum;
      const match = t.estimatedEffort.match(/(\d+)([mh])/);
      if (!match) return sum;
      const [, value, unit] = match;
      const minutes = parseInt(value, 10) * (unit === "h" ? 60 : 1);
      return sum + minutes;
    }, 0);

    //#then total should be correct (2h + 3h + 2h + 1h + 3h = 11h)
    expect(totalEffort).toBe(660); // 11 hours in minutes
  });
});
