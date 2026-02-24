# Agents, Commands, and Skills: The Unified Model

## The Problem

Users are confused because ghostwire has **three overlapping concepts** that seem to do similar things:

- **Agents** - Autonomous AI workers
- **Commands** - Structured workflows
- **Skills** - Knowledge/tool providers

This document explains what each is, how they differ, and when to use each one.

---

## Quick Definitions

### Agent

**An autonomous AI entity that reasons, makes decisions, and executes work.**

- Thinks independently
- Makes strategic decisions
- Can delegate to other agents
- Can load skills for specialized knowledge
- Examples: `planner`, `researcher-codebase`, `reviewer-rails`

### Command

**A structured workflow that orchestrates agents to accomplish a goal.**

- Defines a sequence of steps
- Invokes agents at specific points
- Verifies results
- Handles errors and retries
- Examples: `/ghostwire:workflows:plan`, `/ghostwire:code:review`

### Skill

**Passive knowledge or tool access that enhances agents.**

- Provides specialized knowledge
- Enables tool access
- Cannot act independently
- Must be loaded into an agent
- Examples: `git-master`, `playwright`, `frontend-ui-ux`

---

## The Autonomy Spectrum

```
┌─────────────────────────────────────────────────────────┐
│                   AUTONOMY SPECTRUM                     │
└─────────────────────────────────────────────────────────┘

PASSIVE                                              ACTIVE
  │                                                    │
  ▼                                                    ▼
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ SKILLS   │    │ COMMANDS │    │ AGENTS   │    │ORCHESTR. │
│          │    │          │    │          │    │ AGENTS   │
│Passive   │    │Semi-Auto │    │Autonomous│    │Master    │
│Knowledge │    │Workflows │    │Reasoning │    │Coord.    │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
```

---

## Side-by-Side Comparison

| Aspect              | Skill                      | Command                  | Agent                              |
| ------------------- | -------------------------- | ------------------------ | ---------------------------------- |
| **Autonomy**        | None (passive)             | Semi (scripted)          | Full (reasoning)                   |
| **Invocation**      | Loaded into agent          | `/command-name`          | `@agent-name` or `delegate_task()` |
| **Decision Making** | No                         | Limited (scripted)       | Yes (autonomous)                   |
| **Can Delegate**    | No                         | Yes (to agents)          | Yes (to other agents)              |
| **Can Load Skills** | No                         | Yes                      | Yes                                |
| **Persistence**     | Temporary                  | Per invocation           | Per invocation                     |
| **Examples**        | git-master, playwright     | /plan, /review           | planner, reviewer-rails            |
| **Use When**        | Need specialized knowledge | Need structured workflow | Need autonomous reasoning          |

---

## The Relationship Model

### How They Interact

```
┌─────────────────────────────────────────────────────────┐
│                    COMMAND                              │
│              (Orchestrator/Workflow)                    │
│                                                         │
│  1. Parse user intent                                   │
│  2. Decide which agents to invoke                       │
│  3. Load skills for agents                              │
│  4. Invoke agents with context                          │
│  5. Verify results                                      │
│  6. Report to user                                      │
└────────────────┬────────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
    ┌────────┐        ┌────────┐
    │ AGENT  │        │ AGENT  │
    │        │        │        │
    │ Reason │        │ Reason │
    │ Decide │        │ Decide │
    │ Execute│        │ Execute│
    └────┬───┘        └────┬───┘
         │                 │
         ▼                 ▼
    ┌────────┐        ┌────────┐
    │ SKILL  │        │ SKILL  │
    │        │        │        │
    │ Provide│        │ Provide│
    │ Tools  │        │ Tools  │
    └────────┘        └────────┘
```

### Dependency Graph

```
COMMAND
  ├─ Invokes → AGENT 1
  │             ├─ Loads → SKILL A
  │             ├─ Loads → SKILL B
  │             └─ Delegates → AGENT 2
  │                            └─ Loads → SKILL C
  │
  └─ Invokes → AGENT 3
               └─ Loads → SKILL D
```

---

## The Three Types of Agents

Ghostwire includes **38 agents** organized into 8 functional categories.

### Type 1: Orchestration Agents (4)

**Coordinate other agents and manage workflows.**

| Agent          | Purpose                                       |
| -------------- | --------------------------------------------- |
| `operator`     | Primary orchestrator with obsession for todos |
| `orchestrator` | Master coordinator for all agents             |
| `planner`      | Strategic planning consultant                 |
| `executor`     | Execution specialist (Dark Runner)            |

**Characteristics:**

- Can delegate to other agents
- Maintain state via `.ghostwire/` files
- Verify results from delegated agents
- Handle errors and retries

**When Used:**

- `/jack-in-work` command (operator)
- `/ghostwire:workflows:plan` command (planner)
- `/ghostwire:workflows:work` command (executor)

---

### Type 2: Specialist Agents (34)

**Execute focused work in specific domains.**

**Code Review (7 agents)**

- `reviewer-rails` - Kieran-style Rails code review
- `reviewer-python` - Python code review
- `reviewer-typescript` - TypeScript code review
- `reviewer-rails-dh` - DHH-style Rails review
- `reviewer-simplicity` - Code clarity and YAGNI
- `reviewer-security` - Security audits
- `reviewer-races` - Race condition detection

**Research (8 agents)**

- `researcher-codebase` - Codebase search and patterns
- `researcher-docs` - Framework documentation
- `researcher-learnings` - Internal knowledge
- `researcher-practices` - Best practices
- `researcher-git` - Git history analysis
- `researcher-data` - External libraries and docs
- `researcher-repo` - Repository structure
- `analyzer-media` - PDFs, images, diagrams

**Design (5 agents)**

- `designer-flow` - User journey and spec flow
- `designer-builder` - Frontend implementation
- `designer-sync` - Figma synchronization
- `designer-iterator` - Visual improvements
- `analyzer-design` - Design validation

**Advisory (3 agents)**

- `advisor-architecture` - Architecture design
- `advisor-strategy` - Pre-planning consultation
- `advisor-plan` - High-IQ debugging

**Validation (4 agents)**

- `validator-audit` - Plan validation
- `validator-deployment` - Deployment verification
- `validator-bugs` - Bug reproduction
- `analyzer-patterns` - Pattern recognition

**Specialized (4 agents)**

- `expert-migrations` - Data migrations
- `guardian-data` - Data integrity
- `resolver-pr` - PR comment resolution
- `oracle-performance` - Performance analysis

**Documentation (3 agents)**

- `writer-readme` - README writing
- `writer-gem` - Gem documentation
- `editor-style` - Style guides

**Characteristics:**

- Focused expertise in one domain
- Cannot delegate to other agents (blocked)
- Can call researcher agents for context
- Verify with tools (lsp_diagnostics, bash, etc.)

**When Used:**

- Invoked by commands via `delegate_task()`
- Invoked by orchestration agents
- Invoked directly via `@agent-name`

---

### Type 3: Category-Based Agents

**Ephemeral agents created on-the-fly with specific configurations.**

| Category             | Purpose               |
| -------------------- | --------------------- |
| `visual-engineering` | Frontend/UI work      |
| `business-logic`     | Backend/core logic    |
| `ultrabrain`         | Complex reasoning     |
| `quick`              | Simple, fast tasks    |
| `writing`            | Documentation/content |

**Characteristics:**

- Created dynamically when needed
- Configured with specific skills
- Temporary (exist only for the task)
- Routed to appropriate agent based on category

**When Used:**

- `delegate_task(category="visual-engineering", ...)`
- `delegate_task(category="business-logic", ...)`
- `delegate_task(category="ultrabrain", ...)`

---

## Commands: 50+ Built-in Commands Organized by Category

Commands are organized into functional categories. Each command is a complete workflow that may invoke agents, tools, or both.

### Core Workflow Commands (5)

**Multi-phase workflows that orchestrate agents.**

| Command                           | Purpose            | Agents                             |
| --------------------------------- | ------------------ | ---------------------------------- |
| `/ghostwire:workflows:plan`       | Plan a feature     | planner, researcher-\*             |
| `/ghostwire:workflows:work`       | Execute a plan     | executor, researcher-_, reviewer-_ |
| `/ghostwire:workflows:brainstorm` | Brainstorm ideas   | advisor-_, researcher-_            |
| `/ghostwire:workflows:compound`   | Document learnings | writer-_, editor-_                 |
| `/ghostwire:workflows:review`     | Exhaustive review  | reviewer-_, validator-_            |

---

### Code Commands (4)

**Code analysis and transformation workflows.**

| Command                    | Purpose       | Agents                          |
| -------------------------- | ------------- | ------------------------------- |
| `/ghostwire:code:review`   | Review code   | reviewer-\*                     |
| `/ghostwire:code:refactor` | Refactor code | reviewer-_, researcher-_        |
| `/ghostwire:code:optimize` | Optimize code | oracle-performance, reviewer-\* |
| `/ghostwire:code:format`   | Format code   | (no agents)                     |

---

### Git Commands (4)

**Git workflow automation.**

| Command                       | Purpose           | Agents      |
| ----------------------------- | ----------------- | ----------- |
| `/ghostwire:git:smart-commit` | Smart commits     | (no agents) |
| `/ghostwire:git:branch`       | Branch management | (no agents) |
| `/ghostwire:git:merge`        | Merge assistance  | (no agents) |
| `/ghostwire:git:cleanup`      | Cleanup branches  | (no agents) |

---

### Project Commands (4)

**Project-level operations.**

| Command                     | Purpose            | Agents               |
| --------------------------- | ------------------ | -------------------- |
| `/ghostwire:project:init`   | Initialize project | researcher-repo      |
| `/ghostwire:project:build`  | Build project      | (no agents)          |
| `/ghostwire:project:deploy` | Deploy project     | validator-deployment |
| `/ghostwire:project:test`   | Run tests          | (no agents)          |

---

### Utility Commands (4)

**Project maintenance and diagnostics.**

| Command                   | Purpose         | Agents      |
| ------------------------- | --------------- | ----------- |
| `/ghostwire:util:clean`   | Clean project   | (no agents) |
| `/ghostwire:util:backup`  | Backup files    | (no agents) |
| `/ghostwire:util:restore` | Restore files   | (no agents) |
| `/ghostwire:util:doctor`  | Run diagnostics | (no agents) |

---

### Documentation Commands (4)

**Documentation and testing workflows.**

| Command                         | Purpose               | Agents                         |
| ------------------------------- | --------------------- | ------------------------------ |
| `/ghostwire:docs:deploy-docs`   | Deploy documentation  | (no agents)                    |
| `/ghostwire:docs:release-docs`  | Release documentation | (no agents)                    |
| `/ghostwire:docs:feature-video` | Create feature video  | (no agents)                    |
| `/ghostwire:docs:test-browser`  | Browser testing       | designer-builder, validator-\* |

---

### Specialized Commands (20+)

**Domain-specific workflows and utilities.**

| Command                            | Purpose                                    | Agents                              |
| ---------------------------------- | ------------------------------------------ | ----------------------------------- |
| `/ghostwire:project:map`           | Map project structure & generate AGENTS.md | researcher-codebase                 |
| `/ghostwire:init-deep`             | (deprecated, use project:map)              | researcher-codebase                 |
| `/ghostwire:overclock-loop`        | Run task completion loop                   | operator, orchestrator              |
| `/ghostwire:ulw-overclock`         | Ultra-work mode                            | operator, orchestrator              |
| `/ghostwire:jack-in-work`          | Jump into work mode                        | operator, orchestrator              |
| `/ghostwire:refactor`              | Refactor with analysis                     | reviewer-_, researcher-_            |
| `/ghostwire:plan-review`           | Review a plan                              | reviewer-rails, reviewer-simplicity |
| `/ghostwire:test-browser`          | Browser testing                            | designer-builder, validator-\*      |
| `/ghostwire:xcode-test`            | iOS testing                                | designer-builder, validator-\*      |
| `/ghostwire:triage`                | Triage issues                              | researcher-codebase, validator-\*   |
| `/ghostwire:resolve-parallel`      | Resolve multiple items                     | executor, reviewer-\*               |
| `/ghostwire:resolve-pr-parallel`   | Resolve PRs in parallel                    | executor, reviewer-\*               |
| `/ghostwire:resolve-todo-parallel` | Resolve todos in parallel                  | executor, reviewer-\*               |
| `/ghostwire:create-agent-skill`    | Create agent skills                        | writer-_, editor-_                  |
| `/ghostwire:deepen-plan`           | Enhance plans with research                | researcher-_, advisor-_             |
| `/ghostwire:generate-command`      | Generate custom commands                   | writer-_, editor-_                  |
| `/ghostwire:heal-skill`            | Fix broken skills                          | reviewer-_, validator-_             |
| `/ghostwire:report-bug`            | Report bugs                                | validator-bugs                      |
| `/ghostwire:reproduce-bug`         | Reproduce bugs                             | validator-bugs                      |
| `/ghostwire:sync-tutorials`        | Sync tutorials                             | writer-_, editor-_                  |
| `/ghostwire:changelog`             | Create changelogs                          | writer-_, editor-_                  |
| `/ghostwire:lfg`                   | Looking for group                          | advisor-_, researcher-_             |
| `/ghostwire:teach-me`              | Interactive learning                       | advisor-_, researcher-_             |
| `/ghostwire:quiz-me`               | Interactive quizzes                        | advisor-_, researcher-_             |
| `/ghostwire:lint:ruby`             | Ruby linting                               | reviewer-ruby                       |

---

### Key Insight About Commands

**Commands are not just "two types"** - they're 50+ specialized workflows organized by category. Each command:

1. **Defines a complete workflow** - Multi-phase process with specific steps
2. **Invokes agents strategically** - At specific points where reasoning is needed
3. **Uses tools directly** - For operations that don't need reasoning
4. **Verifies results** - Between phases to catch errors early
5. **Maintains state** - Via `.ghostwire/` files for complex workflows

**The key distinction is not "type" but "purpose":**

- Some commands focus on **planning** (workflows:plan)
- Some focus on **execution** (workflows:work)
- Some focus on **analysis** (code:review)
- Some focus on **automation** (git:smart-commit)
- Some focus on **coordination** (resolve-parallel)

---

## Skills: 19 Built-in Skills

Ghostwire includes **19 built-in skills** that enhance agents with specialized knowledge and tool access.

### Core Skills (4)

**Essential skills for common tasks.**

| Skill            | Purpose                                                       |
| ---------------- | ------------------------------------------------------------- |
| `git-master`     | Git expertise: atomic commits, rebase, squash, history search |
| `frontend-ui-ux` | Frontend design and UX patterns                               |
| `dev-browser`    | Browser automation and testing                                |
| `agent-browser`  | Browser automation via Playwright                             |

**Characteristics:**

- Provide domain expertise
- Enable specialized reasoning
- Enhance agent decision-making
- Loaded via `load_skills=["..."]`

**When Used:**

- Agent needs specialized knowledge
- Task requires domain expertise
- Want to enhance agent capabilities

---

### Domain-Specific Skills (15)

**Specialized knowledge for specific domains and frameworks.**

**Ruby/Rails Skills**

- `andrew-kane-gem-writer` - Andrew Kane gem documentation style
- `dhh-rails-style` - DHH/37signals Rails philosophy
- `dspy-ruby` - DSPy Ruby integration

**Documentation Skills**

- `compound-docs` - Compound documentation patterns
- `every-style-editor` - Every style guide editor
- `file-todos` - File-based todo management

**Development Skills**

- `brainstorming` - Brainstorming and ideation
- `coding-tutor` - Coding tutorials and learning
- `create-agent-skills` - Creating new agent skills
- `frontend-design` - Frontend design patterns
- `gemini-imagegen` - Gemini image generation
- `git-worktree` - Git worktree management
- `ralph-loop` - Ralph loop execution
- `rclone` - Rclone file synchronization
- `skill-creator` - Skill creation and scaffolding

**Characteristics:**

- Provide specialized knowledge for specific domains
- Enable tool access for specialized operations
- Loaded via `load_skills=["..."]`
- Can be combined for complex tasks

**When Used:**

- Agent needs specialized knowledge for a domain
- Task requires tool access
- Want to enhance agent capabilities with domain expertise

---

### How Skills Work

Skills enhance agents by:

1. **Providing knowledge** - Domain expertise and best practices
2. **Enabling tools** - Access to specialized MCPs and utilities
3. **Guiding reasoning** - Patterns and conventions for the domain
4. **Improving quality** - Domain-specific standards and practices

**Example:**

```
delegate_task(
  category="visual-engineering",
  load_skills=["frontend-ui-ux", "playwright"],
  prompt="Build a responsive navbar..."
)
```

This invokes an agent with:

- Frontend UI/UX expertise
- Browser automation capabilities
- Enhanced reasoning for visual work

---

## Decision Tree: What Should I Use?

```
START: "I want to accomplish something"
  │
  ├─ "I want a structured workflow"
  │   └─ USE COMMAND
  │       ├─ /ghostwire:workflows:plan (planning)
  │       ├─ /ghostwire:workflows:work (execution)
  │       ├─ /ghostwire:code:review (code review)
  │       └─ /ghostwire:code:refactor (refactoring)
  │
  ├─ "I want autonomous reasoning"
  │   └─ USE AGENT
  │       ├─ @planner (planning)
  │       ├─ @reviewer-rails (code review)
  │       ├─ @researcher-codebase (exploration)
  │       └─ @advisor-plan (debugging)
  │
  ├─ "I want to enhance an agent"
  │   └─ USE SKILL
  │       ├─ git-master (git expertise)
  │       ├─ frontend-ui-ux (design expertise)
  │       └─ playwright (browser automation)
  │
  └─ "I'm not sure"
      └─ START HERE: Use a COMMAND
          (Commands know which agents to invoke)
```

---

## Real-World Scenarios

### Scenario 1: "I want to plan a feature"

**Wrong Approach:**

```
"Use the planner agent to plan my feature"
```

**Why It Fails:**

- Planner is passive without a command
- Doesn't know what to research
- Can't coordinate with other agents
- Results aren't synthesized

**Right Approach:**

```
/ghostwire:workflows:plan Add user authentication
```

**What Happens:**

1. Command invokes planner agent
2. Planner researches existing patterns
3. Planner creates work plan
4. Command synthesizes results
5. User gets actionable plan

---

### Scenario 2: "I want to review code"

**Wrong Approach:**

```
"Use the reviewer-rails agent to review my code"
```

**Why It Fails:**

- Agent doesn't know what code to review
- Can't coordinate with other reviewers
- Results aren't synthesized
- No actionable recommendations

**Right Approach:**

```
/ghostwire:code:review
```

**What Happens:**

1. Command identifies code to review
2. Command invokes multiple review agents in parallel
3. Agents review from different perspectives
4. Command synthesizes findings
5. User gets comprehensive review with todos

---

### Scenario 3: "I want to execute a plan"

**Wrong Approach:**

```
"Use the executor agent to execute my plan"
```

**Why It Fails:**

- Agent doesn't know the plan
- Can't manage git operations
- Can't track progress
- Can't verify results

**Right Approach:**

```
/ghostwire:workflows:work path/to/plan.md
```

**What Happens:**

1. Command reads the plan
2. Command invokes executor agent
3. Executor executes each task
4. Command verifies results
5. Command manages git commits
6. User gets completed work

---

### Scenario 4: "I want to refactor code"

**Wrong Approach:**

```
"Use the refactor agent to refactor my code"
```

**Why It Fails:**

- No "refactor agent" exists
- Refactoring requires multiple specialists
- Needs research + planning + execution + verification

**Right Approach:**

```
/ghostwire:code:refactor
```

**What Happens:**

1. Command launches parallel researchers (background)
2. Command uses LSP tools for analysis
3. Command collects research results
4. Command invokes executor agent
5. Command verifies with tests
6. User gets refactored code

---

### Scenario 5: "I want to use git-master skill"

**Wrong Approach:**

```
"Load the git-master skill"
```

**Why It Fails:**

- Skills don't work alone
- Need an agent to use the skill
- Need a command to invoke the agent

**Right Approach:**

```
/ghostwire:git:smart-commit
```

**What Happens:**

1. Command invokes operator agent
2. Operator loads git-master skill
3. Operator uses git expertise to create smart commit
4. User gets well-structured commit

---

## Common Mistakes and How to Avoid Them

### Mistake 1: Using Agents Without Commands

**Wrong:**

```
"Use the planner agent to plan my feature"
```

**Why It Fails:**

- Agents are passive
- Need commands to provide context
- Need commands to coordinate

**Right:**

```
/ghostwire:workflows:plan Add feature
```

---

### Mistake 2: Using Skills Without Agents

**Wrong:**

```
"Load the git-master skill"
```

**Why It Fails:**

- Skills are passive
- Need agents to use them
- Need commands to invoke agents

**Right:**

```
/ghostwire:git:smart-commit
```

---

### Mistake 3: Trying to Coordinate Agents Manually

**Wrong:**

```
"First use researcher-codebase, then use reviewer-rails"
```

**Why It Fails:**

- Agents can't coordinate each other
- Results aren't synthesized
- No verification

**Right:**

```
/ghostwire:code:review
```

---

### Mistake 4: Assuming Agents Know the Context

**Wrong:**

```
"Use the executor agent to implement the feature"
```

**Why It Fails:**

- Agent doesn't know what feature
- Agent doesn't know the plan
- Agent doesn't know the codebase

**Right:**

```
/ghostwire:workflows:work path/to/plan.md
```

---

### Mistake 5: Using the Wrong Agent Type

**Wrong:**

```
"Use the planner agent to review code"
```

**Why It Fails:**

- Planner is for planning, not reviewing
- Doesn't have review expertise
- Will produce a plan, not a review

**Right:**

```
/ghostwire:code:review
```

---

## Mental Model: The Restaurant Analogy

### The Wrong Mental Model

> "I'll just tell the chef (agent) to cook dinner"

**Problem:**

- Chef doesn't know what dinner means
- Chef doesn't know what ingredients are available
- Chef doesn't know how many people to cook for
- Chef can't coordinate with other chefs

### The Right Mental Model

> "I'll use the head chef (command) to coordinate the kitchen (agents) using recipes (skills)"

**How It Works:**

1. **Head Chef (Command)** receives the order: "Cook dinner for 10 people"
2. **Head Chef** decides what to cook and coordinates:
   - **Sous Chef (Planner)** plans the menu
   - **Prep Cook (Researcher)** finds ingredients
   - **Line Cook (Executor)** cooks the dishes
   - **Pastry Chef (Designer)** plates the food
3. **Head Chef** uses **Recipes (Skills)** to guide each chef
4. **Head Chef** verifies each dish before serving
5. **Guests** enjoy the complete meal

**Key Insight:** Each chef is specialized. The head chef coordinates. The order (command) drives everything.

---

## Summary: The Golden Rules

### Rule 1: Commands Are Entry Points

- Always start with a command
- Commands know which agents to invoke
- Commands handle coordination

### Rule 2: Agents Are Specialists

- Each agent has a specific purpose
- Use the right agent for the job
- Agents can't coordinate themselves

### Rule 3: Skills Enhance Agents

- Skills provide specialized knowledge
- Skills enable tool access
- Skills must be loaded into agents

### Rule 4: Let Commands Decide

- Commands are smart about when to invoke agents
- Don't try to manually coordinate agents
- Trust the command to do the right thing

### Rule 5: Understand the Autonomy Spectrum

- Skills are passive (knowledge only)
- Commands are semi-autonomous (scripted workflows)
- Agents are fully autonomous (reasoning)
- Orchestration agents coordinate everything

---

## Next Steps

1. **Read the full guides:**
   - [Agents and Commands Explained](./agents-and-commands-explained.md)
   - [Quick Reference](./agents-commands-quick-reference.md)

2. **Try a command:**
   - `/ghostwire:workflows:plan Add a feature`
   - Watch how the command invokes agents

3. **Explore agents:**
   - Check `src/orchestration/agents/` for agent definitions
   - Understand agent constraints and capabilities

4. **Create custom commands:**
   - Build workflows that fit your needs
   - Coordinate agents effectively

---

## Related Documentation

- [Agents and Commands Explained](./agents-and-commands-explained.md) - Deep dive
- [Quick Reference](./agents-commands-quick-reference.md) - Cheat sheet
- [Commands Reference](../reference/commands.md) - All commands
- [Agents Reference](../reference/agents.md) - All agents
- [Skills Reference](../reference/skills.md) - All skills
- [Workflows Guide](./workflows.md) - Workflow patterns
