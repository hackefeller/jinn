import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface LinearImportSubIssue {
  title: string;
  description: string;
  state: 'pending' | 'completed';
}

export interface LinearImportIssue {
  title: string;
  description: string;
  sourcePath: string;
  subIssues: LinearImportSubIssue[];
}

export interface LinearImportProject {
  externalRef: string;
  name: string;
  summary: string;
  description: string;
  sourcePath: string;
  issues: LinearImportIssue[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, 'utf-8').trim() : '';
}

function parseTaskSubIssues(tasksContent: string, sourcePath: string): LinearImportSubIssue[] {
  return tasksContent
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^- \[[ x]\] /.test(line))
    .map((line) => ({
      title: line.replace(/^- \[[ x]\] /, '').trim(),
      description: `Imported from ${sourcePath}`,
      state: line.startsWith('- [x]') ? 'completed' : 'pending',
    }));
}

function buildIssueDescription(specContent: string, designContent: string, sourcePath: string): string {
  const parts = [specContent, designContent].filter(Boolean);
  parts.push(`Imported from ${sourcePath}`);
  return parts.join('\n\n');
}

function buildIssues(changeRoot: string, designContent: string): LinearImportIssue[] {
  const specsRoot = join(changeRoot, 'specs');
  const tasksPath = join(changeRoot, 'tasks.md');
  const tasksContent = readIfExists(tasksPath);
  const taskSubIssues = parseTaskSubIssues(tasksContent, tasksPath);

  if (!existsSync(specsRoot)) {
    return [
      {
        title: 'Implementation',
        description: buildIssueDescription('', designContent, tasksPath || changeRoot),
        sourcePath: tasksPath || changeRoot,
        subIssues: taskSubIssues,
      },
    ];
  }

  const capabilityDirs = readdirSync(specsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  if (capabilityDirs.length === 0) {
    return [
      {
        title: 'Implementation',
        description: buildIssueDescription('', designContent, tasksPath || changeRoot),
        sourcePath: tasksPath || changeRoot,
        subIssues: taskSubIssues,
      },
    ];
  }

  return capabilityDirs.map((capability, index) => {
    const specPath = join(specsRoot, capability, 'spec.md');
    return {
      title: capability,
      description: buildIssueDescription(readIfExists(specPath), designContent, specPath),
      sourcePath: specPath,
      subIssues: index === 0 ? taskSubIssues : [],
    };
  });
}

export async function importLegacyChanges(projectRoot: string): Promise<LinearImportProject[]> {
  const changesRoot = join(projectRoot, 'openspec', 'changes');
  if (!existsSync(changesRoot)) {
    return [];
  }

  const changeDirs = readdirSync(changesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== 'archive')
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  return changeDirs.map((changeName) => {
    const changeRoot = join(changesRoot, changeName);
    const proposalPath = join(changeRoot, 'proposal.md');
    const designPath = join(changeRoot, 'design.md');
    const proposalContent = readIfExists(proposalPath);
    const designContent = readIfExists(designPath);

    return {
      externalRef: `legacy:change:${changeName}`,
      name: changeName,
      summary: proposalContent.split('\n').find((line) => line.trim()) ?? changeName,
      description: [proposalContent, designContent, `Imported from ${proposalPath}`]
        .filter(Boolean)
        .join('\n\n'),
      sourcePath: changeRoot,
      issues: buildIssues(changeRoot, designContent),
    };
  });
}
