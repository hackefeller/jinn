# Lifecycle Hooks

Ghostwire provides 32+ lifecycle hooks that intercept and modify agent behavior at key points in the execution flow.

## Hook Events

| Event                | Timing                 | Can Block | Primary Use Cases                                  |
| -------------------- | ---------------------- | --------- | -------------------------------------------------- |
| **UserPromptSubmit** | `chat.message`         | Yes       | Keyword detection, slash commands, mode activation |
| **PreToolUse**       | `tool.execute.before`  | Yes       | Validate inputs, inject context, modify arguments  |
| **PostToolUse**      | `tool.execute.after`   | No        | Add warnings, truncate output, error recovery      |
| **Stop**             | `event` (session.stop) | No        | Auto-continue, notifications, state persistence    |
| **onSummarize**      | Compaction             | No        | Preserve critical context, inject summary context  |

## Context & Injection Hooks

### grid-directory-agents-injector

- **Event**: PostToolUse
- **Description**: Auto-injects AGENTS.md when reading files. Walks from file directory to project root, collecting all AGENTS.md files for hierarchical context.
- **Note**: Auto-disabled for OpenCode 1.1.37+ (native support available)

### grid-directory-readme-injector

- **Event**: PostToolUse
- **Description**: Auto-injects README.md for directory context when exploring unfamiliar code.

### grid-rules-injector

- **Event**: PostToolUse
- **Description**: Injects rules from `.claude/rules/` when conditions match. Supports globs and alwaysApply patterns.

### grid-compaction-context-injector

- **Event**: Stop
- **Description**: Preserves critical context during session compaction to prevent information loss.

## Productivity & Control Hooks

### grid-keyword-detector

- **Event**: UserPromptSubmit
- **Description**: Detects keywords and activates specialized modes:
  - `ultrawork`/`ulw`: Maximum performance mode
  - `search`/`find`: Parallel exploration mode
  - `analyze`/`investigate`: Deep analysis mode

### grid-think-mode

- **Event**: UserPromptSubmit
- **Description**: Auto-detects extended thinking needs. Activates on phrases like "think deeply", "ultrathink" and adjusts model settings accordingly.

### overclock-loop

- **Event**: Stop
- **Description**: Manages self-referential development loop (Ralph Loop) that continues until task completion or cancellation.

### jack-in-work

- **Event**: PostToolUse
- **Description**: Handles `/jack-in-work` command execution to start operator work sessions from planner plans.

### grid-auto-slash-command

- **Event**: UserPromptSubmit
- **Description**: Automatically detects and executes slash commands embedded in natural language prompts.

### planner-md-only

- **Event**: PostToolUse
- **Description**: Enforces markdown-only output mode for the planner planning agent.

## Quality & Safety Hooks

### grid-comment-checker

- **Event**: PostToolUse
- **Description**: Prevents AI slop by reminding agents to reduce excessive comments. Smartly ignores BDD directives, docstrings, and necessary documentation.

### grid-thinking-block-validator

- **Event**: PreToolUse
- **Description**: Validates thinking blocks to prevent API errors from malformed `<thinking>` tags.

### empty-message-sanitizer

- **Event**: PreToolUse
- **Description**: Prevents API errors from empty chat messages being sent.

### grid-edit-error-recovery

- **Event**: PostToolUse
- **Description**: Recovers from edit tool failures gracefully, attempting alternative approaches.

### grid-todo-continuation-enforcer

- **Event**: Multiple
- **Description**: Forces agents to continue if they quit halfway through TODOs. Keeps the boulder rolling.

## Recovery & Stability Hooks

### grid-session-recovery

- **Event**: Stop
- **Description**: Recovers from session errors including missing tool results, thinking block issues, and empty messages.

### grid-anthropic-context-window-limit-recovery

- **Event**: Stop
- **Description**: Handles Claude context window limits gracefully with auto-summarization.

### background-compaction

- **Event**: Stop
- **Description**: Auto-compacts sessions hitting token limits to prevent crashes.

### grid-session-notification

- **Event**: Stop
- **Description**: OS notifications when agents go idle. Supports macOS, Linux, and Windows.
- **Note**: Auto-disabled if external notification plugins detected

## Truncation & Context Management

### grid-grep-output-truncator

- **Event**: PostToolUse
- **Description**: Dynamically truncates grep output based on context window. Keeps 50% headroom, caps at 50k tokens.

### grid-tool-output-truncator

- **Event**: PostToolUse
- **Description**: Truncates output from Grep, Glob, LSP, and AST-grep tools to prevent context bloat.

### grid-context-window-monitor

- **Event**: Multiple
- **Description**: Monitors context window usage and reminds of available headroom.

## Notifications & UX Hooks

### grid-auto-update-checker

- **Event**: UserPromptSubmit
- **Description**: Checks for new plugin versions and shows startup toast with version info.

### grid-background-notification

- **Event**: Stop
- **Description**: Notifies when background agent tasks complete.

### grid-agent-usage-reminder

- **Event**: PostToolUse
- **Description**: Reminds you to leverage specialized agents for better results.

### grid-category-skill-reminder

- **Event**: PostToolUse
- **Description**: Reminds of available category-specific skills for the current task.

### grid-startup-toast

- **Event**: UserPromptSubmit
- **Description**: Shows welcome toast on startup with version and status info.

## Task Management Hooks

### task-resume-info

- **Event**: PostToolUse
- **Description**: Provides task resume information for continuity across sessions.

### grid-delegate-task-retry

- **Event**: PostToolUse
- **Description**: Retries failed delegate_task calls automatically.

### grid-empty-task-response-detector

- **Event**: PostToolUse
- **Description**: Detects and handles empty task responses from agents.

### cipher-runner-notepad

- **Event**: PreToolUse
- **Description**: Provides notepad functionality for Cipher Operator-Junior agent.

## Integration Hooks

### grid-claude-code-hooks

- **Event**: All
- **Description**: Executes hooks from Claude Code's `settings.json` for full compatibility.

### orchestrator

- **Event**: All
- **Description**: Main orchestration logic (752 lines) that coordinates multi-agent workflows.

### grid-interactive-bash-session

- **Event**: PreToolUse
- **Description**: Manages tmux sessions for interactive CLI applications.

### grid-non-interactive-env

- **Event**: PreToolUse
- **Description**: Handles non-interactive environment constraints and TTY detection.

## Utility Hooks

### question-label-truncator

- **Event**: PreToolUse
- **Description**: Auto-truncates question labels to prevent UI overflow.

### subagent-question-blocker

- **Event**: PreToolUse
- **Description**: Blocks question tools in subagents to prevent interactive prompts.

### grid-stop-continuation-guard

- **Event**: Multiple
- **Description**: Guards against premature session stopping when work is in progress.

## Execution Order

Hooks execute in a specific order within each event phase:

### UserPromptSubmit Order

```
keywordDetector → claudeCodeHooks → autoSlashCommand → startWork
```

### PreToolUse Order

```
questionLabelTruncator → claudeCodeHooks → nonInteractiveEnv → commentChecker →
    directoryAgentsInjector → directoryReadmeInjector → rulesInjector → zenPlannerMdOnly →
cipherJuniorNotepad → nexusHook
```

### PostToolUse Order

```
claudeCodeHooks → toolOutputTruncator → contextWindowMonitor → commentChecker →
directoryAgentsInjector → directoryReadmeInjector → rulesInjector → emptyTaskResponseDetector →
agentUsageReminder → interactiveBashSession → editErrorRecovery → delegateTaskRetry →
nexusHook → taskResumeInfo
```

## Disabling Hooks

Disable specific hooks in your configuration:

```json
{
  "disabled_hooks": [
    "grid-comment-checker",
    "grid-auto-update-checker",
    "grid-startup-toast",
    "grid-session-notification"
  ]
}
```

## Claude Code Hooks Integration

Ghostwire supports Claude Code's `settings.json` hooks for full compatibility:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [{ "type": "command", "command": "eslint --fix $FILE" }]
      }
    ]
  }
}
```

**Locations**:

- `~/.claude/settings.json` (user)
- `./.claude/settings.json` (project)
- `./.claude/settings.local.json` (local, git-ignored)
