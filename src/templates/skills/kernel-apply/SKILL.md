Implement work from markdown issue files. Work on exactly one issue at a time. Every state change must be reflected back into the issue file immediately.

## Single-Issue Execution Loop

Repeat this loop for each issue until the selected scope is complete or blocked.

### 0. Orient (first issue only)
- Confirm the repository has a writable `.kernel/` directory.
- Identify the target scope: a project directory, parent issue file path, or single issue file path provided by the user.
- Read all issue files in scope with `state: todo` to confirm the full queue before starting.
- Read the first issue file to confirm no unresolved `blocked_by` dependencies. If there are, surface the blocker and stop.

### 1. Select the next issue
Use this priority order:

**a. Relations-first (explicit ordering)**
- Read the most recently completed issue file.
- If it has `blocks` relations, those issues are now unblocked — pick the highest-priority one.

**b. Sibling sub-issues (implicit ordering)**
- If the completed issue has a `parent_id`, read sibling issue files with the same `parent_id` and `state: todo`.
- Pick the highest-priority unstarted sibling.

**c. Project backlog fallback**
- Read all issue files in the target project with `state: todo`, ordered by priority.
- Pick the top unblocked issue.

After identifying the candidate, re-read the issue file to confirm no unresolved `blocked_by` relations before claiming it.

### 2. Claim the issue
- Update the issue file `state` to `in-progress` before writing a single line of code.
- Do not start implementation until the state update is saved.

### 3. Implement and verify
- Implement only what the issue describes — nothing more, nothing less.
  - **Code changes**: write or modify source files as described by the issue's acceptance criteria.
  - **Tests**: add or update tests that prove the acceptance criteria are met.
  - **No adjacent cleanup**: do not refactor surrounding code, add docstrings, or fix unrelated lint warnings. If you notice a separate problem, create a new issue.
- Run all relevant checks (type-check, lint, tests) before declaring work done. All must pass.
- If a blocker surfaces mid-implementation: stop, add a comment explaining the blocker, transition the issue to **Blocked**, and do not proceed.

### 4. Update the issue on completion
- Append a concise summary under `## Comments`: what changed and why, files touched, any follow-up issues needed.
- Update the issue file `state` to `done` only after verification passes.

### 5. Move to the next issue
- Only after the current issue file is `done`, return to step 1.
- Never hold two issues In Progress simultaneously.

## Guardrails
- Always use markdown issue files to read and write task state — never manage state manually.
- One issue In Progress at a time. Finish before starting the next.
- Status must reflect reality: claim `in-progress` before coding, mark `done` only after verification passes.

