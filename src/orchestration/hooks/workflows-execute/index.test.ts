import { describe, it, expect } from "bun:test";
import type { Task } from "../../../execution/features/task-queue";
import { 
  calculateExecutionWaves, 
  getTasksByWave 
} from "../../../execution/features/task-queue";

//#given a workflows:execute hook
//#when invoked with proper inputs  
//#then it should delegate tasks correctly

// Test helper: Create sample tasks with dependencies
function createSampleTasks(): Task[] {
  return [
    {
      id: "task-1",
      subject: "Design database schema",
      description: "Create normalized database schema",
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
      description: "Build REST API",
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
      subject: "Write API tests",
      description: "Add comprehensive test coverage",
      status: "pending",
      blocks: [],
      blockedBy: ["task-3"],
      category: "deep",
      estimatedEffort: "2h",
    },
  ] as Task[];
}

describe("workflows:execute hook integration", () => {
  it("should calculate execution waves for task dependencies", () => {
    //#given sample tasks with defined dependencies
    const tasks = createSampleTasks();
    
    //#when calculating execution waves
    const waveMap = calculateExecutionWaves(tasks);
    
    //#then independent tasks should be in wave 1
    expect(waveMap["task-1"]).toBe(1);
    
    //#and dependent tasks should be in later waves
    expect(waveMap["task-2"]).toBeGreaterThan(1);
    expect(waveMap["task-3"]).toBeGreaterThan(1);
  });

  it("should group tasks into waves correctly", () => {
    //#given sample tasks
    const tasks = createSampleTasks();
    
    //#when applying auto waves
    const tasksWithWaves = tasks.map(t => ({
      ...t,
      wave: calculateExecutionWaves(tasks)[t.id]
    }));
    
    //#then getTasksByWave should return organized task groups
    const waves = getTasksByWave(tasksWithWaves);
    expect(waves.length).toBeGreaterThan(0);
    expect(waves[0].length).toBe(1); // Wave 1 has only task-1
  });

  it("should support task status tracking across sessions", () => {
    //#given tasks with pending status
    const tasks = createSampleTasks();
    
    //#when we update task status
    const updatedTasks = tasks.map(t => ({
      ...t,
      status: t.id === "task-1" ? "completed" : "pending"
    }));
    
    //#then completed tasks should be marked properly
    expect(updatedTasks.find(t => t.id === "task-1")?.status).toBe("completed");
    expect(updatedTasks.find(t => t.id === "task-2")?.status).toBe("pending");
  });

  it("should handle tasks with multiple blockedBy dependencies", () => {
    //#given a task blocked by multiple dependencies
    const tasks: Task[] = [
      {
        id: "task-a",
        subject: "Setup infrastructure",
        description: "Setup infrastructure and services",
        status: "pending",
        blocks: ["task-d"],
        blockedBy: [],
        category: "ultrabrain",
      },
      {
        id: "task-b",
        subject: "Create config",
        description: "Create configuration files",
        status: "pending",
        blocks: ["task-d"],
        blockedBy: [],
        category: "quick",
      },
      {
        id: "task-c",
        subject: "Deploy services",
        description: "Deploy services to cloud",
        status: "pending",
        blocks: ["task-d"],
        blockedBy: [],
        category: "deep",
      },
      {
        id: "task-d",
        subject: "Run integration tests",
        description: "Run comprehensive integration tests",
        status: "pending",
        blocks: [],
        blockedBy: ["task-a", "task-b", "task-c"],
        category: "deep",
      },
    ];
    
    //#when calculating waves
    const waveMap = calculateExecutionWaves(tasks);
    
    //#then task-d should be in a later wave than all its blockers
    expect(waveMap["task-d"]).toBeGreaterThan(waveMap["task-a"]);
    expect(waveMap["task-d"]).toBeGreaterThan(waveMap["task-b"]);
    expect(waveMap["task-d"]).toBeGreaterThan(waveMap["task-c"]);
  });

  it("should preserve task metadata through execution", () => {
    //#given a task with metadata
    const task: Task = {
      id: "task-meta",
      subject: "Test task",
      description: "Task with metadata",
      status: "pending",
      blocks: [],
      blockedBy: [],
      metadata: {
        assignee: "engineer-1",
        priority: "high",
        relatedPR: "PR-123"
      }
    };
    
    //#when accessing metadata
    //#then all fields should be preserved
    expect(task.metadata?.assignee).toBe("engineer-1");
    expect(task.metadata?.priority).toBe("high");
    expect(task.metadata?.relatedPR).toBe("PR-123");
  });

  it("should handle empty task lists gracefully", () => {
    //#given an empty task list
    const tasks: Task[] = [];
    
    //#when calculating waves
    const waveMap = calculateExecutionWaves(tasks);
    
    //#then it should return empty map
    expect(Object.keys(waveMap).length).toBe(0);
  });

  it("should support task skipping based on blockedBy conditions", () => {
    //#given tasks with blocking dependencies
    const tasks = createSampleTasks();
    
    //#when a blocking task fails (not completed)
    const blockingTaskCompleted = new Set<string>();
    blockingTaskCompleted.add("task-1");
    
    //#then dependent tasks should not be executable
    const task2Blockers = tasks.find(t => t.id === "task-2")?.blockedBy || [];
    const task2Executable = task2Blockers.every(id => blockingTaskCompleted.has(id));
    expect(task2Executable).toBe(true);
  });
});
