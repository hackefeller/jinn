import type { CommandDefinition } from "../../claude-code-command-loader";

export const NAME = "ghostwire:spec:checklist";
export const DESCRIPTION = "Generate domain-specific checklists";
export const TEMPLATE = `<command-instruction>
---
description: "Checklist for $DOMAIN: $FEATURE_NAME"
---

# Checklist: $FEATURE_NAME ($DOMAIN)

**Created**: $TIMESTAMP  
**Domain**: $DOMAIN  
**Feature**: [.ghostwire/specs/$BRANCH_NAME/spec.md](../spec.md)

---

## $DOMAIN Checklist

$CHECKLIST_ITEMS

---

## Usage

1. Review each item before implementation
2. Mark items as complete: \`- [x]\`
</command-instruction>`;
export const ARGUMENT_HINT = "[domain] [feature name] (e.g., 'security user-auth')";

export const COMMAND: CommandDefinition = {
  name: NAME,
  description: DESCRIPTION,
  template: TEMPLATE,
  argumentHint: ARGUMENT_HINT,
};