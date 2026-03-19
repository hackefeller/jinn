import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export function createTemplateReferenceReader(
  metaUrl: string,
  referenceDirectoryName: string = "references",
): (filename: string) => string {
  const templateDirectory = dirname(fileURLToPath(metaUrl));

  return (filename: string) =>
    readFileSync(join(templateDirectory, referenceDirectoryName, filename), "utf-8");
}