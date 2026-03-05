# Proposal: Harness-Agnostic Architecture Realignment

## Summary

Transform ghostwire from an OpenCode-centric CLI tool into a harness-agnostic AI agent distribution platform that works across 24+ AI coding assistants including OpenCode, GitHub Copilot, Cursor, Claude Code, Continue, Cline, and others. This realignment adopts OpenSpec's proven adapter pattern while maintaining ghostwire's unique value proposition: intelligent, reasoning agents that guide development workflows.

## Problem Statement

### Current State

Ghostwire is architecturally coupled to OpenCode:

```
Current Architecture (OpenCode-Locked):
├── Agents hardcoded for OpenCode tool system
├── Commands written in OpenCode-specific format
├── Skills installed only to .opencode/skills/
├── Configuration assumes OpenCode environment
└── Cannot run in Copilot, Cursor, Claude, or other AI tools
```

**Consequences:**
- Users locked into OpenCode ecosystem
- Cannot leverage superior AI tools (Claude Code for reasoning, Cursor for IDE integration)
- Skills and agents don't work in team environments with different tool preferences
- Limited market reach
- Technical debt accumulating around OpenCode assumptions

### Desired State

```
Target Architecture (Harness-Agnostic):
├── Agents are pure reasoning personas (tool-neutral)
├── Commands generated from templates for each tool
├── Skills distributed to ALL configured tools
├── Tool adapters handle format translation
└── Works identically in OpenCode, Copilot, Cursor, Claude, etc.
```

**Benefits:**
- Users choose their preferred AI tool
- Team flexibility (different tools, same ghostwire experience)
- Broader adoption
- Future-proof against tool ecosystem changes
- Cleaner architecture with clear separation of concerns

## What We're Changing

### 1. Command System Architecture

**From:** Hardcoded OpenCode commands in `src/commands/commands-manifest.ts`

**To:** Template-driven command generation:
- `src/templates/commands/code-format.ts` → generates to 24 tools
- `src/templates/commands/git-branch.ts` → generates to 24 tools
- `src/templates/commands/propose.ts` → generates to 24 tools

### 2. Skill Distribution

**From:** Skills only in `.opencode/skills/`

**To:** Skills in ALL configured tool directories:
- `.opencode/skills/ghostwire-planner/SKILL.md`
- `.cursor/skills/ghostwire-planner/SKILL.md`
- `.claude/skills/ghostwire-planner/SKILL.md`
- `.github/skills/ghostwire-planner/SKILL.md`
- (and 20 more tools)

### 3. Agent Architecture

**From:** OpenCode-specific agent definitions

**To:** Tool-agnostic agent templates:
- `src/templates/agents/planner.ts` → pure reasoning instructions
- `src/templates/agents/architect.ts` → design pattern expertise
- No tool-specific API calls
- Conceptual command references only

### 4. Adapter Infrastructure

**New:** 24 tool adapters following OpenSpec pattern:
- `src/core/adapters/opencode.ts` → `.opencode/commands/ghostwire-*.md`
- `src/core/adapters/cursor.ts` → `.cursor/commands/ghostwire-*.md`
- `src/core/adapters/claude.ts` → `.claude/commands/ghostwire/*.md`
- `src/core/adapters/github-copilot.ts` → `.github/prompts/ghostwire-*.prompt.md`
- (and 20 more)

### 5. Configuration System

**New:** Tool-aware configuration:
```yaml
# .ghostwire/config.yaml
tools:
  - opencode
  - cursor
  - github-copilot
  - claude
profile: core  # which commands/skills to install
delivery: both  # skills, commands, or both
```

### 6. CLI Interface

**New:** ghostwire CLI commands:
```bash
ghostwire init --tools opencode,cursor,copilot  # Setup all tools
ghostwire update  # Regenerate all files
ghostwire config profile core  # Change profile
ghostwire config tools --add claude  # Add new tool
```

## Success Criteria

1. **Functional:** Same ghostwire experience works in OpenCode, Copilot, Cursor, and Claude
2. **Complete:** All existing ghostwire commands migrated to new format
3. **Comprehensive:** Support for 24 AI tools (matching OpenSpec coverage)
4. **Coherent:** Unified `/ghostwire:*` namespace across all tools
5. **Competitive:** ghostwire becomes viable OpenSpec alternative

## Scope

### In Scope

- All 25+ existing ghostwire commands → template format
- 24 tool adapters (opencode, cursor, copilot, claude, continue, cline, etc.)
- 39 agent templates (planner, architect, designer, researcher, analyzer, orchestrator, and 33 more)
- Generator infrastructure
- Configuration system
- CLI (init, update, config)
- Migration from old ghostwire format
- Documentation

### Out of Scope

- New ghostwire features (focus on architecture migration)
- Changes to skill content (migrate existing content)
- External integrations (MCP tools remain separate)
- OpenSpec compatibility layer
- Web dashboard

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Complexity of 24 adapters | Medium | High | Copy OpenSpec's proven adapter implementations |
| Breaking changes for existing users | High | Medium | This is a local test project - no users yet |
| Tool format changes | Low | Medium | Adapter pattern isolates changes |
| Performance of generation | Low | Low | Run once at init/update time |
| Maintenance burden | Medium | Medium | Community can contribute adapters |

## Alternatives Considered

### Alternative 1: Minimal Migration
**Approach:** Only migrate core workflows (propose, apply, archive), keep domain commands as-is
**Rejected:** Creates two different command systems. Confusing for users. Technical debt.

### Alternative 2: OpenSpec Dependency
**Approach:** Depend on `@fission-ai/openspec` package for adapters
**Rejected:** ghostwire is a competitor. Self-owned adapters allow differentiation and control.

### Alternative 3: Daemon Architecture
**Approach:** Create ghostwire daemon that receives commands from all tools via API
**Rejected:** Violates "works in any AI harness" philosophy. Requires infrastructure. Not file-based.

## Timeline

**Estimated Duration:** 4-6 weeks full-time
**Phases:**
1. Infrastructure (Week 1-2)
2. Adapter Implementation (Week 2-3)
3. Template Migration (Week 3-4)
4. CLI & Integration (Week 4-5)
5. Testing & Polish (Week 5-6)

## Dependencies

- OpenSpec adapter patterns (reference implementation)
- 24 AI tool format specifications (documented in OpenSpec)
- TypeScript/Node.js toolchain (existing)
- Testing framework (Vitest, existing)

## Stakeholders

- **You (Developer):** Primary implementer, architectural decisions
- **Future Users:** AI developers seeking ghostwire's agent capabilities
- **Future Contributors:** Community adding new tool adapters

## Open Questions

1. Should we maintain backward compatibility with old ghostwire commands during migration?
2. How do we handle tool detection (scan for .opencode/, .cursor/, etc.)?
3. What's the migration path for existing ghostwire projects (when we have users)?
4. Should ghostwire try to detect and warn about OpenSpec installations?

## Decision

**Proceed with comprehensive harness-agnostic realignment.**

This transforms ghostwire from a niche OpenCode tool into a platform-competitive product. The architecture is proven (OpenSpec), the implementation path is clear, and the value proposition is strong.

The risk is manageable given this is currently a test project with no users. The upside is establishing ghostwire as a viable alternative to OpenSpec with unique agent-focused capabilities.

## Next Steps

1. Review and approve this proposal
2. Create detailed design document
3. Break down into implementation tasks
4. Begin Phase 1: Infrastructure

---

**Status:** Proposed  
**Author:** Ghostwire Architect  
**Date:** 2026-03-04
