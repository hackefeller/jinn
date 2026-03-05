/**
 * Tool registry
 *
 * Central registry for managing tool definitions and adapters.
 */

import { TOOL_DEFINITIONS, getToolDefinition } from './definitions.js';
import type { ToolDefinition } from '../config/schema.js';

/**
 * Registry for tool definitions
 */
export class ToolRegistry {
  private tools: Map<string, ToolDefinition>;

  constructor() {
    this.tools = new Map();
    for (const tool of TOOL_DEFINITIONS) {
      this.tools.set(tool.id, tool);
    }
  }

  /**
   * Get a tool by ID
   */
  get(toolId: string): ToolDefinition | undefined {
    return this.tools.get(toolId);
  }

  /**
   * Check if a tool exists
   */
  has(toolId: string): boolean {
    return this.tools.has(toolId);
  }

  /**
   * Get all tools
   */
  getAll(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get available tools only
   */
  getAvailable(): ToolDefinition[] {
    return this.getAll().filter((tool) => tool.available);
  }

  /**
   * Get all tool IDs
   */
  getToolIds(): string[] {
    return Array.from(this.tools.keys());
  }

  /**
   * Get count of registered tools
   */
  getCount(): number {
    return this.tools.size;
  }

  /**
   * Get count of available tools
   */
  getAvailableCount(): number {
    return this.getAvailable().length;
  }
}

/**
 * Singleton instance of the tool registry
 */
export const toolRegistry = new ToolRegistry();

/**
 * Factory function to create a fresh registry instance
 * (useful for testing)
 */
export function createToolRegistry(): ToolRegistry {
  return new ToolRegistry();
}
