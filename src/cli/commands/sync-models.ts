/**
 * Sync models command - updates global OpenCode settings with latest model defaults.
 *
 * Usage: opencode ghostwire:sync-models
 *
 * This command writes the default model configuration to the user's global
 * OpenCode settings, allowing them to customize from there.
 */
import * as p from "@clack/prompts";
import color from "picocolors";
import { writeModelConfig, getConfigContext } from "../config-manager";

export async function runSyncModels(): Promise<number> {
  p.intro(color.bgMagenta(color.white(" Sync Models ")));

  const s = p.spinner();
  s.start("Syncing model configuration");

  const result = writeModelConfig();

  if (!result.success) {
    s.stop(`Failed: ${result.error}`);
    p.outro(color.red("Sync failed."));
    return 1;
  }

  s.stop(`Model config synced to ${color.cyan(result.configPath)}`);

  p.note(
    `Model configuration has been updated.\n` +
      `You can customize models in: ${color.yellow(result.configPath)}\n\n` +
      `To override per-project, create: ${color.yellow(".opencode/ghostwire.json")}`,
    "Next Steps",
  );

  p.log.success(color.bold("Model configuration synced!"));

  return 0;
}
