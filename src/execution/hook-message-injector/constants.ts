import { join } from "node:path";
import { getOpenCodeStorageDir } from "../../integration/shared/data-path";

const OPENCODE_STORAGE = getOpenCodeStorageDir();
export const MESSAGE_STORAGE = join(OPENCODE_STORAGE, "message");
export const PART_STORAGE = join(OPENCODE_STORAGE, "part");
