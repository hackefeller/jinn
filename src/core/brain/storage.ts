import * as fs from "node:fs/promises";
import * as os from "os";
import * as path from "path";
import * as yaml from "yaml";
import { githubCopilotAdapter } from "../adapters/github-copilot.js";
import { ensureDir, fileExists, listDirs, readFile, writeFile } from "../utils/file-system.js";
import type { BrainCommandAlias, BrainPackageManifest } from "./types.js";
import { getBuiltInCatalog } from "./catalog.js";
import { getCatalogRoot, getKernelHome } from "./config.js";
import { serializeAgentTemplate } from "./serialize.js";

function getSkillsRoot(homePath = os.homedir()): string {
  return path.join(getCatalogRoot(homePath), "skills");
}

function getAgentsRoot(homePath = os.homedir()): string {
  return path.join(getCatalogRoot(homePath), "agents");
}

function getPackagesRoot(homePath = os.homedir()): string {
  return path.join(getKernelHome(homePath), "packages");
}

function getCommandsRoot(homePath = os.homedir()): string {
  return path.join(getCatalogRoot(homePath), "commands");
}

export async function ensureCatalogLayout(homePath = os.homedir()): Promise<void> {
  await ensureDir(getSkillsRoot(homePath));
  await ensureDir(getAgentsRoot(homePath));
  await ensureDir(getPackagesRoot(homePath));
  await ensureDir(getCommandsRoot(homePath));
}

export async function syncBuiltInCatalog(homePath = os.homedir()): Promise<void> {
  await ensureCatalogLayout(homePath);
  const catalog = getBuiltInCatalog();

  const catalogSkillNames = new Set(catalog.skills.map((s) => s.name));
  const catalogAgentNames = new Set(catalog.agents.map((a) => a.name));
  const catalogCommandNames = new Set(catalog.commands.map((c) => c.name));

  for (const skill of catalog.skills) {
    const skillDir = path.join(getSkillsRoot(homePath), skill.name);
    const skillPath = path.join(skillDir, "SKILL.md");
    await writeFile(skillPath, githubCopilotAdapter.formatSkill(skill, "2.0.0"));
    for (const ref of skill.references ?? []) {
      await writeFile(path.join(skillDir, ref.relativePath), ref.content);
    }
  }

  for (const agent of catalog.agents) {
    const agentDir = path.join(getAgentsRoot(homePath), agent.name);
    const agentPath = path.join(agentDir, "AGENT.md");
    await writeFile(agentPath, serializeAgentTemplate(agent));
    for (const ref of agent.references ?? []) {
      await writeFile(path.join(agentDir, ref.relativePath), ref.content);
    }
  }

  for (const pkg of catalog.packages) {
    const pkgPath = path.join(getPackagesRoot(homePath), `${pkg.id}.yaml`);
    await writeFile(pkgPath, yaml.stringify(pkg, { indent: 2, sortMapEntries: true }));
  }

  for (const command of catalog.commands) {
    const commandPath = path.join(getCommandsRoot(homePath), `${command.name}.yaml`);
    await writeFile(commandPath, yaml.stringify(command, { indent: 2, sortMapEntries: true }));
  }

  for (const name of await listDirs(getSkillsRoot(homePath))) {
    if (!catalogSkillNames.has(name)) {
      await fs.rm(path.join(getSkillsRoot(homePath), name), { recursive: true, force: true });
    }
  }

  for (const name of await listDirs(getAgentsRoot(homePath))) {
    if (!catalogAgentNames.has(name)) {
      await fs.rm(path.join(getAgentsRoot(homePath), name), { recursive: true, force: true });
    }
  }

  {
    const entries = await fs.readdir(getCommandsRoot(homePath), { withFileTypes: true });
    const commandFiles = entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".yaml"))
      .map((entry) => entry.name.replace(/\.yaml$/, ""));
    for (const name of commandFiles) {
      if (!catalogCommandNames.has(name)) {
        await fs.rm(path.join(getCommandsRoot(homePath), `${name}.yaml`), { force: true });
      }
    }
  }
}

export async function listCatalogSkillNames(homePath = os.homedir()): Promise<string[]> {
  return (await listDirs(getSkillsRoot(homePath))).sort();
}

export async function listCatalogAgentNames(homePath = os.homedir()): Promise<string[]> {
  return (await listDirs(getAgentsRoot(homePath))).sort();
}

export async function listCatalogCommandNames(homePath = os.homedir()): Promise<string[]> {
  const entries = await fs.readdir(getCommandsRoot(homePath), { withFileTypes: true }).catch(() => []);
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".yaml"))
    .map((entry) => entry.name.replace(/\.yaml$/, ""))
    .sort();
}

export async function loadCatalogSkillContent(
  skillName: string,
  homePath = os.homedir(),
): Promise<string> {
  return readFile(path.join(getSkillsRoot(homePath), skillName, "SKILL.md"));
}

export async function loadCatalogAgentContent(
  agentName: string,
  homePath = os.homedir(),
): Promise<string> {
  return readFile(path.join(getAgentsRoot(homePath), agentName, "AGENT.md"));
}

export async function loadCatalogCommandAlias(
  commandName: string,
  homePath = os.homedir(),
): Promise<BrainCommandAlias> {
  return yaml.parse(await readFile(path.join(getCommandsRoot(homePath), `${commandName}.yaml`))) as BrainCommandAlias;
}

export async function listPackageManifests(homePath = os.homedir()): Promise<BrainPackageManifest[]> {
  const packageRoot = getPackagesRoot(homePath);
  const names = (await listDirs(packageRoot)).sort();
  const manifests: BrainPackageManifest[] = [];
  for (const entry of names) {
    const manifestPath = path.join(packageRoot, entry, "package.yaml");
    if (await fileExists(manifestPath)) {
      manifests.push((yaml.parse(await readFile(manifestPath)) ?? {}) as BrainPackageManifest);
    }
  }

  const fileNames = await listDirs(packageRoot);
  void fileNames;
  const catalog = getBuiltInCatalog();
  return catalog.packages;
}

export function getCatalogSkillDir(skillName: string, homePath = os.homedir()): string {
  return path.join(getSkillsRoot(homePath), skillName);
}

export function getCatalogAgentsRoot(homePath = os.homedir()): string {
  return getAgentsRoot(homePath);
}

export function getCatalogCommandsRoot(homePath = os.homedir()): string {
  return getCommandsRoot(homePath);
}
