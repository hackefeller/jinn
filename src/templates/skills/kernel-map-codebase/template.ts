import type { SkillTemplate } from "../../../core/templates/types.js";
import { parseFrontmatter } from "../../../core/templates/frontmatter.js";
import mapCodebaseSkillMarkdown from "./instructions.md";
import { SKILL_NAMES } from "../../constants.js";

export function getMapCodebaseSkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.MAP_CODEBASE,
    profile: "extended",
    description:
      "Maps an unfamiliar codebase by tracing data flows, identifying module boundaries, and locating where to make changes. Use when onboarding to a new project, investigating an area before making changes, or when users ask how the codebase is structured.",
    license: "MIT",
    compatibility: "Works with any project.",
    metadata: {
      author: "project",
      version: "1.0",
      category: "Engineering",
      tags: ["codebase", "exploration", "architecture", "mapping"],
    },
    when: [
      "starting work in an unfamiliar codebase",
      "needing to understand where to make a change before making it",
      "tracing data flow through a system end-to-end",
      "producing an architecture summary for onboarding or planning",
    ],
    applicability: [
      "Use before making non-trivial changes in an unfamiliar codebase",
      "Use when a reviewer or new contributor needs a structural orientation",
    ],
    termination: [
      "Entry points identified",
      "Major subsystems mapped with key file references",
      "A representative data flow traced end-to-end",
      "Architecture summary produced",
    ],
    outputs: ["Architecture summary with entry points, subsystems, data flow, and coverage gaps"],
    dependencies: [],
    argumentHint: "module, feature, or entry point to trace (optional)",
    allowedTools: ["Read", "Grep", "Glob"],
    instructions: parseFrontmatter(mapCodebaseSkillMarkdown).body,
  };
}
