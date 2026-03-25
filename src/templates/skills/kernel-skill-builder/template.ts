import type { SkillTemplate } from "../../../core/templates/types.js";
import { SKILL_NAMES } from "../../constants.js";
import { getSkillInstructions } from "../../.generated/templates.js";

export function getSkillBuilderSkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.SKILL_BUILDER,
    profile: "extended",
    description:
      "Creates, audits, and improves kernel skills against established quality standards. Use when creating a new skill, auditing existing skills for quality, identifying merge candidates across a skill directory, or when a skill's description, body structure, or behavioral fields need improvement.",
    metadata: {
      author: "project",
      version: "1.0",
      category: "Ecosystem",
      tags: ["skills", "quality", "audit", "standards", "meta", "skill-builder"],
    },
    when: [
      "user is creating a new kernel skill",
      "user wants to audit one or more existing skills for quality",
      "user asks whether two skills should be merged",
      "a skill description is not in third-person or lacks trigger language",
      "a skill body exceeds 300 lines and needs reference files extracted",
      "a skill contains project-specific package names or proprietary commands",
    ],
    applicability: [
      "Use when authoring any new skill in the kernel template system",
      "Use when reviewing an existing skill for description quality, body length, or behavioral field coverage",
      "Use when scanning a directory of skills to find merge candidates or systematic issues",
    ],
    termination: [
      "Each audited skill has a specific, actionable finding or a pass",
      "Merge candidates identified with a concrete action plan",
      "New skill has a passing description, correct body structure, and appropriate behavioral fields set",
    ],
    outputs: [
      "Per-skill audit report with findings in standard format",
      "Merge candidate report with reason and action plan",
      "Improved skill with updated description, body, and template.ts",
    ],
    dependencies: [],
    argumentHint: "skill name or directory path to audit",
    allowedTools: ["Read", "Grep", "Glob"],
    instructions: getSkillInstructions(SKILL_NAMES.SKILL_BUILDER),
  };
}
