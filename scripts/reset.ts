import { dirname, join } from "node:path";
import { existsSync, lstatSync, readdirSync, rmSync, rmdirSync } from "node:fs";
import { homedir } from "node:os";
import { createPopulatedAdapterRegistry } from "../src/core/adapters/index.ts";
import { CONFIG_VERSION } from "../src/core/config/defaults.ts";
import { generateSkillsForAllTools } from "../src/core/generator/skill-gen.ts";
import { generateAgentsForAllTools } from "../src/core/generator/agent-gen.ts";
import { generateManifestsForAllTools } from "../src/core/generator/manifest-gen.ts";
import { getDefaultAgentTemplates, getDefaultSkillTemplates } from "../src/templates/catalog.ts";

const home = homedir();
const projectRoot = process.cwd();
const registry = createPopulatedAdapterRegistry();
const adapters = registry.getAll();
const skillTemplates = getDefaultSkillTemplates("extended");
const agentTemplates = getDefaultAgentTemplates("extended");
const generatedPaths = [
  ...generateSkillsForAllTools(skillTemplates, adapters, CONFIG_VERSION),
  ...generateManifestsForAllTools(skillTemplates, adapters, CONFIG_VERSION),
  ...generateAgentsForAllTools(agentTemplates, adapters, CONFIG_VERSION),
].map((file) => file.path);
const homePaths = generatedPaths.map((filePath) =>
  filePath.startsWith(".github/") ? filePath.replace(".github/", ".copilot/") : filePath,
);

function removePath(path: string): void {
  rmSync(path, { force: true, recursive: true });
}

function removeGeneratedPath(root: string, relativePath: string): void {
  const absolutePath = join(root, relativePath);
  if (!existsSync(absolutePath)) {
    return;
  }
  removePath(absolutePath);
  removeEmptyParents(root, relativePath);
}

function removeEmptyParents(root: string, relativePath: string): void {
  const topDir = relativePath.split("/")[0];
  const topDirPath = join(root, topDir);
  let current = dirname(join(root, relativePath));

  while (current.startsWith(topDirPath) && current !== root) {
    if (!existsSync(current) || lstatSync(current).isSymbolicLink()) {
      return;
    }
    if (readdirSync(current).length > 0) {
      return;
    }
    rmdirSync(current);
    if (current === topDirPath) {
      return;
    }
    current = dirname(current);
  }
}

for (const filePath of homePaths) {
  removeGeneratedPath(home, filePath);
}

for (const filePath of generatedPaths) {
  removeGeneratedPath(projectRoot, filePath);
}

removePath(join(home, ".agents", "agents"));
removePath(join(home, ".agents", "skills"));
