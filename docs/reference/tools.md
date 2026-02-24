# Tools

Ghostwire provides 20+ specialized tools that extend agent capabilities across LSP operations, AST analysis, code search, session management, and agent delegation.

## LSP Tools (IDE Features)

Language Server Protocol tools provide IDE-like capabilities for agents.

### lsp_goto_definition

Jump to symbol definition across the workspace.

```typescript
lsp_goto_definition({
  file_path: "/path/to/file.ts",
  line: 10,
  column: 5,
});
```

### lsp_find_references

Find all usages of a symbol across the workspace.

```typescript
lsp_find_references({
  file_path: "/path/to/file.ts",
  line: 10,
  column: 5,
});
```

### lsp_symbols

Get file outline or search workspace symbols.

```typescript
lsp_symbols({
  query: "MyClass", // Optional: search workspace
  file_path: "/path/to/file.ts", // Optional: file-only outline
});
```

### lsp_diagnostics

Get errors and warnings before running builds.

```typescript
lsp_diagnostics({
  file_path: "/path/to/file.ts",
});
```

### lsp_prepare_rename

Validate rename operation before executing.

```typescript
lsp_prepare_rename({
  file_path: "/path/to/file.ts",
  line: 10,
  column: 5,
});
```

### lsp_rename

Rename symbol across workspace safely.

```typescript
lsp_rename({
  file_path: "/path/to/file.ts",
  line: 10,
  column: 5,
  new_name: "NewName",
});
```

## AST-Grep Tools

AST-aware code search and replacement supporting 25+ languages.

### ast_grep_search

Search code using AST patterns.

```typescript
ast_grep_search({
  pattern: "function $NAME() { $$$BODY }",
  language: "typescript",
  paths: ["/src"],
});
```

### ast_grep_replace

Replace code using AST-aware patterns.

```typescript
ast_grep_replace({
  pattern: "console.log($$$ARGS)",
  replacement: "logger.debug($$$ARGS)",
  language: "typescript",
  paths: ["/src"],
});
```

## Search Tools

### grep

Custom grep with intelligent defaults.

- **Timeout**: 60 seconds
- **Output limit**: 10MB
- **Features**: Regex support, context lines, file filtering

```typescript
grep({
  pattern: "async function",
  paths: ["/src"],
  include: "*.ts",
  context: 2,
});
```

### glob

File pattern matching with safety limits.

- **Timeout**: 60 seconds
- **File limit**: 100 files
- **Features**: Glob patterns, exclusions

```typescript
glob({
  pattern: "**/*.test.ts",
  cwd: "/src",
  exclude: ["node_modules", "dist"],
});
```

## Agent Delegation Tools

### delegate_task

Category-based task delegation with automatic agent selection.

```typescript
delegate_task({
  agent: "researcher-codebase", // Optional: specific agent
  category: "visual", // Optional: category-based selection
  prompt: "Find all auth middleware",
  background: true, // Optional: run in background
  run_in_background: true,
});
```

**Categories**:

- `quick`: Fast, cheap tasks
- `visual`: UI/frontend work
- `business-logic`: Backend implementation
- `exploration`: Codebase exploration
- `documentation`: Writing and docs
- `testing`: Test writing and verification
- `unspecified-low`: Default fallback

### call_grid_agent

Direct agent invocation for researcher-codebase and researcher-data.

```typescript
call_grid_agent({
  agent_type: "researcher-codebase",
  prompt: "Find authentication patterns",
  run_in_background: true,
});
```

### background_output

Retrieve results from background tasks.

```typescript
background_output({
  task_id: "bg_abc123",
});
```

### background_cancel

Cancel running background tasks.

```typescript
background_cancel({
  task_id: "bg_abc123",
});
```

## Session Tools

### session_list

List all OpenCode sessions.

```typescript
session_list({});
```

### session_read

Read messages and history from a specific session.

```typescript
session_read({
  session_id: "sess_abc123",
  limit: 50,
  offset: 0,
});
```

### session_search

Full-text search across session messages.

```typescript
session_search({
  query: "authentication",
  session_id: "sess_abc123", // Optional: search specific session
});
```

### session_info

Get session metadata and statistics.

```typescript
session_info({
  session_id: "sess_abc123",
});
```

## Interactive Terminal Tools

### interactive_bash

Tmux-based terminal for interactive CLI applications.

```typescript
// Create new session
interactive_bash({
  tmux_command: "new-session -d -s dev-app",
});

// Send keystrokes
interactive_bash({
  tmux_command: "send-keys -t dev-app 'vim main.py' Enter",
});

// Capture output
interactive_bash({
  tmux_command: "capture-pane -p -t dev-app",
});
```

**Use Cases**:

- TUI applications (vim, htop, pudb)
- Interactive debuggers
- Long-running processes with output streaming

**Key Points**:

- Commands are tmux subcommands (no `tmux` prefix)
- Use for interactive apps that need persistent sessions
- One-shot commands should use regular `Bash` tool

## System Tools

### look_at

Multimodal analysis of PDFs and images.

```typescript
look_at({
  file_path: "/path/to/screenshot.png",
});
```

**Supported formats**: PNG, JPG, JPEG, PDF

## Skill Tools

### skill

Execute a skill by name with arguments.

```typescript
skill({
  name: "playwright",
  prompt: "Navigate to example.com and take a screenshot",
});
```

### skill_mcp

Invoke MCP operations with full schema discovery.

```typescript
skill_mcp({
  skill: "playwright",
  operation: "browser_navigate",
  params: { url: "https://example.com" },
});
```

### slashcommand

Execute slash commands.

```typescript
slashcommand({
  command: "/refactor src/utils.ts --scope=module",
});
```

## Tool Categories Summary

| Category       | Tools                                                                                                  | Pattern                     |
| -------------- | ------------------------------------------------------------------------------------------------------ | --------------------------- |
| **LSP**        | lsp_goto_definition, lsp_find_references, lsp_symbols, lsp_diagnostics, lsp_prepare_rename, lsp_rename | Direct execution            |
| **Search**     | ast_grep_search, ast_grep_replace, grep, glob                                                          | Direct execution            |
| **Session**    | session_list, session_read, session_search, session_info                                               | Direct execution            |
| **Agent**      | delegate_task, call_grid_agent                                                                         | Factory (context-dependent) |
| **Background** | background_output, background_cancel                                                                   | Factory (context-dependent) |
| **System**     | interactive_bash, look_at                                                                              | Mixed                       |
| **Skill**      | skill, skill_mcp, slashcommand                                                                         | Factory (context-dependent) |

## Tool Usage Patterns

### Direct Tool Execution

Most tools execute immediately with provided arguments:

```typescript
const results = await grep({ pattern: "TODO", paths: ["/src"] });
```

### Background Execution

Delegate tasks to run in parallel:

```typescript
// Start multiple searches in parallel
const task1 = delegate_task({
  agent: "researcher-codebase",
  prompt: "Find auth",
  background: true,
});
const task2 = delegate_task({
  agent: "researcher-data",
  prompt: "Research best practices",
  background: true,
});

// Continue working...

// Retrieve results later
const result1 = await background_output({ task_id: task1.task_id });
const result2 = await background_output({ task_id: task2.task_id });
```

### Error Handling

Tools return structured results with error information:

```typescript
const result = await lsp_rename({ ... })
if (result.error) {
  // Handle error
}
```

## Tool Restrictions by Agent

Different agents have different tool access:

| Agent               | Restrictions                                       |
| ------------------- | -------------------------------------------------- |
| advisor-plan        | Read-only (no write, edit, task, delegate)         |
| researcher-data     | Cannot write, edit, task, delegate, or call agents |
| researcher-codebase | Cannot write, edit, task, delegate, or call agents |
| analyzer-media      | Read, glob, grep only                              |
| executor            | Cannot spawn subtasks                              |
