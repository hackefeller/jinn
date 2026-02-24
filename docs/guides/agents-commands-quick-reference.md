# Agents & Commands: Quick Reference

## One-Minute Summary

| Concept | What It Is | What It Does | Can It Work Alone? |
|---------|-----------|--------------|-------------------|
| **Agent** | Specialized LLM worker | Executes focused tasks | ❌ No - needs instructions |
| **Command** | Workflow orchestrator | Invokes agents, coordinates work | ✅ Yes - but needs agents to be useful |

**Golden Rule:** Commands invoke agents. Agents don't self-start.

---

## When to Use What

### "I want to plan a feature"
```
❌ Don't: "Use the planner agent"
✅ Do: /ghostwire:workflows:plan Add user authentication
```

### "I want to review code"
```
❌ Don't: "Use the reviewer agent"
✅ Do: /ghostwire:code:review
```

### "I want to execute a plan"
```
❌ Don't: "Use the executor agent"
✅ Do: /ghostwire:workflows:work path/to/plan.md
```

### "I want to refactor code"
```
❌ Don't: "Use the refactor agent"
✅ Do: /ghostwire:code:refactor
```

---

## Agent Quick Lookup

Ghostwire includes **38 agents** organized into 8 functional categories.

### By Task

| Task | Agent | Command |
|------|-------|---------|
| Plan a feature | `planner` | `/ghostwire:workflows:plan` |
| Review Rails code | `reviewer-rails` | `/ghostwire:code:review` |
| Review Python code | `reviewer-python` | `/ghostwire:code:review` |
| Review TypeScript code | `reviewer-typescript` | `/ghostwire:code:review` |
| Check security | `reviewer-security` | `/ghostwire:code:review` |
| Find code patterns | `researcher-codebase` | `/ghostwire:workflows:plan` |
| Research best practices | `researcher-practices` | `/ghostwire:workflows:plan` |
| Research documentation | `researcher-docs` | `/ghostwire:workflows:plan` |
| Execute work | `executor` | `/ghostwire:workflows:work` |
| Design UI | `designer-builder` | `/ghostwire:code:review` |
| Validate deployment | `validator-deployment` | `/ghostwire:workflows:work` |
| Debug architecture | `advisor-plan` | `/ghostwire:plan-review` |

### By Category (38 total)

**Orchestration (4)**
- `operator` - Primary orchestrator
- `orchestrator` - Master coordinator
- `planner` - Planning specialist
- `executor` - Execution specialist

**Code Review (7)**
- `reviewer-rails` - Kieran-style Rails
- `reviewer-python` - Python code
- `reviewer-typescript` - TypeScript code
- `reviewer-rails-dh` - DHH-style Rails
- `reviewer-simplicity` - Code clarity
- `reviewer-security` - Security issues
- `reviewer-races` - Race conditions

**Research (8)**
- `researcher-codebase` - Code patterns
- `researcher-docs` - Framework docs
- `researcher-learnings` - Internal knowledge
- `researcher-practices` - Best practices
- `researcher-git` - Git history
- `researcher-data` - External libraries
- `researcher-repo` - Repo structure
- `analyzer-media` - PDFs, images, diagrams

**Design (5)**
- `designer-flow` - User journeys
- `designer-sync` - Figma sync
- `designer-iterator` - Visual improvements
- `analyzer-design` - Design validation
- `designer-builder` - Frontend implementation

**Advisory (3)**
- `advisor-architecture` - Architecture design
- `advisor-strategy` - Pre-planning
- `advisor-plan` - High-IQ debugging

**Validation (4)**
- `validator-audit` - Plan validation
- `validator-deployment` - Deployment checks
- `validator-bugs` - Bug reproduction
- `analyzer-patterns` - Pattern recognition

**Specialized (4)**
- `expert-migrations` - Data migrations
- `guardian-data` - Data integrity
- `resolver-pr` - PR comments
- `oracle-performance` - Performance

**Documentation (3)**
- `writer-readme` - README writing
- `writer-gem` - Gem documentation
- `editor-style` - Style guides

---

## Command Quick Lookup

Ghostwire includes **50+ built-in commands** organized by category.

### Core Workflow Commands (5)

| Command | Purpose | Agents |
|---------|---------|--------|
| `/ghostwire:workflows:plan` | Plan a feature | planner, researcher-* |
| `/ghostwire:workflows:work` | Execute a plan | executor, researcher-*, reviewer-* |
| `/ghostwire:workflows:brainstorm` | Brainstorm ideas | advisor-*, researcher-* |
| `/ghostwire:workflows:compound` | Document learnings | writer-*, editor-* |
| `/ghostwire:workflows:review` | Exhaustive review | reviewer-*, validator-* |

### Code Commands (4)

| Command | Purpose | Agents |
|---------|---------|--------|
| `/ghostwire:code:review` | Review code | reviewer-* |
| `/ghostwire:code:refactor` | Refactor code | reviewer-*, researcher-* |
| `/ghostwire:code:optimize` | Optimize code | oracle-performance, reviewer-* |
| `/ghostwire:code:format` | Format code | (no agents) |

### Git Commands (4)

| Command | Purpose | Agents |
|---------|---------|--------|
| `/ghostwire:git:smart-commit` | Smart commits | (no agents) |
| `/ghostwire:git:branch` | Branch management | (no agents) |
| `/ghostwire:git:merge` | Merge assistance | (no agents) |
| `/ghostwire:git:cleanup` | Cleanup branches | (no agents) |

### Project Commands (4)

| Command | Purpose | Agents |
|---------|---------|--------|
| `/ghostwire:project:init` | Initialize project | researcher-repo |
| `/ghostwire:project:build` | Build project | (no agents) |
| `/ghostwire:project:deploy` | Deploy project | validator-deployment |
| `/ghostwire:project:test` | Run tests | (no agents) |

### Utility Commands (4)

| Command | Purpose | Agents |
|---------|---------|--------|
| `/ghostwire:util:clean` | Clean project | (no agents) |
| `/ghostwire:util:backup` | Backup files | (no agents) |
| `/ghostwire:util:restore` | Restore files | (no agents) |
| `/ghostwire:util:doctor` | Run diagnostics | (no agents) |

### Documentation Commands (4)

| Command | Purpose | Agents |
|---------|---------|--------|
| `/ghostwire:docs:deploy-docs` | Deploy documentation | (no agents) |
| `/ghostwire:docs:release-docs` | Release documentation | (no agents) |
| `/ghostwire:docs:feature-video` | Create feature video | (no agents) |
| `/ghostwire:docs:test-browser` | Browser testing | designer-builder, validator-* |

### Specialized Commands (20+)

| Command | Purpose | Agents |
|---------|---------|--------|
| `/ghostwire:project:map` | Map project structure & generate AGENTS.md | researcher-codebase |
| `/ghostwire:init-deep` | (deprecated, use project:map) | researcher-codebase |
| `/ghostwire:overclock-loop` | Run task completion loop | operator, orchestrator |
| `/ghostwire:ulw-overclock` | Ultra-work mode | operator, orchestrator |
| `/ghostwire:jack-in-work` | Jump into work mode | operator, orchestrator |
| `/ghostwire:refactor` | Refactor with analysis | reviewer-*, researcher-* |
| `/ghostwire:plan-review` | Review a plan | reviewer-rails, reviewer-simplicity |
| `/ghostwire:test-browser` | Browser testing | designer-builder, validator-* |
| `/ghostwire:xcode-test` | iOS testing | designer-builder, validator-* |
| `/ghostwire:triage` | Triage issues | researcher-codebase, validator-* |
| `/ghostwire:resolve-parallel` | Resolve multiple items | executor, reviewer-* |
| `/ghostwire:resolve-pr-parallel` | Resolve PRs in parallel | executor, reviewer-* |
| `/ghostwire:resolve-todo-parallel` | Resolve todos in parallel | executor, reviewer-* |
| And 10+ more... | | |

---

## How Agents Are Invoked

### From Commands

Commands invoke agents using three mechanisms:

#### 1. `delegate_task` - Parallel Execution
```
delegate_task(
  subagent_type="reviewer-security",
  prompt="Check for SQL injection"
)
```

#### 2. `call_grid_agent` - Specialized Research
```
call_grid_agent(
  subagent_type="researcher-codebase",
  prompt="Find authentication patterns"
)
```

#### 3. `@agent-name` - Inline Mentions
```
Have @reviewer-security @reviewer-rails review this code.
```

---

## Common Workflows

### Workflow 1: Plan → Review → Execute

```
1. /ghostwire:workflows:plan "Add payment processing"
   ↓ Creates plan.md
   
2. /plan-review path/to/plan.md
   ↓ Reviews plan with multiple agents
   
3. /ghostwire:workflows:work path/to/plan.md
   ↓ Executes plan with agents
```

### Workflow 2: Code Review → Refactor → Test

```
1. /ghostwire:code:review
   ↓ Reviews code with multiple agents
   
2. /ghostwire:code:refactor
   ↓ Refactors based on review
   
3. /ghostwire:project:test
   ↓ Runs tests
```

### Workflow 3: Research → Plan → Execute

```
1. /ghostwire:workflows:brainstorm "Add caching"
   ↓ Brainstorms approach
   
2. /ghostwire:workflows:plan "Add caching"
   ↓ Plans implementation
   
3. /ghostwire:workflows:work path/to/plan.md
   ↓ Executes plan
```

---

## Troubleshooting

### "The agent did nothing"

**Problem:** You tried to use an agent directly without a command.

**Solution:** Use a command instead:
```
❌ "Use the planner agent"
✅ "/ghostwire:workflows:plan Add feature"
```

### "The agent gave me the wrong result"

**Problem:** You used the wrong agent for the task.

**Solution:** Check the agent's purpose and use the right command:
```
❌ "Use planner to review code"
✅ "/ghostwire:code:review"
```

### "The agents didn't coordinate"

**Problem:** You tried to manually invoke multiple agents.

**Solution:** Use a command that coordinates them:
```
❌ "First use researcher, then use reviewer"
✅ "/ghostwire:code:review"
```

### "The agent doesn't know the context"

**Problem:** You didn't provide enough context.

**Solution:** Use a command that provides context:
```
❌ "Use executor to implement"
✅ "/ghostwire:workflows:work path/to/plan.md"
```

---

## Key Principles

1. **Commands are entry points**
   - Always start with a command
   - Commands know which agents to invoke

2. **Agents are specialists**
   - Each agent has a specific purpose
   - Use the right agent for the job

3. **Agents need coordination**
   - Agents don't coordinate themselves
   - Commands handle coordination

4. **Results need synthesis**
   - Raw agent output isn't actionable
   - Commands synthesize results

5. **Context is critical**
   - Agents need clear instructions
   - Commands provide context

---

## Next Steps

1. **Try a command:** `/ghostwire:workflows:plan Add a feature`
2. **Watch agents work:** See how the command invokes agents
3. **Read the full guide:** [Agents and Commands Explained](./agents-and-commands-explained.md)
4. **Explore agents:** Check `src/orchestration/agents/` for agent definitions
5. **Create custom commands:** Build workflows that fit your needs

---

## Related Documentation

- [Full Agents & Commands Guide](./agents-and-commands-explained.md)
- [Commands Reference](../reference/commands.md)
- [Agents Reference](../reference/agents.md)
- [Workflows Guide](./workflows.md)
