import { homedir } from 'node:os';
import { join } from 'node:path';

interface OpenCodeConfigDirOptions {
  binary: string;
}

interface OpenCodeConfigPathOptions extends OpenCodeConfigDirOptions {
  version: string | null;
}

export function getOpenCodeConfigDir(_: OpenCodeConfigDirOptions): string {
  return join(homedir(), '.config', 'opencode');
}

export function getOpenCodeConfigPaths(options: OpenCodeConfigPathOptions): {
  dir: string;
  configJson: string;
  configJsonc: string;
} {
  const dir = getOpenCodeConfigDir(options);

  return {
    dir,
    configJson: join(dir, 'opencode.json'),
    configJsonc: join(dir, 'opencode.jsonc'),
  };
}
