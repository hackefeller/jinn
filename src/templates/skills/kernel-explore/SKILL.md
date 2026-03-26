Explore context, tradeoffs, and risks inside a project issue file or issue group.

## Steps

### 1. Verify and orient
- Confirm the repository has a writable `.kernel/` directory.
- Read the target issue file and its frontmatter to understand its current description, acceptance criteria, and relations.
- Read all sub-issues from `.kernel/issues/` filtered by `parent_id` to understand the full scope.

### 2. Map the unknowns
Identify every open question in the issue:
- **Decision gaps** — questions that must be answered before implementation can start.
- **Dependency unknowns** — unclear whether an upstream change or API is ready.
- **Scope ambiguity** — the issue description doesn't fully define what "done" looks like.
- **Risk areas** — portions of the design with a high chance of failure or rework.

### 3. Investigate
For each unknown identified in step 2:
- Search the codebase for relevant context (existing patterns, related code, prior attempts).
- Read related issue files to understand decisions already made.
- Reason about tradeoffs — name at least two options and the consequences of each.

### 4. Write findings back to the issue file
- Append findings under `## Comments` with a dated entry and agent attribution.
- Update the body or frontmatter with:
  - Resolved decisions and their rationale.
  - Outstanding decisions requiring human input (each as a named open question).
  - Any missing or incomplete acceptance criteria.
- Update the `updated` timestamp in frontmatter.

### 5. Report
- State which questions were resolved and which remain open.
- Give a clear recommendation: is the issue ready for implementation, or does it need a decision first?

## Guardrails
- Always use markdown issue files — never manage context externally.
- Do not start implementation during explore — this skill produces decisions, not code.
- Never mark a question resolved without concrete rationale written into the issue.
- Keep recommendations grounded in both codebase evidence and issue-file context.

