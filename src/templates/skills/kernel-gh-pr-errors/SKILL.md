---
name: kernel-gh-pr-errors
kind: skill
tags:
  - git
  - debugging
profile: extended
description: Inspect the latest GitHub Actions failure details for the open pull
  request on the current branch. Use when CI is failing on the active branch and
  you need the newest failed step logs and the first actionable error.
license: MIT
compatibility: Requires gh CLI with an authenticated session.
metadata:
  author: kernel
  version: "1.0"
  category: Workflow
  tags:
    - github
    - actions
    - ci
    - pull-request
    - errors
when:
  - the user asks why the current pull request is failing in CI
  - the user wants the latest GitHub Actions errors for the active branch
  - you need failed step logs from the newest pull request workflow run
termination:
  - Latest run metadata is surfaced
  - The current run state is reported accurately
  - If the run failed, the first actionable error is summarized
outputs:
  - Compact CI status summary
  - First actionable GitHub Actions failure
disableModelInvocation: true
argumentHint: optional branch or PR context
allowedTools:
  - Bash
  - Read
  - Grep
  - Glob
---

# GH PR Errors

## When to Use

- The user wants the latest GitHub Actions errors for the current branch.
- The user asks why the open pull request is failing in CI.
- You need the failed step logs from the most recent pull request workflow run.

## Workflow

1. Run `.claude/skills/kernel-gh-pr-errors/scripts/check-last-gh-actions-errors.sh` from the repo root.
2. If `gh` is missing or unauthenticated, stop and tell the user exactly what is missing.
3. If the current branch has no open pull request, stop and report that.
4. If no pull request workflow runs exist yet, stop and report that.
5. Surface the PR URL, branch pair, workflow name, status, conclusion, commit, and start time.
6. If the latest run is still in progress, tell the user there are no completed errors yet.
7. If the latest run succeeded, say that clearly.
8. If the latest run failed, summarize the failed logs and call out the first actionable error.

## Notes

- Prefer the bundled script over reimplementing the `gh` query flow in ad hoc shell.
- Fall back from `gh run view --log-failed` to `gh run view --log` when GitHub cannot scope failed logs.
