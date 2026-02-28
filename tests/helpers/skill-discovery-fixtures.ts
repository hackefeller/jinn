import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectory = dirname(currentFilePath);

export const SKILL_SCOPES_FIXTURE_ROOT = resolve(currentDirectory, "../fixtures/skills-scopes");

export const CANONICAL_REPO_SKILLS_DIR = resolve(SKILL_SCOPES_FIXTURE_ROOT, "repo/.agents/skills");

export const COLLISION_NEAREST_SKILLS_DIR = resolve(
  SKILL_SCOPES_FIXTURE_ROOT,
  "collisions/nearest/.agents/skills",
);

export const COLLISION_PARENT_SKILLS_DIR = resolve(
  SKILL_SCOPES_FIXTURE_ROOT,
  "collisions/.agents/skills",
);

export function getCanonicalSkillScopeDirectories(): string[] {
  return [CANONICAL_REPO_SKILLS_DIR];
}

export function getCollisionSkillScopeDirectoriesByPrecedence(): string[] {
  return [COLLISION_NEAREST_SKILLS_DIR, COLLISION_PARENT_SKILLS_DIR];
}
