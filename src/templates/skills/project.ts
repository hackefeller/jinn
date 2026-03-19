import type { SkillTemplate } from "../../core/templates/types.js";

export function getProjectWorkflowSkillTemplate(): SkillTemplate {
  return {
    name: "project-workflow",
    description:
      "Project lifecycle management: initialization, build, test, deploy, and architectural mapping.",
    license: "MIT",
    compatibility: "Works with any project or stack",
    metadata: {
      author: "jinn",
      version: "1.0",
      category: "Engineering",
      tags: ["project", "build", "deploy", "init", "test", "conventions"],
    },
    when: [
      "user needs to initialize, build, test, or deploy a project",
      "user wants to map or understand an unfamiliar codebase",
      "project conventions or standards need to be defined",
      'user asks "how do I set this up?" or "how do I deploy?"',
    ],
    applicability: [
      "Use for any project lifecycle task from scaffolding to production deployment",
      "Use when establishing or reviewing project conventions and standards",
    ],
    termination: [
      "Project initialized with working build and tests",
      "Build artifacts verified and deployment completed",
      "Project map or convention document delivered",
    ],
    outputs: [
      "Initialized project structure with tooling configured",
      "Successful production build or deployment",
      "Project map or architecture summary",
    ],
    dependencies: [],
    instructions: `# Project Workflow Skill

You handle the full project lifecycle: initialization, build, test, deploy, and codebase mapping.

## Project Initialization

When setting up a new project:

1. **Choose a template** — framework default, existing project, or custom spec
2. **Install dependencies** — confirm package manager, install core + devDependencies
3. **Configure tooling** — linter, formatter, type checker, test runner, bundler
4. **Set up git** — initialize repo, create .gitignore, make initial commit
5. **Verify** — run build, run tests, confirm no errors

## Building for Production

1. Clean previous build artifacts (dist/, build/, .cache/)
2. Confirm all dependencies are installed and up to date
3. Run the build command with appropriate environment variables
4. Verify output — check artifacts exist, file sizes are reasonable
5. Run a smoke test or preview to confirm the build is functional

Common build commands by stack:
- Node.js: \`npm run build\` / \`pnpm build\`
- Python: \`python -m build\` / \`poetry build\`
- Go: \`go build ./...\`
- Rust: \`cargo build --release\`

## Testing

Run the appropriate test types for the scope of change:
- **Unit** — individual functions or components in isolation
- **Integration** — interaction between modules or services
- **E2E** — complete user flows
- **Performance** — load characteristics and response time

Always run tests before committing and before deploying.

## Deployment

Pre-deployment checklist:
- [ ] All tests passing on the target branch
- [ ] Build successful with production config
- [ ] Environment variables configured and secrets rotated if needed
- [ ] Database migrations are ready and reversible
- [ ] Rollback plan documented

Deployment strategies:
- **Blue-Green** — run two identical environments, switch traffic
- **Rolling** — replace instances one-by-one
- **Canary** — route a small percentage to the new version first
- **Feature flags** — deploy code dark, enable incrementally

Post-deployment: run health checks, monitor error rates, validate key user flows.

## Project Mapping

When exploring an unfamiliar codebase:
1. Identify the entry points (main files, index files, route files)
2. Trace the dependency graph from entry points outward
3. Find where data flows: input → processing → storage → output
4. Identify the test infrastructure and coverage gaps
5. Summarize the architecture in plain language with key file paths

## Project Constitution

When defining or reviewing project standards:
- **Code style** — linting rules, formatting conventions, naming patterns
- **Git workflow** — branch naming, commit format, PR requirements
- **Testing** — coverage requirements, patterns, when tests are mandatory
- **Documentation** — README structure, API docs, code comment expectations
- **Tooling** — which tools are enforced in CI

Document the constitution in a README or CONTRIBUTING.md and enforce it with CI checks.
`,
  };
}
