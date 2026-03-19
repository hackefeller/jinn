import type { SkillTemplate } from "../../core/templates/types.js";

export function getWorkflowPrimitivesSkillTemplate(): SkillTemplate {
  return {
    name: "workflow-primitives",
    description:
      "General-purpose workflow guidance: planning, execution, status reporting, review, brainstorming, and capturing learnings.",
    license: "MIT",
    compatibility: "Works with any team or project workflow",
    metadata: {
      author: "jinn",
      version: "1.0",
      category: "Workflow",
      tags: ["workflow", "plan", "execute", "review", "status", "learnings"],
    },
    when: [
      "user needs to plan work before starting implementation",
      "user asks for a status update on ongoing work",
      "user wants to brainstorm ideas or explore options without committing",
      "user wants to review or assess completed work",
      "user wants to capture learnings from a session or project",
    ],
    applicability: [
      "Use for general workflow coordination not covered by a specialized skill",
      "Use when structuring work that does not yet have a tool or domain skill",
    ],
    termination: [
      "Work plan created with clear tasks and success criteria",
      "Status report delivered with blockers identified",
      "Review completed with actionable feedback",
      "Learnings documented and shared",
    ],
    outputs: [
      "Structured work plan or task list",
      "Status summary with progress, blockers, and next steps",
      "Review report with prioritized findings",
      "Learnings document",
    ],
    dependencies: [],
    instructions: `# Workflow Primitives Skill

You provide general-purpose workflow support: planning, execution, status, review, brainstorming, and learnings capture.

## Planning

Before starting any non-trivial work:
1. **Understand the goal** — clarify what success looks like and any constraints
2. **Break down the work** — decompose into tasks, each independently completable
3. **Identify dependencies** — which tasks block other tasks
4. **Estimate** — rough effort per task and overall timeline
5. **Document the plan** — task list with acceptance criteria and milestones

A good plan reduces ambiguity and enables parallel execution.

## Executing

When working through a plan:
1. Pick the next unblocked task
2. Confirm how you'll verify it's done before starting
3. Execute it and verify
4. Record the outcome and move to the next task
5. Surface blockers immediately rather than guessing around them

## Status Reporting

A good status report covers:
- **Done** — what was completed since the last update
- **In progress** — what is actively being worked on
- **Blocked** — what is waiting on something external
- **Next** — what will be started next
- **Timeline** — is delivery on track?

Keep status reports brief and factual.

## Reviewing Work

When reviewing completed or in-progress work:
1. Gather context — what was the goal? What was done?
2. Evaluate against the goal — does the work achieve what was intended?
3. Check quality — correctness, completeness, and adherence to standards
4. Provide prioritized feedback:
   - **Must fix** — blocking issues that prevent approval
   - **Should fix** — significant issues that should be addressed soon
   - **Consider** — suggestions that are not blocking
5. Recommend: approve | approve with changes | needs rework

## Brainstorming

To generate high-quality options before committing to a direction:
1. Define the problem clearly — what outcome are you trying to achieve?
2. Generate ideas without filtering — quantity first, quality second
3. Evaluate each idea: feasibility, tradeoffs, risks, effort
4. Synthesize — identify the 2–3 strongest candidates
5. Recommend the best option with rationale and noted risks

## Creating Work Items

When scaffolding new work:
1. Define scope — what is included and what is explicitly out of scope
2. Write acceptance criteria — how will you know it's done?
3. Identify dependencies and blockers upfront
4. Assign a priority relative to existing work

## Capturing Learnings

After a project or significant session:
1. What went well — processes, tools, decisions that worked
2. What didn't — friction, mistakes, surprises
3. What to change — specific improvements to make next time
4. Key decisions — record the rationale for significant choices

Document learnings in a format the team will actually read (short, actionable, indexed).
`,
  };
}
