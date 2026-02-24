import type { CommandDefinition } from "../../claude-code-command-loader";

export const NAME = "ghostwire:spec:implement";
export const DESCRIPTION = "Execute all tasks from task breakdown";
export const TEMPLATE = `<command-instruction>
## Implementation: $FEATURE_NAME

**Branch**: \`$BRANCH_NAME\` | **Plan**: [.ghostwire/specs/$BRANCH_NAME/plan.md](../plan.md) | **Tasks**: [.ghostwire/specs/$BRANCH_NAME/tasks.md](../tasks.md)

---

## Pre-Implementation Checklist

### Checklist Status

$CHECKLIST_STATUS_TABLE

$CHECKLIST_WARNING

### Prerequisites Loaded

✅ **tasks.md**: $TASKS_LOADED tasks identified  
✅ **plan.md**: Tech stack: $TECH_STACK  
$OPTIONAL_PREREQS

### Project Setup Verification

$IGNORE_FILES_STATUS

---

## Implementation Execution

### Phase 1: Setup

$PHASE_1_TASKS

### Phase 2: Foundational

$PHASE_2_TASKS

### Phase 3+: User Stories

$USER_STORY_IMPLEMENTATIONS

### Final Phase: Polish
</command-instruction>`;
export const ARGUMENT_HINT = "[path to tasks.md or auto-detect from branch]";

export const COMMAND: CommandDefinition = {
  name: NAME,
  description: DESCRIPTION,
  template: TEMPLATE,
  argumentHint: ARGUMENT_HINT,
};