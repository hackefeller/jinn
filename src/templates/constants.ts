/**
 * Template Constants
 *
 * Single source of truth for all skill names.
 * When updating a skill name, update it here and rebuild.
 *
 * SKILL_NAMES: Complete skill identifiers (includes prefix)
 *   - Defined with full prefix as they appear in generated files
 */

export const KERNEL_TEMPLATE_PREFIX = "kernel-";

export function prefixKernelTemplateName(name: string): string {
  return name.startsWith(KERNEL_TEMPLATE_PREFIX) ? name : `${KERNEL_TEMPLATE_PREFIX}${name}`;
}

// =============================================================================
// Skill Names (must include prefix as defined in skill templates)
// =============================================================================
export const SKILL_NAMES = {
  // Git skills
  GIT_MASTER: prefixKernelTemplateName("git-master"),

  // Frontend skills
  DESIGN: prefixKernelTemplateName("design"),

  // Engineering skills
  CODE_QUALITY: prefixKernelTemplateName("code-quality"),
  DEV_ENVIRONMENT: prefixKernelTemplateName("dev-environment"),
  DOCS_WORKFLOW: prefixKernelTemplateName("docs-workflow"),
  PROJECT_INIT: prefixKernelTemplateName("project-init"),
  BUILD: prefixKernelTemplateName("build"),
  DEPLOY: prefixKernelTemplateName("deploy"),
  CONVENTIONS: prefixKernelTemplateName("conventions"),
  MAP_CODEBASE: prefixKernelTemplateName("map-codebase"),

  // Workflow skills
  CHECK: prefixKernelTemplateName("check"),
  REVIEW: prefixKernelTemplateName("review"),
  PROPOSE: prefixKernelTemplateName("propose"),
  EXPLORE: prefixKernelTemplateName("explore"),
  APPLY: prefixKernelTemplateName("apply"),
  ARCHIVE: prefixKernelTemplateName("archive"),
  SYNC: prefixKernelTemplateName("sync"),
  TRIAGE: prefixKernelTemplateName("triage"),
  UNBLOCK: prefixKernelTemplateName("unblock"),
  READY_FOR_PROD: prefixKernelTemplateName("ready-for-prod"),
} as const;

export const AGENT_NAMES = {
  ARCHITECT: prefixKernelTemplateName("architect"),
  CAPTURE: prefixKernelTemplateName("capture"),
  DESIGNER: prefixKernelTemplateName("designer"),
  DO: prefixKernelTemplateName("do"),
  GIT: prefixKernelTemplateName("git"),
  PLAN: prefixKernelTemplateName("plan"),
  REVIEW: prefixKernelTemplateName("review"),
  SEARCH: prefixKernelTemplateName("search"),
} as const;
