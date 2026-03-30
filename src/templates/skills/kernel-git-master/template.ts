import type { SkillTemplate } from "../../../core/templates/types.js";
import { parseFrontmatter } from "../../../core/templates/frontmatter.js";
import gitMasterSkillMarkdown from "./instructions.md";
import { SKILL_NAMES } from "../../constants.js";

const { body } = parseFrontmatter(gitMasterSkillMarkdown);

export function getGitMasterSkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.GIT_MASTER,
    profile: "core",
    description:
      "Guides advanced git workflows, branch management, history rewriting, and collaboration patterns. Use when branching, merging, rebasing, resolving merge conflicts, cleaning up commit history, or when users ask about git collaboration.",
    license: "MIT",
    compatibility: "Works with any git repository",
    metadata: {
      author: "project",
      version: "1.0",
      category: "Version Control",
      tags: ["git", "workflow", "collaboration"],
    },
    when: [
      "user asks about branching, merging, or rebasing",
      "there are merge conflicts to resolve",
      "user wants to clean up commit history before a PR",
      "user needs help with git collaboration workflows",
    ],
    applicability: [
      "Use when working with git history, branches, or remote repositories",
      "Use for commit hygiene, rebase workflows, and conflict resolution",
    ],
    termination: [
      "Git operation described and commands provided",
      "Conflict resolved or branch strategy defined",
    ],
    outputs: [
      "Git commands and workflow guidance",
      "Branch strategy or commit message recommendations",
    ],
    dependencies: [],
    instructions: body,
  };
}
