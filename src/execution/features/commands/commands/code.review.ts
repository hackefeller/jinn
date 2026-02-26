import type { CommandDefinition } from "../../claude-code-command-loader";

export const NAME = "ghostwire:code:review";
export const DESCRIPTION = "Conduct comprehensive code reviews with specialist agents";
export const TEMPLATE = `<command-instruction>
# Code:Review Command

Conduct comprehensive code reviews leveraging multiple specialist agents.

## Review Types

- **Architecture Review** - High-level design and patterns
- **Security Review** - Vulnerability and security best practices
- **Performance Review** - Optimization opportunities
- **Style Review** - Code quality and consistency
- **Complexity Review** - Simplification opportunities
- **Test Coverage Review** - Testing strategy adequacy

## Key Agents & Tasks

- Use \`reviewer-rails\` for Ruby/Rails code
- Use \`reviewer-python\` for Python code
- Use \`reviewer-typescript\` for TypeScript/JavaScript
- Use \`reviewer-rails-dh\` for architectural opinions
- Use \`security-sentinel\` for security issues
- Use \`performance-advisor-plan\` for optimization
- Use \`reviewer-simplicity\` for YAGNI violations

## Output

- Structured review comments
- Priority-ordered issues
- Actionable suggestions
- References to relevant patterns or best practices
</command-instruction>

<code-context>
$ARGUMENTS
</code-context>
`;
export const ARGUMENT_HINT = "[file-path or PR-number] [--type=architecture|security|performance]";

export const COMMAND: CommandDefinition = {
  name: NAME,
  description: DESCRIPTION,
  template: TEMPLATE,
  argumentHint: ARGUMENT_HINT,
};
