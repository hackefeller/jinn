/**
 * Tool detector
 *
 * Detects which AI coding assistants are installed in a project.
 */

import * as path from 'path';
import { directoryExists } from '../utils/file-system.js';
import { TOOL_DEFINITIONS } from './definitions.js';
import type { ToolId } from '../config/schema.js';

/**
 * Detect which AI tools are available in a project
 * by scanning for their configuration directories.
 *
 * @param projectPath - Path to the project root
 * @returns Array of detected tool IDs
 */
export async function detectAvailableTools(projectPath: string): Promise<ToolId[]> {
  const detected: ToolId[] = [];

  for (const tool of TOOL_DEFINITIONS) {
    if (!tool.available) continue;

    const toolDir = path.join(projectPath, tool.skillsDir);
    if (await directoryExists(toolDir)) {
      detected.push(tool.id);
    }
  }

  return detected;
}

/**
 * Check if a specific tool is available
 *
 * @param projectPath - Path to the project root
 * @param toolId - Tool identifier to check
 * @returns True if tool is available
 */
export async function isToolAvailable(projectPath: string, toolId: string): Promise<boolean> {
  const tool = TOOL_DEFINITIONS.find((t) => t.id === toolId);
  if (!tool || !tool.available) return false;

  const toolDir = path.join(projectPath, tool.skillsDir);
  return directoryExists(toolDir);
}

/**
 * Get a human-readable message about detected tools
 *
 * @param tools - Array of detected tool IDs
 * @returns Formatted message
 */
export function getDetectedToolsMessage(tools: ToolId[]): string {
  if (tools.length === 0) {
    return 'No AI tools detected in this project.';
  }

  if (tools.length === 1) {
    return `Detected 1 tool: ${tools[0]}`;
  }

  return `Detected ${tools.length} tools: ${tools.join(', ')}`;
}

/**
 * Get formatted list of detected tools with names
 *
 * @param tools - Array of detected tool IDs
 * @returns Array of {id, name} objects
 */
export function getDetectedToolsWithNames(tools: ToolId[]): Array<{ id: string; name: string }> {
  return tools.map((toolId) => {
    const tool = TOOL_DEFINITIONS.find((t) => t.id === toolId);
    return {
      id: toolId,
      name: tool?.name || toolId,
    };
  });
}

/**
 * Suggest tools to install based on project type
 *
 * @param projectPath - Path to the project
 * @returns Array of suggested tool IDs
 */
export async function suggestTools(projectPath: string): Promise<ToolId[]> {
  const suggestions: ToolId[] = [];

  // Check for common editor configs
  const commonConfigs = [
    { dir: '.vscode', tool: 'cursor' as ToolId },
    { dir: '.idea', tool: 'github-copilot' as ToolId },
  ];

  for (const { dir, tool } of commonConfigs) {
    const configPath = path.join(projectPath, dir);
    if (await directoryExists(configPath)) {
      suggestions.push(tool);
    }
  }

  return suggestions;
}
