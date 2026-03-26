Reconcile project issue files with the current state of the codebase.

## Steps

### 1. Collect current project state
- Confirm the repository has a writable `.kernel/` directory.
- Read all issue files with `state: in-progress` to find currently claimed work.
- Read all issue files with `state: todo` to find queued work in scope.

### 2. Audit each in-progress issue
For every issue currently marked `in-progress`:
- Read the issue file to inspect its description and acceptance criteria.
- Search the codebase for evidence the work is complete (relevant files changed, tests passing, feature present).
- Classify as one of:
  - **Done** — work is complete and verified; update the issue file to `done` with a summary comment.
  - **Stale** — no apparent work done and no recent activity; add a comment flagging staleness, transition back to `todo`.
  - **Blocked** — work started but stopped for a known reason; add a blocking comment, transition to `blocked`.
  - **Genuinely In Progress** — active work is happening; leave as-is.

### 3. Audit Todo queue for orphans
- Identify any `todo` issues that have no `parent_id` but belong to an existing parent's scope.
- Update the issue file to set the correct `parent_id` and restore proper hierarchy.

### 4. Identify undocumented work
- Check recent git commits or changed files for work with no corresponding issue file.
- For each undocumented change, create a new issue file (or sub-issue under the relevant parent) marked `done`, describing what was delivered.

### 5. Report
- Summarise the transitions made: how many issues moved to Done, Stale, Blocked, or left unchanged.
- List any undocumented changes that were back-filled.
- Call out any issues that need human review before proceeding.

## Guardrails
- Never transition an issue to `done` without codebase evidence — only verify, do not assume.
- Always use markdown issue files to update state — never manage manually.
- Do not delete or cancel issues during sync; flag them for human review instead.
- Run this before starting a new implementation session to prevent double-claiming work.

