import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import ts from "typescript";

const REPO_ROOT = process.cwd();
const SRC_ROOT = join(REPO_ROOT, "src");

const FORBIDDEN_FROM_SHARED = new Set([
  "getOpenCodeConfigDir",
  "getOpenCodeConfigPaths",
  "getOpenCodeVersion",
  "isOpenCodeVersionAtLeast",
  "OPENCODE_NATIVE_AGENTS_INJECTION_VERSION",
  "detectExternalNotificationPlugin",
  "getNotificationConflictWarning",
  "getClaudeConfigDir",
  "isHookDisabled",
  "fetchAvailableModels",
  "isModelAvailable",
  "resolveModelWithFallback",
  "AGENT_MODEL_REQUIREMENTS",
  "migrateAgentConfig",
  "migrateConfigFile",
  "migrateAgentConfigToCategory",
  "getAgentToolRestrictions",
]);

const FORBIDDEN_SHARED_PATH_SEGMENTS = [
  "shared/opencode-config-dir",
  "shared/opencode-version",
  "shared/connected-providers-cache",
  "shared/external-plugin-detector",
  "shared/model-availability",
  "shared/claude-config-dir",
  "shared/hook-disabled",
  "shared/model-requirements",
  "shared/model-resolver",
  "shared/permission-compat",
  "shared/migration",
  "shared/agent-tool-restrictions",
];

type Violation = {
  file: string;
  line: number;
  column: number;
  message: string;
};

function listTsFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      files.push(...listTsFiles(full));
      continue;
    }
    if (full.endsWith(".ts") && !full.endsWith(".d.ts")) {
      files.push(full);
    }
  }
  return files;
}

function isSharedBarrelImport(modulePath: string): boolean {
  return modulePath === "./shared" || modulePath === "../shared" || /\/shared$/.test(modulePath);
}

function hasForbiddenSharedPath(modulePath: string): boolean {
  return FORBIDDEN_SHARED_PATH_SEGMENTS.some((segment) => modulePath.includes(segment));
}

function getLineAndColumn(
  sourceFile: ts.SourceFile,
  node: ts.Node,
): { line: number; column: number } {
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
  return { line: line + 1, column: character + 1 };
}

function checkFile(filePath: string): Violation[] {
  const sourceText = readFileSync(filePath, "utf8");
  const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true);
  const violations: Violation[] = [];

  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node)) {
      const modulePath = (node.moduleSpecifier as ts.StringLiteral).text;

      if (hasForbiddenSharedPath(modulePath)) {
        const pos = getLineAndColumn(sourceFile, node.moduleSpecifier);
        violations.push({
          file: relative(REPO_ROOT, filePath),
          line: pos.line,
          column: pos.column,
          message: `Forbidden legacy shared path import: "${modulePath}"`,
        });
      }

      if (isSharedBarrelImport(modulePath) && node.importClause) {
        if (
          node.importClause.namedBindings &&
          ts.isNamespaceImport(node.importClause.namedBindings)
        ) {
          const pos = getLineAndColumn(sourceFile, node.importClause.namedBindings);
          violations.push({
            file: relative(REPO_ROOT, filePath),
            line: pos.line,
            column: pos.column,
            message: `Namespace import from shared barrel is forbidden: "${modulePath}"`,
          });
        }

        if (node.importClause.namedBindings && ts.isNamedImports(node.importClause.namedBindings)) {
          for (const element of node.importClause.namedBindings.elements) {
            const importedName = element.propertyName?.text ?? element.name.text;
            if (FORBIDDEN_FROM_SHARED.has(importedName)) {
              const pos = getLineAndColumn(sourceFile, element.name);
              violations.push({
                file: relative(REPO_ROOT, filePath),
                line: pos.line,
                column: pos.column,
                message: `Forbidden symbol "${importedName}" imported from shared barrel`,
              });
            }
          }
        }
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return violations;
}

const allViolations = listTsFiles(SRC_ROOT).flatMap(checkFile);

if (allViolations.length > 0) {
  console.error("Topology check failed.");
  for (const v of allViolations) {
    console.error(`${v.file}:${v.line}:${v.column} ${v.message}`);
  }
  process.exit(1);
}

console.log("Topology check passed.");
