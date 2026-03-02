import { SKILL_NAME_VALUES as GENERATED_SKILL_NAME_VALUES } from "./skills-manifest";

// Re-export the constant from the generated manifest so callers can import from
// a stable module that we control. This mirrors the pattern used for
// command-name-values.ts where the manifest is auto-generated and the helper
// lives in a handwritten file.

export const SKILL_NAME_VALUES = GENERATED_SKILL_NAME_VALUES as const;

export type SkillName = (typeof SKILL_NAME_VALUES)[number];

/**
 * True if the provided string is a known skill name.
 */
export function isValidSkillName(skill: string): skill is SkillName {
  return SKILL_NAME_VALUES.includes(skill as SkillName);
}
