import { join } from "node:path";
import { getOpenCodeStorageDir } from "../../../integration/shared/data-path";

const OPENCODE_STORAGE = getOpenCodeStorageDir();
export const AGENTS_INJECTOR_STORAGE = join(OPENCODE_STORAGE, "directory-agents");
export const AGENTS_FILENAME = "AGENTS.md";
