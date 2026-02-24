import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { AGENTS_MANIFEST } from "../execution/features/agents-manifest";

type ExportTarget = "copilot" | "codex" | "all";

export interface ExportArgs {
  target?: ExportTarget;
  directory?: string;
  force?: boolean;
}

interface ExportArtifact {
  path: string;
  content: string;
  target: "copilot" | "codex";
}

function utcDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function buildAgentCatalogLines(): string {
  const sorted = [...AGENTS_MANIFEST].sort((a, b) => a.id.localeCompare(b.id));
  return sorted.map((agent) => `- \`${agent.id}\`: ${agent.purpose}`).join("\n");
}

function buildSharedCoreInstructions(): string {
  const systemPromptPath = new URL("../../system-prompt.md", import.meta.url);
  const systemPrompt = readFileSync(systemPromptPath, "utf-8").trim();
  const agents = buildAgentCatalogLines();

  return [
    `# Ghostwire Intelligence Export`,
    ``,
    `Generated: ${utcDate()}`,
    `Source: Ghostwire orchestration protocol`,
    ``,
    `## Operational Principles`,
    `- Decompose tasks into verifiable subtasks and execute with explicit dependency ordering.`,
    `- Maximize concurrency for independent subtasks; enforce synchronization barriers for dependent subtasks.`,
    `- Prefer deterministic tools (type checkers, linters, tests, static analysis) over speculative edits.`,
    `- Maintain strict error propagation. Never suppress exceptions or ignore failing diagnostics.`,
    `- Apply minimal-diff interventions: smallest safe change set that satisfies acceptance criteria.`,
    ``,
    `## Quality Gates`,
    `- Preconditions: confirm assumptions, locate authoritative files, define expected behavior.`,
    `- Execution: implement incrementally with local invariants and bounded scope.`,
    `- Validation: run project tests and type checks; ensure no regression signatures.`,
    `- Reporting: summarize changed files, residual risks, and verification evidence.`,
    ``,
    `## Agent Capability Catalog`,
    agents,
    ``,
    `## System Protocol (Reference)`,
    `\`\`\`markdown`,
    systemPrompt,
    `\`\`\``,
    ``,
  ].join("\n");
}

function buildCopilotInstructions(): string {
  const core = buildSharedCoreInstructions();
  return [
    core,
    `## Copilot Adaptation Rules`,
    `- Treat this file as repository-wide execution policy for implementation tasks.`,
    `- For large tasks: provide a task graph with explicit critical path before editing.`,
    `- For pull requests: enumerate defect findings by severity first, then remediation steps.`,
    `- Use technical and scientific language with falsifiable claims and concrete evidence.`,
    ``,
  ].join("\n");
}

function buildCodexInstructions(): string {
  const core = buildSharedCoreInstructions();
  return [
    core,
    `## Codex Adaptation Rules`,
    `- Use technical and scientific language and point of view.`,
    `- Prioritize test-first workflow: RED -> GREEN -> REFACTOR.`,
    `- Surface uncertainty quantitatively when evidence is incomplete.`,
    `- Prefer explicit assumptions and operational constraints over narrative explanation.`,
    ``,
  ].join("\n");
}

function resolveArtifacts(baseDirectory: string, target: ExportTarget): ExportArtifact[] {
  const artifacts: ExportArtifact[] = [];
  if (target === "copilot" || target === "all") {
    artifacts.push({
      target: "copilot",
      path: join(baseDirectory, ".github", "copilot-instructions.md"),
      content: buildCopilotInstructions(),
    });
  }
  if (target === "codex" || target === "all") {
    artifacts.push({
      target: "codex",
      path: join(baseDirectory, "AGENTS.md"),
      content: buildCodexInstructions(),
    });
  }
  return artifacts;
}

function validateTarget(target: string | undefined): target is ExportTarget {
  return target === undefined || target === "copilot" || target === "codex" || target === "all";
}

export async function exportGenius(args: ExportArgs): Promise<number> {
  if (!validateTarget(args.target)) {
    console.error(`Invalid --target value: ${args.target}. Expected one of: copilot, codex, all`);
    return 1;
  }

  const target = args.target ?? "all";
  const force = args.force ?? false;
  const baseDirectory = resolve(args.directory ?? process.cwd());
  const artifacts = resolveArtifacts(baseDirectory, target);

  for (const artifact of artifacts) {
    if (existsSync(artifact.path) && !force) {
      console.error(
        `Refusing to overwrite existing file: ${artifact.path}. Use --force to overwrite.`,
      );
      return 1;
    }
  }

  for (const artifact of artifacts) {
    mkdirSync(dirname(artifact.path), { recursive: true });
    writeFileSync(artifact.path, artifact.content, "utf-8");
    console.log(`Exported ${artifact.target} intelligence -> ${artifact.path}`);
  }

  return 0;
}
