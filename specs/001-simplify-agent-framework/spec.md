# Feature Specification: Simplify Agentic Framework with Scoped Skills

**Feature Branch**: `001-simplify-agent-framework`  
**Created**: 2026-02-27  
**Status**: Draft  
**Input**: User description: "review GitHub/OpenAI guidance and simplify architecture using scoped skills in `.agents/skills`"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Deterministic skill discovery model (Priority: P1)

As a maintainer, I can reason about exactly where skills are discovered from and in what precedence order, so runtime behavior is predictable and debuggable.

**Why this priority**: Discovery ambiguity is the dominant source of architectural complexity and operational drift.

**Independent Test**: Can be fully tested by configuring skills in multiple candidate folders and verifying a single deterministic precedence table and collision behavior.

**Acceptance Scenarios**:

1. **Given** skills exist in `.agents/skills` and legacy locations, **When** the runtime loads skills, **Then** only canonical configured paths are used with deterministic tie-breaking.
2. **Given** duplicate skill names across scopes, **When** discovery runs, **Then** conflict resolution is deterministic and observable.

---

### User Story 2 - Unified runtime/build model (Priority: P2)

As a contributor, I can use one mental model for runtime discovery and export/build outputs, reducing surprise and maintenance overhead.

**Why this priority**: Current split between runtime loading and exported/generated artifacts increases drift risk.

**Independent Test**: Can be tested by snapshotting runtime-resolved skills and generated manifests and confirming semantic parity.

**Acceptance Scenarios**:

1. **Given** canonical skill inputs, **When** exports/manifests are generated, **Then** resulting artifacts reflect runtime semantics.

---

### User Story 3 - Reduced orchestration surface complexity (Priority: P3)

As a maintainer, I can modify agent/skill/hook behavior without editing multiple parallel composition paths.

**Why this priority**: Redundant composition layers increase defect probability and review cost.

**Independent Test**: Can be tested by tracing skill and hook composition through a single pipeline and confirming equivalent functional output.

**Acceptance Scenarios**:

1. **Given** plugin initialization and config composition, **When** feature paths are resolved, **Then** discovery and merge logic executes in one shared pipeline.

### Edge Cases

- Duplicate SKILL IDs across local and user scopes.
- Missing or malformed `SKILL.md` metadata.
- Nested repository execution where current working directory differs from repo root.
- Cold-start runtime performance regression after loader consolidation.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support a canonical scoped skill discovery path rooted at `.agents/skills`.
- **FR-002**: System MUST define deterministic precedence and conflict resolution for duplicate skill identifiers.
- **FR-003**: System MUST expose one shared skill discovery/composition pipeline for runtime initialization and config composition.
- **FR-004**: System MUST align generated/exported skill artifacts with canonical runtime discovery semantics.
- **FR-005**: System MUST provide regression coverage for discovery scope, collision handling, and runtime/export parity.
- **FR-006**: System MUST document migration impact for existing non-canonical skill locations.

### Key Entities *(include if feature involves data)*

- **SkillDefinition**: Parsed representation of a skill (`name`, `description`, `path`, metadata, content source).
- **SkillSource**: Origin scope of a skill (project-local, parent-scope, user-scope, system/built-in).
- **DiscoveryPolicy**: Deterministic precedence and collision policy used by loaders and composers.
- **ResolvedSkillSet**: Final de-duplicated ordered set consumed by runtime and export/manifests.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of discovery tests pass for scope/precedence/collision matrix.
- **SC-002**: Runtime and generated manifest snapshots show semantic parity for canonical inputs.
- **SC-003**: Touch points for skill discovery/merge logic are reduced to one canonical pipeline (no parallel duplicate loaders).
- **SC-004**: Migration documentation enables maintainers to update existing skill paths in under 15 minutes.