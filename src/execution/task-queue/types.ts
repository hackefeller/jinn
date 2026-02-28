import { z } from "zod";

export const TaskStatusSchema = z.enum(["pending", "in_progress", "completed"]);
export type TaskStatus = z.infer<typeof TaskStatusSchema>;

// Category options for subagent delegation
export const DelegationCategorySchema = z.enum([
  "visual-engineering",
  "ultrabrain",
  "quick",
  "deep",
  "artistry",
  "writing",
  "unspecified-low",
  "unspecified-high",
]);
export type DelegationCategory = z.infer<typeof DelegationCategorySchema>;

export const TaskSchema = z.object({
  id: z.string(),
  subject: z.string(),
  description: z.string(),
  activeForm: z.string().optional(),
  owner: z.string().optional(),
  // Workflow task delegation fields (new)
  category: DelegationCategorySchema.optional().describe("Subagent category for delegation"),
  skills: z.array(z.string()).optional().describe("Required skills for this task"),
  estimatedEffort: z.string().optional().describe("Time estimate (e.g., '2h', '30m')"),
  wave: z.number().optional().describe("Execution wave for parallelization (1, 2, 3...)"),
  // Timestamps
  createdAt: z.string().datetime().optional(),
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  // Dependencies and status
  status: TaskStatusSchema,
  blocks: z.array(z.string()),
  blockedBy: z.array(z.string()),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type Task = z.infer<typeof TaskSchema>;

export const TaskCreateInputSchema = z.object({
  subject: z.string().describe("Task title"),
  description: z.string().describe("Detailed description"),
  activeForm: z.string().optional().describe("Text shown when in progress"),
  owner: z.string().optional().describe("Task owner/category"),
  category: DelegationCategorySchema.optional().describe("Subagent category for delegation"),
  skills: z.array(z.string()).optional().describe("Required skills for this task"),
  estimatedEffort: z.string().optional().describe("Time estimate"),
  blockedBy: z.array(z.string()).optional().describe("Task IDs that block this"),
  blocks: z.array(z.string()).optional().describe("Task IDs this blocks"),
  wave: z.number().optional().describe("Execution wave for parallelization"),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type TaskCreateInput = z.infer<typeof TaskCreateInputSchema>;

export const TaskUpdateInputSchema = z.object({
  taskId: z.string().describe("Task ID to update"),
  subject: z.string().optional(),
  description: z.string().optional(),
  activeForm: z.string().optional(),
  status: z.enum(["pending", "in_progress", "completed", "deleted"]).optional(),
  owner: z.string().optional(),
  category: DelegationCategorySchema.optional(),
  skills: z.array(z.string()).optional(),
  estimatedEffort: z.string().optional(),
  wave: z.number().optional(),
  addBlocks: z.array(z.string()).optional().describe("Task IDs this task will block"),
  addBlockedBy: z.array(z.string()).optional().describe("Task IDs that block this task"),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type TaskUpdateInput = z.infer<typeof TaskUpdateInputSchema>;

// Workflow task list structure for plan files
export const WorkflowTaskListSchema = z.object({
  plan_id: z.string(),
  plan_name: z.string(),
  tasks: z.array(TaskSchema),
  created_at: z.string().datetime(),
  breakdown_at: z.string().datetime().optional(),
  executed_at: z.string().datetime().optional(),
  completed_at: z.string().datetime().optional(),
  auto_parallelization: z.boolean().optional().default(true),
});

export type WorkflowTaskList = z.infer<typeof WorkflowTaskListSchema>;
