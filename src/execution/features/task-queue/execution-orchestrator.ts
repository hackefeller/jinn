import type { Task } from "./types";
import {
  getTasksByWave,
  getExecutableTasksInWave,
  canExecuteTask,
} from "./parallelization";
import {
  buildTaskDelegationInstruction,
  validateTaskForDelegation,
  type TaskDelegationResult,
} from "./delegation-engine";

/**
 * Execution state tracking for a workflow
 */
export interface ExecutionState {
  workflowId: string;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  currentWave: number;
  maxWave: number;
  startedAt?: Date;
  completedAt?: Date;
  completedTaskIds: Set<string>;
  failedTaskIds: Set<string>;
}

/**
 * Task execution result
 */
export interface TaskExecutionResult {
  taskId: string;
  status: "success" | "failure" | "skipped";
  output?: string;
  error?: string;
  duration?: number;
  delegationTaskId?: string;
}

/**
 * Initialize execution state for a workflow
 */
export function initializeExecutionState(
  workflowId: string,
  tasks: Task[]
): ExecutionState {
  const maxWave = Math.max(...tasks.map(t => t.wave || 1), 1);

  return {
    workflowId,
    totalTasks: tasks.length,
    completedTasks: 0,
    failedTasks: 0,
    currentWave: 1,
    maxWave,
    startedAt: new Date(),
    completedTaskIds: new Set(),
    failedTaskIds: new Set(),
  };
}

/**
 * Get the next set of tasks to execute (current wave, executable, not yet started)
 */
export function getNextTasksToExecute(
  tasks: Task[],
  state: ExecutionState
): Task[] {
  return getExecutableTasksInWave(
    tasks,
    state.currentWave,
    state.completedTaskIds
  );
}

/**
 * Advance to next execution wave
 */
export function advanceToNextWave(state: ExecutionState): boolean {
  if (state.currentWave < state.maxWave) {
    state.currentWave++;
    return true;
  }
  return false;
}

/**
 * Mark a task as completed
 */
export function markTaskCompleted(
  taskId: string,
  state: ExecutionState
): void {
  state.completedTaskIds.add(taskId);
  state.completedTasks++;
}

/**
 * Mark a task as failed
 */
export function markTaskFailed(
  taskId: string,
  state: ExecutionState
): void {
  state.failedTaskIds.add(taskId);
  state.failedTasks++;
}

/**
 * Check if execution is complete
 */
export function isExecutionComplete(state: ExecutionState): boolean {
  return (
    state.currentWave >= state.maxWave &&
    state.completedTasks + state.failedTasks === state.totalTasks
  );
}

/**
 * Check if execution should halt (too many failures)
 */
export function shouldHaltExecution(
  state: ExecutionState,
  failureThreshold: number = 0.5
): boolean {
  const failureRate = state.failedTasks / state.totalTasks;
  return failureRate >= failureThreshold;
}

/**
 * Get execution summary
 */
export interface ExecutionSummary {
  workflowId: string;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  pendingTasks: number;
  successRate: number;
  duration?: string;
  status: "in_progress" | "completed" | "halted" | "failed";
}

export function getExecutionSummary(state: ExecutionState): ExecutionSummary {
  const pendingTasks =
    state.totalTasks - state.completedTasks - state.failedTasks;
  const successRate =
    state.totalTasks > 0
      ? (state.completedTasks / state.totalTasks) * 100
      : 0;

  let status: "in_progress" | "completed" | "halted" | "failed" =
    "in_progress";
  if (state.completedTasks === state.totalTasks) {
    status = "completed";
  } else if (
    state.failedTasks > 0 &&
    pendingTasks === 0
  ) {
    status = "failed";
  } else if (shouldHaltExecution(state)) {
    status = "halted";
  }

  let duration: string | undefined;
  if (state.startedAt && state.completedAt) {
    const ms = state.completedAt.getTime() - state.startedAt.getTime();
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    duration =
      minutes > 0
        ? `${minutes}m ${seconds}s`
        : `${seconds}s`;
  }

  return {
    workflowId: state.workflowId,
    totalTasks: state.totalTasks,
    completedTasks: state.completedTasks,
    failedTasks: state.failedTasks,
    pendingTasks,
    successRate: Math.round(successRate * 100) / 100,
    duration,
    status,
  };
}

/**
 * Build execution plan - all tasks ready for delegation in order
 */
export interface ExecutionPlan {
  workflowId: string;
  maxWave: number;
  waveTaskMap: Record<number, TaskDelegationResult[]>;
  totalTasks: number;
  validationErrors: string[];
}

export function buildExecutionPlan(
  workflowId: string,
  tasks: Task[],
  workflowContext?: string
): ExecutionPlan {
  const validationErrors: string[] = [];
  const waveTaskMap: Record<number, TaskDelegationResult[]> = {};
  const maxWave = Math.max(...tasks.map(t => t.wave || 1), 1);

  // Validate all tasks
  for (const task of tasks) {
    const validation = validateTaskForDelegation(task);
    if (!validation.valid) {
      validationErrors.push(`Task ${task.id}: ${validation.errors.join("; ")}`);
    }
  }

  // If validation failed, return early with errors
  if (validationErrors.length > 0) {
    return {
      workflowId,
      maxWave,
      waveTaskMap: {},
      totalTasks: tasks.length,
      validationErrors,
    };
  }

  // Organize tasks by wave with delegation instructions
  for (let wave = 1; wave <= maxWave; wave++) {
    const waveTasks = getTasksByWave(tasks);
    if (wave <= waveTasks.length) {
      waveTaskMap[wave] = waveTasks[wave - 1]
        .map(task => buildTaskDelegationInstruction(task, workflowContext))
        .filter(instruction => !instruction.error);
    }
  }

  return {
    workflowId,
    maxWave,
    waveTaskMap,
    totalTasks: tasks.length,
    validationErrors,
  };
}

/**
 * Format execution plan for display/logging
 */
export function formatExecutionPlan(plan: ExecutionPlan): string {
  const lines: string[] = [
    `## Execution Plan: ${plan.workflowId}`,
    `Total Tasks: ${plan.totalTasks}`,
    `Waves: ${plan.maxWave}`,
    "",
  ];

  if (plan.validationErrors.length > 0) {
    lines.push("### ⚠️ Validation Errors");
    plan.validationErrors.forEach(error => {
      lines.push(`- ${error}`);
    });
    lines.push("");
  }

  for (let wave = 1; wave <= plan.maxWave; wave++) {
    const tasks = plan.waveTaskMap[wave] || [];
    lines.push(`### Wave ${wave} (${tasks.length} tasks)`);

    for (const task of tasks) {
      const categoryStr = task.category || "unspecified";
      const skillStr =
        task.skills.length > 0 ? ` [${task.skills.join(", ")}]` : "";
      const durationStr = task.estimatedDuration ? ` (${task.estimatedDuration})` : "";
      lines.push(
        `- **${task.taskId}**: ${categoryStr}${skillStr}${durationStr}`
      );
    }
    lines.push("");
  }

  return lines.join("\n");
}
