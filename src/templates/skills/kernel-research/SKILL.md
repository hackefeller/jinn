---
name: kernel-research
kind: skill
tags:
  - exploration
profile: core
description: Investigate unknowns, tradeoffs, and risks in a Linear issue or
  project, then write findings back to the right destination. Use when planning
  work that needs deeper investigation, technical decisions are unclear, or
  options need to be explored before committing to an approach.
license: MIT
compatibility: Requires Linear access for issue reads and comment, description,
  or document writes.
metadata:
  author: project
  version: "1.0"
  category: Workflow
  tags:
    - workflow
    - research
    - investigation
    - linear
    - decisions
when:
  - user wants to investigate tradeoffs or risks before implementing
  - there are missing context or open decisions in an issue or project
  - technical direction is unclear and options need to be evaluated
  - user asks to explore, investigate, or research an issue or topic
termination:
  - Open questions resolved with rationale written back to Linear
  - "Clear recommendation delivered: ready for implementation or needs a human
    decision first"
  - All Linear updates (comments, description changes, documents) confirmed
outputs:
  - Linear comment, updated issue description, updated project description, or
    Linear document (depending on finding type)
  - Risk and tradeoff analysis
  - Implementation readiness recommendation
disableModelInvocation: true
argumentHint: issue ID, project, or topic to investigate
allowedTools:
  - mcp_linear_get_issue
  - mcp_linear_list_issues
  - mcp_linear_list_documents
  - mcp_linear_save_comment
  - mcp_linear_save_issue
  - mcp_linear_save_project
  - mcp_linear_update_document
  - mcp_linear_create_document
---

# kernel-research

Investigate open questions in a Linear issue or project and route findings to the right destination in Linear.

---

## Step 1 — Orient

- Read the target Linear issue to understand its description, acceptance criteria, comments, and relations.
- Read all child issues and blocking relations to understand the full scope.
- Identify the type of investigation needed: technical decision, scope clarification, risk assessment, or dependency check.

---

## Step 2 — Map the unknowns

Identify every open question that must be resolved before work can proceed:

| Type                   | Description                                                      |
| ---------------------- | ---------------------------------------------------------------- |
| **Decision gap**       | A choice that must be made before implementation can start       |
| **Dependency unknown** | Unclear whether an upstream change, API, or team is ready        |
| **Scope ambiguity**    | "Done" is not clearly defined by the current acceptance criteria |
| **Risk area**          | A portion of the design with a high chance of failure or rework  |

---

## Step 3 — Investigate

For each unknown identified in Step 2:

- Search the codebase for relevant context, existing patterns, and prior attempts.
- Read related Linear issues, project descriptions, and comments for prior decisions.
- Reason about tradeoffs: name at least two options and the consequences of each.

---

## Step 4 — Route findings to the right destination

Choose the output destination based on the finding type:

| Finding type                                               | Destination                                                |
| ---------------------------------------------------------- | ---------------------------------------------------------- |
| Lightweight, time-stamped note or interim finding          | **Comment** on the issue — `mcp_linear_save_comment`       |
| Resolves or refines the issue's acceptance criteria        | **Update issue description** — `mcp_linear_save_issue`     |
| Cross-issue architectural decision or project-wide context | **Update project description** — `mcp_linear_save_project` |
| Substantial specification, RFC, or multi-page writeup      | **Linear document** — `mcp_linear_create_document`         |

Default to a comment unless the finding materially changes the issue definition or project context.

---

## Step 5 — Report

- State which questions were resolved and which remain open.
- Give a clear recommendation: is the issue ready for implementation, or does it need a human decision first?
- List every Linear update made (comments added, descriptions changed, documents created).

---

## Guardrails

- Always write findings back to Linear — never keep them only in the chat response.
- Do not begin implementation during research — this skill produces decisions, not code.
- Never mark a question resolved without concrete rationale written into Linear.
- Keep recommendations grounded in both codebase evidence and Linear issue context.
