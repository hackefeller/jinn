/**
 * Template Constants
 *
 * Single source of truth for all command IDs and skill names.
 * When updating a command or skill name, update it here and rebuild.
 * The adapter layer will automatically handle prefixing (e.g., "jinn-" for OpenCode).
 */

// =============================================================================
// Command IDs (used in file paths and agent templates)
// =============================================================================
export const COMMAND_IDS = {
  // Git commands
  GIT_SMART_COMMIT: 'git-smart-commit',
  GIT_BRANCH: 'git-branch',
  GIT_CLEANUP: 'git-cleanup',
  GIT_MERGE: 'git-merge',

  // Code commands
  CODE_FORMAT: 'code-format',
  CODE_REFACTOR: 'code-refactor',
  CODE_REVIEW: 'code-review',
  CODE_OPTIMIZE: 'code-optimize',

  // Workflow commands
  WORKFLOWS_PLAN: 'workflows-plan',
  WORKFLOWS_EXECUTE: 'workflows-execute',
  WORKFLOWS_REVIEW: 'workflows-review',
  WORKFLOWS_STATUS: 'workflows-status',
  WORKFLOWS_STOP: 'workflows-stop',
  WORKFLOWS_COMPLETE: 'workflows-complete',
  WORKFLOWS_CREATE: 'workflows-create',
  WORKFLOWS_BRAINSTORM: 'workflows-brainstorm',
  WORKFLOWS_LEARNINGS: 'workflows-learnings',

  // Docs commands
  DOCS_DEPLOY: 'docs-deploy',
  DOCS_FEATURE_VIDEO: 'docs-feature-video',
  DOCS_RELEASE: 'docs-release',
  DOCS_TEST_BROWSER: 'docs-test-browser',

  // Project commands
  PROJECT_BUILD: 'project-build',
  PROJECT_CONSTITUTION: 'project-constitution',
  PROJECT_DEPLOY: 'project-deploy',
  PROJECT_INIT: 'project-init',
  PROJECT_MAP: 'project-map',

  // Utility commands
  UTIL_CLEAN: 'util-clean',
  UTIL_DOCTOR: 'util-doctor',

  // Jinn workflow commands
  JINN_PROPOSE: 'propose',
  JINN_EXPLORE: 'explore',
  JINN_APPLY: 'apply',
  JINN_ARCHIVE: 'archive',
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

// =============================================================================
// Prefixed Command References (for use in agent templates)
// These are the names that appear in "## Available commands" sections
// of agent files after the adapter applies prefixing
// =============================================================================
export function prefixCommand(commandId: string): string {
  return `jinn-${commandId}`;
}

export const PREFIXED_COMMANDS = {
  // Git
  GIT_SMART_COMMIT: prefixCommand(COMMAND_IDS.GIT_SMART_COMMIT),
  GIT_BRANCH: prefixCommand(COMMAND_IDS.GIT_BRANCH),
  GIT_CLEANUP: prefixCommand(COMMAND_IDS.GIT_CLEANUP),
  GIT_MERGE: prefixCommand(COMMAND_IDS.GIT_MERGE),

  // Code
  CODE_FORMAT: prefixCommand(COMMAND_IDS.CODE_FORMAT),
  CODE_REFACTOR: prefixCommand(COMMAND_IDS.CODE_REFACTOR),
  CODE_REVIEW: prefixCommand(COMMAND_IDS.CODE_REVIEW),
  CODE_OPTIMIZE: prefixCommand(COMMAND_IDS.CODE_OPTIMIZE),

  // Workflows
  WORKFLOWS_PLAN: prefixCommand(COMMAND_IDS.WORKFLOWS_PLAN),
  WORKFLOWS_EXECUTE: prefixCommand(COMMAND_IDS.WORKFLOWS_EXECUTE),
  WORKFLOWS_REVIEW: prefixCommand(COMMAND_IDS.WORKFLOWS_REVIEW),
  WORKFLOWS_STATUS: prefixCommand(COMMAND_IDS.WORKFLOWS_STATUS),
  WORKFLOWS_STOP: prefixCommand(COMMAND_IDS.WORKFLOWS_STOP),
  WORKFLOWS_COMPLETE: prefixCommand(COMMAND_IDS.WORKFLOWS_COMPLETE),
  WORKFLOWS_CREATE: prefixCommand(COMMAND_IDS.WORKFLOWS_CREATE),
  WORKFLOWS_BRAINSTORM: prefixCommand(COMMAND_IDS.WORKFLOWS_BRAINSTORM),
  WORKFLOWS_LEARNINGS: prefixCommand(COMMAND_IDS.WORKFLOWS_LEARNINGS),

  // Docs
  DOCS_DEPLOY: prefixCommand(COMMAND_IDS.DOCS_DEPLOY),
  DOCS_FEATURE_VIDEO: prefixCommand(COMMAND_IDS.DOCS_FEATURE_VIDEO),
  DOCS_RELEASE: prefixCommand(COMMAND_IDS.DOCS_RELEASE),
  DOCS_TEST_BROWSER: prefixCommand(COMMAND_IDS.DOCS_TEST_BROWSER),

  // Project
  PROJECT_BUILD: prefixCommand(COMMAND_IDS.PROJECT_BUILD),
  PROJECT_CONSTITUTION: prefixCommand(COMMAND_IDS.PROJECT_CONSTITUTION),
  PROJECT_DEPLOY: prefixCommand(COMMAND_IDS.PROJECT_DEPLOY),
  PROJECT_INIT: prefixCommand(COMMAND_IDS.PROJECT_INIT),
  PROJECT_MAP: prefixCommand(COMMAND_IDS.PROJECT_MAP),

  // Utility
  UTIL_CLEAN: prefixCommand(COMMAND_IDS.UTIL_CLEAN),
  UTIL_DOCTOR: prefixCommand(COMMAND_IDS.UTIL_DOCTOR),

  // Jinn workflows
  JINN_PROPOSE: prefixCommand(COMMAND_IDS.JINN_PROPOSE),
  JINN_EXPLORE: prefixCommand(COMMAND_IDS.JINN_EXPLORE),
  JINN_APPLY: prefixCommand(COMMAND_IDS.JINN_APPLY),
  JINN_ARCHIVE: prefixCommand(COMMAND_IDS.JINN_ARCHIVE),
} as const;
