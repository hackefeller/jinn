# Agents and Commands: The Complete Guide

## TL;DR

**Agents are workers. Commands are orchestrators.**

- **Agents** are specialized LLM workers (planner, reviewer, researcher, etc.)
- **Commands** are workflows that invoke agents to accomplish goals
- **You can't use agents alone** - they need commands to know what to do and how to coordinate
- **Commands without agents** are just templates - they need agents to execute

Think of it like a restaurant:

- **Agents** = chefs, sous chefs, dishwashers (specialized workers)
- **Commands** = recipes and kitchen procedures (how to coordinate workers)
- **You** = the head chef orchestrating everything

---

## The Problem: Why Users Are Confused

Users often assume:

> "I'll just use the planner agent to plan my feature"

But then they discover:

> "The planner agent did nothing. It just sat there waiting for instructions."

**Why?** Because agents are **passive workers**, not **active orchestrators**. They need:

1. **Clear instructions** (what to do)
2. **A workflow** (how to coordinate with other agents)
3. **A command** (the entry point that ties it all together)

---

## Architecture: How Agents and Commands Work Together

### The Separation of Concerns

```
┌─────────────────────────────────────────────────────────────┐
│                        USER PROMPT                          │
│                    "Plan my feature"                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      COMMAND                                │
│              (/ghostwire:workflows:plan)                    │
│                                                             │
│  - Parses user input                                        │
│  - Decides which agents to invoke                           │
│  - Coordinates agent execution                              │
│  - Synthesizes results                                      │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
    ┌────────┐      ┌────────┐      ┌────────┐
    │ Agent  │      │ Agent  │      │ Agent  │
    │Planner │      │Research│      │Advisor │
    └────────┘      └────────┘      └────────┘
        │                │                │
        └────────────────┼────────────────┘
                         │
                         ▼
            ┌──────────────────────────┐
            │   Synthesized Result     │
            │   (Plan document)        │
            └──────────────────────────┘
```

### Key Insight: Agents Are Passive

Agents **do not** automatically:

- Decide what to work on
- Coordinate with other agents
- Know when to start or stop
- Understand the overall goal

Agents **only**:

- Respond to explicit instructions
- Execute a single focused task
- Return results to the caller

### Commands Are Active Orchestrators

Commands **do**:

- Parse user intent
- Decide which agents to invoke
- Coordinate parallel/sequential execution
- Synthesize results
- Handle error cases
- Provide feedback to the user

---

## Agent Types and Their Roles

Ghostwire includes **38 agents** organized into 8 functional categories.

### 1. **Orchestration Agents** (4 agents)

These coordinate other agents and manage workflows:

| Agent          | Purpose                                       | Used By                     |
| -------------- | --------------------------------------------- | --------------------------- |
| `operator`     | Primary orchestrator with obsession for todos | Ralph Loop, overclock mode  |
| `orchestrator` | Master coordinator for all agents             | Grid sync hook              |
| `planner`      | Strategic planning consultant                 | `/ghostwire:workflows:plan` |
| `executor`     | Execution specialist for task completion      | `/ghostwire:workflows:work` |

**Key insight:** Even orchestration agents need commands to be invoked. They don't self-start.

### 2. **Specialist Agents** (34 agents)

These perform focused work in specific domains:

**Code Review Agents** (7)

- `reviewer-rails` - Kieran-style Rails code review
- `reviewer-python` - Python code review
- `reviewer-typescript` - TypeScript code review
- `reviewer-rails-dh` - DHH-style Rails review
- `reviewer-simplicity` - Code clarity and YAGNI
- `reviewer-security` - Security audits
- `reviewer-races` - Race condition detection

**Research Agents** (8)

- `researcher-codebase` - Codebase search and patterns
- `researcher-docs` - Framework documentation
- `researcher-learnings` - Internal knowledge
- `researcher-practices` - Best practices
- `researcher-git` - Git history analysis
- `researcher-data` - External libraries and docs
- `researcher-repo` - Repository structure
- `analyzer-media` - PDFs, images, diagrams

**Design Agents** (5)

- `designer-flow` - User journey and spec flow
- `designer-builder` - Frontend implementation
- `designer-sync` - Figma synchronization
- `designer-iterator` - Visual improvements
- `analyzer-design` - Design validation

**Advisory Agents** (3)

- `advisor-architecture` - Architecture design
- `advisor-strategy` - Pre-planning consultation
- `advisor-plan` - High-IQ debugging

**Validation Agents** (4)

- `validator-audit` - Plan validation
- `validator-deployment` - Deployment verification
- `validator-bugs` - Bug reproduction
- `analyzer-patterns` - Pattern recognition

**Specialized Agents** (4)

- `expert-migrations` - Data migrations
- `guardian-data` - Data integrity
- `resolver-pr` - PR comment resolution
- `oracle-performance` - Performance analysis

**Documentation Agents** (3)

- `writer-readme` - README writing
- `writer-gem` - Gem documentation
- `editor-style` - Style guides

---

## How Commands Invoke Agents

### Invocation Mechanisms

Commands use three main mechanisms to invoke agents:

#### 1. **delegate_task** - For Parallel Execution

```typescript
// Invoke multiple agents in parallel
delegate_task((category = "code-review"), (prompt = "Review this PR for security issues"));

// Or invoke a specific agent
delegate_task(
  (subagent_type = "reviewer-security"),
  (prompt = "Check for SQL injection vulnerabilities"),
);
```

**When to use:**

- Running multiple agents simultaneously
- Agents don't depend on each other's output
- Want to leverage multiple perspectives

**Example from code:**

```typescript
// From /ghostwire:workflows:plan command
- Task repo-research-analyst(feature_description)
- Task learnings-researcher(feature_description)
```

#### 2. **call_grid_agent** - For Specialized Research

```typescript
call_grid_agent(
  (subagent_type = "researcher-codebase"),
  (prompt = "Find all authentication patterns in the codebase"),
);
```

**When to use:**

- Need deep codebase exploration
- Require specialized research agents
- Want background task execution

**Example from code:**

```typescript
// From /ghostwire:code:refactor command
call_grid_agent(
  (subagent_type = "researcher-codebase"),
  (prompt = "Find all usages of deprecated API"),
);
```

#### 3. **@agent-name** - For Inline Mentions

```markdown
Have @reviewer-security @reviewer-rails review this code in parallel.
```

**When to use:**

- Simple, direct agent invocation
- Inline within command templates
- Quick mentions without complex coordination

**Example from code:**

```typescript
// From /plan-review command
Have @agent-dhh-rails-reviewer @agent-kieran-rails-reviewer
@agent-code-simplicity-reviewer review this plan in parallel.
```

---

## Real-World Examples: Commands Using Agents

### Example 1: The Plan Command

**Command:** `/ghostwire:workflows:plan`

**What it does:**

1. Parses the feature description from user
2. Invokes `researcher-codebase` to find existing patterns
3. Invokes `researcher-learnings` to find institutional knowledge
4. Decides if external research is needed
5. Optionally invokes `researcher-docs` and `researcher-practices`
6. Synthesizes findings into a plan document

**Why agents alone wouldn't work:**

- The planner agent doesn't know what to research
- It doesn't know the project structure
- It can't decide between local vs external research
- It needs the command to coordinate the workflow

### Example 2: The Code Review Command

**Command:** `/ghostwire:code:review`

**What it does:**

1. Identifies the PR or branch to review
2. Invokes multiple review agents in parallel:
   - `reviewer-security` for security issues
   - `reviewer-rails` for Rails patterns
   - `reviewer-simplicity` for code clarity
   - `reviewer-performance` for optimization
3. Synthesizes findings into a comprehensive report
4. Creates todo items for each finding

**Why agents alone wouldn't work:**

- Individual agents don't know about the PR
- They can't coordinate findings
- They don't know how to synthesize results
- They can't create actionable todos

### Example 3: The Work Command

**Command:** `/ghostwire:workflows:work`

**What it does:**

1. Reads the work plan
2. Breaks it into tasks
3. For each task:
   - Invokes `researcher-codebase` to find similar patterns
   - Invokes `designer-builder` if UI work
   - Invokes `reviewer-typescript` to validate code
4. Manages git commits and branch creation
5. Tracks progress with todos

**Why agents alone wouldn't work:**

- Agents don't know the plan
- They can't manage git operations
- They can't coordinate sequential task execution
- They can't track overall progress

---

## The Agent-Command Relationship: Key Patterns

### Pattern 1: Command as Workflow Orchestrator

```
Command receives user input
    ↓
Command decides which agents to invoke
    ↓
Command invokes agents (parallel or sequential)
    ↓
Command collects results
    ↓
Command synthesizes/formats results
    ↓
Command returns to user
```

**Example:** `/ghostwire:workflows:plan`

### Pattern 2: Command as Decision Maker

```
Command analyzes context
    ↓
Command decides: "Do we need external research?"
    ↓
If yes: invoke research agents
If no: skip to synthesis
    ↓
Command synthesizes findings
```

**Example:** `/ghostwire:workflows:plan` (research decision phase)

### Pattern 3: Command as Coordinator

```
Command invokes Agent A
    ↓
Agent A returns results
    ↓
Command invokes Agent B (using A's results)
    ↓
Agent B returns results
    ↓
Command synthesizes both results
```

**Example:** `/ghostwire:workflows:work` (sequential task execution)

### Pattern 4: Command as Parallel Executor

```
Command invokes Agent A ─┐
Command invokes Agent B ─┼─ (all in parallel)
Command invokes Agent C ─┘
    ↓
Command waits for all to complete
    ↓
Command synthesizes results
```

**Example:** `/ghostwire:code:review` (multiple reviewers)

---

## Why Agents Can't Work Alone

### Reason 1: No Entry Point

Agents are passive. They wait for instructions. Without a command:

- No one tells them to start
- No one provides context
- No one knows what they should do

### Reason 2: No Coordination

Agents are specialists. They focus on one task. Without a command:

- Multiple agents don't know about each other
- Results aren't synthesized
- No overall workflow exists

### Reason 3: No Context Management

Agents need context to work effectively. Without a command:

- They don't know the project structure
- They don't understand the goal
- They can't make intelligent decisions

### Reason 4: No Result Handling

Agents produce raw output. Without a command:

- Results aren't formatted for users
- Findings aren't actionable
- No follow-up actions are taken

---

## How to Use Agents Effectively

### Rule 1: Always Use Commands

**Don't do this:**

```
"Use the planner agent to plan my feature"
```

**Do this:**

```
"/ghostwire:workflows:plan Add user authentication to the app"
```

The command knows how to invoke the planner and coordinate the workflow.

### Rule 2: Understand Agent Specialization

Each agent is specialized. Use the right agent for the job:

| Goal              | Agent          | Command                     |
| ----------------- | -------------- | --------------------------- |
| Plan a feature    | `planner`      | `/ghostwire:workflows:plan` |
| Review code       | `reviewer-*`   | `/ghostwire:code:review`    |
| Research patterns | `researcher-*` | `/ghostwire:workflows:plan` |
| Execute work      | `executor`     | `/ghostwire:workflows:work` |
| Debug issues      | `advisor-plan` | `/ghostwire:plan-review`    |

### Rule 3: Combine Agents for Complex Tasks

Complex tasks require multiple agents:

```
Feature Planning:
  1. Planner (creates structure)
  2. Researcher (finds patterns)
  3. Advisor (validates approach)
  4. Executor (implements)
```

Each agent contributes its specialty. The command coordinates them.

### Rule 4: Let Commands Decide

Commands are smart about when to invoke agents:

```
/ghostwire:workflows:plan "Add payment processing"
    ↓
Command decides: "This is high-risk (payments)"
    ↓
Command invokes external research agents
    ↓
Command invokes security advisor
    ↓
Command synthesizes comprehensive plan
```

Don't try to manually invoke agents. Let the command decide.

---

## Common Mistakes and How to Avoid Them

### Mistake 1: Expecting Agents to Self-Start

**Wrong:**

```
"I'll use the researcher agent to explore the codebase"
```

**Why it fails:**

- The agent doesn't know what to research
- It doesn't know where to start
- It has no context

**Right:**

```
"/ghostwire:workflows:plan Add caching to the API"
```

The command invokes the researcher with clear context.

### Mistake 2: Using the Wrong Agent

**Wrong:**

```
"Use the planner agent to review my code"
```

**Why it fails:**

- The planner is for planning, not reviewing
- It doesn't have review expertise
- It will produce a plan, not a review

**Right:**

```
"/ghostwire:code:review"
```

The command invokes the appropriate review agents.

### Mistake 3: Trying to Coordinate Agents Manually

**Wrong:**

```
"First use researcher-codebase to find patterns,
then use reviewer-rails to review the code,
then use advisor-plan to validate"
```

**Why it fails:**

- You're doing the command's job
- Agents don't know about each other's results
- Results aren't synthesized

**Right:**

```
"/ghostwire:code:review"
```

The command handles all coordination.

### Mistake 4: Assuming Agents Know the Context

**Wrong:**

```
"Use the executor agent to implement the feature"
```

**Why it fails:**

- The agent doesn't know what feature
- It doesn't know the plan
- It doesn't know the codebase

**Right:**

```
"/ghostwire:workflows:work path/to/plan.md"
```

The command provides context to the agent.

---

## Mental Model: The Restaurant Analogy

### The Wrong Mental Model

> "I'll just tell the chef to cook dinner"

**Problem:** The chef doesn't know:

- What dinner means
- What ingredients are available
- What the guests like
- How many people to cook for

### The Right Mental Model

> "I'll use the head chef (command) to coordinate the kitchen (agents)"

**How it works:**

1. **Head Chef (Command)** receives the order: "Cook dinner for 10 people"
2. **Head Chef** decides what to cook and coordinates:
   - **Sous Chef (Planner)** plans the menu
   - **Prep Cook (Researcher)** finds ingredients
   - **Line Cook (Executor)** cooks the dishes
   - **Pastry Chef (Designer)** plates the food
3. **Head Chef** synthesizes everything into a complete dinner
4. **Guests** enjoy the meal

Each chef is specialized. The head chef coordinates. The order (command) drives everything.

---

## The Command Ecosystem

Ghostwire includes **50+ built-in commands** organized by category. Each command is a complete workflow that may invoke agents, tools, or both.

### Core Workflow Commands (5)

These are the main entry points for complex work:

| Command                           | Purpose            | Agents Used                        |
| --------------------------------- | ------------------ | ---------------------------------- |
| `/ghostwire:workflows:plan`       | Plan a feature     | planner, researcher-\*             |
| `/ghostwire:workflows:work`       | Execute a plan     | executor, researcher-_, reviewer-_ |
| `/ghostwire:workflows:brainstorm` | Brainstorm ideas   | advisor-_, researcher-_            |
| `/ghostwire:workflows:compound`   | Document learnings | writer-_, editor-_                 |
| `/ghostwire:workflows:review`     | Exhaustive review  | reviewer-_, validator-_            |

### Code Commands (4)

Code analysis and transformation:

| Command                    | Purpose       | Agents Used                     |
| -------------------------- | ------------- | ------------------------------- |
| `/ghostwire:code:review`   | Review code   | reviewer-\*                     |
| `/ghostwire:code:refactor` | Refactor code | reviewer-_, researcher-_        |
| `/ghostwire:code:optimize` | Optimize code | oracle-performance, reviewer-\* |
| `/ghostwire:code:format`   | Format code   | (no agents)                     |

### Git Commands (4)

Git workflow automation:

| Command                       | Purpose           | Agents Used |
| ----------------------------- | ----------------- | ----------- |
| `/ghostwire:git:smart-commit` | Smart commits     | (no agents) |
| `/ghostwire:git:branch`       | Branch management | (no agents) |
| `/ghostwire:git:merge`        | Merge assistance  | (no agents) |
| `/ghostwire:git:cleanup`      | Cleanup branches  | (no agents) |

### Project Commands (4)

Project-level operations:

| Command                     | Purpose            | Agents Used          |
| --------------------------- | ------------------ | -------------------- |
| `/ghostwire:project:init`   | Initialize project | researcher-repo      |
| `/ghostwire:project:build`  | Build project      | (no agents)          |
| `/ghostwire:project:deploy` | Deploy project     | validator-deployment |
| `/ghostwire:project:test`   | Run tests          | (no agents)          |

### Utility Commands (4)

Project maintenance:

| Command                   | Purpose         | Agents Used |
| ------------------------- | --------------- | ----------- |
| `/ghostwire:util:clean`   | Clean project   | (no agents) |
| `/ghostwire:util:backup`  | Backup files    | (no agents) |
| `/ghostwire:util:restore` | Restore files   | (no agents) |
| `/ghostwire:util:doctor`  | Run diagnostics | (no agents) |

### Documentation Commands (4)

Documentation and testing:

| Command                         | Purpose               | Agents Used                    |
| ------------------------------- | --------------------- | ------------------------------ |
| `/ghostwire:docs:deploy-docs`   | Deploy documentation  | (no agents)                    |
| `/ghostwire:docs:release-docs`  | Release documentation | (no agents)                    |
| `/ghostwire:docs:feature-video` | Create feature video  | (no agents)                    |
| `/ghostwire:docs:test-browser`  | Browser testing       | designer-builder, validator-\* |

### Specialized Commands (20+)

Domain-specific workflows:

| Command                              | Purpose                                    | Agents Used                         |
| ------------------------------------ | ------------------------------------------ | ----------------------------------- |
| `/ghostwire:project:map`             | Map project structure & generate AGENTS.md | researcher-codebase                 |
| `/ghostwire:init-deep`               | (deprecated, use project:map)              | researcher-codebase                 |
| `/ghostwire:overclock-loop`          | Run task completion loop                   | operator, orchestrator              |
| `/ghostwire:jack-in-work`            | Jump into work mode                        | operator, orchestrator              |
| `/ghostwire:refactor`                | Refactor with analysis                     | reviewer-_, researcher-_            |
| `/ghostwire:plan-review`             | Review a plan                              | reviewer-rails, reviewer-simplicity |
| `/ghostwire:test-browser`            | Browser testing                            | designer-builder, validator-\*      |
| `/ghostwire:xcode-test`              | iOS testing                                | designer-builder, validator-\*      |
| `/ghostwire:triage`                  | Triage issues                              | researcher-codebase, validator-\*   |
| `/ghostwire:resolve-parallel`        | Resolve multiple items                     | executor, reviewer-\*               |
| `/ghostwire:resolve-pr-parallel`     | Resolve PRs in parallel                    | executor, reviewer-\*               |
| `/ghostwire:resolve-todo-parallel`   | Resolve todos in parallel                  | executor, reviewer-\*               |
| And 10+ more specialized commands... |                                            |                                     |

---

## Advanced: Creating Custom Commands

If you want to create a custom command that uses agents:

### Step 1: Define the Workflow

```
What agents do I need?
What order should they run?
How do I synthesize results?
```

### Step 2: Create the Command Template

```markdown
# My Custom Command

## Phase 1: Research

- Invoke researcher-codebase
- Invoke researcher-docs

## Phase 2: Analysis

- Invoke advisor-architecture
- Invoke reviewer-security

## Phase 3: Synthesis

- Combine findings
- Create actionable items
```

### Step 3: Implement Agent Invocation

```typescript
// Invoke agents in parallel
delegate_task(
  (subagent_type = "researcher-codebase"),
  (prompt = "Find all authentication patterns"),
);

delegate_task((subagent_type = "researcher-docs"), (prompt = "Find authentication best practices"));

// Wait for results, then synthesize
```

### Step 4: Synthesize Results

```typescript
// Combine findings from both agents
// Create actionable recommendations
// Return to user
```

---

## FAQ

### Q: Can I use an agent directly without a command?

**A:** Technically yes, but you shouldn't. Agents need:

- Clear instructions (what to do)
- Context (what project, what goal)
- Coordination (with other agents)

Commands provide all of this. Using agents directly is like asking a chef to cook without a recipe.

### Q: Why are agents and commands separate?

**A:** Separation of concerns:

- **Agents** = specialized workers (focused, reusable)
- **Commands** = workflows (orchestration, coordination)

This allows:

- Agents to be reused in multiple commands
- Commands to be composed from agents
- Easy testing and maintenance

### Q: Can I create my own agents?

**A:** Yes! Agents are defined in `src/orchestration/agents/*.md`. You can:

- Create new agent definitions
- Customize existing agents
- Combine agents in new ways

But remember: agents still need commands to be useful.

### Q: What if I want to use multiple agents for a task?

**A:** Use a command that coordinates them:

```
/ghostwire:code:review  # Uses multiple review agents
/ghostwire:workflows:plan  # Uses multiple research agents
```

Or create a custom command that invokes the agents you need.

### Q: How do I know which agent to use?

**A:** Look at the agent's purpose:

| Purpose        | Agent          |
| -------------- | -------------- |
| Planning       | `planner`      |
| Reviewing code | `reviewer-*`   |
| Researching    | `researcher-*` |
| Designing UI   | `designer-*`   |
| Validating     | `validator-*`  |

When in doubt, use a command that handles the task. The command knows which agents to invoke.

---

## Summary

### Key Takeaways

1. **Agents are workers, commands are orchestrators**
   - Agents execute focused tasks
   - Commands coordinate agents

2. **Agents can't work alone**
   - They need commands to provide context
   - They need commands to coordinate with other agents
   - They need commands to synthesize results

3. **Always use commands**
   - Commands know which agents to invoke
   - Commands handle coordination
   - Commands synthesize results

4. **Understand agent specialization**
   - Each agent has a specific purpose
   - Use the right agent for the job
   - Combine agents for complex tasks

5. **Let commands decide**
   - Commands are smart about when to invoke agents
   - Don't try to manually coordinate agents
   - Trust the command to do the right thing

### Next Steps

1. **Read the command documentation** to understand available workflows
2. **Try a command** like `/ghostwire:workflows:plan` to see agents in action
3. **Explore agent definitions** in `src/orchestration/agents/` to understand specialization
4. **Create custom commands** when you need specialized workflows

---

## Related Documentation

- [Commands Reference](../reference/commands.md)
- [Agents Reference](../reference/agents.md)
- [Skills Reference](../reference/skills.md)
- [Configuration Guide](../reference/configurations.md)
- [Workflows Guide](./workflows.md)
