import type { SkillTemplate } from "../../core/templates/types.js";

export function getJinnProposeSkillTemplate(): SkillTemplate {
  return {
    name: "jinn-propose",
    description:
      "Use when turning a change request into a Linear project with seeded issues and sub-issues.",
    license: "MIT",
    compatibility: "Requires jinn CLI and a configured Linear MCP server.",
    metadata: {
      author: "jinn",
      version: "1.0",
      category: "Workflow",
      tags: ["workflow", "propose", "linear", "planning"],
    },
    when: [
      "user wants to plan new work or a new feature",
      "user describes a change request or product idea",
      "a new project or initiative needs to be structured",
    ],
    applicability: [
      "Use when turning a vague change request into structured Linear work",
      "Use when a project or initiative needs a proposal with seeded issues",
    ],
    termination: [
      "Linear project created with a description and design context",
      "Top-level Linear issues seeded for each workstream",
      "Sub-issues created for immediately actionable tasks",
    ],
    outputs: ["Linear project", "Linear issues and sub-issues"],
    dependencies: ["jinn-explore"],
    instructions: `Create a Linear-backed change proposal using Linear MCP.

1. Verify Linear MCP is available (check for linear_* tools).
2. Clarify the requested change.
3. Use Linear MCP to create or update a Linear project.
4. Use Linear MCP to write the summary and design context in the Linear project description.
5. Use Linear MCP to seed top-level Linear issues for workstreams or milestones.
6. Use Linear MCP to seed sub-issues for immediately actionable implementation tasks.
7. Report the resulting Linear project and open decisions.

Guardrails:
- Always use Linear MCP tools to interact with Linear — never manage state manually.
- Linear is the source of truth.
- Do not create local planning artifacts as the primary record.
- Update an existing matching Linear project instead of duplicating it.
`,
  };
}

export function getJinnExploreSkillTemplate(): SkillTemplate {
  return {
    name: "jinn-explore",
    description:
      "Use when exploring tradeoffs, risks, or missing context inside an existing Linear project or issue.",
    license: "MIT",
    compatibility: "Requires jinn CLI and a configured Linear MCP server.",
    metadata: {
      author: "jinn",
      version: "1.0",
      category: "Workflow",
      tags: ["workflow", "explore", "linear", "investigation"],
    },
    when: [
      "user wants to investigate tradeoffs or risks before implementing",
      "there is missing context or open decisions in a Linear issue or project",
      "user needs to explore options without committing to implementation",
    ],
    applicability: [
      "Use when exploring tradeoffs, risks, or dependencies in existing Linear work",
      "Use before implementation when context or direction is unclear",
    ],
    termination: [
      "Options, risks, and open decisions documented in Linear",
      "Recommendation or decision written back to the Linear issue or project",
    ],
    outputs: [
      "Updated Linear issue or project description with decisions",
      "Risk and tradeoff analysis",
    ],
    dependencies: [],
    instructions: `Explore with Linear context using Linear MCP.

1. Verify Linear MCP is available (check for linear_* tools).
2. Use Linear MCP to identify the relevant Linear project or Linear issue.
3. Use Linear MCP to read the current Linear descriptions, dependencies, and status.
4. Explore options, risks, and missing context.
5. Use Linear MCP to write clarified decisions back into the relevant Linear project or Linear issue.

Guardrails:
- Always use Linear MCP tools to read and write Linear data.
- Explore before implementation.
- Keep recommendations grounded in both the codebase and Linear state.
`,
  };
}

export function getJinnApplySkillTemplate(): SkillTemplate {
  return {
    name: "jinn-apply",
    description: "Use when executing implementation work from Linear issues and sub-issues.",
    license: "MIT",
    compatibility: "Requires jinn CLI and a configured Linear MCP server.",
    metadata: {
      author: "jinn",
      version: "1.0",
      category: "Workflow",
      tags: ["workflow", "apply", "linear", "execute"],
    },
    when: [
      "user wants to implement work from a Linear issue or sub-issue",
      "there is an unblocked Linear task ready for implementation",
      'user says "work on", "implement", "build", or "start" a Linear issue',
    ],
    applicability: [
      "Use when executing implementation tasks tracked in Linear",
      "Use when the plan is clear and the next unblocked issue is ready",
    ],
    termination: [
      "All sub-issues in scope are implemented and verified",
      "Linear issue status updated to reflect completion or blockers",
    ],
    outputs: ["Implemented code changes", "Updated Linear issue statuses"],
    dependencies: ["jinn-explore", "jinn-propose"],
    instructions: `Implement work from Linear using Linear MCP.

1. Verify Linear MCP is available (check for linear_* tools).
2. Use Linear MCP to select the relevant Linear project or Linear issue.
3. Use Linear MCP to read the next unblocked sub-issue.
4. Implement the change and verify it.
5. Use Linear MCP to update the Linear issue progress and state.
6. Continue until the selected Linear scope is complete or blocked.

Guardrails:
- Always use Linear MCP tools to read and write Linear data.
- Use Linear sub-issues as the execution queue.
- Pause on ambiguity or blockers instead of guessing.
`,
  };
}

export function getJinnArchiveSkillTemplate(): SkillTemplate {
  return {
    name: "jinn-archive",
    description:
      "Use when closing or cleaning up completed Linear projects, issues, and follow-up work.",
    license: "MIT",
    compatibility: "Requires jinn CLI and a configured Linear MCP server.",
    metadata: {
      author: "jinn",
      version: "1.0",
      category: "Workflow",
      tags: ["workflow", "archive", "linear", "done"],
    },
    when: [
      "a Linear project or milestone is complete",
      "user wants to clean up or close finished work",
      'user says "wrap up", "close", "archive", or "done" for a Linear project',
    ],
    applicability: [
      "Use when closing completed Linear projects and resolving remaining issues",
      "Use when surfacing follow-up work before archiving a project",
    ],
    termination: [
      "Linear project marked complete",
      "All open issues resolved, deferred, or captured as follow-up",
    ],
    outputs: ["Completed Linear project", "Follow-up issues for deferred work"],
    dependencies: ["jinn-apply"],
    instructions: `Close completed Linear work using Linear MCP.

1. Verify Linear MCP is available (check for linear_* tools).
2. Use Linear MCP to select the Linear project to close.
3. Use Linear MCP to review remaining open Linear issues and sub-issues.
4. Confirm what should be deferred versus completed.
5. Use Linear MCP to mark the Linear project complete and finish the relevant Linear issues.
6. Report any remaining follow-up work.

Guardrails:
- Always use Linear MCP tools to transition Linear state — never manage manually.
- Surface incomplete items before closing the Linear project.
`,
  };
}

export function getJinnSyncSkillTemplate(): SkillTemplate {
  return {
    name: "jinn-sync",
    description:
      "Use when Linear state has drifted from reality — stale In Progress issues, work completed without updates, or issues missing from the board. Reconciles Linear with what actually happened.",
    license: "MIT",
    compatibility: "Requires jinn CLI and a configured Linear MCP server.",
    metadata: {
      author: "jinn",
      version: "1.0",
      category: "Workflow",
      tags: ["workflow", "sync", "linear", "reconcile"],
    },
    when: [
      'Linear issues are stuck in "In Progress" with no recent activity',
      "work was completed without updating Linear",
      "the board state does not match the codebase",
      "before starting a new jinn-apply session",
    ],
    applicability: [
      "Use when Linear state has drifted from the actual state of the codebase",
      "Use to audit and reconcile stale, missing, or mis-classified issues",
    ],
    termination: [
      "All In Progress issues classified and transitioned correctly",
      "Undocumented work back-filled in Linear",
      "Sync report delivered",
    ],
    outputs: [
      "Updated Linear issue statuses",
      "Back-filled issues for undocumented work",
      "Sync summary report",
    ],
    dependencies: [],
    instructions: `Reconcile Linear state with the current state of the codebase using Linear MCP.

### 1. Collect current Linear state
- Verify Linear MCP is available (check for linear_* tools).
- Use mcp_linear_list_issues with state: "In Progress" to find all currently claimed issues.
- Use mcp_linear_list_issues with state: "Todo" to find all queued issues in scope.

### 2. Audit each In Progress issue
For every issue currently marked In Progress, classify as one of:
- Done — work is complete; update to Done with a summary comment.
- Stale — no work done; add a comment flagging staleness, transition back to Todo.
- Blocked — work started but stopped; add a blocking comment, transition to Blocked.
- Genuinely In Progress — active work is happening; leave as-is.

### 3. Audit Todo queue for orphans
- Identify any Todo issues with no parentId that belong to an existing parent's scope.
- Use mcp_linear_save_issue to set the correct parentId and restore hierarchy.

### 4. Identify undocumented work
- Check recent git commits or changed files for work with no corresponding Linear issue.
- For each undocumented change, create a new issue (or sub-issue) marked Done.

### 5. Report
- Summarise transitions made: Done, Stale, Blocked, or unchanged.
- List any undocumented changes that were back-filled.
- Call out issues needing human review.

Guardrails:
- Never transition an issue to Done without codebase evidence.
- Always use Linear MCP tools to update state.
- Do not delete or cancel issues during sync; flag them for human review.
- Run sync before starting a new jinn-apply session.
`,
  };
}

export function getJinnTriageSkillTemplate(): SkillTemplate {
  return {
    name: "jinn-triage",
    description:
      "Use when a bug report, ad-hoc request, or unplanned issue arrives and needs to be assessed, sized, and placed into the correct position in the Linear hierarchy before work begins.",
    license: "MIT",
    compatibility: "Requires jinn CLI and a configured Linear MCP server.",
    metadata: {
      author: "jinn",
      version: "1.0",
      category: "Workflow",
      tags: ["workflow", "triage", "linear", "intake"],
    },
    when: [
      "a bug report or ad-hoc request arrives outside the current plan",
      "user reports something broken or missing",
      "a new item needs to be assessed and placed into the Linear hierarchy",
    ],
    applicability: [
      "Use to intake and correctly position new bugs or requests in Linear",
      "Use before implementation to ensure the item is properly scoped and sequenced",
    ],
    termination: [
      "Issue created in Linear with correct parentId and priority",
      "blockedBy / blocks relations set to maintain correct phase ordering",
      "Triage report delivered with issue URL and position in hierarchy",
    ],
    outputs: ["New Linear issue with parentId, priority, and relations set", "Triage report"],
    dependencies: ["jinn-explore", "jinn-propose"],
    instructions: `Intake and place new issues into the correct position in the Linear hierarchy using Linear MCP.

### 1. Understand the incoming item
- Collect the full description of the bug, request, or idea.
- Classify as: Bug, Gap, New scope, or Spike.

### 2. Find the right parent
- Use mcp_linear_list_issues to search existing parent issues by keyword or project.
- If a matching parent exists: new item is a sub-issue — record the parentId.
- If no matching parent exists and the item is new scope: create a parent issue first (follow jinn-propose steps 3–4), then add this item as its first sub-issue.

### 3. Assess priority and phase placement
- Review existing sub-issues under the parent with mcp_linear_list_issues filtered by parentId.
- Determine whether this item should block an in-progress phase, be inserted before an upcoming phase, or queue at the end.

### 4. Create the issue
- Use mcp_linear_save_issue with parentId, priority, blockedBy/blocks relations, and a clear description including acceptance criteria.
- Status: Todo.

### 5. Report
- Share the new issue URL and its position in the hierarchy.
- Note any phase ordering changes made.
- Flag if the item reveals scope that should update the parent issue description.

Guardrails:
- Always use Linear MCP tools — never create offline issue lists.
- Do not start implementation during triage.
- Bugs affecting an In Progress phase must be evaluated for whether they block the current jinn-apply session.
- If the item is ambiguous, run jinn-explore before completing triage.
`,
  };
}

export function getJinnUnblockSkillTemplate(): SkillTemplate {
  return {
    name: "jinn-unblock",
    description:
      "Use when an issue is Blocked — either because jinn-apply stopped on a blocker, or a blockedBy dependency hasn't resolved. Diagnoses the blocker, decides whether to resolve, defer, or split, and updates Linear accordingly.",
    license: "MIT",
    compatibility: "Requires jinn CLI and a configured Linear MCP server.",
    metadata: {
      author: "jinn",
      version: "1.0",
      category: "Workflow",
      tags: ["workflow", "unblock", "linear", "blocked"],
    },
    when: [
      "a Linear issue is in Blocked status",
      "jinn-apply stopped due to a blocker",
      "a blockedBy dependency has not been resolved",
    ],
    applicability: [
      "Use to diagnose and resolve blocked Linear issues",
      "Use when a blocker must be classified and actioned before implementation can resume",
    ],
    termination: [
      "Blocker classified and resolution action taken",
      "Blocked issue transitioned to the correct new status",
      "Parent issue updated if timeline or scope is affected",
    ],
    outputs: [
      "Updated Linear issue status",
      "Comment explaining blocker resolution",
      "Unblock report",
    ],
    dependencies: ["jinn-explore", "jinn-sync"],
    instructions: `Diagnose and resolve a blocked Linear issue using Linear MCP.

### 1. Read the blocked issue
- Verify Linear MCP is available (check for linear_* tools).
- Use mcp_linear_get_issue (+ includeRelations: true) on the blocked issue.
- Read the blocking comment to understand the specific blocker.
- List all blockedBy relations — are any already Done?

### 2. Diagnose the blocker
Classify as one of:
- Stale dependency — a blockedBy issue is actually already done. Run jinn-sync, then re-check.
- Missing information — description lacks enough detail. Run jinn-explore to clarify.
- Technical dependency — upstream code/API/infra isn't ready. Issue genuinely cannot proceed.
- Scope conflict — implementation revealed overlap with another issue. Needs re-scoping.
- External dependency — blocked on a person, team, or third-party outside this codebase.

### 3. Resolve based on classification
- Stale dependency: close the completed dependency, remove blockedBy relation, transition to Todo.
- Missing information: write clarification into issue description, transition to Todo.
- Technical dependency: confirm upstream issue exists in Linear (create via jinn-triage if not). Leave as Blocked with a comment naming the unblocking condition.
- Scope conflict: split conflicting scope into a new sub-issue. Update relations. Transition original to Todo with reduced scope.
- External dependency: add a comment naming the dependency and expected resolution date. Leave as Blocked. Escalate in parent if it threatens timeline.

### 4. Update the parent issue
- If the blocker shifts delivery timeline or changes scope, update the parent description.

### 5. Report
- State the blocker classification and action taken.
- Confirm the new status of the previously blocked issue.
- Identify whether jinn-apply can resume immediately or must wait.

Guardrails:
- Never silently remove a blockedBy relation without understanding why it existed.
- Every resolution must leave a comment trail.
- If resolution requires implementation work, transition to Todo and let jinn-apply pick it up.
- When in doubt about classification, run jinn-explore first.
`,
  };
}

export function getReadyForProdSkillTemplate(): SkillTemplate {
  return {
    name: "jinn-ready-for-prod",
    description:
      "Use when validating production readiness before a release, deployment, or launch decision.",
    license: "MIT",
    compatibility: "Works with any project.",
    metadata: {
      author: "jinn",
      version: "1.0",
      category: "Quality",
      tags: ["quality", "production", "deployment", "readiness"],
    },
    when: [
      "user is about to release, deploy, or merge to production",
      'user asks "is this ready?" or "can we ship this?"',
      "a PR or branch needs a final quality gate before merging",
    ],
    applicability: [
      "Use before any production deployment, release, or launch",
      "Use when validating code quality, security, tests, and documentation",
    ],
    termination: [
      "All checklist categories reviewed",
      "Pass or fail verdict delivered with blocking items listed",
    ],
    outputs: ["Production readiness report", "List of blocking issues (if any)"],
    dependencies: [],
    instructions: `Check production readiness before deployment.

## Production Readiness Checklist

### 1. Code Quality
- [ ] No console.log or debug statements
- [ ] No hardcoded secrets or keys
- [ ] Error handling in place
- [ ] TypeScript types correct

### 2. Testing
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Manual testing completed
- [ ] Edge cases covered

### 3. Security
- [ ] Input validation
- [ ] Authentication/authorization verified
- [ ] No security vulnerabilities
- [ ] Secrets not in code

### 4. Performance
- [ ] No memory leaks
- [ ] Load testing done if applicable
- [ ] Performance benchmarks met

### 5. Documentation
- [ ] README updated
- [ ] API docs updated
- [ ] Changelog updated

### 6. Deployment
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Rollback plan in place
- [ ] Monitoring and alerts configured

### 7. Business
- [ ] Feature complete per requirements
- [ ] Stakeholder sign-off
`,
  };
}
