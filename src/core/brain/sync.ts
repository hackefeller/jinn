import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";
import type { CommandTemplate, SkillTemplate } from "../templates/types.js";
import { directoryExists, ensureDir, fileExists, listDirs, readFile, writeFile } from "../utils/file-system.js";
import { getCatalogRoot, loadBrainConfig, saveBrainConfig, getSyncManifestPath } from "./config.js";
import { getHostAdapter, getHostDescriptor, listKnownHosts, mapProjectPathToHome } from "./hosts.js";
import { parseAgentDocument, parseSkillDocument } from "./serialize.js";
import {
  getCatalogAgentsRoot,
  getCatalogCommandsRoot,
  loadCatalogAgentContent,
  loadCatalogCommandAlias,
  loadCatalogSkillContent,
  syncBuiltInCatalog,
} from "./storage.js";
import type {
  BrainCommandAlias,
  CommandMaterialization,
  HostId,
  SyncAction,
  SyncHostResult,
  SyncManifest,
  SyncResult,
} from "./types.js";

function getSkillsRoot(homePath = os.homedir()): string {
  return path.join(getCatalogRoot(homePath), "skills");
}

async function loadSyncManifest(homePath = os.homedir()): Promise<SyncManifest> {
  const manifestPath = getSyncManifestPath(homePath);
  if (!(await fileExists(manifestPath))) {
    return { version: 1, hosts: {} };
  }
  return JSON.parse(await readFile(manifestPath)) as SyncManifest;
}

async function saveSyncManifest(manifest: SyncManifest, homePath = os.homedir()): Promise<void> {
  await ensureDir(path.dirname(getSyncManifestPath(homePath)));
  await writeFile(getSyncManifestPath(homePath), JSON.stringify(manifest, null, 2));
}

function buildCommandTemplate(alias: BrainCommandAlias): CommandMaterialization {
  const instructions = [
    `Route this request to the Kernel CLI command \`kernel ${alias.target}\`.`,
    alias.description,
    alias.argumentHint ? `Argument hint: ${alias.argumentHint}` : null,
    "Prefer the local Kernel workflow over recreating the process manually when the command fits the user's goal.",
  ]
    .filter((line): line is string => Boolean(line))
    .join("\n\n");

  const template: CommandTemplate = {
    name: alias.name,
    description: alias.description,
    instructions,
    argumentsHint: alias.argumentHint,
  };

  return { alias, template };
}

async function readCatalogSkillTemplates(homePath: string): Promise<Array<{ name: string; template: SkillTemplate }>> {
  const names = (await listDirs(getSkillsRoot(homePath))).sort();
  const skills: Array<{ name: string; template: SkillTemplate }> = [];
  for (const name of names) {
    skills.push({
      name,
      template: parseSkillDocument(await loadCatalogSkillContent(name, homePath)),
    });
  }
  return skills;
}

async function readCatalogAgentTemplates(homePath: string) {
  const names = (await listDirs(getCatalogAgentsRoot(homePath))).sort();
  return Promise.all(
    names.map(async (name) => ({
      name,
      template: parseAgentDocument(await loadCatalogAgentContent(name, homePath)),
    })),
  );
}

async function readCatalogCommandTemplates(homePath: string) {
  const entries = await fs.readdir(getCatalogCommandsRoot(homePath), { withFileTypes: true }).catch(() => []);
  const commandFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".yaml"))
    .map((entry) => entry.name.replace(/\.yaml$/, ""))
    .sort();
  return Promise.all(
    commandFiles.map(async (name) => buildCommandTemplate(await loadCatalogCommandAlias(name, homePath))),
  );
}

export async function buildDesiredHostActions(
  hostId: HostId,
  homePath = os.homedir(),
): Promise<SyncAction[]> {
  const adapter = getHostAdapter(hostId);
  const skillTemplates = await readCatalogSkillTemplates(homePath);
  const agentTemplates = await readCatalogAgentTemplates(homePath);
  const commandTemplates = await readCatalogCommandTemplates(homePath);
  const actions: SyncAction[] = [];

  for (const skill of skillTemplates) {
    actions.push({
      kind: "symlink",
      path: path.join(homePath, getHostDescriptor(hostId).homeDir, "skills", skill.name),
      target: path.join(getSkillsRoot(homePath), skill.name),
    });
  }

  if (adapter.getAgentPath && adapter.formatAgent) {
    for (const agent of agentTemplates) {
      const projectRelativePath = adapter.getAgentPath(agent.template.name);
      actions.push({
        kind: "file",
        path: mapProjectPathToHome(hostId, projectRelativePath, homePath),
        content: adapter.formatAgent(agent.template, "2.0.0"),
      });
    }
  }

  if (adapter.getCommandPath && adapter.formatCommand) {
    for (const command of commandTemplates) {
      const projectRelativePath = adapter.getCommandPath(command.alias.name);
      actions.push({
        kind: "file",
        path: mapProjectPathToHome(hostId, projectRelativePath, homePath),
        content: adapter.formatCommand(command.template, "2.0.0"),
      });
    }
  }

  if (adapter.getManifestPath && adapter.formatManifest) {
    const projectRelativePath = adapter.getManifestPath();
    actions.push({
      kind: "file",
      path: mapProjectPathToHome(hostId, projectRelativePath, homePath),
      content: adapter.formatManifest(
        skillTemplates.map((skill) => skill.template),
        "2.0.0",
      ),
    });
  }

  return actions.sort((a, b) => a.path.localeCompare(b.path));
}

async function removeTrackedPath(targetPath: string): Promise<void> {
  await fs.rm(targetPath, { force: true, recursive: true });
}

async function applyAction(action: SyncAction): Promise<"created" | "updated" | "unchanged"> {
  const stat = await fs.lstat(action.path).catch(() => null);
  if (action.kind === "symlink") {
    if (stat?.isSymbolicLink()) {
      const currentTarget = await fs.readlink(action.path).catch(() => "");
      if (currentTarget === action.target) {
        return "unchanged";
      }
    }
    await fs.rm(action.path, { force: true, recursive: true });
    await ensureDir(path.dirname(action.path));
    await fs.symlink(action.target!, action.path, "dir");
    return stat ? "updated" : "created";
  }

  const currentContent =
    stat?.isFile() && action.content !== undefined ? await fs.readFile(action.path, "utf-8") : null;
  if (currentContent === action.content) {
    return "unchanged";
  }
  await ensureDir(path.dirname(action.path));
  await fs.writeFile(action.path, action.content ?? "", "utf-8");
  return stat ? "updated" : "created";
}

async function cleanupHostOrphans(hostId: HostId, homePath: string): Promise<number> {
  const descriptor = getHostDescriptor(hostId);
  const hostBase = path.join(homePath, descriptor.homeDir);
  let cleaned = 0;

  const desiredPaths = new Set((await buildDesiredHostActions(hostId, homePath)).map((action) => action.path));

  const skillsDir = path.join(hostBase, "skills");
  if (await directoryExists(skillsDir)) {
    for (const entry of await fs.readdir(skillsDir, { withFileTypes: true })) {
      if (!entry.name.startsWith("kernel-")) continue;
      const entryPath = path.join(skillsDir, entry.name);
      const isBrokenLink = entry.isSymbolicLink() && !(await fs.stat(entryPath).catch(() => null));
      if (isBrokenLink || !desiredPaths.has(entryPath) || entry.name.startsWith("kernel-openspec-")) {
        await fs.rm(entryPath, { force: true });
        cleaned++;
      }
    }
  }

  const agentsDir = path.join(hostBase, "agents");
  if (await directoryExists(agentsDir)) {
    for (const entry of await fs.readdir(agentsDir, { withFileTypes: true })) {
      if (!entry.name.startsWith("kernel-")) continue;
      const entryPath = path.join(agentsDir, entry.name);
      if (!desiredPaths.has(entryPath)) {
        await fs.rm(entryPath, { force: true });
        cleaned++;
      }
    }
  }

  for (const relativeCommandsDir of [path.join(hostBase, "commands"), path.join(hostBase, "commands", "kernel")]) {
    if (await directoryExists(relativeCommandsDir)) {
      for (const entry of await fs.readdir(relativeCommandsDir, { withFileTypes: true })) {
        if (!entry.name.startsWith("kernel-")) continue;
        const entryPath = path.join(relativeCommandsDir, entry.name);
        if (!desiredPaths.has(entryPath)) {
          await fs.rm(entryPath, { force: true });
          cleaned++;
        }
      }
    }
  }

  return cleaned;
}

async function syncHost(
  hostId: HostId,
  previous: string[],
  homePath: string,
): Promise<SyncHostResult> {
  const desired = await buildDesiredHostActions(hostId, homePath);
  const desiredPaths = new Set(desired.map((action) => action.path));
  let removed = 0;
  for (const tracked of previous) {
    if (!desiredPaths.has(tracked)) {
      await removeTrackedPath(tracked);
      removed += 1;
    }
  }

  let created = 0;
  let updated = 0;
  let unchanged = 0;
  for (const action of desired) {
    const result = await applyAction(action);
    if (result === "created") {
      created += 1;
    } else if (result === "updated") {
      updated += 1;
    } else {
      unchanged += 1;
    }
  }

  const orphansCleaned = await cleanupHostOrphans(hostId, homePath);
  removed += orphansCleaned;

  return {
    host: hostId,
    created,
    updated,
    removed,
    unchanged,
    tracked: desired.map((action) => action.path),
  };
}

export async function syncKernelBrain(homePath = os.homedir()): Promise<SyncResult> {
  await syncBuiltInCatalog(homePath);
  const config = await loadBrainConfig(homePath);
  if (!config) {
    throw new Error("Kernel is not initialized. Run `kernel init` first.");
  }
  const normalizedConfig = await saveBrainConfig(config, homePath);

  const manifest = await loadSyncManifest(homePath);
  const results: SyncHostResult[] = [];
  for (const hostId of normalizedConfig.hosts) {
    const previous = manifest.hosts[hostId]?.paths ?? [];
    const result = await syncHost(hostId, previous, homePath);
    manifest.hosts[hostId] = { paths: result.tracked };
    results.push(result);
  }

  for (const hostId of listKnownHosts()) {
    if (!normalizedConfig.hosts.includes(hostId) && manifest.hosts[hostId]?.paths) {
      for (const tracked of manifest.hosts[hostId]!.paths) {
        await removeTrackedPath(tracked);
      }
      delete manifest.hosts[hostId];
    }
  }

  await saveSyncManifest(manifest, homePath);

  return {
    catalogPath: getCatalogRoot(homePath),
    importedLegacySkills: [],
    hosts: results,
  };
}
