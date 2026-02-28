# Scoped Skill Fixture Matrix

This directory provides deterministic file-system fixtures for scoped skill discovery tests.

## Layout

- `repo/.agents/skills/`: canonical project-scoped skills for baseline discovery behavior.
- `collisions/nearest/.agents/skills/`: nearest-scope winner fixtures.
- `collisions/.agents/skills/`: parent-scope loser fixtures using duplicate IDs.

## Matrix Coverage

| Scenario | Fixture Path | Expected Outcome |
|---|---|---|
| Canonical scope discovery | `repo/.agents/skills/` | Skills are discovered in canonical path only |
| Duplicate ID collision | `collisions/nearest/.agents/skills/dup-skill/` and `collisions/.agents/skills/dup-skill/` | Deterministic first-wins precedence with collision diagnostics |

## Notes

- Each skill uses a directory with `SKILL.md` frontmatter.
- Fixture content is static to preserve snapshot determinism.
