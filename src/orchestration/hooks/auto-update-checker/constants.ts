import * as path from "node:path";
import * as os from "node:os";
import * as fs from "node:fs";
import { getOpenCodeConfigDir } from "../../../platform/opencode/config-dir";

export const PACKAGE_NAME = "ghostwire";
export const NPM_REGISTRY_URL = `https://registry.npmjs.org/-/package/${PACKAGE_NAME}/dist-tags`;
export const NPM_FETCH_TIMEOUT = 5000;

function getCacheDir(): string {
  if (process.platform === "win32") {
    return path.join(process.env.LOCALAPPDATA ?? os.homedir(), "ghostwire");
  }
  return path.join(os.homedir(), ".cache", "ghostwire");
}

export const CACHE_DIR = getCacheDir();
const VERSION_FILE = path.join(CACHE_DIR, "version");
export const INSTALLED_PACKAGE_JSON = path.join(
  CACHE_DIR,
  "node_modules",
  PACKAGE_NAME,
  "package.json",
);

export function getWindowsAppdataDir(): string | null {
  if (process.platform !== "win32") return null;
  return process.env.APPDATA ?? path.join(os.homedir(), "AppData", "Roaming");
}

export const USER_CONFIG_DIR = getOpenCodeConfigDir({ binary: "opencode" });
export const USER_OPENCODE_CONFIG = path.join(USER_CONFIG_DIR, "ghostwire.json");
export const USER_OPENCODE_CONFIG_JSONC = path.join(USER_CONFIG_DIR, "ghostwire.jsonc");
