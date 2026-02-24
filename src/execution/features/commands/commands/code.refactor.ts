import type { CommandDefinition } from "../../claude-code-command-loader";

export const NAME = "ghostwire:code:refactor";
export const DESCRIPTION = "Systematically refactor code while maintaining functionality";
export const TEMPLATE = `<command-instruction>
# Code:Refactor Command

Systematically refactor code while maintaining functionality and improving clarity, performance, or maintainability.

## Process

1. **Scope Analysis** - Define refactoring boundaries (file, module, or project level)
2. **Impact Assessment** - Identify affected code, tests, and dependencies
3. **Strategy Selection** - Choose approach (safe vs aggressive, incremental vs comprehensive)
4. **Refactoring Execution** - Apply transformations using code transformation tools
5. **Verification** - Run tests and validate functionality
6. **Documentation** - Update comments and related documentation

## Key Agents & Tasks

- Use \`reviewer-typescript\` or \`reviewer-python\` for language-specific reviews
- Use \`reviewer-simplicity\` to ensure simplifications don't over-engineer
- Use \`analyzer-patterns\` to identify and apply consistent patterns
- Run comprehensive test suites before/after refactoring

## Refactoring Types

- **Extract Method** - Break large functions into smaller, focused units
- **Rename** - Improve code clarity through better naming
- **Inline** - Remove unnecessary abstraction layers
- **Move** - Reorganize code for better structure
- **Simplify** - Remove duplication and complexity
- **Performance** - Optimize without changing behavior
</command-instruction>

<refactoring-target>
$ARGUMENTS
</refactoring-target>
`;
export const ARGUMENT_HINT = "<target> [--scope=file|module|project] [--strategy=safe|aggressive]";

export const COMMAND: CommandDefinition = {
  name: NAME,
  description: DESCRIPTION,
  template: TEMPLATE,
  argumentHint: ARGUMENT_HINT,
};
