# Jinn Generator Stability And Scalability Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Jinn generation deterministic, safer to evolve, and able to scale cleanly across more tools, profiles, and output artifacts without path drift or partial-write failures.

**Architecture:** Split generation into explicit phases: capability-aware planning, validated artifact graph construction, and atomic materialization. Move tool-specific behavior behind richer adapter capabilities and verify outputs through fixture-based parity tests instead of relying on scattered path assumptions.

**Tech Stack:** Bun, TypeScript, Zod, filesystem-based generators, adapter registry, fixture and integration tests

---

## File Map

- Modify: `/Users/charlesponti/Developer/jinn/src/core/adapters/types.ts`
- Modify: `/Users/charlesponti/Developer/jinn/src/core/adapters/codex.ts`
- Modify: `/Users/charlesponti/Developer/jinn/src/core/adapters/claude.ts`
- Modify: `/Users/charlesponti/Developer/jinn/src/core/adapters/github-copilot.ts`
- Modify: `/Users/charlesponti/Developer/jinn/src/core/adapters/gemini.ts`
- Modify: `/Users/charlesponti/Developer/jinn/src/core/adapters/opencode.ts`
- Modify: `/Users/charlesponti/Developer/jinn/src/core/adapters/cursor.ts`
- Modify: `/Users/charlesponti/Developer/jinn/src/core/discovery/definitions.ts`
- Modify: `/Users/charlesponti/Developer/jinn/src/core/generator/index.ts`
- Modify: `/Users/charlesponti/Developer/jinn/src/core/generator/skill-gen.ts`
- Modify: `/Users/charlesponti/Developer/jinn/src/core/generator/agent-gen.ts`
- Modify: `/Users/charlesponti/Developer/jinn/src/core/generator/manifest-gen.ts`
- Create: `/Users/charlesponti/Developer/jinn/src/core/generator/artifact-plan.ts`
- Create: `/Users/charlesponti/Developer/jinn/src/core/generator/artifact-writer.ts`
- Create: `/Users/charlesponti/Developer/jinn/src/core/generator/artifact-cleanup.ts`
- Create: `/Users/charlesponti/Developer/jinn/src/core/generator/__tests__/artifact-plan.test.ts`
- Create: `/Users/charlesponti/Developer/jinn/src/core/generator/__tests__/artifact-writer.test.ts`
- Modify: `/Users/charlesponti/Developer/jinn/src/core/generator/__tests__/generator.integration.test.ts`
- Modify: `/Users/charlesponti/Developer/jinn/src/core/discovery/detector.ts`
- Create: `/Users/charlesponti/Developer/jinn/src/core/discovery/compatibility.ts`
- Create: `/Users/charlesponti/Developer/jinn/src/core/discovery/__tests__/compatibility.test.ts`
- Modify: `/Users/charlesponti/Developer/jinn/src/core/vault/compiler.ts`
- Create: `/Users/charlesponti/Developer/jinn/src/core/vault/__tests__/compatibility.test.ts`
- Modify: `/Users/charlesponti/Developer/jinn/README.md`
- Modify: `/Users/charlesponti/Developer/jinn/docs/export.md`
- Modify: `/Users/charlesponti/Developer/jinn/docs/config.md`

## Chunk 1: Explicit Artifact Planning

### Task 1: Add a typed artifact plan layer

**Files:**
- Create: `/Users/charlesponti/Developer/jinn/src/core/generator/artifact-plan.ts`
- Create: `/Users/charlesponti/Developer/jinn/src/core/generator/__tests__/artifact-plan.test.ts`
- Modify: `/Users/charlesponti/Developer/jinn/src/core/adapters/types.ts`
- Modify: `/Users/charlesponti/Developer/jinn/src/core/generator/skill-gen.ts`
- Modify: `/Users/charlesponti/Developer/jinn/src/core/generator/agent-gen.ts`
- Modify: `/Users/charlesponti/Developer/jinn/src/core/generator/manifest-gen.ts`

- [ ] **Step 1: Write the failing tests for planned artifact shape and ordering**

Run: `bun test /Users/charlesponti/Developer/jinn/src/core/generator/__tests__/artifact-plan.test.ts`
Expected: FAIL because `artifact-plan.ts` does not exist.

- [ ] **Step 2: Add typed artifact descriptors**

Define artifact kinds, ownership metadata, adapter capabilities, and deterministic ordering rules in `/Users/charlesponti/Developer/jinn/src/core/adapters/types.ts` and `/Users/charlesponti/Developer/jinn/src/core/generator/artifact-plan.ts`.

- [ ] **Step 3: Route skill, agent, and manifest generation through the planner**

Update the generator helpers so they return planned artifacts instead of ad hoc file arrays.

- [ ] **Step 4: Re-run the focused tests**

Run: `bun test /Users/charlesponti/Developer/jinn/src/core/generator/__tests__/artifact-plan.test.ts /Users/charlesponti/Developer/jinn/src/core/adapters/__tests__/adapters.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git -C /Users/charlesponti/Developer/jinn add src/core/adapters/types.ts src/core/generator/artifact-plan.ts src/core/generator/skill-gen.ts src/core/generator/agent-gen.ts src/core/generator/manifest-gen.ts src/core/generator/__tests__/artifact-plan.test.ts src/core/adapters/__tests__/adapters.test.ts
git -C /Users/charlesponti/Developer/jinn commit -m "refactor: add typed artifact planning layer"
```

## Chunk 2: Safe Materialization

### Task 2: Make generation atomic and cleanup-aware

**Files:**
- Create: `/Users/charlesponti/Developer/jinn/src/core/generator/artifact-writer.ts`
- Create: `/Users/charlesponti/Developer/jinn/src/core/generator/artifact-cleanup.ts`
- Create: `/Users/charlesponti/Developer/jinn/src/core/generator/__tests__/artifact-writer.test.ts`
- Modify: `/Users/charlesponti/Developer/jinn/src/core/generator/index.ts`
- Modify: `/Users/charlesponti/Developer/jinn/src/core/generator/__tests__/generator.integration.test.ts`

- [ ] **Step 1: Write failing tests for atomic writes, unchanged-file skipping, and stale-file cleanup**

Run: `bun test /Users/charlesponti/Developer/jinn/src/core/generator/__tests__/artifact-writer.test.ts`
Expected: FAIL because the writer and cleanup modules do not exist.

- [ ] **Step 2: Implement atomic write primitives**

Write to temp files, fsync or rename on success, and preserve deterministic result reporting in `/Users/charlesponti/Developer/jinn/src/core/generator/artifact-writer.ts`.

- [ ] **Step 3: Implement cleanup for previously-owned stale artifacts**

Remove obsolete generated files only when they are part of the generator-owned artifact set for a configured tool.

- [ ] **Step 4: Integrate the writer into the main generator**

Replace direct batch writes in `/Users/charlesponti/Developer/jinn/src/core/generator/index.ts` with artifact planning plus safe materialization.

- [ ] **Step 5: Re-run generator tests**

Run: `bun test /Users/charlesponti/Developer/jinn/src/core/generator/__tests__/artifact-writer.test.ts /Users/charlesponti/Developer/jinn/src/core/generator/__tests__/generator.integration.test.ts`
Expected: PASS.

## Chunk 3: Adapter Capability Hardening

### Task 3: Replace path assumptions with explicit capability contracts

**Files:**
- Modify: `/Users/charlesponti/Developer/jinn/src/core/adapters/types.ts`
- Modify: `/Users/charlesponti/Developer/jinn/src/core/adapters/codex.ts`
- Modify: `/Users/charlesponti/Developer/jinn/src/core/adapters/claude.ts`
- Modify: `/Users/charlesponti/Developer/jinn/src/core/adapters/github-copilot.ts`
- Modify: `/Users/charlesponti/Developer/jinn/src/core/adapters/gemini.ts`
- Modify: `/Users/charlesponti/Developer/jinn/src/core/adapters/opencode.ts`
- Modify: `/Users/charlesponti/Developer/jinn/src/core/adapters/cursor.ts`
- Modify: `/Users/charlesponti/Developer/jinn/src/core/discovery/definitions.ts`
- Modify: `/Users/charlesponti/Developer/jinn/src/core/adapters/__tests__/adapters.test.ts`

- [ ] **Step 1: Write failing adapter tests for capabilities and path consistency**

Run: `bun test /Users/charlesponti/Developer/jinn/src/core/adapters/__tests__/adapters.test.ts /Users/charlesponti/Developer/jinn/src/core/discovery/__tests__/detector.test.ts`
Expected: FAIL after adding assertions for canonical tool root, skill root, agent root, and manifest support.

- [ ] **Step 2: Add explicit adapter capability fields**

Model tool root, skill root, agent root, manifest support, and native-agent support directly in the adapter interface.

- [ ] **Step 3: Update all adapters and discovery definitions**

Remove duplicated string assumptions and have one source of truth per tool.

- [ ] **Step 4: Re-run adapter and discovery tests**

Run: `bun test /Users/charlesponti/Developer/jinn/src/core/adapters/__tests__/adapters.test.ts /Users/charlesponti/Developer/jinn/src/core/discovery/__tests__/detector.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git -C /Users/charlesponti/Developer/jinn add src/core/adapters src/core/discovery
git -C /Users/charlesponti/Developer/jinn commit -m "refactor: add explicit adapter capability model"
```

## Chunk 4: Discovery And Compatibility

### Task 4: Make detection and vault compilation compatibility-aware

**Files:**
- Create: `/Users/charlesponti/Developer/jinn/src/core/discovery/compatibility.ts`
- Create: `/Users/charlesponti/Developer/jinn/src/core/discovery/__tests__/compatibility.test.ts`
- Modify: `/Users/charlesponti/Developer/jinn/src/core/discovery/detector.ts`
- Modify: `/Users/charlesponti/Developer/jinn/src/core/vault/compiler.ts`
- Create: `/Users/charlesponti/Developer/jinn/src/core/vault/__tests__/compatibility.test.ts`

- [ ] **Step 1: Write failing tests for alternate-path compatibility**

Run: `bun test /Users/charlesponti/Developer/jinn/src/core/discovery/__tests__/compatibility.test.ts /Users/charlesponti/Developer/jinn/src/core/vault/__tests__/compatibility.test.ts`
Expected: FAIL because compatibility rules are not implemented.

- [ ] **Step 2: Implement compatibility metadata**

Allow tool detection and vault compilation to understand native roots and optional legacy aliases without changing canonical output paths.

- [ ] **Step 3: Integrate compatibility rules into detector and vault compiler**

Ensure detection is pragmatic, generation is canonical, and docs can reflect both clearly.

- [ ] **Step 4: Re-run compatibility and integration tests**

Run: `bun test /Users/charlesponti/Developer/jinn/src/core/discovery/__tests__/compatibility.test.ts /Users/charlesponti/Developer/jinn/src/core/vault/__tests__/compatibility.test.ts /Users/charlesponti/Developer/jinn/src/core/generator/__tests__/generator.integration.test.ts`
Expected: PASS.

## Chunk 5: Regression Fixtures And Documentation

### Task 5: Freeze output behavior with fixture snapshots and docs

**Files:**
- Modify: `/Users/charlesponti/Developer/jinn/src/core/generator/__tests__/generator.integration.test.ts`
- Modify: `/Users/charlesponti/Developer/jinn/README.md`
- Modify: `/Users/charlesponti/Developer/jinn/docs/export.md`
- Modify: `/Users/charlesponti/Developer/jinn/docs/config.md`

- [ ] **Step 1: Add failing fixture assertions for every supported tool**

Run: `bun test /Users/charlesponti/Developer/jinn/src/core/generator/__tests__/generator.integration.test.ts`
Expected: FAIL until fixture expectations include exact roots, files, and agent outputs.

- [ ] **Step 2: Add fixture coverage**

Capture expected generated artifacts for `opencode`, `claude`, `github-copilot`, `codex`, `gemini`, and `cursor` under representative `core` and `extended` configurations.

- [ ] **Step 3: Update docs to match canonical behavior**

Document canonical output roots, compatibility aliases, and delivery semantics in the README and reference docs.

- [ ] **Step 4: Run the focused verification suite**

Run: `bun test /Users/charlesponti/Developer/jinn/src/core/generator/__tests__/generator.integration.test.ts /Users/charlesponti/Developer/jinn/src/core/adapters/__tests__/adapters.test.ts /Users/charlesponti/Developer/jinn/src/core/discovery/__tests__/detector.test.ts /Users/charlesponti/Developer/jinn/src/core/vault/__tests__`
Expected: PASS.

- [ ] **Step 5: Run the repo verification pass**

Run: `bun test && bun --bun tsc --noEmit`
Expected: PASS.

## Success Criteria

- Canonical output paths come from one source of truth per tool.
- Generator writes are deterministic and atomic.
- Stale generated files are cleaned up safely.
- Detection can recognize compatible layouts without exporting to legacy roots.
- Integration fixtures fail fast when a tool path or artifact topology drifts.
- README and reference docs match generated behavior.

## Risks To Watch

- Partial cleanup deleting user-authored files if ownership tracking is too broad.
- Tool adapters drifting again if capability metadata is duplicated across discovery and formatting layers.
- Vault compilation rewriting references in a way that breaks non-Copilot tools.
- Fixture snapshots becoming noisy if generation order is not normalized before write time.

Plan complete and saved to `docs/superpowers/plans/2026-03-19-generator-stability-scalability.md`. Ready to execute?
