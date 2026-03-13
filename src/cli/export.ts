import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

import {
  getDefaultAgentTemplates,
  getDefaultCommandTemplates,
  getDefaultSkillTemplates,
} from "../templates/catalog.js";

type ExportTarget = "copilot" | "codex" | "all";

type CopilotGroup = "instructions" | "prompts" | "skills" | "agents" | "hooks";
const COPILOT_GROUPS: CopilotGroup[] = ["instructions", "prompts", "skills", "agents", "hooks"];

export interface ExportArgs {
  target?: ExportTarget;
  directory?: string;
  force?: boolean;
  groups?: string;
  strict?: boolean;
}

interface ExportArtifact {
  path: string;
  content: string;
  target: "copilot" | "codex";
}

interface ExportModel {
  generatedAt: string;
  generatedDate: string;
  agents: Array<{ id: string; name: string; purpose: string; instructions: string }>;
  commands: Array<{
    id: string;
    fullId: string;
    name: string;
    description: string;
    category: string;
    content: string;
  }>;
  skills: Array<{ id: string; name: string; description: string; template: string }>;
}

interface CoverageEntry {
  source_count: number;
  emitted_count: number;
  missing_ids: string[];
  applicable: boolean;
}

interface ExportCoverage {
  agents: CoverageEntry;
  prompts: CoverageEntry;
  skills: CoverageEntry;
  codex_agents: CoverageEntry;
  codex_commands: CoverageEntry;
  codex_skills: CoverageEntry;
}

interface ResolvedArtifacts {
  artifacts: ExportArtifact[];
  coverage: ExportCoverage;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/--+/g, "-");
}

function ensureUniqueSlug(base: string, used: Set<string>): string {
  if (!used.has(base)) {
    used.add(base);
    return base;
  }

  let index = 2;
  let candidate = `${base}-${index}`;
  while (used.has(candidate)) {
    index += 1;
    candidate = `${base}-${index}`;
  }
  used.add(candidate);
  return candidate;
}

function normalizeCommandId(name: string): string {
  return name
    .toLowerCase()
    .replace(/^jinn:?\s*/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatSkillDocument(name: string, description: string, instructions: string): string {
  return [
    "---",
    `name: ${name}`,
    `description: ${description.replace(/\n+/g, " ")}`,
    "---",
    "",
    instructions.trim(),
    "",
  ].join("\n");
}

function createCoverageEntry(
  sourceIds: string[],
  emittedIds: string[],
  applicable: boolean,
): CoverageEntry {
  const sourceSet = new Set(sourceIds);
  const emittedSet = new Set(emittedIds);
  return {
    source_count: sourceSet.size,
    emitted_count: emittedSet.size,
    missing_ids: applicable ? [...sourceSet].filter((id) => !emittedSet.has(id)).sort() : [],
    applicable,
  };
}

function compileExportModel(): ExportModel {
  const generatedAt = new Date().toISOString();

  const agents = getDefaultAgentTemplates()
    .map((template) => ({
      id: template.name,
      name: template.name,
      purpose: template.description,
      instructions: template.instructions,
    }))
    .sort((a, b) => a.id.localeCompare(b.id));

  const commands = getDefaultCommandTemplates()
    .map((template) => {
      const id = normalizeCommandId(template.name);
      return {
        id,
        fullId: `jinn:${id}`,
        name: template.name,
        description: template.description,
        category: template.category,
        content: template.content,
      };
    })
    .sort((a, b) => a.fullId.localeCompare(b.fullId));

  const skills = getDefaultSkillTemplates()
    .map((template) => ({
      id: slugify(template.name),
      name: template.name,
      description: template.description,
      template: template.instructions,
    }))
    .sort((a, b) => a.id.localeCompare(b.id));

  return {
    generatedAt,
    generatedDate: generatedAt.slice(0, 10),
    agents,
    commands,
    skills,
  };
}

function buildCopilotRootInstructions(model: ExportModel): string {
  return [
    "# Jinn Copilot Instructions",
    "",
    `Generated: ${model.generatedDate}`,
    "",
    "Repository-wide constraints:",
    "- Use technical and scientific language with explicit assumptions and measurable outcomes.",
    "- Apply RED -> GREEN -> REFACTOR for non-trivial code changes.",
    "- Prefer deterministic validation before completion.",
    "- Keep edits minimal and scoped to requested behavior.",
    "",
    "Full capability export is available via modular artifacts:",
    "- .github/instructions/*.instructions.md",
    "- .github/prompts/*.prompt.md",
    "- .github/skills/*/SKILL.md",
    "- .github/agents/*.agent.md",
    "- .github/hooks/*.json",
    "",
    `Available commands: ${model.commands.length}`,
    `Available skills: ${model.skills.length}`,
    `Available agents: ${model.agents.length}`,
    "",
  ].join("\n");
}

function buildCopilotScopedInstructions(model: ExportModel): ExportArtifact[] {
  const workflowCommands = model.commands
    .filter((command) => command.category.toLowerCase() === "workflow")
    .slice(0, 12)
    .map((command) => `- \`${command.fullId}\`: ${command.description}`)
    .join("\n");

  return [
    {
      target: "copilot",
      path: ".github/instructions/workflows.instructions.md",
      content: [
        "---",
        'applyTo: "**/*"',
        "---",
        "",
        "# Workflow Rules",
        "- Prefer the Linear-backed workflow commands for planning and execution.",
        "- Treat Linear as the source of truth for proposals, plans, and task state.",
        "- Keep implementation aligned with the active workflow command context.",
        "",
        "## Workflow Commands",
        workflowCommands,
        "",
      ].join("\n"),
    },
  ];
}

function buildCopilotPromptArtifacts(model: ExportModel): {
  artifacts: ExportArtifact[];
  emittedIds: string[];
} {
  const artifacts: ExportArtifact[] = [];
  const emittedIds: string[] = [];
  const usedSlugs = new Set<string>();

  for (const command of model.commands) {
    const slug = ensureUniqueSlug(slugify(command.id), usedSlugs);
    artifacts.push({
      target: "copilot",
      path: `.github/prompts/${slug}.prompt.md`,
      content: [
        `# ${command.fullId}`,
        "",
        `Category: ${command.category}`,
        "",
        command.content.trim(),
        "",
      ].join("\n"),
    });
    emittedIds.push(command.id);
  }

  return { artifacts, emittedIds };
}

function buildCopilotSkillArtifacts(model: ExportModel): {
  artifacts: ExportArtifact[];
  emittedIds: string[];
} {
  const artifacts: ExportArtifact[] = [];
  const emittedIds: string[] = [];
  const usedSlugs = new Set<string>();

  for (const skill of model.skills) {
    const slug = ensureUniqueSlug(slugify(skill.id || skill.name), usedSlugs);
    artifacts.push({
      target: "copilot",
      path: `.github/skills/${slug}/SKILL.md`,
      content: formatSkillDocument(skill.name, skill.description, skill.template),
    });
    emittedIds.push(skill.id);
  }

  return { artifacts, emittedIds };
}

function buildCopilotAgentArtifacts(model: ExportModel): {
  artifacts: ExportArtifact[];
  emittedIds: string[];
} {
  const artifacts: ExportArtifact[] = [];
  const emittedIds: string[] = [];
  const usedSlugs = new Set<string>();

  for (const agent of model.agents) {
    const slug = ensureUniqueSlug(slugify(agent.id), usedSlugs);
    artifacts.push({
      target: "copilot",
      path: `.github/agents/${slug}.agent.md`,
      content: [
        "---",
        `name: ${agent.name}`,
        `description: ${agent.purpose.replace(/\n+/g, " ")}`,
        "---",
        "",
        `# ${agent.id}`,
        "",
        agent.instructions.trim(),
        "",
      ].join("\n"),
    });
    emittedIds.push(agent.id);
  }

  return { artifacts, emittedIds };
}

function buildCopilotHookArtifacts(): ExportArtifact[] {
  return [
    {
      target: "copilot",
      path: ".github/hooks/jinn-guardrails.json",
      content: JSON.stringify(
        {
          version: 1,
          hooks: {
            sessionStart: [{ command: "echo jinn-session-start" }],
            preToolUse: [{ command: "echo jinn-pre-tool" }],
            postToolUse: [{ command: "echo jinn-post-tool" }],
          },
        },
        null,
        2,
      ),
    },
  ];
}

function buildCodexSkillArtifacts(model: ExportModel): {
  artifacts: ExportArtifact[];
  emittedIds: string[];
} {
  const artifacts: ExportArtifact[] = [];
  const emittedIds: string[] = [];
  const usedSlugs = new Set<string>();

  for (const skill of model.skills) {
    const slug = ensureUniqueSlug(slugify(skill.id || skill.name), usedSlugs);
    artifacts.push({
      target: "codex",
      path: `.agents/skills/${slug}/SKILL.md`,
      content: formatSkillDocument(skill.name, skill.description, skill.template),
    });
    emittedIds.push(skill.id);
  }

  return { artifacts, emittedIds };
}

function buildCodexInstructions(model: ExportModel): {
  content: string;
  emittedAgentIds: string[];
  emittedCommandIds: string[];
} {
  const workflowCommands = model.commands
    .filter((command) => command.category.toLowerCase() === "workflow")
    .map((command) => `- \`${command.fullId}\`: ${command.description}`)
    .join("\n");
  const agents = model.agents.map((agent) => `- \`${agent.id}\`: ${agent.purpose}`).join("\n");
  const skills = model.skills
    .map((skill) => `- \`${skill.name}\`: ${skill.description}`)
    .join("\n");

  return {
    emittedAgentIds: model.agents.map((agent) => agent.id),
    emittedCommandIds: model.commands
      .filter((command) => command.category.toLowerCase() === "workflow")
      .map((command) => command.id),
    content: [
      "# Jinn Codex Instructions",
      "",
      `Generated: ${model.generatedDate}`,
      "",
      "Use technical and scientific language and state assumptions explicitly.",
      "Apply RED -> GREEN -> REFACTOR for non-trivial implementation.",
      "Prefer deterministic validation evidence over narrative claims.",
      "Treat Linear as the source of truth for workflow state.",
      "",
      "## Workflow Commands",
      workflowCommands,
      "",
      "## Agents",
      agents,
      "",
      "## Skills",
      "Codex discovers reusable skills from `.agents/skills/<skill-name>/SKILL.md`.",
      "Commands and agents are cataloged in this file instead of `.agents/commands` or `.agents/agents` directories.",
      "",
      skills,
      "",
    ].join("\n"),
  };
}

async function resolveArtifactsWithGroups(
  baseDirectory: string,
  target: ExportTarget,
  groups: Set<CopilotGroup>,
): Promise<ResolvedArtifacts> {
  const model = compileExportModel();
  const relativeArtifacts: ExportArtifact[] = [];

  let emittedCopilotAgentIds: string[] = [];
  let emittedCopilotPromptIds: string[] = [];
  let emittedCopilotSkillIds: string[] = [];
  let emittedCodexAgentIds: string[] = [];
  let emittedCodexCommandIds: string[] = [];
  let emittedCodexSkillIds: string[] = [];

  if (target === "copilot" || target === "all") {
    relativeArtifacts.push({
      target: "copilot",
      path: ".github/copilot-instructions.md",
      content: buildCopilotRootInstructions(model),
    });

    if (groups.has("instructions")) {
      relativeArtifacts.push(...buildCopilotScopedInstructions(model));
    }

    if (groups.has("prompts")) {
      const prompts = buildCopilotPromptArtifacts(model);
      relativeArtifacts.push(...prompts.artifacts);
      emittedCopilotPromptIds = prompts.emittedIds;
    }

    if (groups.has("skills")) {
      const skills = buildCopilotSkillArtifacts(model);
      relativeArtifacts.push(...skills.artifacts);
      emittedCopilotSkillIds = skills.emittedIds;
    }

    if (groups.has("agents")) {
      const agents = buildCopilotAgentArtifacts(model);
      relativeArtifacts.push(...agents.artifacts);
      emittedCopilotAgentIds = agents.emittedIds;
    }

    if (groups.has("hooks")) {
      relativeArtifacts.push(...buildCopilotHookArtifacts());
    }
  }

  if (target === "codex" || target === "all") {
    const codexSkills = buildCodexSkillArtifacts(model);
    const codex = buildCodexInstructions(model);
    relativeArtifacts.push({
      target: "codex",
      path: "AGENTS.md",
      content: codex.content,
    });
    relativeArtifacts.push(...codexSkills.artifacts);
    emittedCodexAgentIds = codex.emittedAgentIds;
    emittedCodexCommandIds = codex.emittedCommandIds;
    emittedCodexSkillIds = codexSkills.emittedIds;
  }

  const absoluteArtifacts = relativeArtifacts.map((artifact) => ({
    ...artifact,
    path: join(baseDirectory, artifact.path),
  }));

  return {
    artifacts: absoluteArtifacts,
    coverage: {
      agents: createCoverageEntry(
        model.agents.map((agent) => agent.id),
        emittedCopilotAgentIds,
        (target === "copilot" || target === "all") && groups.has("agents"),
      ),
      prompts: createCoverageEntry(
        model.commands.map((command) => command.id),
        emittedCopilotPromptIds,
        (target === "copilot" || target === "all") && groups.has("prompts"),
      ),
      skills: createCoverageEntry(
        model.skills.map((skill) => skill.id),
        emittedCopilotSkillIds,
        (target === "copilot" || target === "all") && groups.has("skills"),
      ),
      codex_agents: createCoverageEntry(
        model.agents.map((agent) => agent.id),
        emittedCodexAgentIds,
        target === "codex" || target === "all",
      ),
      codex_commands: createCoverageEntry(
        model.commands
          .filter((command) => command.category.toLowerCase() === "workflow")
          .map((command) => command.id),
        emittedCodexCommandIds,
        target === "codex" || target === "all",
      ),
      codex_skills: createCoverageEntry(
        model.skills.map((skill) => skill.id),
        emittedCodexSkillIds,
        target === "codex" || target === "all",
      ),
    },
  };
}

function validateTarget(target: string | undefined): target is ExportTarget {
  return target === undefined || target === "copilot" || target === "codex" || target === "all";
}

function parseGroups(groupsArg: string | undefined): Set<CopilotGroup> | null {
  if (!groupsArg || groupsArg.trim().length === 0) {
    return new Set(COPILOT_GROUPS);
  }

  const parsed = new Set<CopilotGroup>();
  for (const group of groupsArg.split(",").map((value) => value.trim().toLowerCase())) {
    if (!group) {
      continue;
    }
    if (!COPILOT_GROUPS.includes(group as CopilotGroup)) {
      return null;
    }
    parsed.add(group as CopilotGroup);
  }

  return parsed;
}

function runStrictValidation(artifacts: ExportArtifact[], coverage: ExportCoverage): string[] {
  const errors: string[] = [];

  for (const artifact of artifacts) {
    if (!artifact.content.trim()) {
      errors.push(`Empty artifact content: ${artifact.path}`);
    }

    if (artifact.path.endsWith(".json")) {
      try {
        JSON.parse(artifact.content);
      } catch {
        errors.push(`Invalid JSON artifact: ${artifact.path}`);
      }
    }
  }

  const parityClasses: Array<keyof ExportCoverage> = [
    "agents",
    "prompts",
    "skills",
    "codex_agents",
    "codex_commands",
    "codex_skills",
  ];

  for (const className of parityClasses) {
    const entry = coverage[className];
    if (entry.applicable && entry.missing_ids.length > 0) {
      errors.push(
        `Parity gap in ${className}: source=${entry.source_count}, emitted=${entry.emitted_count}, missing=${entry.missing_ids.join(",")}`,
      );
    }
  }

  return errors;
}

export async function exportGenius(args: ExportArgs): Promise<number> {
  if (!validateTarget(args.target)) {
    console.error(`Invalid --target value: ${args.target}. Expected one of: copilot, codex, all`);
    return 1;
  }

  const target = args.target ?? "all";
  const force = args.force ?? false;
  const strict = args.strict ?? false;
  const baseDirectory = resolve(args.directory ?? process.cwd());

  const groups = parseGroups(args.groups);
  if (!groups) {
    console.error(
      `Invalid --groups value: ${args.groups}. Expected comma-separated subset of: ${COPILOT_GROUPS.join(",")}`,
    );
    return 1;
  }

  const resolved = await resolveArtifactsWithGroups(baseDirectory, target, groups);
  if (strict) {
    const errors = runStrictValidation(resolved.artifacts, resolved.coverage);
    if (errors.length > 0) {
      for (const error of errors) {
        console.error(error);
      }
      return 1;
    }
  }

  for (const artifact of resolved.artifacts) {
    if (existsSync(artifact.path) && !force) {
      console.error(
        `Refusing to overwrite existing file: ${artifact.path}. Use --force to overwrite.`,
      );
      return 1;
    }
  }

  for (const artifact of resolved.artifacts) {
    mkdirSync(dirname(artifact.path), { recursive: true });
    writeFileSync(artifact.path, artifact.content, "utf-8");
    console.log(`Exported ${artifact.target} artifact -> ${artifact.path}`);
  }

  return 0;
}
