# Phase 0 Research: Simplify Agentic Framework with Scoped Skills

## Context

Feature: migrate to a deterministic, simplified skill-discovery architecture with `.agents/skills` as canonical scope.

## Decision 1: Canonical skill scope path

- **Decision**: Use `.agents/skills` as the canonical project-scoped runtime discovery path.
- **Rationale**: OpenAI Codex documents scoped discovery rooted in `.agents/skills`; choosing one canonical runtime path minimizes ambiguity and reduces loader branching.
- **Alternatives considered**:
  - `.github/skills` as canonical: stronger GitHub-native alignment but does not match Codex scoped search defaults.
  - Dual-equal `.agents/skills` + `.github/skills` + `.claude/skills`: maximizes compatibility but preserves complexity and precedence ambiguity.

## Decision 2: Discovery precedence and conflict handling

- **Decision**: Enforce deterministic precedence by scope (nearest scoped directory to farthest, then user/system) with stable tie-breaker for duplicate skill IDs (first winner by precedence, deterministic warning/event for collisions).
- **Rationale**: Deterministic precedence enables reproducible behavior and testable contracts.
- **Alternatives considered**:
  - Last-write-wins merge: simpler implementation but difficult to reason about in nested scopes.
  - Non-deterministic set merge: unacceptable for reproducibility and debugging.

## Decision 3: Single composition pipeline

- **Decision**: Use one shared pipeline for discovery + merge + resolved skill set consumption across plugin init and config composition.
- **Rationale**: Existing duplicate composition paths increase drift probability and maintenance burden.
- **Alternatives considered**:
  - Keep separate pipelines with synchronization tests: still duplicates logic and complexity.

## Decision 4: Runtime/build parity

- **Decision**: Make generated manifests/export output semantically aligned to canonical runtime discovery policy.
- **Rationale**: Mismatch between runtime behavior and generated artifacts causes operational surprises.
- **Alternatives considered**:
  - Preserve independent build semantics: lower refactor cost but retains mental-model split.

## Decision 5: Migration posture

- **Decision**: Hard-switch migration (no prolonged compatibility window), with explicit docs and preflight validation tests.
- **Rationale**: User-selected direction emphasizes simplification over backward-compatibility complexity.
- **Alternatives considered**:
  - Timed deprecation period with dual support: lower immediate disruption but extends code complexity.

## Decision 6: Test and verification protocol

- **Decision**: Enforce RED → GREEN → REFACTOR for loader/composer changes; add deterministic matrix tests for scope resolution and collisions, plus runtime/export parity snapshots.
- **Rationale**: Deterministic evidence is required for safe architecture simplification.
- **Alternatives considered**:
  - Broad end-to-end tests only: weaker fault localization for precedence bugs.

## Clarification Resolution Ledger

All `NEEDS CLARIFICATION` items in technical context are resolved:

1. Canonical scope path: resolved to `.agents/skills`.
2. Conflict policy: resolved to deterministic precedence + stable collision behavior.
3. Runtime/build relationship: resolved to semantic parity.
4. Migration style: resolved to hard switch.
5. Performance target: resolved to <=10% cold-start overhead increase.

## Confidence

- Architecture simplification effectiveness: **High (0.88)**
- Migration safety under hard switch: **Medium (0.72)**
- Runtime/build parity feasibility: **High (0.84)**