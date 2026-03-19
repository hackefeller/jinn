---
name: jinn-unblock
description: Use when an issue is Blocked — either because jinn-apply stopped on a blocker, or a blockedBy dependency hasn't resolved. Diagnoses the blocker, decides whether to resolve, defer, or split, and updates Linear accordingly.
license: MIT
compatibility: Requires jinn CLI and a configured Linear MCP server.
metadata:
  author: jinn
  version: "1.0"
  generatedBy: "1.0.0"
  category: Workflow
  tags: [workflow, unblock, linear, blocked]
---

Diagnose and resolve a blocked Linear issue using Linear MCP.

## Steps

### 1. Read the blocked issue

- Verify Linear MCP is available (check for `linear_*` tools).
- Use `mcp_linear_get_issue` (+ `includeRelations: true`) on the blocked issue.
- Read the blocking comment left by `jinn-apply` (or the latest comment) to understand the specific blocker.
- List all `blockedBy` relations — are any of them already Done?

### 2. Diagnose the blocker

Classify the blocker as one of:

- **Stale dependency** — a `blockedBy` issue is actually already done; its status wasn't updated. Run `jinn-sync` to reconcile, then re-check.
- **Missing information** — the issue description lacks enough detail to implement. Run `jinn-explore` on the parent or the blocked issue to clarify.
- **Technical dependency** — upstream code, API, or infrastructure isn't ready. The issue genuinely cannot proceed yet.
- **Scope conflict** — implementation revealed the scope of this issue overlaps or conflicts with another issue. Needs re-scoping.
- **External dependency** — blocked on a person, team, or third-party system outside this codebase.

### 3. Resolve based on classification

**Stale dependency**: use `mcp_linear_save_issue` to close the completed dependency, then remove the `blockedBy` relation and transition the blocked issue back to `Todo`.

**Missing information**: use `mcp_explore` to produce a clarification, write the result into the issue description via `mcp_linear_save_issue`, then transition back to `Todo`.

**Technical dependency**: confirm the upstream issue exists in Linear; if not, create it via `jinn-triage`. Set the correct `blockedBy` relation. Leave status as `Blocked`. Add a comment with the specific unblocking condition.

**Scope conflict**: use `mcp_linear_save_issue` to split off the conflicting portion into a new sub-issue under the same parent. Update `blocks`/`blockedBy` relations to reflect the new ordering. Transition the original issue back to `Todo` with reduced scope.

**External dependency**: add a comment naming the external dependency and expected resolution date. Leave as `Blocked`. Escalate in the parent issue description if it threatens the parent's timeline.

### 4. Update the parent issue

- Use `mcp_linear_get_issue` on the parent issue.
- If the blocker shifts the delivery timeline or changes scope, update the parent description via `mcp_linear_save_issue`.

### 5. Report

- State the blocker classification and action taken.
- Confirm the new status of the previously blocked issue.
- Identify whether `jinn-apply` can resume immediately or must wait.

## Guardrails

- Always use Linear MCP tools — never resolve blockers by just deleting the relation without understanding why it existed.
- A blocker should never be silently removed; every resolution must leave a comment trail.
- If the resolution requires implementation work, transition back to `Todo` and let `jinn-apply` pick it up — do not start coding inside this skill.
- When in doubt about classification, run `jinn-explore` first.
