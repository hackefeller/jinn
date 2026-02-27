import { join } from "node:path";
import { getOpenCodeStorageDir } from "../../../integration/shared/data-path";
import { getClaudeConfigDir } from "../../../platform/claude/config-dir";

export const OPENCODE_STORAGE = getOpenCodeStorageDir();
export const MESSAGE_STORAGE = join(OPENCODE_STORAGE, "message");
export const PART_STORAGE = join(OPENCODE_STORAGE, "part");
export const SESSION_STORAGE = join(OPENCODE_STORAGE, "session");
export const TODO_DIR = join(getClaudeConfigDir(), "todos");
export const TRANSCRIPT_DIR = join(getClaudeConfigDir(), "transcripts");
export const SESSION_LIST_DESCRIPTION = `List all OpenCode sessions with optional filtering.

Returns a list of available session IDs with metadata including message count, date range, and agents used.

Arguments:
- limit (optional): Maximum number of sessions to return
- from_date (optional): Filter sessions from this date (ISO 8601 format)
- to_date (optional): Filter sessions until this date (ISO 8601 format)

Example output:
| Session ID | Messages | First | Last | Agents |
|------------|----------|-------|------|--------|
| ses_abc123 | 45 | 2025-12-20 | 2025-12-24 | build, advisorPlan |
| ses_def456 | 12 | 2025-12-19 | 2025-12-19 | build |`;

export const SESSION_READ_DESCRIPTION = `Read messages and history from an OpenCode session.

Returns a formatted view of session messages with role, timestamp, and content. Optionally includes todos and transcript data.

Arguments:
- session_id (required): Session ID to read
- include_todos (optional): Include todo list if available (default: false)
- include_transcript (optional): Include transcript log if available (default: false)
- limit (optional): Maximum number of messages to return (default: all)

Example output:
Session: ses_abc123
Messages: 45
Date Range: 2025-12-20 to 2025-12-24

[Message 1] user (2025-12-20 10:30:00)
Hello, can you help me with...

[Message 2] assistant (2025-12-20 10:30:15)
Of course! Let me help you with...`;

export const SESSION_SEARCH_DESCRIPTION = `Search for content within OpenCode session messages.

Performs full-text search across session messages and returns matching excerpts with context.

Arguments:
- query (required): Search query string
- session_id (optional): Search within specific session only (default: all sessions)
- case_sensitive (optional): Case-sensitive search (default: false)
- limit (optional): Maximum number of results to return (default: 20)

Example output:
Found 3 matches across 2 sessions:

[ses_abc123] Message msg_001 (user)
...implement the **session manager** tool...

[ses_abc123] Message msg_005 (assistant)
...I'll create a **session manager** with full search...

[ses_def456] Message msg_012 (user)
...use the **session manager** to find...`;

export const SESSION_INFO_DESCRIPTION = `Get metadata and statistics about an OpenCode session.

Returns detailed information about a session including message count, date range, agents used, and available data sources.

Arguments:
- session_id (required): Session ID to inspect

Example output:
Session ID: ses_abc123
Messages: 45
Date Range: 2025-12-20 10:30:00 to 2025-12-24 15:45:30
Duration: 4 days, 5 hours
Agents Used: build, advisorPlan, researcher-data
Has Todos: Yes (12 items, 8 completed)
Has Transcript: Yes (234 entries)`;

export const SESSION_DELETE_DESCRIPTION = `Delete an OpenCode session with configurable cascade behavior.

Safely removes session data with options to handle child sessions, todos, and background tasks.

Arguments:
- session_id (required): Session ID to delete
- cascade (optional): If true, recursively delete child sessions (default: false)
- force (optional): If true, bypass safety checks and force deletion (default: false)
- archive_todos (optional): If true, archive todos instead of deleting (default: true)
- reason (optional): Reason for deletion (audit trail)

Safety behaviors (cascade: false, default):
- Rejects delete if session has child sessions
- Rejects delete if session has active background tasks
- Archives todos instead of deleting them

Example:
session_delete(session_id="ses_abc123", cascade=true, reason="Analysis complete")
Successfully deleted session ses_abc123 and 2 child sessions`;

export const SESSION_CREATE_DESCRIPTION = `Create a new OpenCode session.

Creates a new session with optional parent-child relationship. Sessions can be created as root sessions or as children of existing sessions for organized workflows.

Arguments:
- title (required): Session title
- description (optional): Session description
- parent_session_id (optional): Parent session ID (creates child session)
- initial_prompt (optional): Initial message/prompt for the session

Example:
session_create(title="Security audit", description="Analyze auth module", parent_session_id="ses_parent123")
Created session ses_abc456 (child of ses_parent123)`;

export const SESSION_UPDATE_DESCRIPTION = `Update an OpenCode session's metadata.

Modifies session title, description, or permissions. Only the session owner or agents with write permission can update.

Arguments:
- session_id (required): Session ID to update
- title (optional): New title
- description (optional): New description

Example:
session_update(session_id="ses_abc123", title="Updated: Security audit")
Successfully updated session ses_abc123`;

export const TOOL_NAME_PREFIX = "session_";
