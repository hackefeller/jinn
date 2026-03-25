import type { SkillTemplate } from "../../../core/templates/types.js";
import { SKILL_NAMES } from "../../constants.js";
import { getSkillInstructions } from "../../.generated/templates.js";

export function getProposeSkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.PROPOSE,
    profile: "core",
    description:
      "Turns a change request or product idea into a Linear project with seeded issues and sub-issues. Use when planning new work, when a user describes a feature or initiative that needs to be structured, or when users say 'plan this', 'create a project for', or 'break this down'.",
    license: "MIT",
    compatibility: "Requires the CLI and a configured Linear MCP server.",
    metadata: {
      author: "project",
      version: "1.0",
      category: "Workflow",
      tags: ["workflow", "propose", "linear", "planning"],
    },
    when: [
      "user wants to plan new work or a new feature",
      "user describes a change request or product idea",
      "a new project or initiative needs to be structured",
    ],
    applicability: [
      "Use when turning a vague change request into structured Linear work",
      "Use when a project or initiative needs a proposal with seeded issues",
    ],
    termination: [
      "Linear project created with a description and design context",
      "Top-level Linear issues seeded for each workstream",
      "Sub-issues created for immediately actionable tasks",
    ],
    outputs: ["Linear project", "Linear issues and sub-issues"],
    dependencies: [SKILL_NAMES.EXPLORE],
    argumentHint: "feature description or change request",
    instructions: getSkillInstructions(SKILL_NAMES.PROPOSE),
  };
}
