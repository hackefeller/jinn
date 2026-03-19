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
  GIT_MASTER: "jinn-git-master",

  // Frontend skills
  FRONTEND_DESIGN: "jinn-frontend-design",

  // Jinn workflow skills
  JINN_PROPOSE: "jinn-propose",
  JINN_EXPLORE: "jinn-explore",
  JINN_APPLY: "jinn-apply",
  JINN_ARCHIVE: "jinn-archive",
  JINN_READY_FOR_PROD: "jinn-ready-for-prod",
} as const;
