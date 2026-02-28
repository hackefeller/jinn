# Data Model: Simplify Agentic Framework with Scoped Skills

## Entity: SkillDefinition

- **Description**: Parsed skill object loaded from `SKILL.md` and optional content files.
- **Fields**:
  - `id` (string, required): canonical unique identifier.
  - `name` (string, required): display name.
  - `description` (string, required): semantic trigger description for discovery.
  - `sourcePath` (string, required): absolute file-system path.
  - `scope` (enum, required): `project-local | parent-scope | user | system | builtin`.
  - `version` (string, optional): semantic version if supplied.
  - `content` (string, optional): inlined or loaded skill instruction content.
  - `metadata` (map<string,string>, optional): additional stable metadata fields.
- **Validation rules**:
  - `id`, `name`, `description`, `sourcePath`, and `scope` must be present.
  - `id` must match `/^[a-z0-9][a-z0-9-_.]*$/`.
  - `sourcePath` must exist and point to a readable `SKILL.md` root.

## Entity: SkillSource

- **Description**: A discovery origin and precedence group.
- **Fields**:
  - `kind` (enum): `project-local | parent-scope | user | system | builtin`.
  - `rootPath` (string): origin directory.
  - `precedenceRank` (integer): lower rank means higher precedence.
- **Validation rules**:
  - `precedenceRank` must be unique per active source in a resolution pass.

## Entity: DiscoveryPolicy

- **Description**: Immutable ruleset used by loaders and composers.
- **Fields**:
  - `canonicalPath` (string): `.agents/skills`.
  - `scopeWalkEnabled` (boolean): true for cwd-to-repo-root walk.
  - `collisionPolicy` (enum): `first-wins`.
  - `emitCollisionDiagnostics` (boolean): true.
- **Validation rules**:
  - `canonicalPath` must be non-empty and relative.
  - `collisionPolicy` must be explicitly set.

## Entity: ResolvedSkillSet

- **Description**: Deterministic ordered result consumed by runtime and exporters.
- **Fields**:
  - `skills` (array<SkillDefinition>): de-duplicated by `id`.
  - `collisions` (array<CollisionEvent>): duplicate detections.
  - `resolutionDigest` (string): deterministic hash of source+order for snapshot tests.
- **Validation rules**:
  - `skills` order must be stable for identical inputs.
  - `resolutionDigest` must remain stable across identical runs.

## Entity: CollisionEvent

- **Description**: Observable duplicate-skill resolution record.
- **Fields**:
  - `skillId` (string)
  - `winnerPath` (string)
  - `loserPath` (string)
  - `winnerScope` (SkillSource.kind)
  - `loserScope` (SkillSource.kind)
  - `reason` (string)

## Relationships

- `SkillSource` 1..* -> `SkillDefinition`
- `DiscoveryPolicy` 1..1 -> `ResolvedSkillSet`
- `ResolvedSkillSet` 1..* -> `CollisionEvent`

## State Transitions

1. **Discovered**: raw files found by scope walker.
2. **Parsed**: `SKILL.md` parsed into `SkillDefinition` candidates.
3. **Validated**: schema + path + required fields validated.
4. **Resolved**: duplicates removed per policy; collisions captured.
5. **Published**: consumed by runtime/composer/export/manifests.