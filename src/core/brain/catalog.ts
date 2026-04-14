import type { AgentTemplate, SkillTemplate } from "../templates/types.js";
import { getDefaultAgentTemplates, getDefaultSkillTemplates } from "../../templates/catalog.js";
import type { BrainCommandAlias, BrainPackageManifest, BuiltInCatalog } from "./types.js";

function getBuiltInSkills(): SkillTemplate[] {
  return getDefaultSkillTemplates();
}

function getBuiltInAgents(): AgentTemplate[] {
  return getDefaultAgentTemplates();
}

function dedupePackages(packages: BrainPackageManifest[]): BrainPackageManifest[] {
  return [...new Map(packages.map((pkg) => [pkg.id, pkg])).values()];
}

function getBuiltInCommands(): BrainCommandAlias[] {
  return [
    {
      name: "kernel-init",
      description: "Initialize the local Kernel brain, detect hosts, import legacy skills, and sync.",
      target: "init",
    },
    {
      name: "kernel-sync",
      description: "Sync the local Kernel brain into every enabled agent host directory.",
      target: "sync",
    },
    {
      name: "kernel-doctor",
      description: "Diagnose the local Kernel brain, generated host files, and sync drift.",
      target: "doctor",
    },
    {
      name: "kernel-work-new",
      description: "Create a new local work item in kernel/work/ and make it the active task.",
      target: "work new",
      argumentHint: "goal or work description",
    },
    {
      name: "kernel-work-plan",
      description: "Refresh the local work plan and sync tasks into structured state.",
      target: "work plan",
      argumentHint: "optional work id",
    },
    {
      name: "kernel-work-next",
      description: "Show the next unchecked task for the active local work item.",
      target: "work next",
      argumentHint: "optional work id",
    },
    {
      name: "kernel-work-status",
      description: "Show progress for the active local work item.",
      target: "work status",
      argumentHint: "optional work id",
    },
    {
      name: "kernel-work-done",
      description: "Mark a local work task complete and sync the task view.",
      target: "work done",
      argumentHint: "task id or title",
    },
    {
      name: "kernel-work-archive",
      description: "Archive a completed local work item into kernel/work/archive/.",
      target: "work archive",
      argumentHint: "optional work id",
    },
  ];
}

function getBuiltInPackages(): BrainPackageManifest[] {
  return dedupePackages([
    {
      id: "core-brain",
      name: "Core Brain",
      description: "Local-first core skills and orchestration agents for day-to-day coding work.",
      skills: ["kernel-build", "kernel-map-codebase", "kernel-project-setup"],
      agents: ["kernel-plan", "kernel-do", "kernel-search"],
      commands: ["kernel-init", "kernel-sync", "kernel-doctor"],
    },
    {
      id: "workflow-local",
      name: "Workflow Local",
      description: "Local work management commands for planning, tracking, and closing tasks in the repo.",
      skills: [],
      agents: [],
      commands: [
        "kernel-work-new",
        "kernel-work-plan",
        "kernel-work-next",
        "kernel-work-status",
        "kernel-work-done",
        "kernel-work-archive",
      ],
    },
    {
      id: "git",
      name: "Git",
      description: "Git strategy and safe history management.",
      skills: ["kernel-git-master"],
      agents: ["kernel-git"],
      commands: [],
    },
    {
      id: "review",
      name: "Review",
      description: "Review and sign-off helpers for completed work.",
      skills: ["kernel-review"],
      agents: ["kernel-review"],
      commands: [],
    },
    {
      id: "frontend",
      name: "Frontend",
      description: "Frontend architecture, component, and safety skills.",
      skills: [
        "kernel-api-engineering",
        "kernel-asset-integration-security",
        "kernel-react-patterns",
      ],
      agents: [],
      commands: [],
    },
    {
      id: "mobile",
      name: "Mobile",
      description: "React Native and Expo workflow guidance.",
      skills: ["kernel-react-native"],
      agents: [],
      commands: [],
    },
    {
      id: "database",
      name: "Database",
      description: "Schema, auth, and shared type architecture skills.",
      skills: [
        "kernel-database-workflow",
        "kernel-auth-contract",
        "kernel-type-architecture",
      ],
      agents: [],
      commands: [],
    },
  ]);
}

export function getBuiltInCatalog(): BuiltInCatalog {
  return {
    packages: getBuiltInPackages(),
    skills: getBuiltInSkills(),
    agents: getBuiltInAgents(),
    commands: getBuiltInCommands(),
  };
}

export function getBuiltInPackage(packageId: string): BrainPackageManifest | null {
  return getBuiltInCatalog().packages.find((pkg) => pkg.id === packageId) ?? null;
}

export function getBuiltInPackageIds(): string[] {
  return getBuiltInCatalog().packages.map((pkg) => pkg.id);
}
