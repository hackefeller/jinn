Diagnose and resolve a blocked project issue file.

### 1. Read the blocked issue
- Confirm the repository has a writable `.kernel/` directory.
- Read the blocked issue file and its comments.
- Read the blocking comment to understand the specific blocker.
- List all `blocked_by` relations — are any already `done`?

### 2. Diagnose the blocker
Classify as one of:
- Stale dependency — a blockedBy issue is actually already done. Reconcile state, then re-check.
- Missing information — description lacks enough detail. Clarify it before continuing.
- Technical dependency — upstream code/API/infra isn't ready. Issue genuinely cannot proceed.
- Scope conflict — implementation revealed overlap with another issue. Needs re-scoping.
- External dependency — blocked on a person, team, or third-party outside this codebase.

### 3. Resolve based on classification
- Stale dependency: close the completed dependency, remove `blocked_by` relation, transition to `todo`.
- Missing information: write clarification into issue description, transition to `todo`.
- Technical dependency: confirm an upstream issue file exists. Leave as `blocked` with a comment naming the unblocking condition.
- Scope conflict: split conflicting scope into a new sub-issue. Update relations. Transition original to `todo` with reduced scope.
- External dependency: add a comment naming the dependency and expected resolution date. Leave as `blocked`. Escalate in parent if it threatens timeline.

### 4. Update the parent issue
- If the blocker shifts delivery timeline or changes scope, update the parent description.

### 5. Report
- State the blocker classification and action taken.
- Confirm the new status of the previously blocked issue.
- Identify whether implementation can resume immediately or must wait.

Guardrails:
- Never silently remove a `blocked_by` relation without understanding why it existed.
- Every resolution must leave a comment trail.
- If resolution requires implementation work, transition to `todo` and let the implementation workflow pick it up.
- When in doubt about classification, investigate first.

