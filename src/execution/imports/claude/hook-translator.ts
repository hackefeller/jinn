/**
 * Hook Translation Layer for Claude Code → OpenCode
 *
 * Maps Claude Code hooks to their OpenCode equivalents.
 * Documents gaps where no equivalent exists.
 */

export type HookContext = Record<string, unknown>;

/**
 * Claude Hook Types
 */
export type ClaudeHookName =
  | "PreToolUse"
  | "PostToolUse"
  | "UserPromptSubmit"
  | "Stop"
  | "PreCompact"
  | "Todo"
  | "Transcript";

/**
 * OpenCode Hook Types
 */
export type OpenCodeHookName =
  | "tool.execute.before"
  | "tool.execute.after"
  | "chat.message"
  | "event"
  | "session.compact.before"
  | "todo.create"
  | "transcript.save";

/**
 * Hook Mapping Definition
 */
export interface HookMapping {
  claudeHook: ClaudeHookName;
  openCodeHook: OpenCodeHookName | null;
  status: "mapped" | "partial" | "not-mapped";
  notes?: string;
  translator?: (claudeContext: unknown) => HookContext;
}

/**
 * Complete Hook Compatibility Matrix
 */
export const HOOK_MAPPINGS: HookMapping[] = [
  {
    claudeHook: "PreToolUse",
    openCodeHook: "tool.execute.before",
    status: "mapped",
    notes: "Direct mapping - both fire before tool execution",
    translator: (claudeContext: unknown) => {
      const ctx = claudeContext as { toolName: string; input: unknown };
      return {
        toolName: ctx.toolName,
        input: ctx.input,
        timestamp: Date.now(),
      };
    },
  },
  {
    claudeHook: "PostToolUse",
    openCodeHook: "tool.execute.after",
    status: "mapped",
    notes: "Direct mapping - both fire after tool execution",
    translator: (claudeContext: unknown) => {
      const ctx = claudeContext as { toolName: string; input: unknown; output: unknown };
      return {
        toolName: ctx.toolName,
        input: ctx.input,
        output: ctx.output,
        timestamp: Date.now(),
      };
    },
  },
  {
    claudeHook: "UserPromptSubmit",
    openCodeHook: "chat.message",
    status: "mapped",
    notes: "Direct mapping - both handle user message submission",
    translator: (claudeContext: unknown) => {
      const ctx = claudeContext as { message: string; sessionId: string };
      return {
        message: ctx.message,
        sessionId: ctx.sessionId,
        timestamp: Date.now(),
      };
    },
  },
  {
    claudeHook: "Stop",
    openCodeHook: "event",
    status: "mapped",
    notes: "Mapped to generic event hook with 'cleanup' type",
    translator: (claudeContext: unknown) => {
      const ctx = claudeContext as { reason?: string };
      return {
        eventType: "cleanup",
        reason: ctx.reason ?? "stop",
        timestamp: Date.now(),
      };
    },
  },
  {
    claudeHook: "PreCompact",
    openCodeHook: "session.compact.before",
    status: "partial",
    notes:
      "Claude's PreCompact has more granular control over compaction. OpenCode's version is simpler.",
    translator: (claudeContext: unknown) => {
      const ctx = claudeContext as { messages: unknown[] };
      return {
        messageCount: ctx.messages?.length ?? 0,
        timestamp: Date.now(),
      };
    },
  },
  {
    claudeHook: "Todo",
    openCodeHook: "todo.create",
    status: "mapped",
    notes: "Direct mapping - both handle todo creation",
    translator: (claudeContext: unknown) => {
      const ctx = claudeContext as { todo: string; priority?: string };
      return {
        todo: ctx.todo,
        priority: ctx.priority ?? "normal",
        timestamp: Date.now(),
      };
    },
  },
  {
    claudeHook: "Transcript",
    openCodeHook: "transcript.save",
    status: "mapped",
    notes: "Direct mapping - both handle transcript persistence",
    translator: (claudeContext: unknown) => {
      const ctx = claudeContext as { transcript: string; path?: string };
      return {
        transcript: ctx.transcript,
        savePath: ctx.path,
        timestamp: Date.now(),
      };
    },
  },
];

/**
 * Get mapping for a specific Claude hook
 */
export function getHookMapping(claudeHook: ClaudeHookName): HookMapping | undefined {
  return HOOK_MAPPINGS.find((m) => m.claudeHook === claudeHook);
}

/**
 * Check if a hook is fully mapped
 */
export function isHookFullyMapped(claudeHook: ClaudeHookName): boolean {
  const mapping = getHookMapping(claudeHook);
  return mapping?.status === "mapped";
}

/**
 * Get all unmapped hooks
 */
export function getUnmappedHooks(): ClaudeHookName[] {
  return HOOK_MAPPINGS.filter((m) => m.status === "not-mapped").map((m) => m.claudeHook);
}

/**
 * Get mapping statistics
 */
export function getMappingStats(): {
  total: number;
  mapped: number;
  partial: number;
  notMapped: number;
} {
  return {
    total: HOOK_MAPPINGS.length,
    mapped: HOOK_MAPPINGS.filter((m) => m.status === "mapped").length,
    partial: HOOK_MAPPINGS.filter((m) => m.status === "partial").length,
    notMapped: HOOK_MAPPINGS.filter((m) => m.status === "not-mapped").length,
  };
}

/**
 * Translate Claude hook context to OpenCode context
 */
export function translateHookContext(
  claudeHook: ClaudeHookName,
  claudeContext: unknown,
): HookContext | null {
  const mapping = getHookMapping(claudeHook);

  if (!mapping || !mapping.translator) {
    return null;
  }

  try {
    return mapping.translator(claudeContext);
  } catch (error) {
    console.error(`[HookTranslation] Failed to translate ${claudeHook}:`, error);
    return null;
  }
}

/**
 * Hook Translation Report
 * Used for debugging and documentation
 */
export function generateHookReport(): string {
  const stats = getMappingStats();

  const lines = [
    "=".repeat(60),
    "Claude Code → OpenCode Hook Translation Report",
    "=".repeat(60),
    "",
    `Total Hooks: ${stats.total}`,
    `✓ Fully Mapped: ${stats.mapped}`,
    `~ Partially Mapped: ${stats.partial}`,
    `✗ Not Mapped: ${stats.notMapped}`,
    "",
    "Detailed Mappings:",
    "-".repeat(60),
  ];

  for (const mapping of HOOK_MAPPINGS) {
    const statusIcon = mapping.status === "mapped" ? "✓" : mapping.status === "partial" ? "~" : "✗";
    lines.push(`${statusIcon} ${mapping.claudeHook} → ${mapping.openCodeHook ?? "(none)"}`);

    if (mapping.notes) {
      lines.push(`  Note: ${mapping.notes}`);
    }
    lines.push("");
  }

  lines.push("=".repeat(60));

  return lines.join("\n");
}

/**
 * Validation result for hook configuration
 */
export interface HookValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate a Claude hook configuration for OpenCode compatibility
 */
export function validateClaudeHookConfig(
  claudeHook: ClaudeHookName,
  config: unknown,
): HookValidationResult {
  const result: HookValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  };

  const mapping = getHookMapping(claudeHook);

  if (!mapping) {
    result.valid = false;
    result.errors.push(`Unknown Claude hook: ${claudeHook}`);
    return result;
  }

  if (mapping.status === "not-mapped") {
    result.valid = false;
    result.errors.push(`Hook ${claudeHook} has no OpenCode equivalent`);
    return result;
  }

  if (mapping.status === "partial") {
    result.warnings.push(`Hook ${claudeHook} has partial compatibility: ${mapping.notes}`);
  }

  // Test translation
  if (mapping.translator) {
    const translated = translateHookContext(claudeHook, config);
    if (!translated) {
      result.warnings.push(`Hook ${claudeHook} context translation failed`);
    }
  }

  return result;
}
