import { parse } from "jsonc-parser";
import { existsSync } from "node:fs";

export function parseJsonc<T>(content: string): T {
  return parse(content) as T;
}

export function detectConfigFile(basePath: string): {
  format: "json" | "jsonc" | "none";
  path: string;
} {
  const jsoncPath = `${basePath}.jsonc`;
  if (existsSync(jsoncPath)) {
    return { format: "jsonc", path: jsoncPath };
  }

  const jsonPath = `${basePath}.json`;
  if (existsSync(jsonPath)) {
    return { format: "json", path: jsonPath };
  }

  return { format: "none", path: jsonPath };
}
