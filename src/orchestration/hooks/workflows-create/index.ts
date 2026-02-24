import type { PluginInput } from "@opencode-ai/plugin";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { log } from "../../../integration/shared/logger";
import type {
  Task,
  WorkflowTaskList,
  DelegationCategory,
} from "../../../execution/features/task-queue";

export const HOOK_NAME = "workflows-create";

interface WorkflowsCreateInput {
  sessionID: string;
  messageID?: string;
}

interface WorkflowsCreateOutput {
  parts: Array<{ type: string; text?: string }>;
}

/**
 * Extract feature/request description from prompt
 */
function extractFeatureDescription(promptText: string): string | null {
  // Look for user-request tags first
  const userRequestMatch = promptText.match(
    /<user-request>\s*([\s\S]*?)\s*<\/user-request>/i
  );
  if (userRequestMatch) {
    return userRequestMatch[1].trim();
  }

  // Look for the workflow task list already present
  const jsonMatch = promptText.match(/```json\n([\s\S]*?)\n```/);
  if (jsonMatch) {
    try {
      const taskList = JSON.parse(jsonMatch[1]);
      if (taskList.tasks && Array.isArray(taskList.tasks)) {
        return null; // Already has task structure, skip
      }
    } catch {
      // Not valid JSON, continue
    }
  }

  // Return first 500 chars of remaining text as description
  const text = promptText.replace(/<[^>]+>/g, "").trim();
  return text.length > 0 ? text : null;
}

/**
 * Extract existing tasks from prompt if already broken down
 */
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

/**
 * Create workflow task list structure
 */
function createWorkflowTaskList(
  planName: string,
  tasks: Task[]
): WorkflowTaskList {
  return {
    plan_id: `plan_${Date.now()}`,
    plan_name: planName,
    tasks,
    created_at: new Date().toISOString(),
    auto_parallelization: true,
  };
}

/**
 * Format task list as markdown code block
 */
function formatTaskListAsJson(taskList: WorkflowTaskList): string {
  return `\`\`\`json\n${JSON.stringify(taskList, null, 2)}\n\`\`\``;
}

/**
 * Build delegation prompt for planner agent
 */
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
4. Suggests a delegation category (one of: visual-engineering, ultrabrain, quick, deep, artistry, writing, unspecified-low, unspecified-high)
5. Lists required skills if specialized
6. Estimates effort (e.g., "30m", "2h")

### Output Format

Return a JSON array of tasks with this exact structure:

\`\`\`json
[
  {
    "id": "task-1",
    "subject": "Task title",
    "description": "Detailed description",
    "category": "ultrabrain|quick|deep|visual-engineering|artistry|writing|unspecified-low|unspecified-high",
    "skills": ["skill1", "skill2"],
    "estimatedEffort": "30m",
    "status": "pending",
    "blocks": ["task-2"],
    "blockedBy": []
  }
]
\`\`\`

Focus on logical dependencies and parallelizable work. Independent tasks should have empty blockedBy arrays.`;
}

/**
 * Parse planner response to extract task array
 */
function extractTasksFromPlannerResponse(responseText: string): Task[] | null {
  // Look for JSON array in response
  const jsonMatch = responseText.match(/\[[\s\S]*\{[\s\S]*\}\s*\]/);
  if (!jsonMatch) return null;

  try {
    const tasks = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(tasks)) return null;

    // Validate structure
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

export function createWorkflowsCreateHook(ctx: PluginInput) {
  return {
    "chat.message": async (
      input: WorkflowsCreateInput,
      output: WorkflowsCreateOutput
    ): Promise<void> => {
      const parts = output.parts;
      const promptText =
        parts
          ?.filter((p) => p.type === "text" && p.text)
          .map((p) => p.text)
          .join("\n")
          .trim() || "";

      // Only trigger on workflows:create command
      const isWorkflowsCreateCommand = promptText.includes(
        "workflows:create"
      ) && promptText.includes("<session-context>");

      if (!isWorkflowsCreateCommand) {
        return;
      }

      log(`[${HOOK_NAME}] Processing workflows:create command`, {
        sessionID: input.sessionID,
      });

      // Check if tasks already exist in prompt
      const existingTasks = extractExistingTasks(promptText);
      if (existingTasks && existingTasks.length > 0) {
        log(`[${HOOK_NAME}] Tasks already present in prompt, skipping delegation`, {
          taskCount: existingTasks.length,
        });
        return;
      }

      // Extract feature description
      const featureDescription = extractFeatureDescription(promptText);
      if (!featureDescription) {
        log(`[${HOOK_NAME}] No feature description found, skipping`, {
          sessionID: input.sessionID,
        });
        return;
      }

      log(`[${HOOK_NAME}] Feature description extracted`, {
        descriptionLength: featureDescription.length,
        sessionID: input.sessionID,
      });

      // Build delegation prompt for planner
      const delegationPrompt = buildPlannerDelegationPrompt(featureDescription);

      // Inject instruction to delegate to planner
      const instruction = `
## Workflow Task Breakdown

${delegationPrompt}

---

**After receiving the task breakdown from the agent:**
1. Save the JSON task list to a plan file in \`.ghostwire/plans/\`
2. Apply automatic parallelization (wave calculation)
3. Return the formatted execution plan

Use \`buildExecutionPlan()\` from the task-queue module to generate the final plan.
`;

      // Add instruction to output parts
      if (parts) {
        parts.push({
          type: "text",
          text: instruction,
        });
      }

      log(`[${HOOK_NAME}] Injected task breakdown instruction`, {
        sessionID: input.sessionID,
      });
    },
  };
}
