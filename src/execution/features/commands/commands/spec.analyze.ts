import type { CommandDefinition } from "../../claude-code-command-loader";

export const NAME = "ghostwire:spec:analyze";
export const DESCRIPTION = "Cross-artifact consistency validation";
export const TEMPLATE = `<command-instruction>
## Analysis: $FEATURE_NAME

**Branch**: \`$BRANCH_NAME\` | **Artifacts**: .ghostwire/specs/$BRANCH_NAME/

---

## Artifact Inventory

| Artifact | Status | Issues |
|----------|--------|--------|
| spec.md | $SPEC_STATUS | $SPEC_ISSUES |
| plan.md | $PLAN_STATUS | $PLAN_ISSUES |
| tasks.md | $TASKS_STATUS | $TASKS_ISSUES |
| research.md | $RESEARCH_STATUS | $RESEARCH_ISSUES |
| data-model.md | $DATA_MODEL_STATUS | $DATA_MODEL_ISSUES |
| contracts/ | $CONTRACTS_STATUS | $CONTRACTS_ISSUES |
| quickstart.md | $QUICKSTART_STATUS | $QUICKSTART_ISSUES |

---

## Cross-Artifact Consistency Check
</command-instruction>`;
export const ARGUMENT_HINT = "[path to feature directory or auto-detect from branch]";

export const COMMAND: CommandDefinition = {
  name: NAME,
  description: DESCRIPTION,
  template: TEMPLATE,
  argumentHint: ARGUMENT_HINT,
};
