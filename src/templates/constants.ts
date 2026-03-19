/**
 * Template Constants
 *
 * Single source of truth for all command IDs and skill names.
 * When updating a command or skill name, update it here and rebuild.
 *
 * COMMAND_IDS: Complete command identifiers as they appear in generated files
 *   - Include the 'jinn-' prefix for use in agent templates
 *   - Used directly in availableCommands and defaultCommand
 *
 * SKILL_NAMES: Complete skill identifiers (includes prefix)
 *   - Defined with full prefix as they appear in generated files
 */

// =============================================================================
// Command IDs (single source of truth for all commands)
// =============================================================================
export const COMMAND_IDS = {
  // Git commands
  GIT_SMART_COMMIT: 'jinn-git-smart-commit',
  GIT_BRANCH: 'jinn-git-branch',
  GIT_CLEANUP: 'jinn-git-cleanup',
  GIT_MERGE: 'jinn-git-merge',

  // Code commands
  CODE_FORMAT: 'jinn-code-format',
  CODE_REFACTOR: 'jinn-code-refactor',
  CODE_REVIEW: 'jinn-code-review',
  CODE_OPTIMIZE: 'jinn-code-optimize',

  // Workflow commands
  WORKFLOWS_PLAN: 'jinn-workflows-plan',
  WORKFLOWS_EXECUTE: 'jinn-workflows-execute',
  WORKFLOWS_REVIEW: 'jinn-workflows-review',
  WORKFLOWS_STATUS: 'jinn-workflows-status',
  WORKFLOWS_STOP: 'jinn-workflows-stop',
  WORKFLOWS_COMPLETE: 'jinn-workflows-complete',
  WORKFLOWS_CREATE: 'jinn-workflows-create',
  WORKFLOWS_BRAINSTORM: 'jinn-workflows-brainstorm',
  WORKFLOWS_LEARNINGS: 'jinn-workflows-learnings',

  // Docs commands
  DOCS_DEPLOY: 'jinn-docs-deploy',
  DOCS_FEATURE_VIDEO: 'jinn-docs-feature-video',
  DOCS_RELEASE: 'jinn-docs-release',
  DOCS_TEST_BROWSER: 'jinn-docs-test-browser',

  // Project commands
  PROJECT_BUILD: 'jinn-project-build',
  PROJECT_CONSTITUTION: 'jinn-project-constitution',
  PROJECT_DEPLOY: 'jinn-project-deploy',
  PROJECT_INIT: 'jinn-project-init',
  PROJECT_MAP: 'jinn-project-map',

  // Utility commands
  UTIL_CLEAN: 'jinn-util-clean',
  UTIL_DOCTOR: 'jinn-util-doctor',

  // Jinn workflow commands
  JINN_PROPOSE: 'jinn-propose',
  JINN_EXPLORE: 'jinn-explore',
  JINN_APPLY: 'jinn-apply',
  JINN_ARCHIVE: 'jinn-archive',
} as const;

// =============================================================================
// Skill Names (must include prefix as defined in skill templates)
// =============================================================================
export const SKILL_NAMES = {
  // Git skills
  GIT_MASTER: 'jinn-git-master',

  // Frontend skills
  FRONTEND_DESIGN: 'jinn-frontend-design',

  // Jinn workflow skills
  JINN_PROPOSE: 'jinn-propose',
  JINN_EXPLORE: 'jinn-explore',
  JINN_APPLY: 'jinn-apply',
  JINN_ARCHIVE: 'jinn-archive',
  JINN_READY_FOR_PROD: 'jinn-ready-for-prod',
} as const;


