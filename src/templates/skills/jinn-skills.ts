import type { SkillTemplate } from '../../core/templates/types.js';

export function getJinnProposeSkillTemplate(): SkillTemplate {
  return {
    name: 'jinn-propose',
    description: 'Use when turning a change request into a Linear project with seeded issues and sub-issues.',
    license: 'MIT',
    compatibility: 'Requires jinn CLI and a configured Linear MCP server.',
    metadata: {
      author: 'jinn',
      version: '1.0',
      category: 'Workflow',
      tags: ['workflow', 'propose', 'linear', 'planning'],
    },
    instructions: `Create a Linear-backed change proposal.

1. Clarify the requested change.
2. Create or update a Linear project for the change.
3. Put the summary and design context in the Linear project description.
4. Seed top-level Linear issues for workstreams or milestones.
5. Seed sub-issues for immediately actionable implementation tasks.
6. Report the resulting Linear project and open decisions.

Guardrails:
- Linear is the source of truth.
- Do not create local planning artifacts as the primary record.
- Update an existing matching Linear project instead of duplicating it.
`,
  };
}

export function getJinnExploreSkillTemplate(): SkillTemplate {
  return {
    name: 'jinn-explore',
    description: 'Use when exploring tradeoffs, risks, or missing context inside an existing Linear project or issue.',
    license: 'MIT',
    compatibility: 'Requires jinn CLI and a configured Linear MCP server.',
    metadata: {
      author: 'jinn',
      version: '1.0',
      category: 'Workflow',
      tags: ['workflow', 'explore', 'linear', 'investigation'],
    },
    instructions: `Enter explore mode with Linear context.

1. Identify the relevant Linear project or Linear issue.
2. Read the current Linear descriptions, dependencies, and status.
3. Explore options, risks, and missing context.
4. Offer to write clarified decisions back into the relevant Linear project or Linear issue.

Guardrails:
- Explore before implementation.
- Keep recommendations grounded in both the codebase and Linear state.
`,
  };
}

export function getJinnApplySkillTemplate(): SkillTemplate {
  return {
    name: 'jinn-apply',
    description: 'Use when executing implementation work from Linear issues and sub-issues.',
    license: 'MIT',
    compatibility: 'Requires jinn CLI and a configured Linear MCP server.',
    metadata: {
      author: 'jinn',
      version: '1.0',
      category: 'Workflow',
      tags: ['workflow', 'apply', 'linear', 'execute'],
    },
    instructions: `Implement work from Linear.

1. Select the relevant Linear project or Linear issue.
2. Read the next unblocked sub-issue.
3. Implement the change and verify it.
4. Update the Linear issue progress and state.
5. Continue until the selected Linear scope is complete or blocked.

Guardrails:
- Use Linear sub-issues as the execution queue.
- Pause on ambiguity or blockers instead of guessing.
`,
  };
}

export function getJinnArchiveSkillTemplate(): SkillTemplate {
  return {
    name: 'jinn-archive',
    description: 'Use when closing or cleaning up completed Linear projects, issues, and follow-up work.',
    license: 'MIT',
    compatibility: 'Requires jinn CLI and a configured Linear MCP server.',
    metadata: {
      author: 'jinn',
      version: '1.0',
      category: 'Workflow',
      tags: ['workflow', 'archive', 'linear', 'done'],
    },
    instructions: `Close completed Linear work.

1. Select the Linear project to close.
2. Review remaining open Linear issues and sub-issues.
3. Confirm what should be deferred versus completed.
4. Mark the Linear project complete and finish the relevant Linear issues.
5. Report any remaining follow-up work.

Guardrails:
- Use Linear state transitions instead of moving local folders.
- Surface incomplete items before closing the Linear project.
`,
  };
}

export function getReadyForProdSkillTemplate(): SkillTemplate {
  return {
    name: 'jinn-ready-for-prod',
    description: 'Use when validating production readiness before a release, deployment, or launch decision.',
    license: 'MIT',
    compatibility: 'Works with any project.',
    metadata: {
      author: 'jinn',
      version: '1.0',
      category: 'Quality',
      tags: ['quality', 'production', 'deployment', 'readiness'],
    },
    instructions: `Check production readiness before deployment.

## Production Readiness Checklist

### 1. Code Quality
- [ ] No console.log or debug statements
- [ ] No hardcoded secrets or keys
- [ ] Error handling in place
- [ ] TypeScript types correct

### 2. Testing
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Manual testing completed
- [ ] Edge cases covered

### 3. Security
- [ ] Input validation
- [ ] Authentication/authorization verified
- [ ] No security vulnerabilities
- [ ] Secrets not in code

### 4. Performance
- [ ] No memory leaks
- [ ] Load testing done if applicable
- [ ] Performance benchmarks met

### 5. Documentation
- [ ] README updated
- [ ] API docs updated
- [ ] Changelog updated

### 6. Deployment
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Rollback plan in place
- [ ] Monitoring and alerts configured

### 7. Business
- [ ] Feature complete per requirements
- [ ] Stakeholder sign-off
`,
  };
}
