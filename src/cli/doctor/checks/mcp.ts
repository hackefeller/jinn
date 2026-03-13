import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { CheckResult, CheckDefinition, McpServerInfo } from "../types";
import { CHECK_IDS, CHECK_NAMES } from "../constants";
import { parseJsonc } from "../../../integration/shared/jsonc-parser";
import type { WorkflowConfig } from "../../../platform/config";
import { parseConfig as parseJinnConfig } from "../../commands/config-file.js";

const MCP_SERVERS = ["context7", "grep_app"];

const MCP_CONFIG_PATHS = [
  join(homedir(), ".claude", ".mcp.json"),
  join(process.cwd(), ".mcp.json"),
  join(process.cwd(), ".claude", ".mcp.json"),
];

interface McpConfig {
  mcpServers?: Record<string, unknown>;
}

interface LinearMcpValidationResult {
  valid: boolean;
  errors: string[];
}

export function loadUserMcpConfig(): Record<string, unknown> {
  const servers: Record<string, unknown> = {};

  for (const configPath of MCP_CONFIG_PATHS) {
    if (!existsSync(configPath)) continue;

    try {
      const content = readFileSync(configPath, "utf-8");
      const config = parseJsonc<McpConfig>(content);
      if (config.mcpServers) {
        Object.assign(servers, config.mcpServers);
      }
    } catch {
      // intentionally empty - skip invalid configs
    }
  }

  return servers;
}

function loadJinnWorkflowConfig(): WorkflowConfig | null {
  const configPath = join(process.cwd(), ".jinn", "config.yaml");
  if (!existsSync(configPath)) return null;

  try {
    const content = readFileSync(configPath, "utf-8");
    return parseJinnConfig(content).workflow;
  } catch {
    return null;
  }
}

export function validateLinearWorkflowMcpServer(
  workflow: WorkflowConfig,
  servers: Record<string, unknown>,
): LinearMcpValidationResult {
  if (workflow.backend !== "linear") {
    return { valid: true, errors: [] };
  }

  const serverName = workflow.linear?.mcpServerName;
  if (!serverName) {
    return { valid: false, errors: ["Linear workflow is missing workflow.linear.mcpServerName"] };
  }

  const server = servers[serverName];
  if (!server) {
    return {
      valid: false,
      errors: [`Linear workflow requires MCP server "${serverName}" in user MCP config`],
    };
  }

  if (typeof server !== "object" || server === null) {
    return {
      valid: false,
      errors: [`Linear MCP server "${serverName}" has an invalid configuration format`],
    };
  }

  return { valid: true, errors: [] };
}

export function getMcpInfo(): McpServerInfo[] {
  return MCP_SERVERS.map((id) => ({
    id,
    type: "plugin" as const,
    enabled: true,
    valid: true,
  }));
}

export function getUserMcpInfo(): McpServerInfo[] {
  const userServers = loadUserMcpConfig();
  const servers: McpServerInfo[] = [];

  for (const [id, config] of Object.entries(userServers)) {
    const isValid = typeof config === "object" && config !== null;
    servers.push({
      id,
      type: "user",
      enabled: true,
      valid: isValid,
      error: isValid ? undefined : "Invalid configuration format",
    });
  }

  return servers;
}

export async function checkMcpServers(): Promise<CheckResult> {
  const servers = getMcpInfo();

  return {
    name: CHECK_NAMES[CHECK_IDS.MCP_PLUGIN],
    status: "pass",
    message: `${servers.length} built-in servers enabled`,
    details: servers.map((s) => `Enabled: ${s.id}`),
  };
}

export async function checkUserMcpServers(): Promise<CheckResult> {
  const rawServers = loadUserMcpConfig();
  const servers = getUserMcpInfo();
  const workflow = loadJinnWorkflowConfig();

  if (servers.length === 0) {
    if (workflow?.backend === "linear") {
      return {
        name: CHECK_NAMES[CHECK_IDS.MCP_USER],
        status: "fail",
        message: "Linear workflow requires user MCP configuration",
        details: [
          `Expected MCP server: ${workflow.linear?.mcpServerName ?? "linear"}`,
          "Add the configured Linear MCP server to .mcp.json or ~/.claude/.mcp.json",
        ],
      };
    }

    return {
      name: CHECK_NAMES[CHECK_IDS.MCP_USER],
      status: "skip",
      message: "No user MCP configuration found",
      details: ["Optional: Add .mcp.json for custom MCP servers"],
    };
  }

  const invalidServers = servers.filter((s) => !s.valid);
  if (invalidServers.length > 0) {
    return {
      name: CHECK_NAMES[CHECK_IDS.MCP_USER],
      status: "warn",
      message: `${invalidServers.length} server(s) have configuration issues`,
      details: [
        ...servers.filter((s) => s.valid).map((s) => `Valid: ${s.id}`),
        ...invalidServers.map((s) => `Invalid: ${s.id} - ${s.error}`),
      ],
    };
  }

  if (workflow) {
    const linearValidation = validateLinearWorkflowMcpServer(workflow, rawServers);
    if (!linearValidation.valid) {
      return {
        name: CHECK_NAMES[CHECK_IDS.MCP_USER],
        status: "fail",
        message: "Linear workflow MCP configuration is incomplete",
        details: linearValidation.errors,
      };
    }
  }

  return {
    name: CHECK_NAMES[CHECK_IDS.MCP_USER],
    status: "pass",
    message: `${servers.length} user server(s) configured`,
    details: servers.map((s) => `Configured: ${s.id}`),
  };
}

export function getMcpCheckDefinitions(): CheckDefinition[] {
  return [
    {
      id: CHECK_IDS.MCP_PLUGIN,
      name: CHECK_NAMES[CHECK_IDS.MCP_PLUGIN],
      category: "tools",
      check: checkMcpServers,
      critical: false,
    },
    {
      id: CHECK_IDS.MCP_USER,
      name: CHECK_NAMES[CHECK_IDS.MCP_USER],
      category: "tools",
      check: checkUserMcpServers,
      critical: false,
    },
  ];
}
