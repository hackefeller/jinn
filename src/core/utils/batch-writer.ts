/**
 * Batch file writer utility
 *
 * Shared implementation used by both the generator and vault compile command.
 */

import * as fs from "fs/promises";
import * as path from "path";

export interface BatchWriteOptions {
  dryRun?: boolean;
}

export interface BatchWriteResult {
  written: string[];
  failed: Array<{ path: string; error: string }>;
}

/**
 * Write a batch of files to disk under `projectPath`.
 *
 * - Directories are pre-created in parallel before writing.
 * - mkdir failures surface in `failed` rather than being swallowed.
 * - When `dryRun` is true, no files are written; all paths are returned in `written`.
 */
export async function writeFilesBatch(
  files: Array<{ path: string; content: string }>,
  projectPath: string,
  options: BatchWriteOptions = {},
): Promise<BatchWriteResult> {
  if (files.length === 0) return { written: [], failed: [] };

  const { dryRun = false } = options;

  if (dryRun) {
    return { written: files.map((f) => f.path), failed: [] };
  }

  const written: string[] = [];
  const failed: Array<{ path: string; error: string }> = [];

  // Pre-create all required directories in parallel; surface errors in failed
  const uniqueDirs = [...new Set(files.map((f) => path.dirname(path.join(projectPath, f.path))))];
  await Promise.all(
    uniqueDirs.map(async (dir) => {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (err) {
        // Collect mkdir failures so they surface when the subsequent writeFile fails
        failed.push({ path: dir, error: `mkdir failed: ${String(err)}` });
      }
    }),
  );

  // Write files in parallel
  await Promise.all(
    files.map(async (file) => {
      try {
        await fs.writeFile(path.join(projectPath, file.path), file.content, "utf-8");
        written.push(file.path);
      } catch (err) {
        failed.push({ path: file.path, error: String(err) });
      }
    }),
  );

  return { written, failed };
}
