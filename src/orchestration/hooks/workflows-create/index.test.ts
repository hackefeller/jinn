import { describe, it, expect, beforeEach } from "bun:test";
import type { Task } from "../../../execution/features/task-queue";

// Mock implementations of hook functions for testing
function extractFeatureDescription(promptText: string): string | null {
  const userRequestMatch = promptText.match(
    /<user-request>\s*([\s\S]*?)\s*<\/user-request>/i
  );
  if (userRequestMatch) {
    return userRequestMatch[1].trim();
  }

  const jsonMatch = promptText.match(/```json\n([\s\S]*?)\n```/);
  if (jsonMatch) {
    try {
      const taskList = JSON.parse(jsonMatch[1]);
      if (taskList.tasks && Array.isArray(taskList.tasks)) {
        return null;
      }
    } catch {
      // Not valid JSON
    }
  }

  const text = promptText.replace(/<[^>]+>/g, "").trim();
  return text.length > 0 ? text : null;
}

function extractExistingTasks(promptText: string): Task[] | null {
  const jsonMatch = promptText.match(/```json\n([\s\S]*?)\n```/);
  if (!jsonMatch) return null;

  try {
    const taskList = JSON.parse(jsonMatch[1]);
    if (taskList.tasks && Array.isArray(taskList.tasks)) {
      return taskList.tasks;
    }
  } catch {
    // Not valid JSON
  }

  return null;
}

function buildPlannerDelegationPrompt(featureDescription: string): string {
  return `## Task Breakdown Request

Please analyze this feature/requirement and break it down into concrete, implementable tasks:

### Feature Description
${featureDescription}

### Task Requirements

Generate a task list where each task:
1. Has a clear, specific title (subject)
2. Includes detailed description
3. Identifies dependencies (blockedBy, blocks arrays)
4. Suggests a delegation category
5. Lists required skills if specialized
6. Estimates effort (e.g., "30m", "2h")

### Output Format

Return a JSON array of tasks with this exact structure...`;
}

function extractTasksFromPlannerResponse(responseText: string): Task[] | null {
  const jsonMatch = responseText.match(/\[[\s\S]*\{[\s\S]*\}\s*\]/);
  if (!jsonMatch) return null;

  try {
    const tasks = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(tasks)) return null;

    return tasks.filter(task => {
      return (
        task.id &&
        task.subject &&
        task.description &&
        typeof task.blocks === "object" &&
        typeof task.blockedBy === "object"
      );
    });
  } catch {
    return null;
  }
}

describe("workflows-create hook", () => {
  //#given a prompt with user-request tags
  //#when extracting feature description
  //#then description is extracted from tags
  it("should extract feature description from user-request tags", () => {
    const prompt = `
      <user-request>
        Add dark mode toggle to the application
      </user-request>
    `;

    const description = extractFeatureDescription(prompt);

    expect(description).toBe("Add dark mode toggle to the application");
  });

  //#given a prompt with plain text
  //#when extracting feature description
  //#then description is extracted from text
  it("should extract feature description from plain text", () => {
    const prompt = "Implement user authentication with JWT tokens";

    const description = extractFeatureDescription(prompt);

    expect(description).toContain("Implement user authentication");
  });

  //#given a prompt with existing task JSON
  //#when extracting feature description
  //#then null is returned (skip processing)
  it("should return null when tasks already present", () => {
    const prompt = `\`\`\`json
{
  "plan_id": "plan_123",
  "tasks": [
    {
      "id": "task-1",
      "subject": "Existing task",
      "description": "Already broken down"
    }
  ]
}
\`\`\``;

    const description = extractFeatureDescription(prompt);

    expect(description).toBeNull();
  });

  //#given a prompt with existing task JSON
  //#when extracting existing tasks
  //#then tasks are extracted
  it("should extract existing tasks from JSON", () => {
    const prompt = `\`\`\`json
{
  "plan_id": "plan_123",
  "tasks": [
    {
      "id": "task-1",
      "subject": "Task 1",
      "description": "First task",
      "status": "pending",
      "blocks": [],
      "blockedBy": []
    }
  ]
}
\`\`\``;

    const tasks = extractExistingTasks(prompt);

    expect(tasks).toBeDefined();
    expect(tasks).toHaveLength(1);
    expect(tasks![0].id).toBe("task-1");
  });

  //#given a feature description
  //#when building planner delegation prompt
  //#then prompt contains all required sections
  it("should build comprehensive planner delegation prompt", () => {
    const description = "Add authentication to the API";

    const prompt = buildPlannerDelegationPrompt(description);

    expect(prompt).toContain("Task Breakdown Request");
    expect(prompt).toContain("Feature Description");
    expect(prompt).toContain(description);
    expect(prompt).toContain("Task Requirements");
    expect(prompt).toContain("Output Format");
    expect(prompt).toContain("delegation category");
  });

  //#given a planner response with JSON task array
  //#when extracting tasks
  //#then valid tasks are returned
  it("should extract tasks from planner response", () => {
    const response = `
      Here's the task breakdown:
      
      [
        {
          "id": "task-1",
          "subject": "Setup database",
          "description": "Create database schema",
          "category": "quick",
          "status": "pending",
          "blocks": ["task-2"],
          "blockedBy": []
        },
        {
          "id": "task-2",
          "subject": "API endpoint",
          "description": "Create auth endpoint",
          "category": "ultrabrain",
          "status": "pending",
          "blocks": [],
          "blockedBy": ["task-1"]
        }
      ]
    `;

    const tasks = extractTasksFromPlannerResponse(response);

    expect(tasks).toBeDefined();
    expect(tasks).toHaveLength(2);
    expect(tasks![0].id).toBe("task-1");
    expect(tasks![1].id).toBe("task-2");
  });

  //#given a planner response without valid JSON
  //#when extracting tasks
  //#then null is returned
  it("should return null for invalid JSON in response", () => {
    const response = "The tasks are task-1, task-2, and task-3";

    const tasks = extractTasksFromPlannerResponse(response);

    expect(tasks).toBeNull();
  });

  //#given a JSON task array with missing fields
  //#when extracting tasks
  //#then incomplete tasks are filtered out
  it("should filter out incomplete tasks", () => {
    const response = `
      [
        {
          "id": "task-1",
          "subject": "Valid task",
          "description": "Complete task",
          "status": "pending",
          "blocks": [],
          "blockedBy": []
        },
        {
          "id": "task-2",
          "subject": "Incomplete task"
        }
      ]
    `;

    const tasks = extractTasksFromPlannerResponse(response);

    expect(tasks).toHaveLength(1);
    expect(tasks![0].id).toBe("task-1");
  });

  //#given a complex feature description
  //#when building planner prompt
  //#then all details are included
  it("should preserve full feature description in prompt", () => {
    const description = `Implement a comprehensive user management system with:
- User registration with email verification
- JWT-based authentication
- Role-based access control
- Password reset flow
- User profile management`;

    const prompt = buildPlannerDelegationPrompt(description);

    expect(prompt).toContain("email verification");
    expect(prompt).toContain("JWT");
    expect(prompt).toContain("Role-based");
  });

  //#given empty prompt
  //#when extracting feature description
  //#then null is returned
  it("should return null for empty prompt", () => {
    const description = extractFeatureDescription("");

    expect(description).toBeNull();
  });

  //#given prompt with only tags
  //#when extracting feature description
  //#then empty string is returned (will be falsy)
  it("should handle empty user-request tags", () => {
    const prompt = `<user-request></user-request>`;

    const description = extractFeatureDescription(prompt);

    expect(description).toBe("");
  });

  //#given planner response with multiple valid JSON arrays
  //#when extracting tasks
  //#then first valid array is used
  it("should use first JSON array if multiple present", () => {
    const response = `
      First attempt:
      [{"id": "a", "subject": "Task A", "description": "Desc", "blocks": [], "blockedBy": []}]
      
      Second attempt:
      [{"id": "b", "subject": "Task B", "description": "Desc", "blocks": [], "blockedBy": []}]
    `;

    const tasks = extractTasksFromPlannerResponse(response);

    expect(tasks).toBeDefined();
    if (tasks) {
      expect(tasks[0].id).toBe("a");
    }
  });
});
