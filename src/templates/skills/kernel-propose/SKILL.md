Create a project-backed change proposal using markdown issue files. The output is a single parent issue that owns the entire proposal, with one sub-issue per phase.

## Steps

### 1. Verify and orient
- Confirm the repository has a writable `.kernel/` directory.
- Read `.kernel/CONFIG.md` for the project prefix, next available ID, and project name.
- Check for an existing matching issue file in `.kernel/issues/` before creating a duplicate.

### 2. Clarify the change
- Identify the goal, scope, and constraints of the requested change.
- Break the work into sequential phases (e.g., schema, API, UI, tests). Each phase must be independently shippable or testable.
- Surface open decisions or unknowns that must be resolved before or during implementation.

### 3. Create the parent issue file
- Create a single **parent issue file** for the entire change in `.kernel/issues/`.
- Frontmatter must include: `id`, `title`, `state: todo`, `priority`, `labels`, `created`, `updated`, `parent_id: null`, `blocked_by: []`, and `blocks: []`.
- The body must include the problem statement, proposed approach, success criteria, and any open decisions.
- Record the returned issue ID — all sub-issues will reference it as `parent_id`.

### 4. Create one sub-issue per phase
For each phase identified in step 2, create a sub-issue file:
- Set `parent_id` to the parent issue ID from step 3.
- **Title**: `[Phase N] <concise phase name>` (e.g., `[Phase 1] Database schema migration`).
- **Description**: what this phase delivers, its acceptance criteria, and any `blocked_by` relations to earlier phases.
- Set `blocked_by` relations between phases so the issue files enforce the correct execution order (phase 2 is blocked by phase 1, etc.).
- State: `todo`.

### 5. Report
- Share the parent issue file path and a numbered list of sub-issues with their file paths and titles.
- Call out any open decisions or risks that should be resolved before implementation begins.

## Guardrails
- Always use markdown issue files as the source of truth — never manage state manually.
- The parent issue is the single source of truth for the proposal — do not create a separate local planning document.
- Sub-issues must have `parent_id` set — orphan issues are not acceptable.
- Use `blocked_by` relations between phases to model sequencing, not just ordering by title.
- Update an existing matching parent issue file instead of duplicating it.

