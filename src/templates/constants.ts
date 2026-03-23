/**
 * Template Constants
 *
 * Single source of truth for all skill names.
 * When updating a skill name, update it here and rebuild.
 *
 * SKILL_NAMES: Complete skill identifiers (includes prefix)
 *   - Defined with full prefix as they appear in generated files
 */

// =============================================================================
// Skill Names (must include prefix as defined in skill templates)
// =============================================================================
export const SKILL_NAMES = {
  // Git skills
  GIT_MASTER: "git-master",

  // Frontend skills
  DESIGN: "design",

  // Engineering skills
  CODE_QUALITY: "code-quality",
  DEV_ENVIRONMENT: "dev-environment",
  DOCS_WORKFLOW: "docs-workflow",
  PROJECT_INIT: "project-init",
  BUILD: "build",
  DEPLOY: "deploy",
  CONVENTIONS: "conventions",
  MAP_CODEBASE: "map-codebase",

  // Workflow skills
  CHECK: "check",
  REVIEW: "review",
  PROPOSE: "propose",
  EXPLORE: "explore",
  APPLY: "apply",
  ARCHIVE: "archive",
  SYNC: "sync",
  TRIAGE: "triage",
  UNBLOCK: "unblock",
  READY_FOR_PROD: "ready-for-prod",
} as const;
