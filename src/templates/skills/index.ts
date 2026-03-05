import type { SkillTemplate } from '../../core/templates/types.js';

export function getGitMasterSkillTemplate(): SkillTemplate {
  return {
    name: 'ghostwire-git-master',
    description: 'Advanced git workflows, branch management, and collaboration patterns',
    license: 'MIT',
    compatibility: 'Works with any git repository',
    metadata: {
      author: 'ghostwire',
      version: '1.0',
      category: 'Version Control',
      tags: ['git', 'workflow', 'collaboration'],
    },
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

export function getBrainstormingSkillTemplate(): SkillTemplate {
  return {
    name: 'ghostwire-brainstorming',
    description: 'Creative problem-solving and idea generation',
    license: 'MIT',
    compatibility: 'Works with any project',
    metadata: {
      author: 'ghostwire',
      version: '1.0',
      category: 'Productivity',
      tags: ['brainstorming', 'ideas', 'creativity'],
    },
    instructions: `# Brainstorming Skill

You help users generate creative solutions and explore ideas.

## Your Approach

1. **Go Wide First**
   - Generate many ideas without judgment
   - Build on others' ideas
   - Encourage wild ideas

2. **Then Narrow**
   - Evaluate feasibility
   - Consider constraints
   - Prioritize impact

3. **Document Everything**
   - No idea is too small
   - Capture context
   - Tag for categorization

## Techniques

- SCAMPER: Substitute, Combine, Adapt, Modify, Put to use, Eliminate, Reverse
- Six Thinking Hats: Facts, Emotions, Risks, Benefits, Creativity, Process
- Mind Mapping: Visual organization of ideas

## When to Use

- Feature ideation
- Problem solving
- Exploring alternatives
- Breaking through blocks
`,
  };
}

export function getRailsStyleSkillTemplate(): SkillTemplate {
  return {
    name: 'ghostwire-rails-style',
    description: 'Ruby on Rails conventions and best practices',
    license: 'MIT',
    compatibility: 'Works with Rails projects',
    metadata: {
      author: 'ghostwire',
      version: '1.0',
      category: 'Framework',
      tags: ['rails', 'ruby', 'conventions'],
    },
    instructions: `# Rails Style Skill

You are an expert in Ruby on Rails development.

## Conventions

- RESTful routes
- Convention over configuration
- DRY principle
- Fat models, skinny controllers

## Best Practices

- Use concerns for shared behavior
- Service objects for complex logic
- Form objects for complex forms
- Query objects for database queries

## Common Patterns

- migrations, callbacks, validations
- associations and scopes
- background jobs
- caching strategies
`,
  };
}

export function getFrontendDesignSkillTemplate(): SkillTemplate {
  return {
    name: 'ghostwire-frontend-design',
    description: 'Frontend development and UI implementation',
    license: 'MIT',
    compatibility: 'Works with any frontend project',
    metadata: {
      author: 'ghostwire',
      version: '1.0',
      category: 'Frontend',
      tags: ['frontend', 'ui', 'css', 'html'],
    },
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
