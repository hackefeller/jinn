import type { CommandDefinition } from "../../claude-code-command-loader";

export const NAME = "ghostwire:workflows:plan";
export const DESCRIPTION = "Transform feature descriptions into implementation plans [Phase: PLAN]";
export const TEMPLATE = `<command-instruction>
Note: The current year is 2026. Use 2026 for date-sensitive references unless the system date differs.

# Workflows:Plan Command (Canonical)

Transform a feature request, bug report, or refactor idea into one strictly formatted plan document. This command always follows the same execution pipeline and output schema.

## Input

<feature-description>
$ARGUMENTS
</feature-description>

If the feature description is empty, ask:
"What should I plan? Provide the feature, bug, or refactor scope."
Do not continue until scope is explicit.

## Required Execution Pipeline

1. Brainstorm first
- Check for brainstorm artifacts in docs/brainstorms/.
- If one or more relevant brainstorms exist, use the most recent relevant file as prior context.
- If none exists, run a short collaborative brainstorm with AskUserQuestion to converge on problem framing, constraints, and success criteria.
- Summarize brainstorm output as explicit decisions and open questions.

2. Run mandatory local research
- Run in parallel:
  - Task researcher-repo(feature_description)
  - Task researcher-learnings(feature_description)
- Extract file-level evidence with line references where possible.
- Capture conventions from CLAUDE.md and any relevant project governance docs.

3. Run mandatory external research
- Run in parallel:
  - Task researcher-practices(feature_description)
  - Task researcher-docs(feature_description)
- Focus on current authoritative sources and implementation caveats.
- Record at least 2 external references when applicable.

4. Consolidate research
- Produce one synthesis block containing:
  - Local patterns to reuse
  - Institutional learnings and gotchas
  - External guidance
  - Explicit tradeoffs and unresolved risks

5. Setup issue tracking metadata
- Detect project tracker preference from CLAUDE.md:
  - project_tracker: github
  - project_tracker: linear
- If not configured, ask the user to choose GitHub, Linear, or Other.
- Populate issue_tracker in frontmatter.
- Populate issue_url with:
  - Existing issue URL if known
  - pending if issue not created yet

6. Write plan file
- Write to: docs/plans/YYYY-MM-DD-type-descriptive-name-plan.md
- type must be one of: feat, fix, refactor
- Use kebab-case for filename; no spaces or colons.

## Output Contract

Use exactly this output format. Do not switch templates based on complexity. Do not emit MINIMAL, MORE, or A LOT variants.

~~~markdown
---
title: "<type>: <clear action-oriented title>"
type: feat|fix|refactor
date: YYYY-MM-DD
status: draft
issue_tracker: github|linear|other
issue_url: pending|https://...
feature_description: "<original user request, normalized>"
---

# <type>: <clear action-oriented title>

## Problem Statement
[Concise technical statement of the problem or opportunity.]

## Goals and Non-Goals
### Goals
- [ ] Goal 1
- [ ] Goal 2
### Non-Goals
- [ ] Non-goal 1

## Brainstorm Decisions
- Decision 1
- Decision 2

## Research Summary
### Local Findings
- [path/to/file.ts:line] Pattern or constraint
### External Findings
- [Source name](https://example.com): recommendation
### Risks and Unknowns
- Risk 1 and mitigation

## Proposed Approach
[Architecture and execution strategy.]

## Acceptance Criteria
- [ ] Functional criterion 1
- [ ] Functional criterion 2
- [ ] Non-functional criterion (performance/security/reliability)

## Implementation Steps
1. Step with scope and expected artifact
2. Step with validation method
3. Step with rollout or migration considerations

## Testing Strategy
- Unit:
- Integration:
- End-to-end:

## Dependencies and Rollout
- Dependencies:
- Sequencing:
- Rollback:

## References
- Internal: [path/to/file.ts:line]
- External: [Source](https://example.com)
- Related issue/PR: #123
~~~

## Post-Generation Tracking Step

After writing the plan:
1. Ask user if issue should be created now.
2. If yes and tracker is GitHub:
   - gh issue create --title "<type>: <title>" --body-file <plan_path>
3. If yes and tracker is Linear:
   - linear issue create --title "<type>: <title>" --description "$(cat <plan_path>)"
4. Update issue_url in frontmatter with the created URL.
5. Ask whether to proceed with /workflows:create next.

NEVER implement code in this command. Produce planning output only.
</command-instruction>
`;
export const ARGUMENT_HINT = "[feature description, bug report, or improvement idea]";

export const COMMAND: CommandDefinition = {
  name: NAME,
  description: DESCRIPTION,
  template: TEMPLATE,
  argumentHint: ARGUMENT_HINT,
};
