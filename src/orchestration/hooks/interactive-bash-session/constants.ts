import { join } from "node:path";
import { getOpenCodeStorageDir } from "../../../integration/shared/data-path";

const OPENCODE_STORAGE = getOpenCodeStorageDir();
export const INTERACTIVE_BASH_SESSION_STORAGE = join(
  OPENCODE_STORAGE,
  "grid-interactive-bash-session",
);

export const OMO_SESSION_PREFIX = "grid-";

export function buildSessionReminderMessage(sessions: string[]): string {
  if (sessions.length === 0) return "";
  return `\n\n[System Reminder] Active grid-* tmux sessions: ${sessions.join(", ")}`;
}
