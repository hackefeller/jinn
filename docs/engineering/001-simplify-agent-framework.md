# Simplifying the Agentic Framework: A Technical Narrative

**Branch**: `refactor/tiered-system-prompt`  
**Date**: February 2026  
**Author**: Engineering team  
**Audience**: Future maintainers, contributors building on this framework

---

## Why This Document Exists

When a codebase changes in ways that span multiple layers—loaders, composers, exports, tests, documentation—the diff alone is not enough. You can read every changed line and still not understand the reasoning behind the choices. This document captures that reasoning. It explains where the system was before, why that was a problem worth fixing, what we decided to do about it, how we implemented it, and what the rules are going forward that make the new system work correctly.

Read this before modifying skill discovery, skill export, plugin initialization, or config composition.

---

## Part One: The Problem

### Skills Were Discovered from Too Many Places in Too Many Ways

Ghostwire's job is to inject the right capabilities (skills, agents, hooks, MCP servers) at the right moment into the right context.

Skills are the most user-visible part of that: they're YAML-fronted Markdown files that describe how an AI agent should behave, what tools it can use, and what its purpose is. A user puts a `SKILL.md` file somewhere on disk and expects ghostwire to find it.

Before this refactor, "somewhere on disk" had grown to mean many different things. The loader code had evolved organically to support multiple discovery origins: `.claude/skills`, `.github/skills`, `.agents/skills`, user-level config directories, plugin-bundled defaults, and paths explicitly declared in ghostwire's own JSON configuration file. Each origin had slightly different validation rules, slightly different scope semantics, and slightly different fallback behavior. The code that consolidated all of these into a final usable set had branching logic scattered across the loader, the merger, the async loader, the config composer, and the plugin init function.

The result was a system that worked—most of the time—but was hard to reason about. 

If you had a skill with the same name in `.claude/skills` and in `.agents/skills`, which one won? The answer depended on which code path ran first, which varied based on how the caller had invoked the loader. If you added a new skill in your project and it didn't appear in the agent's context, diagnosing why required reading multiple files and tracing multiple execution paths. There was no single authoritative answer to "where do skills come from?"

This wasn't a theoretical problem. It caused observable operational drift: the set of skills available at runtime differed from what the generated manifest said was available. The export command, which produces Copilot and Codex artifacts, was consulting different data than the runtime was resolving. Developers maintaining the system were carrying a large amount of implicit knowledge about which code path ran when.

### The Build/Runtime Split

A secondary but important problem was that the build system and the runtime disagreed on skill semantics. The `ghostwire export` command, and the `build-skills-manifest.ts` script that powered it, resolved skills using a different path than the runtime loader. This meant that the generated manifest files—the `.github/skills` artifacts, the `AGENTS.md` content, the Copilot instruction files—could reflect a different skill set than what agents actually saw when they ran.

This kind of drift is insidious because it fails silently. Nobody raises an error when the export produces something the runtime doesn't use. You only discover the problem when a user reports that a skill they thought they configured is not being applied.

### Duplicate Composition Paths

There was a third, more structural problem: skill discovery and composition happened in two essentially parallel places: 
1. The plugin initialization function (`src/index.ts`) had its own skill discovery logic. 
2. The config composer (`src/platform/opencode/config-composer.ts`) had its own. 

They overlapped in purpose but didn't share code. When one was updated to handle a new case, the other often wasn't. This is the classic "two places to get the same thing" problem that almost always leads to bugs over time—not immediately, but inevitably.

---

## Part Two: The Decisions

Before writing any code, we articulated the decisions we were making and why. These decisions are documented in `specs/001-simplify-agent-framework/research.md`. Here is what was decided and the reasoning behind each choice.

### Decision 1: One Canonical Path

We chose `.agents/skills` as the single canonical location for project-scoped skill discovery. The alternatives were `.github/skills` (which aligned with GitHub Copilot conventions) and a dual-equal model where both were supported simultaneously.

We rejected the dual-equal model because it preserved the core problem: ambiguity about which path wins. The purpose of this refactor was to eliminate that ambiguity, not rearrange it.

We chose `.agents/skills` over `.github/skills` for two reasons. First, the OpenAI Codex documentation describes scoped discovery rooted in `.agents/skills`, which made it the most interoperable choice for users working across multiple AI runtimes. Second, `.github/` is strongly associated with GitHub-specific tooling and CI/CD infrastructure. Skill definitions aren't CI configuration. Keeping them separate conceptually is cleaner.

The migration impact is minimal: users with skills in `.github/skills` or `.claude/skills` can move them to `.agents/skills`. The quickstart document covers this explicitly.

### Decision 2: Deterministic Precedence, First-Wins

When the same skill name appears in multiple scopes, the system now applies a deterministic first-wins policy. Priority order, from highest to lowest: project-local nearest (the `.agents/skills` directory closest to the current working directory in the directory tree), parent scopes walking toward the repository root, user scope, system scope, built-in plugin skills.

The key property is not the specific order—it's that the order is fixed, documented, and consistent. You can read the `CANONICAL_DISCOVERY_POLICY` constant in `src/execution/opencode-skill-loader/types.ts` and know exactly what will happen. When a collision occurs, the system emits a structured `SkillCollisionDiagnostic` record rather than silently discarding one of the entries. This makes collisions observable and debuggable.

We considered last-write-wins as an alternative. It's simpler to implement but almost impossible to reason about in nested project structures where you can't easily predict which directory is loaded last. First-wins with scope-based precedence is slightly more complex to implement but far easier to explain to users: "the most local version of a skill wins."

### Decision 3: One Shared Composition Pipeline

We decided that there must be exactly one entry point for skill discovery that all consumers use. The `discoverSharedPipelineSkills` function in `src/execution/opencode-skill-loader/index.ts` is that entry point. Plugin init calls it. Config composition calls it. Export calls it. If you are writing code that needs to know what skills are available, you call that function.

This decision has a strong rule attached to it: **no new code should perform skill discovery independently.** If you find yourself about to write a new discovery loop to find `SKILL.md` files, stop and use `discoverSharedPipelineSkills`. The whole point of this refactor was to eliminate parallel discovery paths.

### Decision 4: Runtime/Build Parity

We decided that generated artifacts must reflect what the runtime resolves, not a static snapshot of bundled defaults. The export command now invokes the same canonical discovery pipeline and uses the same merge semantics as the runtime. Built-in skills are merged as fallback after scoped resolution, in both contexts.

This means the `--manifest` output from `ghostwire export` accurately reflects what agents see at runtime. If you add a skill to `.agents/skills`, export it with `--manifest`, and inspect the manifest, you should find it listed. If the runtime is running in the same directory, it should also be using that skill.

### Decision 5: Hard Switch, No Compatibility Window

We decided to migrate without a prolonged compatibility period. Legacy paths (`.claude/skills`, `.github/skills` as discovery sources) are not supported by the new canonical loader in strict mode. We documented the migration path clearly and provided explicit validation tests so that users who have existing skill configurations will know exactly what to update.

The alternative—maintaining dual support with a deprecation timeline—would have kept the codebase complex while reducing the pressure to actually migrate. Given that we were already breaking the mental model by introducing strict canonical behavior, a clean break was more honest and ultimately less expensive to maintain.

---

## Part Three: The Data Model

Understanding the new system requires understanding four key entities. These are defined formally in `specs/001-simplify-agent-framework/data-model.md`; here is the plain English version.

**SkillDefinition**: A parsed, validated representation of a single skill. It has a canonical name, a description, the path on disk where it was found, which scope it came from (project-local, parent, user, system, or built-in plugin), and its content. The content is what actually gets injected into agent context.

**SkillSource**: The origin of a discovery pass. A source has a kind (which scope it represents), a root path (where the `.agents/skills` directory was found), and a precedence rank (an integer where lower means higher priority). The scope-walk logic generates an ordered list of sources before loading any individual skill files.

**DiscoveryPolicy**: An immutable configuration object that governs how discovery runs. The canonical policy has `.agents/skills` as its path, scope-walking enabled, first-wins collision handling, and collision diagnostics enabled. You can read this constant at the top of `types.ts` and it tells you everything the loader will do.

**ResolvedSkillSet**: The output of running the full pipeline: a de-duplicated, precedence-ordered list of `LoadedSkill` objects, plus any collision events that were detected, plus a deterministic resolution digest. The digest is a hash of the resolved skill names and their source paths in order. Two runs with the same skill inputs will produce the same digest; this is useful for snapshot tests and for detecting when skill discovery unexpectedly changes.

The lifecycle of a skill goes through five stages: discovered (file path found), parsed (SKILL.md read and frontmatter extracted), validated (schema and required field checks), resolved (duplicates removed per policy), and published (inserted into agent context or exported artifact). Code that handles skills at the "discovered" stage and code that handles them at the "published" stage should not overlap.

---

## Part Four: The Implementation

### Phase 1 and 2: Fixtures and Primitives

Before touching production code, we built a deterministic test fixture tree under `tests/fixtures/skills-scopes/`. This tree has a documented collision structure: a skill named `dup-skill` appears in both a nearest-scope directory and a parent-scope directory. The fixture is static on disk, which means tests that pass against it are repeatable without any mocking or dynamic generation.

The fixture helper in `tests/helpers/skill-discovery-fixtures.ts` exports path constants so that test files don't have string literals scattered across them. If the fixture tree ever moves or changes shape, one file changes and all tests that use it pick up the update.

With fixtures in place, we defined the canonical types in `types.ts`—this is the vocabulary that all other files in the loader module use. Defining types first before touching behavior is important: it makes the intended contracts explicit and causes TypeScript to enforce them across the codebase immediately.

### Phase 3: Deterministic Discovery (User Story 1)

The core of the refactor is in `loader.ts`. The `enumerateScopedAgentSkillSources` function walks from the current working directory up to the repository root, looking for `.agents/skills` directories at each level. Each found directory becomes a `ScopedSkillSource` with a precedence rank derived from its depth: nearer directories get lower rank values (higher priority). The user-scope directory, if enabled, is always appended at the end with the highest rank number.

`discoverScopedAgentSkills` calls the enumerator and then loads skills from each source in precedence order. Skills from higher-priority sources appear first in the resulting array. This ordering is what makes the first-wins resolution in `merger.ts` correct: the merger simply iterates the ordered list and keeps the first instance of each name.

The canonical path enforcement is in `loadSkillsFromDirWithOptions` via the `strictCanonicalLayout` flag. When this flag is true, only directories containing a `SKILL.md` file (the canonical layout) are treated as valid skill roots. Directories that happen to contain a markdown file with a matching name, but no `SKILL.md`, are skipped. This was a deliberate tightening: the previous code had implicit fallbacks that would load skills from non-standard layouts, which made the loader's behavior harder to predict.

Malformed `SKILL.md` files—those with invalid frontmatter YAML, or with a frontmatter block that doesn't contain a `description` field—are skipped silently by the loader when operating in strict mode. This is enforced by the `requireFrontmatterMetadata` option. The test for this case in `tests/skills.test.ts` verifies that a malformed skill does not appear in the resolved output, even if its directory is in the right location.

### Phase 4: Runtime/Build Parity (User Story 2)

With deterministic discovery working, we updated the export pipeline. The export command in `src/cli/export.ts` now invokes `discoverSharedPipelineSkills` to collect scoped skills from the user's working directory before merging built-ins. Previously it was consulting a static generated manifest. The generated manifest in `src/execution/skills/skills-manifest.ts` now exports a `mergeScopedSkillsWithBuiltins` helper that applies the same merge order used at runtime: scoped skills first, built-ins as fallback.

The build script (`src/script/build-skills-manifest.ts`) was updated to emit parity constants alongside the generated values, so that the manifest file carries its own documentation about what the merge semantics are.

The practical implication: if you are testing what `ghostwire export` produces, you must be in a directory where `.agents/skills` exists (or doesn't) as you expect. The export output now depends on the discovery context of the machine running it, just as the runtime does.

### Phase 5: Shared Pipeline (User Story 3)

The plugin initialization function (`src/index.ts`) and the config composer (`src/platform/opencode/config-composer.ts`) were updated to call `discoverSharedPipelineSkills` from the canonical index. Their previous implementations had independent discovery logic: they each did their own directory walks and their own merges. Those implementations are gone.

This was the riskiest change from a behavioral standpoint because initializing the plugin is load-bearing for everything else. We wrote integration tests first (`src/index.test.ts` and `src/plugin-config.test.ts`) that verified the expected skills appeared after initialization, then made the implementation change, then confirmed the tests continued to pass. The RED → GREEN → REFACTOR pattern was strictly followed here.

One subtle thing to understand about the async loader (`src/execution/opencode-skill-loader/async-loader.ts`): it still exists and still exports helper functions. We considered removing it entirely during this phase, but several existing tests depended on its exported surface. The simplification was to make it a thin wrapper that delegates to the shared pipeline rather than a parallel implementation. Its exports remain available for backward compatibility; they just no longer contain independent discovery logic.

### Phase 6: Documentation and Test Hygiene

The final phase updated the user-facing documentation in `docs/configurations.md` and `docs/export.md` to reflect canonical `.agents/skills` semantics. The migration section explains exactly where to move existing skill files and why.

We also fixed several pre-existing test failures discovered during the full test suite run after implementation. These are worth documenting because they are an example of how invisible technical debt accumulates:

**The commands test file** (`tests/commands.test.ts`) contained hardcoded lists of command names that had long since been superseded by the actual generated manifest. The test was asserting that `ghostwire:project:test` was a valid command, but that command had been removed from the manifest at some earlier point and nobody had updated the test. The test was not enforcing anything true about the system. We replaced the hardcoded lists with assertions that read directly from `COMMAND_NAME_VALUES` and `COMMANDS_MANIFEST`—the same sources of truth the validator uses. Tests like this cannot drift again because they validate the actual current state, not a static snapshot.

**The session search timeout** in `src/execution/tools/session-manager/tools.test.ts` was a test that ran a case-sensitive search across all sessions on disk without providing a scope constraint. In environments with large session histories (which is normal on a developer's machine), this scan could exceed the test timeout. The fix was to scope the search to a specific non-existent session ID. The test still verifies case-sensitive search parameter handling, which was the intent, but it no longer depends on the size of the local disk state.

**The OAuth mock contamination** was more subtle. The `skill-mcp-manager/manager.test.ts` file used `mock.module("../mcp-oauth/provider")` to replace the OAuth provider class globally during its test run. In Bun's test runner, module mocks at the top level of a test file persist for the duration of that file's execution. When the test runner ran `manager.test.ts` followed by `provider.test.ts` in the same process, the mock was still active, making the real `McpOAuthProvider` class look like the stripped-down mock. The fix was to refactor `SkillMcpManager` to accept an injectable OAuth provider factory in its constructor. Tests that need to mock OAuth behavior pass a fake factory. Tests that test the real provider import the real provider directly without any mocking. The global module mock was removed entirely. This is the correct pattern: dependency injection over module mocking.

---

## Part Five: How It Works Now

Here is the complete flow from user intent to resolved skill set.

1. A user creates `.agents/skills/my-skill/SKILL.md` in their project directory.

2. When ghostwire initializes the plugin (`src/index.ts`), it calls `discoverSharedPipelineSkills({ cwd: process.cwd(), includeUserScope: true })`.

3. `discoverSharedPipelineSkills` calls `resolveScopedSkillsCanonical`, which calls `discoverScopedAgentSkills`.

4. `discoverScopedAgentSkills` first calls `enumerateScopedAgentSkillSources` to build the ordered list of source directories. Starting from `process.cwd()`, it walks up to the repository root. Any directory containing a `.agents/skills` subdirectory becomes a source. The nearest directory gets precedence rank 0 (highest priority), the next gets rank 1, and so on. The user-scope home directory is appended last.

5. For each source in precedence order, `loadSkillsFromDirWithOptions` is called with `strictCanonicalLayout: true` and `requireFrontmatterMetadata: true`. It reads the directory, finds subdirectories (each expected to contain a `SKILL.md`), parses the frontmatter, validates that at minimum a `description` field is present, and returns a `LoadedSkill` object.

6. All loaded skills from all sources are concatenated into a single ordered array. Order is determined by source precedence rank, then by order of appearance within each source directory listing.

7. `resolveDeterministicSkillsFirstWins` iterates the ordered array. The first occurrence of each skill name is kept. All subsequent occurrences of the same name are recorded as `SkillCollisionDiagnostic` events and discarded from the resolved output.

8. The resolved skills are returned to the caller. `createSkillResolutionDigest` computes a hash over the resolved names and paths to produce a stable `resolutionDigest` for snapshot testing.

9. In the plugin init path, the resolved scoped skills are merged with built-in plugin skills (using the same first-wins policy, scoped skills having higher priority) and passed through the config composer to produce the final capability set injected into the OpenCode runtime.

10. The export command follows the same steps 2–8, then uses the resolved skill set to generate Copilot and Codex artifacts. The manifest, if `--manifest` is passed, reflects this resolved state.

---

## Part Six: Rules for Future Development

These are not suggestions. They are constraints that exist to prevent the problems described in Part One from returning.

**Do not add a new skill discovery path.** If you need a new source of skills, add it as a new `CanonicalSkillScopeKind` in `types.ts`, implement it as a new source kind in `enumerateScopedAgentSkillSources`, give it a defined precedence rank, and add tests for the collision behavior when it overlaps with existing kinds. Do not write independent directory-walking code somewhere else.

**Do not bypass `discoverSharedPipelineSkills`.** Every callsite that needs the current runtime skill set must go through this function or through `resolveScopedSkillsCanonical` if it also needs diagnostic data. If you add a new consumer—a new hook, a new export target, a new API surface—use the shared pipeline. Do not clone the logic.

**Do not use `mock.module` to mock the OAuth provider or any other module that another test file tests directly.** Use constructor injection or a factory parameter instead. The pattern is always: if an object has a dependency that needs to be replaceable in tests, accept that dependency as a constructor argument.

**Do not hardcode command names, skill names, or agent names in test assertions.** Read them from the source of truth: `COMMAND_NAME_VALUES`, `COMMANDS_MANIFEST`, `SKILL_NAME_VALUES`, or the actual loaded collection. Tests that hardcode values will drift and eventually test nothing true about the system.

**Do not write a test that scans disk state without bounding its scope.** The session search test failure was caused by an unbounded disk scan. Any test that reads from the user's actual home directory, session history, or uncontrolled workspace files must either mock that layer or constrain the query to a specific, controlled scope.

**SKILL.md is the canonical entry point for a skill definition.** A directory under `.agents/skills` that does not contain a `SKILL.md` file is not a skill. The `strictCanonicalLayout` option enforces this. Adding support for alternate file layouts means editing the canonical policy object and updating the discovery contract documentation; it is not something to do ad hoc.

---

## Part Seven: What Was Not Changed

Several things were explicitly left alone because they are correct and stable:

- The `LoadedSkill` interface itself was not changed. Existing consumers that receive `LoadedSkill` objects were unaffected; the refactor changed how those objects are produced, not what they contain.

- The `SkillsConfig` schema and the config-entry-based skill loading path (skills declared explicitly in `ghostwire.json`) were not changed. Config-declared skills continue to work and are merged alongside discovered skills in the final composition.

- MCP server configuration within skills (`mcp.json` sidecar files and `mcp:` frontmatter fields) was not changed. The loader still parses and passes through MCP config exactly as before.

- The built-in skills bundled with the plugin were not changed. Their precedence (lowest priority, fallback only) was formalized rather than invented.

- The hook system, agent definitions, and prompt templates were not part of this refactor. They have their own composition paths which remain independent for now.

---

## Closing

The core insight behind this refactor is that complexity in a framework is not neutral. Complexity in how capabilities are discovered and composed cascades into uncertainty for every agent and every user that depends on the framework. When a developer cannot predict which version of a skill will be used, the framework has failed a basic contract: predictability.

The changes in this branch are not features. They are the repair of a structural deficit that had accumulated over time through incremental additions, each individually reasonable, that collectively produced a system harder to trust than it needed to be.

The new system has one place to define where skills live (`.agents/skills`), one function to call to get them (`discoverSharedPipelineSkills`), one policy that governs what happens when names collide (first-wins by scope precedence), and one set of diagnostic records to inspect when something unexpected happens (`SkillCollisionDiagnostic`). That simplicity is the goal. Every new feature added to this subsystem should preserve it.
