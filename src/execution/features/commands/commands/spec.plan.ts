import type { CommandDefinition } from "../../claude-code-command-loader";

export const NAME = "ghostwire:spec:plan";
export const DESCRIPTION = "Create implementation plan from feature specification";
export const TEMPLATE = `<command-instruction>
# Implementation Plan: $FEATURE_NAME

**Branch**: \`[$FEATURE_NUM-$FEATURE_SHORT_NAME]\` | **Date**: $TIMESTAMP | **Spec**: [.ghostwire/specs/$BRANCH_NAME/spec.md](../spec.md)
**Input**: Feature specification from \`/ghostwire/specs/$BRANCH_NAME/spec.md\`

---

## Summary

$SUMMARY

## Technical Context

**Language/Version**: $TECH_LANGUAGE  
**Primary Dependencies**: $TECH_DEPENDENCIES  
**Storage**: $TECH_STORAGE  
**Testing**: $TECH_TESTING  
**Target Platform**: $TECH_PLATFORM  
**Project Type**: $TECH_PROJECT_TYPE  
**Performance Goals**: $TECH_PERFORMANCE  
**Constraints**: $TECH_CONSTRAINTS  
**Scale/Scope**: $TECH_SCALE

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

$CONSTITUTION_GATES

## Project Structure

### Documentation (this feature)

\`\`\`
.ghostwire/specs/$BRANCH_NAME/
├── plan.md              # This file (/ghostwire:spec:plan output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/ghostwire:spec:tasks)
\`\`\`

### Source Code (repository root)

$SOURCE_STRUCTURE

**Structure Decision**: $STRUCTURE_DECISION

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| $COMPLEXITY_VIOLATION_1 | $VIOLATION_REASON_1 | $ALTERNATIVE_REJECTED_1 |

## Phases

### Phase 0: Research

**Goal**: Resolve all NEEDS CLARIFICATION from Technical Context

**Tasks**:
- [ ] Research $RESEARCH_TOPIC_1
- [ ] Research $RESEARCH_TOPIC_2
- [ ] Document decisions in research.md

**Output**: research.md with all clarifications resolved

### Phase 1: Design & Contracts

**Prerequisites**: research.md complete

**Tasks**:
- [ ] Extract entities → data-model.md
- [ ] Generate API contracts → contracts/
- [ ] Create quickstart.md
- [ ] Update agent context

**Output**: data-model.md, contracts/, quickstart.md

### Phase 2: Task Generation

**Prerequisites**: All design artifacts complete

**Tasks**:
- [ ] Run \`/ghostwire:spec:tasks\` to generate tasks.md

**Output**: tasks.md with executable task breakdown

---

**Next**: Run \`/ghostwire:spec:tasks\` to create executable task list
</command-instruction>`;
export const ARGUMENT_HINT = "[path to spec.md or auto-detect from branch]";

export const COMMAND: CommandDefinition = {
  name: NAME,
  description: DESCRIPTION,
  template: TEMPLATE,
  argumentHint: ARGUMENT_HINT,
};