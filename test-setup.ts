import { beforeEach } from "bun:test";
import { _resetForTesting } from "./src/execution/features/claude-code-session-state/state";

beforeEach(() => {
  _resetForTesting();
});
