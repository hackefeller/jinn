# Tool Adapters

Tool-specific format adapters for jinn's supported AI coding assistants.

## Purpose

Each adapter implements the `ToolCommandAdapter` interface to format jinn content for a specific AI tool's expected format and directory structure.

## Supported Tools

1. **opencode** - OpenCode
2. **claude** - Claude Code
3. **codex** - OpenAI Codex
4. **github-copilot** - GitHub Copilot
5. **gemini** - Gemini
6. **cursor** - Cursor (skills-only)

## Adapter Interface

See `types.ts` for the complete `ToolCommandAdapter` interface definition.

## Adding a New Tool

To add support for a new AI tool:

1. Add tool definition to `src/core/discovery/definitions.ts`
2. Create adapter in `src/core/adapters/<tool-id>.ts`
3. Register adapter in `src/core/adapters/registry.ts`
4. Add tests in `src/core/adapters/__tests__/<tool-id>.test.ts`

If the tool does not support native agents, implement only the skill methods.
