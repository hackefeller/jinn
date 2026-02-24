# Ghostwire Features

Complete reference for Ghostwire's features. For component details, see:
- [Agents](./agents.md) - AI agent reference
- [Tools](./tools.md) - Available tools
- [Lifecycle Hooks](./lifecycle-hooks.md) - Hook system
- [Modes](./modes.md) - Operating modes

---

## Skills: Specialized Knowledge

Skills provide specialized workflows with embedded MCP servers and detailed instructions.

### Built-in Skills

| Skill | Trigger | Description |
|-------|---------|-------------|
| **playwright** | Browser tasks, testing, screenshots | Browser automation via Playwright MCP. MUST USE for any browser-related tasks - verification, browsing, web scraping, testing, screenshots. |
| **frontend-ui-ux** | UI/UX tasks, styling | Designer-turned-developer persona. Crafts stunning UI/UX even without design mockups. Emphasizes bold aesthetic direction, distinctive typography, cohesive color palettes. |
| **git-master** | commit, rebase, squash, blame | MUST USE for ANY git operations. Atomic commits with automatic splitting, rebase/squash workflows, history search (blame, bisect, log -S). |

### Skill: Browser Automation (playwright / agent-browser)

**Trigger**: Any browser-related request

Ghostwire provides two browser automation providers, configurable via `browser_automation_engine.provider`:

#### Option 1: Playwright MCP (Default)

The default provider uses Playwright MCP server:

```yaml
mcp:
  playwright:
    command: npx
    args: ["@playwright/mcp@latest"]
```

**Usage**:
```
/playwright Navigate to example.com and take a screenshot
```

#### Option 2: Agent Browser CLI (Vercel)

Alternative provider using [Vercel's agent-browser CLI](https://github.com/vercel-labs/agent-browser):

```json
{
  "browser_automation_engine": {
    "provider": "agent-browser"
  }
}
```

**Requires installation**:
```bash
bun add -g agent-browser
```

**Usage**:
```
Use agent-browser to navigate to example.com and extract the main heading
```

#### Capabilities (Both Providers)

- Navigate and interact with web pages
- Take screenshots and PDFs
- Fill forms and click elements
- Wait for network requests
- Scrape content

### Skill: frontend-ui-ux

**Trigger**: UI design tasks, visual changes

A designer-turned-developer who crafts stunning interfaces:

- **Design Process**: Purpose, Tone, Constraints, Differentiation
- **Aesthetic Direction**: Choose extreme - brutalist, maximalist, retro-futuristic, luxury, playful
- **Typography**: Distinctive fonts, avoid generic (Inter, Roboto, Arial)
- **Color**: Cohesive palettes with sharp accents, avoid purple-on-white AI slop
- **Motion**: High-impact staggered reveals, scroll-triggering, surprising hover states
- **Anti-Patterns**: Generic fonts, predictable layouts, cookie-cutter design

### Skill: git-master

**Trigger**: commit, rebase, squash, "who wrote", "when was X added"

Three specializations in one:

1. **Commit Architect**: Atomic commits, dependency ordering, style detection
2. **Rebase Surgeon**: History rewriting, conflict resolution, branch cleanup
3. **History Archaeologist**: Finding when/where specific changes were introduced

**Core Principle - Multiple Commits by Default**:
```
3+ files -> MUST be 2+ commits
5+ files -> MUST be 3+ commits
10+ files -> MUST be 5+ commits
```

**Automatic Style Detection**:
- Analyzes last 30 commits for language (Korean/English) and style (semantic/plain/short)
- Matches your repo's commit conventions automatically

**Usage**:
```
/git-master commit these changes
/git-master rebase onto main
/git-master who wrote this authentication code?
```

### Custom Skills

Load custom skills from:
- `.opencode/skills/*/SKILL.md` (project)
- `~/.config/opencode/skills/*/SKILL.md` (user)
- `.claude/skills/*/SKILL.md` (Claude Code compat)
- `~/.claude/skills/*/SKILL.md` (Claude Code user)

Disable built-in skills via `disabled_skills: ["playwright"]` in config.

---

## Commands: Slash Workflows

Commands are slash-triggered workflows that execute predefined templates.

### Built-in Commands

| Command | Description |
|---------|-------------|
| `/project:map` | Map project structure and generate hierarchical AGENTS.md knowledge base |
| `/init-deep` | (deprecated, use /project:map) |
| `/overclock-loop` | Start self-referential development loop until completion |
| `/ulw-overclock` | Start ultrawork loop - continues with ultrawork mode |
| `/cancel-overclock` | Cancel active Ralph Loop |
| `/refactor` | Intelligent refactoring with LSP, AST-grep, architecture analysis, and TDD verification |
| `/jack-in-work` | Start Cipher Operator work session from planner plan |

### Command: /project:map

**Purpose**: Map project structure and generate hierarchical AGENTS.md files throughout your project

**Usage**:
```
/project:map [--create-new] [--max-depth=N]
```

**Aliases**: `/init-deep` (deprecated, use /project:map)

Creates directory-specific context files that agents automatically read:
```
project/
├── AGENTS.md              # Project-wide context
├── src/
│   ├── AGENTS.md          # src-specific context
│   └── components/
│       └── AGENTS.md      # Component-specific context
```

### Command: /overclock-loop

**Purpose**: Self-referential development loop that runs until task completion

**Named after**: Anthropic's Ralph Wiggum plugin

**Usage**:
```
/overclock-loop "Build a REST API with authentication"
/overclock-loop "Refactor the payment module" --max-iterations=50
```

**Behavior**:
- Agent works continuously toward the goal
- Detects `<promise>DONE</promise>` to know when complete
- Auto-continues if agent stops without completion
- Ends when: completion detected, max iterations reached (default 100), or `/cancel-overclock`

**Configure**: `{ "ralph_loop": { "enabled": true, "default_max_iterations": 100 } }`

### Command: /ulw-overclock

**Purpose**: Same as overclock-loop but with ultrawork mode active

Everything runs at maximum intensity - parallel agents, background tasks, aggressive exploration.

### Command: /refactor

**Purpose**: Intelligent refactoring with full toolchain

**Usage**:
```
/refactor <target> [--scope=<file|module|project>] [--strategy=<safe|aggressive>]
```

**Features**:
- LSP-powered rename and navigation
- AST-grep for pattern matching
- Architecture analysis before changes
- TDD verification after changes
- Codemap generation

### Command: /jack-in-work

**Purpose**: Start execution from a planner-generated plan

**Usage**:
```
/jack-in-work [plan-name]
```

Uses orchestrator agent to execute planned tasks systematically.

### Custom Commands

Load custom commands from:
- `.opencode/command/*.md` (project)
- `~/.config/opencode/command/*.md` (user)
- `.claude/commands/*.md` (Claude Code compat)
- `~/.claude/commands/*.md` (Claude Code user)

---

## MCPs: Built-in Servers

### websearch (Exa AI)

Real-time web search powered by [Exa AI](https://exa.ai).

### context7

Official documentation lookup for any library/framework.

### grep_app

Ultra-fast code search across public GitHub repos. Great for finding implementation examples.

### Skill-Embedded MCPs

Skills can bring their own MCP servers:

```yaml
---
description: Browser automation skill
mcp:
  playwright:
    command: npx
    args: ["-y", "@anthropic-ai/mcp-playwright"]
---
```

The `skill_mcp` tool invokes these operations with full schema discovery.

#### OAuth-Enabled MCPs

Skills can define OAuth-protected remote MCP servers. OAuth 2.1 with full RFC compliance (RFC 9728, 8414, 8707, 7591) is supported:

```yaml
---
description: My API skill
mcp:
  my-api:
    url: https://api.example.com/mcp
    oauth:
      clientId: ${CLIENT_ID}
      scopes: ["read", "write"]
---
```

When a skill MCP has `oauth` configured:
- **Auto-discovery**: Fetches `/.well-known/oauth-protected-resource` (RFC 9728), falls back to `/.well-known/oauth-authorization-server` (RFC 8414)
- **Dynamic Client Registration**: Auto-registers with servers supporting RFC 7591 (clientId becomes optional)
- **PKCE**: Mandatory for all flows
- **Resource Indicators**: Auto-generated from MCP URL per RFC 8707
- **Token Storage**: Persisted in `~/.config/opencode/mcp-oauth.json` (chmod 0600)
- **Auto-refresh**: Tokens refresh on 401; step-up authorization on 403 with `WWW-Authenticate`
- **Dynamic Port**: OAuth callback server uses an auto-discovered available port

Pre-authenticate via CLI:

```bash
bunx ghostwire mcp oauth login <server-name> --server-url https://api.example.com
```

---

## Context Injection

### Directory AGENTS.md

Auto-injects AGENTS.md when reading files. Walks from file directory to project root:

```
project/
├── AGENTS.md              # Injected first
├── src/
│   ├── AGENTS.md          # Injected second
│   └── components/
│       ├── AGENTS.md      # Injected third
│       └── Button.tsx     # Reading this injects all 3
```

### Conditional Rules

Inject rules from `.claude/rules/` when conditions match:

```markdown
---
globs: ["*.ts", "src/**/*.js"]
description: "TypeScript/JavaScript coding rules"
---
- Use PascalCase for interface names
- Use camelCase for function names
```

Supports:
- `.md` and `.mdc` files
- `globs` field for pattern matching
- `alwaysApply: true` for unconditional rules
- Walks upward from file to project root, plus `~/.claude/rules/`

---

## Claude Code Compatibility

Full compatibility layer for Claude Code configurations.

### Config Loaders

| Type | Locations |
|------|-----------|
| **Commands** | `~/.claude/commands/`, `.claude/commands/` |
| **Skills** | `~/.claude/skills/*/SKILL.md`, `.claude/skills/*/SKILL.md` |
| **Agents** | `~/.claude/agents/*.md`, `.claude/agents/*.md` |
| **MCPs** | `~/.claude/.mcp.json`, `.mcp.json`, `.claude/.mcp.json` |

MCP configs support environment variable expansion: `${VAR}`.

### Data Storage

| Data | Location | Format |
|------|----------|--------|
| Todos | `~/.claude/todos/` | Claude Code compatible |
| Transcripts | `~/.claude/transcripts/` | JSONL |

### Compatibility Toggles

Disable specific features:

```json
{
  "claude_code": {
    "mcp": false,
    "commands": false,
    "skills": false,
    "agents": false,
    "hooks": false,
    "plugins": false
  }
}
```

| Toggle | Disables |
|--------|----------|
| `mcp` | `.mcp.json` files (keeps built-in MCPs) |
| `commands` | `~/.claude/commands/`, `.claude/commands/` |
| `skills` | `~/.claude/skills/`, `.claude/skills/` |
| `agents` | `~/.claude/agents/` (keeps built-in agents) |
| `hooks` | settings.json hooks |
| `plugins` | Claude Code marketplace plugins |

Disable specific plugins:

```json
{
  "claude_code": {
    "plugins_override": {
      "claude-mem@thedotmack": false
    }
  }
}
```
