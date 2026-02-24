import type { CommandDefinition } from "../../claude-code-command-loader";

export const NAME = "ghostwire:spec:to-issues";
export const DESCRIPTION = "Convert tasks to GitHub issues";
export const TEMPLATE = `<command-instruction>
## Convert Tasks to GitHub Issues: $FEATURE_NAME

**Branch**: \`$BRANCH_NAME\` | **Tasks**: [.ghostwire/specs/$BRANCH_NAME/tasks.md](../tasks.md)

---

## Task Summary

| Phase | Tasks | Converted |
|-------|-------|-----------|
| Setup | $SETUP_COUNT | $SETUP_CONVERTED |
| Foundational | $FOUNDATIONAL_COUNT | $FOUNDATIONAL_CONVERTED |
$USER_STORY_SUMMARY
| Polish | $POLISH_COUNT | $POLISH_CONVERTED |

**Total**: $TOTAL_TASKS tasks → $TOTAL_ISSUES issues

---

## Issue Creation Plan
</command-instruction>`;
export const ARGUMENT_HINT = "[path to tasks.md or auto-detect from branch]";

export const COMMAND: CommandDefinition = {
  name: NAME,
  description: DESCRIPTION,
  template: TEMPLATE,
  argumentHint: ARGUMENT_HINT,
};