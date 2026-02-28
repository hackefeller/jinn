import { join } from "node:path";
import { getClaudeConfigDir } from "../../../platform/claude/config-dir";

export const TODO_DIR = join(getClaudeConfigDir(), "todos");
