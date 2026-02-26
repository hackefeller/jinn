import type { CommandDefinition } from "../../claude-code-command-loader";

export const NAME = "ghostwire:spec:clarify";
export const DESCRIPTION = "Interactive Q&A to resolve specification ambiguities";
export const TEMPLATE = `<command-instruction>
## Clarification: $FEATURE_NAME

**Branch**: \`$BRANCH_NAME\` | **Spec**: [.ghostwire/specs/$BRANCH_NAME/spec.md](../spec.md)  
**Status**: $CLARIFICATION_STATUS

---

## Current State

### [NEEDS CLARIFICATION] Markers Found: $MARKER_COUNT

$MARKERS_LIST

---

## Clarification Questions

$CLARIFICATION_QUESTIONS
</command-instruction>`;
export const ARGUMENT_HINT = "[path to spec.md or auto-detect from branch]";

export const COMMAND: CommandDefinition = {
  name: NAME,
  description: DESCRIPTION,
  template: TEMPLATE,
  argumentHint: ARGUMENT_HINT,
};
