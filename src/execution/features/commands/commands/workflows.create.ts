import type { CommandDefinition } from "../../claude-code-command-loader";

export const NAME = "ghostwire:workflows:create";
export const DESCRIPTION = "Break down workflow plan into atomic tasks with delegation metadata [Phase: BREAKDOWN]";
export const TEMPLATE = `<command-instruction>
# Workflows:Create Command

Execute a plan by breaking it into concrete development tasks and coordinating implementation.

## Process

1. **Load Plan** - Read the implementation plan
2. **Task Breakdown** - Decompose into specific, implementable tasks
3. **Dependency Analysis** - Identify task dependencies and parallelizable work
4. **Assign Agents** - Route tasks to appropriate specialist agents
5. **Coordinate Execution** - Monitor progress and handle blockers

## Key Agents & Tasks

- Use \`delegate_task\` with appropriate specialized agents
- Track task completion and dependencies
- Surface blockers and ask for user guidance when needed
- Provide progress feedback

## Integration

- Can be invoked manually after \`workflows:plan\`
- Can be chained automatically from \`workflows:plan\` with user approval
- Integrates with background task system for long-running work
</command-instruction>

<plan-reference>
$ARGUMENTS
</plan-reference>`;
export const ARGUMENT_HINT = "[plan-name]";

export const COMMAND: CommandDefinition = {
  name: NAME,
  description: DESCRIPTION,
  template: TEMPLATE,
  argumentHint: ARGUMENT_HINT,
};
