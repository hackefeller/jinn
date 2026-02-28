import { readFile, writeFile } from "node:fs/promises";
import { WorkflowTaskListSchema, type WorkflowTaskList, type Task } from "./types";

/**
 * Parse a plan file and extract the structured task list (JSON block)
 * Expects markdown file with JSON code fence containing task list
 */
export async function parsePlanFile(planPath: string): Promise<WorkflowTaskList> {
  const content = await readFile(planPath, "utf-8");

  // Look for JSON code fence: ```json ... ```
  const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
  if (!jsonMatch || !jsonMatch[1]) {
    throw new Error(`No JSON task list found in plan file: ${planPath}`);
  }

  try {
    const taskListJson = JSON.parse(jsonMatch[1]);
    const taskList = WorkflowTaskListSchema.parse(taskListJson);
    return taskList;
  } catch (error) {
    throw new Error(
      `Failed to parse task list JSON in ${planPath}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Update a plan file with new task list (updates JSON block, preserves markdown)
 */
export async function updatePlanFile(planPath: string, taskList: WorkflowTaskList): Promise<void> {
  const content = await readFile(planPath, "utf-8");

  // Preserve everything except the JSON task block
  const beforeJson = content.split(/```json\n[\s\S]*?\n```/)[0] || "";
  const afterJson = content.split(/```json\n[\s\S]*?\n```/)[1] || "";

  const jsonBlock = `\`\`\`json\n${JSON.stringify(taskList, null, 2)}\n\`\`\``;

  const updatedContent = beforeJson + jsonBlock + (afterJson ? "\n" + afterJson : "");

  await writeFile(planPath, updatedContent, "utf-8");
}

/**
 * Find all task IDs that are blocked by the given task
 */
export function findTaskDependers(taskId: string, tasks: Task[]): string[] {
  return tasks
    .filter((task) => task.blockedBy && task.blockedBy.includes(taskId))
    .map((task) => task.id);
}

/**
 * Find all task IDs that block the given task
 */
export function findTaskDependencies(taskId: string, tasks: Task[]): string[] {
  const task = tasks.find((t) => t.id === taskId);
  return task?.blockedBy || [];
}

/**
 * Recursively get all transitive dependencies for a task
 */
export function getTransitiveDependencies(taskId: string, tasks: Task[]): string[] {
  const visited = new Set<string>();
  const queue = [taskId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);

    const deps = findTaskDependencies(current, tasks);
    queue.push(...deps.filter((d) => !visited.has(d)));
  }

  visited.delete(taskId); // Remove the original task
  return Array.from(visited);
}

/**
 * Check if there's a circular dependency in the task graph
 */
export function hasCircularDependency(tasks: Task[]): boolean {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(taskId: string): boolean {
    visited.add(taskId);
    recursionStack.add(taskId);

    const dependencies = findTaskDependencies(taskId, tasks);
    for (const depId of dependencies) {
      if (!visited.has(depId)) {
        if (dfs(depId)) return true;
      } else if (recursionStack.has(depId)) {
        return true;
      }
    }

    recursionStack.delete(taskId);
    return false;
  }

  for (const task of tasks) {
    if (!visited.has(task.id)) {
      if (dfs(task.id)) return true;
    }
  }

  return false;
}

/**
 * Validate task dependencies (no circular deps, all dependencies exist)
 */
export function validateTaskDependencies(tasks: Task[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const taskIds = new Set(tasks.map((t) => t.id));

  // Check for circular dependencies
  if (hasCircularDependency(tasks)) {
    errors.push("Circular dependency detected in task graph");
  }

  // Check for non-existent dependencies
  for (const task of tasks) {
    for (const depId of task.blockedBy || []) {
      if (!taskIds.has(depId)) {
        errors.push(`Task ${task.id}: dependency "${depId}" does not exist`);
      }
    }
    for (const blockId of task.blocks || []) {
      if (!taskIds.has(blockId)) {
        errors.push(`Task ${task.id}: blocked task "${blockId}" does not exist`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
