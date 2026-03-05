import type { CommandTemplate } from '../../core/templates/types.js';

export function getGhostwireProposeCommandTemplate(): CommandTemplate {
  return {
    name: 'Ghostwire: Propose',
    description: 'Propose a new change with all artifacts generated in one step',
    category: 'Workflow',
    tags: ['workflow', 'proposal', 'change', 'planning'],
    content: `Ghostwire: Propose

Propose a new change - create the change and generate all artifacts in one step.

I'll create a change with artifacts:
- proposal.md (what & why)
- design.md (how)
- tasks.md (implementation steps)

When ready to implement, run /ghostwire:apply

---

**Input**: The argument after \`/ghostwire:propose\` is the change name (kebab-case), OR a description of what the user wants to build.

**Steps**

1. **If no input provided, ask what they want to build**

   Use the **AskUserQuestion tool** (open-ended, no preset options) to ask:
   > "What change do you want to work on? Describe what you want to build or fix."

   From their description, derive a kebab-case name (e.g., "add user authentication" → \`add-user-auth\`).

   **IMPORTANT**: Do NOT proceed without understanding what the user wants to build.

2. **Create the change directory**
   \`\`\`bash
   ghostwire propose "<name>"
   \`\`\`
   This creates a scaffolded change at \`ghostwire/changes/<name>/\` with configuration.

3. **Get the artifact build order**
   \`\`\`bash
   ghostwire status --change "<name>" --json
   \`\`\`
   Parse the JSON to get:
   - \`applyRequires\`: array of artifact IDs needed before implementation (e.g., \`["tasks"]\`)
   - \`artifacts\`: list of all artifacts with their status and dependencies

4. **Create artifacts in sequence until apply-ready**

   Use the **TodoWrite tool** to track progress through the artifacts.

   Loop through artifacts in dependency order (artifacts with no pending dependencies first):

   a. **For each artifact that is \`ready\` (dependencies satisfied)**:
      - Get instructions for creating the artifact
      - Read any completed dependency files for context
      - Create the artifact file using the appropriate template
      - Show brief progress: "Created <artifact-id>"

   b. **Continue until all \`applyRequires\` artifacts are complete**
      - After creating each artifact, re-run status check
      - Stop when all required artifacts are done

   c. **If an artifact requires user input** (unclear context):
      - Use **AskUserQuestion tool** to clarify
      - Then continue with creation

5. **Show final status**

**Output**

After completing all artifacts, summarize:
- Change name and location
- List of artifacts created with brief descriptions
- What's ready: "All artifacts created! Ready for implementation."
- Prompt: "Run \`/ghostwire:apply\` to start implementing."

**Artifact Creation Guidelines**

- Follow the workflow schema for what each artifact should contain
- Read dependency artifacts for context before creating new ones
- Use templates as the structure - fill in their sections
- **IMPORTANT**: Context and rules are constraints for YOU, not content for the file
  - Do NOT copy context blocks into the artifact
  - These guide what you write, but should never appear in the output

**Guardrails**
- Create ALL artifacts needed for implementation
- Always read dependency artifacts before creating a new one
- If context is critically unclear, ask the user - but prefer making reasonable decisions to keep momentum
- If a change with that name already exists, ask if user wants to continue it or create a new one
- Verify each artifact file exists after writing before proceeding to next
`,
  };
}

export function getGhostwireExploreCommandTemplate(): CommandTemplate {
  return {
    name: 'Ghostwire: Explore',
    description: 'Enter explore mode - think through ideas, investigate problems, clarify requirements',
    category: 'Workflow',
    tags: ['workflow', 'explore', 'thinking', 'investigation'],
    content: `Enter explore mode. Think deeply. Visualize freely. Follow the conversation wherever it goes.

**IMPORTANT: Explore mode is for thinking, not implementing.** You may read files, search code, and investigate the codebase, but you must NEVER write code or implement features. If the user asks you to implement something, remind them to exit explore mode first and create a change proposal. You MAY create proposal artifacts if the user asks—that's capturing thinking, not implementing.

**This is a stance, not a workflow.** There are no fixed steps, no required sequence, no mandatory outputs. You're a thinking partner helping the user explore.

**Input**: The argument after \`/ghostwire:explore\` is whatever the user wants to think about. Could be:
- A vague idea: "real-time collaboration"
- A specific problem: "the auth system is getting unwieldy"
- A change name: "add-dark-mode" (to explore in context of that change)
- A comparison: "postgres vs sqlite for this"
- Nothing (just enter explore mode)

---

## The Stance

- **Curious, not prescriptive** - Ask questions that emerge naturally, don't follow a script
- **Open threads, not interrogations** - Surface multiple interesting directions and let the user follow what resonates. Don't funnel them through a single path of questions.
- **Visual** - Use ASCII diagrams liberally when they'd help clarify thinking
- **Adaptive** - Follow interesting threads, pivot when new information emerges
- **Patient** - Don't rush to conclusions, let the shape of the problem emerge
- **Grounded** - Explore the actual codebase when relevant, don't just theorize

---

## What You Might Do

Depending on what the user brings, you might:

**Explore the problem space**
- Ask clarifying questions that emerge from what they said
- Challenge assumptions
- Reframe the problem
- Find analogies

**Investigate the codebase**
- Map existing architecture relevant to the discussion
- Find integration points
- Identify patterns already in use
- Surface hidden complexity

**Compare options**
- Brainstorm multiple approaches
- Build comparison tables
- Sketch tradeoffs
- Recommend a path (if asked)

**Visualize**
\`\`\`
┌─────────────────────────────────────────┐
│     Use ASCII diagrams liberally        │
├─────────────────────────────────────────┤
│                                         │
│   ┌────────┐         ┌────────┐        │
│   │ State  │────────▶│ State  │        │
│   │   A    │         │   B    │        │
│   └────────┘         └────────┘        │
│                                         │
│   System diagrams, state machines,      │
│   data flows, architecture sketches,   │
│   dependency graphs, comparison tables  │
│                                         │
└─────────────────────────────────────────┘
\`\`\`

**Surface risks and unknowns**
- Identify what could go wrong
- Find gaps in understanding
- Suggest spikes or investigations

---

## Ghostwire Awareness

You have full context of the Ghostwire system. Use it naturally, don't force it.

### Check for context

At the start, quickly check what exists:
\`\`\`bash
ghostwire list
\`\`\`

This tells you:
- If there are active changes
- Their names and status
- What the user might be working on

If the user mentioned a specific change name, read its artifacts for context.

### When no change exists

Think freely. When insights crystallize, you might offer:

- "This feels solid enough to start a proposal. Want me to create one?"
- Or keep exploring - no pressure to formalize

### When a change exists

If the user mentions a change or you detect one is relevant:

1. **Read existing artifacts for context**
   - \`ghostwire/changes/<name>/proposal.md\`
   - \`ghostwire/changes/<name>/design.md\`
   - \`ghostwire/changes/<name>/tasks.md\`
   - etc.

2. **Reference them naturally in conversation**
   - "Your design mentions using Redis, but we just realized SQLite fits better..."
   - "The proposal scopes this to premium users, but we're now thinking everyone..."

3. **Offer to capture when decisions are made**

   | Insight Type | Where to Capture |
   |--------------|------------------|
   | New requirement discovered | \`specs/<capability>/spec.md\` changed | \` |
   | Requirementspecs/<capability>/spec.md\` |
   | Design decision made | \`design.md\` |
   | Scope changed | \`proposal.md\` |
   | New work identified | \`tasks.md\` |
   | Assumption invalidated | Relevant artifact |

   Example offers:
   - "That's a design decision. Capture it in design.md?"
   - "This is a new requirement. Add it to specs?"
   - "This changes scope. Update the proposal?"

4. **The user decides** - Offer and move on. Don't pressure. Don't auto-capture.

---

## What You Don't Have To Do

- Follow a script
- Ask the same questions every time
 artifact
- Reach a conclusion
-- Produce a specific Stay on topic if a tangent is valuable
- Be brief (this is thinking time)

---

## Ending Discovery

There's no required ending. Discovery might:

- **Flow into a proposal**: "Ready to start? I can create a change proposal."
- **Result in artifact updates**: "Updated design.md with these decisions"
- **Just provide clarity**: User has what they need, moves on
- **Continue later**: "We can pick this up anytime"

When things crystallize, you might offer a summary - but it's optional. Sometimes the thinking IS the value.

---

## Guardrails

- **Don't implement** - Never write code or implement features. Creating proposal artifacts is fine, writing application code is not.
- **Don't fake understanding** - If something is unclear, dig deeper
- **Don't rush** - Discovery is thinking time, not task time
- **Don't force structure** - Let patterns emerge naturally
- **Don't auto-capture** - Offer to save insights, don't just do it
- **Do visualize** - A good diagram is worth many paragraphs
- **Do explore the codebase** - Ground discussions in reality
- **Do question assumptions** - Including the user's and your own
`,
  };
}

export function getGhostwireApplyCommandTemplate(): CommandTemplate {
  return {
    name: 'Ghostwire: Apply',
    description: 'Implement tasks from a Ghostwire change',
    category: 'Workflow',
    tags: ['workflow', 'apply', 'implementation', 'execute'],
    content: `Implement tasks from a Ghostwire change.

**Input**: Optionally specify a change name (e.g., \`/ghostwire:apply add-auth\`). If omitted, check if it can be inferred from conversation context.

**Steps**

1. **Select the change**

   If a name is provided, use it. Otherwise:
   - Infer from conversation context if the user mentioned a change
   - Auto-select if only one active change exists
   - If ambiguous, run \`ghostwire list\` to get available changes and use the **AskUserQuestion tool** to let the user select

   Always announce: "Using change: <name>" and how to override (e.g., \`/ghostwire:apply <other>\`).

2. **Check status to understand the workflow**
   \`\`\`bash
   ghostwire status --change "<name>" --json
   \`\`\`
   Parse the JSON to understand:
   - \`schemaName\`: The workflow being used (e.g., "spec-driven")
   - Which artifact contains the tasks

3. **Get apply instructions**

   \`\`\`bash
   ghostwire instructions apply --change "<name>" --json
   \`\`\`

   This returns:
   - Context file paths
   - Progress (total, complete, remaining)
   - Task list with status
   - Dynamic instruction based on current state

   **Handle states:**
   - If \`state: "blocked"\` (missing artifacts): show message, suggest completing artifacts first
   - If \`state: "all_done"\`: congratulate, suggest archive
   - Otherwise: proceed to implementation

4. **Read context files**

   Read the files listed in context files from the instructions output.

5. **Show current progress**

   Display:
   - Workflow being used
   - Progress: "N/M tasks complete"
   - Remaining tasks overview
   - Dynamic instruction

6. **Implement tasks (loop until done or blocked)**

   For each pending task:
   - Show which task is being worked on
   - Make the code changes required
   - Keep changes minimal and focused
   - Mark task complete in the tasks file: \`- [ ]\` → \`- [x]\`
   - Continue to next task

   **Pause if:**
   - Task is unclear → ask for clarification
   - Implementation reveals a design issue → suggest updating artifacts
   - Error or blocker encountered → report and wait for guidance
   - User interrupts

7. **On completion or pause, show status**

   Display:
   - Tasks completed this session
   - Overall progress: "N/M tasks complete"
   - If all done: suggest archive
   - If paused: explain why and wait for guidance

**Output During Implementation**

\`\`\`
## Implementing: <change-name> (workflow: <workflow-name>)

Working on task 3/7: <task description>
[...implementation happening...]
✓ Task complete

Working on task 4/7: <task description>
[...implementation happening...]
✓ Task complete
\`\`\`

**Output On Completion**

\`\`\`
## Implementation Complete

**Change:** <change-name>
**Workflow:** <workflow-name>
**Progress:** 7/7 tasks complete ✓

### Completed This Session
- [x] Task 1
- [x] Task 2
...

All tasks complete! You can archive this change with \`/ghostwire:archive\`.
\`\`\`

**Guardrails**
- Keep going through tasks until done or blocked
- Always read context files before starting
- If task is ambiguous, pause and ask before implementing
- If implementation reveals issues, pause and suggest artifact updates
- Keep code changes minimal and scoped to each task
- Update task checkbox immediately after completing each task
- Pause on errors, blockers, or unclear requirements - don't guess
`,
  };
}

export function getGhostwireArchiveCommandTemplate(): CommandTemplate {
  return {
    name: 'Ghostwire: Archive',
    description: 'Archive a completed change',
    category: 'Workflow',
    tags: ['workflow', 'archive', 'complete', 'done'],
    content: `Archive a completed change.

**Input**: Optionally specify a change name (e.g., \`/ghostwire:archive add-auth\`). If omitted, check if it can be inferred from conversation context.

**Steps**

1. **If no change name provided, prompt for selection**

   Run \`ghostwire list --json\` to get available changes. Use the **AskUserQuestion tool** to let the user select.

   Show only active changes (not already archived).

   **IMPORTANT**: Do NOT guess or auto-select a change. Always let the user choose.

2. **Check artifact completion status**

   Run \`ghostwire status --change "<name>" --json\` to check artifact completion.

   Parse the JSON to understand:
   - \`schemaName\`: The workflow being used
   - \`artifacts\`: List of artifacts with their status (\`done\` or other)

   **If any artifacts are not \`done\`:**
   - Display warning listing incomplete artifacts
   - Prompt user for confirmation to continue
   - Proceed if user confirms

3. **Check task completion status**

   Read the tasks file to check for incomplete tasks.

   Count tasks marked with \`- [ ]\` (incomplete) vs \`- [x]\` (complete).

   **If incomplete tasks found:**
   - Display warning showing count of incomplete tasks
   - Prompt user for confirmation to continue
   - Proceed if user confirms

4. **Perform the archive**

   Create the archive directory if it doesn't exist:
   \`\`\`bash
   mkdir -p ghostwire/changes/archive
   \`\`\`

   Generate target name using current date: \`YYYY-MM-DD-<change-name>\`

   **Check if target already exists:**
   - If yes: Fail with error, suggest renaming existing archive or using different date
   - If no: Move the change directory to archive

   \`\`\`bash
   mv ghostwire/changes/<name> ghostwire/changes/archive/YYYY-MM-DD-<name>
   \`\`\`

5. **Display summary**

   Show archive completion summary including:
   - Change name
   - Workflow that was used
   - Archive location
   - Note about any warnings (incomplete artifacts/tasks)

**Output On Success**

\`\`\`
## Archive Complete

**Change:** <change-name>
**Workflow:** <workflow-name>
**Archived to:** ghostwire/changes/archive/YYYY-MM-DD-<name>/

All artifacts complete. All tasks complete.
\`\`\`

**Output On Success With Warnings**

\`\`\`
## Archive Complete (with warnings)

**Change:** <change-name>
**Workflow:** <workflow-name>
**Archived to:** ghostwire/changes/archive/YYYY-MM-DD-<name>/

**Warnings:**
- Archived with 2 incomplete artifacts
- Archived with 3 incomplete tasks

Review the archive if this was not intentional.
\`\`\`

**Guardrails**
- Always prompt for change selection if not provided
- Use status for completion checking
- Don't block archive on warnings - just inform and confirm
- Show clear summary of what happened
`,
  };
}
