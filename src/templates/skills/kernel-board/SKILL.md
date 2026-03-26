Generate and refresh the project task board from markdown issue files.

## Steps

### 1. Collect issue files
- Confirm the repository has a writable `.kernel/` directory.
- Read all issue files under `.kernel/issues/` and `.kernel/archive/`.
- Parse frontmatter fields: `id`, `title`, `state`, `priority`, `blocked_by`, `blocks`, `updated`, and `parent_id`.

### 2. Group the work
- Group issues into `blocked`, `in-progress`, `todo`, `done`, and `cancelled` sections.
- Sort each group by priority, then by updated timestamp, then by ID.
- Show parent/child relationships where they help explain sequencing.

### 3. Write the board
- Update `.kernel/BOARD.md` with the current date and the grouped issue tables.
- Use markdown tables and issue file links.
- Keep the board concise enough to scan quickly while preserving the important relations.

## Guardrails
- Always regenerate the board from issue files — never hand-edit it as the source of truth.
- Use the issue files as the source of truth for state and relations.
- Do not invent statuses or relations that are not present in the files.