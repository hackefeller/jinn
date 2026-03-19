import type { SkillTemplate } from "../../core/templates/types.js";

export function getGitMasterSkillTemplate(): SkillTemplate {
  return {
    name: "git",
    description: "Advanced git workflows, branch management, and collaboration patterns",
    license: "MIT",
    compatibility: "Works with any git repository",
    metadata: {
      author: "jinn",
      version: "1.0",
      category: "Version Control",
      tags: ["git", "workflow", "collaboration"],
    },
    when: [
      "user asks about branching, merging, or rebasing",
      "there are merge conflicts to resolve",
      "user wants to clean up commit history before a PR",
      "user needs help with git collaboration workflows",
    ],
    applicability: [
      "Use when working with git history, branches, or remote repositories",
      "Use for commit hygiene, rebase workflows, and conflict resolution",
    ],
    termination: [
      "Git operation described and commands provided",
      "Conflict resolved or branch strategy defined",
    ],
    outputs: [
      "Git commands and workflow guidance",
      "Branch strategy or commit message recommendations",
    ],
    dependencies: [],
    instructions: `# Git Master Skill

You are a Git Master. You help users with advanced git workflows, branch management, and collaboration patterns.

## Your Capabilities

- Branch strategy design (GitFlow, GitHub Flow, trunk-based)
- Commit hygiene and history management
- Merge conflict resolution
- Rebase workflows
- Cherry-picking and patch management
- Stash management
- Remote repository management

## When to Activate

Activate this skill when the user:
- Mentions complex branching scenarios
- Asks about commit organization
- Has merge conflicts
- Wants to rewrite history (carefully!)
- Needs help with collaboration workflows

## Key Principles

1. **Never rewrite public history** - Rebase is for local branches only
2. **Small, focused commits** - Easier to review and revert
3. **Clear commit messages** - Explain WHY, not just WHAT
4. **Feature branches** - Isolate work from main branch
5. **Regular integration** - Merge main into feature branches often

## Common Patterns

### Starting New Work

\`\`\`bash
git checkout main
git pull origin main
git checkout -b feature/descriptive-name
\`\`\`

### Cleaning Up Before PR

\`\`\`bash
git rebase -i main
git push --force-with-lease origin feature/descriptive-name
\`\`\`

### Handling Merge Conflicts

1. Pull latest main: \`git pull origin main\`
2. Resolve conflicts in editor
3. Stage resolved files: \`git add <file>\`
4. Complete merge: \`git commit\`
`,
  };
}

export function getFrontendDesignSkillTemplate(): SkillTemplate {
  return {
    name: "frontend-design",
    description: "Frontend development and UI implementation best practices",
    license: "MIT",
    compatibility: "Works with any frontend project",
    metadata: {
      author: "jinn",
      version: "1.0",
      category: "Frontend",
      tags: ["frontend", "ui", "css", "html"],
    },
    when: [
      "user is building or reviewing UI components",
      "user asks about CSS, layout, responsiveness, or accessibility",
      "frontend code needs a design or quality review",
    ],
    applicability: [
      "Use when implementing or reviewing frontend components and UI code",
      "Use when applying responsive design, accessibility, or CSS best practices",
    ],
    termination: [
      "Component implemented or reviewed with feedback provided",
      "Design pattern or best practice applied",
    ],
    outputs: ["Frontend component code", "CSS or design recommendations"],
    dependencies: [],
    instructions: `# Frontend Design Skill

You help with frontend development and UI implementation.

## Capabilities

- Component architecture
- CSS frameworks and preprocessors
- Responsive design
- Animation and transitions
- Accessibility

## Best Practices

- Mobile-first approach
- Semantic HTML
- BEM naming convention
- Component composition
- Performance optimization
`,
  };
}
