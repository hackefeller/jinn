Close completed project work using markdown issue files.

## Steps

### 1. Verify and orient
- Confirm the repository has a writable `.kernel/` directory.
- List all issue files under the project scope.
- Count: how many are `done`? How many remain `todo`, `in-progress`, or `blocked`?

### 2. Resolve or defer remaining issues
For each issue that is not `done`:
- **In Progress** — determine if it can be finished now or must be deferred. If deferring, reconcile its status first.
- **Blocked** — diagnose the blocker. If it cannot be resolved, defer to a follow-up issue.
- **Todo** — classify using the scope test below, then act accordingly.

**Scope test — is this issue in-scope or out-of-scope?**
- **In-scope**: the issue directly serves the parent's stated goal, was planned from the start, and can be completed without expanding the original scope.
- **Out-of-scope**: the issue was discovered during execution, serves a different goal, or would require work beyond the parent's acceptance criteria.
- **Grey area**: if unsure, ask — does completing this issue change what the parent delivers? If yes, it's scope expansion and should be deferred.

For in-scope Todo items that are small, complete them now. For out-of-scope or large items, create a follow-up issue under a different parent or new project. Always record the follow-up issue path in the completion summary.

### 3. Mark the project complete
- Confirm all sub-issues are either `done`, `cancelled`, or deferred to a clearly identified follow-up.
- Update the parent issue file `state` to `done`.
- If a project board owns this work, refresh `.kernel/BOARD.md` to mark it complete.

### 4. Write a completion summary
- Append a completion note under `## Comments` in the parent issue file:
  - What was delivered.
  - What was deferred (link to follow-up issue files).
  - Lessons or risks to carry forward.

### 5. Report
- Confirm the parent issue (and project board if applicable) is closed.
- List any follow-up issue files created with their paths.

## Guardrails
- Always use markdown issue files to transition state — never manage manually.
- Surface all incomplete items before closing — do not silently skip unresolved work.
- Deferred work must have a named home (a follow-up issue or project) — do not delete or cancel it.
- Every closed project must have a completion comment; closure without a summary is not complete.

