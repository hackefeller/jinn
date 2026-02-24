import { type Task } from "./types";
import { findTaskDependencies, findTaskDependers, getTransitiveDependencies } from "./plan-parser";

/**
 * Calculate automatic execution waves for tasks based on their dependencies
 * Returns a map of task ID to wave number (1, 2, 3, etc.)
 *
 * Algorithm:
 * 1. Build a dependency graph from blockedBy relationships
 * 2. Use topological sort to determine execution order
 * 3. Group independent tasks into waves
 * 4. Each wave contains only tasks that have no unmet dependencies
 */
export function calculateExecutionWaves(tasks: Task[]): Record<string, number> {
  const waveMap: Record<string, number> = {};
  const inDegree: Record<string, number> = {};
  const adjList: Record<string, string[]> = {};

  // Initialize in-degree and adjacency list
  for (const task of tasks) {
    inDegree[task.id] = task.blockedBy?.length || 0;
    adjList[task.id] = [];
  }

  // Build adjacency list: if A blocks B, then A -> B
  for (const task of tasks) {
    if (task.blocks) {
      for (const blockId of task.blocks) {
        if (adjList[task.id]) {
          adjList[task.id].push(blockId);
        }
      }
    }
  }

  // Kahn's algorithm for topological sort with wave assignment
  const queue: string[] = [];
  const currentWave = 1;

  // Start with tasks that have no dependencies
  for (const task of tasks) {
    if (inDegree[task.id] === 0) {
      queue.push(task.id);
      waveMap[task.id] = currentWave;
    }
  }

  let wave = currentWave;
  while (queue.length > 0) {
    const nextQueue: string[] = [];
    const nextWave = wave + 1;

    // Process all tasks in current wave
    for (const taskId of queue) {
      // For each task that this one blocks
      for (const dependentId of adjList[taskId] || []) {
        inDegree[dependentId]--;
        // If all dependencies are met, add to next wave
        if (inDegree[dependentId] === 0) {
          nextQueue.push(dependentId);
          waveMap[dependentId] = nextWave;
        }
      }
    }

    queue.length = 0;
    queue.push(...nextQueue);
    wave = nextWave;
  }

  // Check if any tasks were not assigned (indicates circular dependency or disconnected graph)
  for (const task of tasks) {
    if (!waveMap[task.id]) {
      // Assign to a high wave number as fallback
      waveMap[task.id] = wave;
    }
  }

  return waveMap;
}

/**
 * Get all tasks for a specific execution wave
 */
export function getTasksInWave(tasks: Task[], waveNumber: number): Task[] {
  return tasks.filter((task) => task.wave === waveNumber);
}

/**
 * Get the maximum wave number in the execution plan
 */
export function getMaxWave(waveMap: Record<string, number>): number {
  const waves = Object.values(waveMap);
  return waves.length > 0 ? Math.max(...waves) : 0;
}

/**
 * Apply auto-calculated waves to tasks (updates task.wave field)
 * Returns updated tasks with wave assignments
 */
export function applyAutoWaves(tasks: Task[]): Task[] {
  const waveMap = calculateExecutionWaves(tasks);

  return tasks.map((task) => ({
    ...task,
    wave: waveMap[task.id],
  }));
}

/**
 * Apply manual wave overrides to tasks
 * Validates that overrides don't create circular dependencies
 * Returns updated tasks, or throws error if overrides are invalid
 */
export function applyManualWaves(
  tasks: Task[],
  manualWaveOverrides: Record<string, number>,
): Task[] {
  // Apply overrides
  const updatedTasks = tasks.map((task) => ({
    ...task,
    wave: manualWaveOverrides[task.id] ?? task.wave,
  }));

  // Validate no violations: if A blocks B, wave(A) must be <= wave(B)
  for (const task of updatedTasks) {
    const taskWave = task.wave || 1;

    // Check blocked tasks
    if (task.blocks) {
      for (const blockId of task.blocks) {
        const blockedTask = updatedTasks.find((t) => t.id === blockId);
        if (blockedTask) {
          const blockedWave = blockedTask.wave || 1;
          if (taskWave > blockedWave) {
            throw new Error(
              `Wave override violation: Task "${task.id}" (wave ${taskWave}) blocks ` +
                `task "${blockId}" (wave ${blockedWave}), but blocker must be in earlier wave`,
            );
          }
        }
      }
    }

    // Check blocking tasks
    if (task.blockedBy) {
      for (const blockerId of task.blockedBy) {
        const blockerTask = updatedTasks.find((t) => t.id === blockerId);
        if (blockerTask) {
          const blockerWave = blockerTask.wave || 1;
          if (blockerWave > taskWave) {
            throw new Error(
              `Wave override violation: Task "${task.id}" (wave ${taskWave}) is blocked by ` +
                `task "${blockerId}" (wave ${blockerWave}), but dependency must be in earlier wave`,
            );
          }
        }
      }
    }
  }

  return updatedTasks;
}

/**
 * Get all tasks grouped by execution wave
 * Returns array of arrays: [wave1Tasks, wave2Tasks, wave3Tasks, ...]
 */
export function getTasksByWave(tasks: Task[]): Task[][] {
  if (tasks.length === 0) return [];

  const maxWave = Math.max(...tasks.map((t) => t.wave || 1));
  const waves: Task[][] = [];

  for (let wave = 1; wave <= maxWave; wave++) {
    const waveTasks = tasks.filter((t) => t.wave === wave);
    if (waveTasks.length > 0) {
      waves.push(waveTasks);
    }
  }

  return waves;
}

/**
 * Check if a task can be executed (all dependencies completed)
 */
export function canExecuteTask(
  taskId: string,
  tasks: Task[],
  completedTaskIds: Set<string>,
): boolean {
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return false;

  // Task can execute if all its blockers are completed
  if (task.blockedBy && task.blockedBy.length > 0) {
    return task.blockedBy.every((blockerId) => completedTaskIds.has(blockerId));
  }

  return true;
}

/**
 * Get the next available tasks to execute (all dependencies met, not yet started)
 */
export function getExecutableTasksInWave(
  tasks: Task[],
  waveNumber: number,
  completedTaskIds: Set<string>,
): Task[] {
  return getTasksInWave(tasks, waveNumber).filter(
    (task) => task.status === "pending" && canExecuteTask(task.id, tasks, completedTaskIds),
  );
}

/**
 * Calculate estimated total duration for execution plan
 * Uses task estimatedEffort fields and parallelization
 * Returns object with duration per wave and total duration
 */
export function estimateExecutionDuration(tasks: Task[]): {
  perWave: Record<number, string>;
  total: string;
} {
  const parseEffort = (effort?: string): number => {
    if (!effort) return 30; // default 30 minutes
    const match = effort.match(/(\d+)([mh])/);
    if (!match) return 30;
    const [, value, unit] = match;
    const minutes = parseInt(value, 10) * (unit === "h" ? 60 : 1);
    return minutes;
  };

  const waveGroups = getTasksByWave(tasks);
  const perWave: Record<number, string> = {};
  let totalMinutes = 0;

  waveGroups.forEach((waveTasks, waveIndex) => {
    const wave = waveIndex + 1;
    // In a wave, tasks run in parallel, so duration is the max of all tasks in that wave
    const waveDuration = Math.max(...waveTasks.map((t) => parseEffort(t.estimatedEffort)));
    perWave[wave] = `${waveDuration}m`;
    totalMinutes += waveDuration;
  });

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const total = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return { perWave, total };
}
