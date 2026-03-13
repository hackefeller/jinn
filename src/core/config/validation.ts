/**
 * Configuration validation
 *
 * Validate jinn configuration files.
 */

import { JinnConfigSchema, type JinnConfig } from './schema.js';

/**
 * Validation result
 */
export interface ValidationResult {
  /** Whether configuration is valid */
  valid: boolean;

  /** Validation error messages */
  errors: string[];
}

/**
 * Validate a configuration object
 *
 * @param config - Configuration to validate
 * @returns Validation result
 */
export function validateConfig(config: unknown): ValidationResult {
  const result = JinnConfigSchema.safeParse(config);

  if (result.success) {
    return { valid: true, errors: [] };
  }

  const errors = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);

  return { valid: false, errors };
}

/**
 * Validate that tools are configured
 *
 * @param config - Configuration to validate
 * @returns Array of error messages
 */
export function validateTools(config: JinnConfig): string[] {
  const errors: string[] = [];

  if (config.tools.length === 0) {
    errors.push('At least one tool must be configured');
  }

  // Check for duplicate tools
  const seen = new Set<string>();
  for (const tool of config.tools) {
    if (seen.has(tool)) {
      errors.push(`Duplicate tool: ${tool}`);
    }
    seen.add(tool);
  }

  return errors;
}

/**
 * Validate custom workflows configuration
 *
 * @param config - Configuration to validate
 * @returns Array of error messages
 */
export function validateCustomWorkflows(config: JinnConfig): string[] {
  const errors: string[] = [];

  if (config.profile === 'custom' && (!config.customWorkflows || config.customWorkflows.length === 0)) {
    errors.push("Custom profile selected but no custom workflows specified");
  }

  return errors;
}

export function validateWorkflow(config: JinnConfig): string[] {
  const errors: string[] = [];

  if (config.workflow.backend !== 'linear') {
    return errors;
  }

  if (!config.workflow.linear) {
    errors.push('workflow.linear: Linear workflow settings are required');
    return errors;
  }

  if (!config.workflow.linear.team.trim()) {
    errors.push('workflow.linear.team: Linear team is required');
  }

  if (!config.workflow.linear.defaultProjectNameTemplate.trim()) {
    errors.push('workflow.linear.defaultProjectNameTemplate: Linear project name template is required');
  }

  if (!config.workflow.linear.mcpServerName.trim()) {
    errors.push('workflow.linear.mcpServerName: Linear MCP server name is required');
  }

  return errors;
}

/**
 * Perform full configuration validation
 *
 * @param config - Configuration to validate
 * @returns Validation result with all errors
 */
export function performFullValidation(config: JinnConfig): ValidationResult {
  const errors: string[] = [];

  // Schema validation
  const schemaResult = validateConfig(config);
  if (!schemaResult.valid) {
    errors.push(...schemaResult.errors);
  }

  // Tool validation
  errors.push(...validateTools(config));

  // Custom workflows validation
  errors.push(...validateCustomWorkflows(config));

  errors.push(...validateWorkflow(config));

  return {
    valid: errors.length === 0,
    errors,
  };
}
