---
title: 'Example: Implement Dark Mode Feature'
type: example
date: '2026-02-24'
status: example
framework: Task-Driven Workflow Architecture
---

# Example: Implement Dark Mode Feature


---

## Summary

This plan demonstrates the new task-driven workflow architecture with structured task breakdown, automatic parallelization, and intelligent delegation. Use this as a reference when implementing your own features with `/ghostwire:workflows:create`.

## Feature Description

Add dark mode toggle to a React application with:

- Settings page toggle switch
- CSS theme variables
- Local storage persistence
- System preference detection
- All existing components updated

## Task List (Structured JSON Format)

The tasks below are in **JSON format** suitable for parsing and delegation to subagents. Each task has metadata enabling:

- **Automatic parallelization** (tasks without dependencies run in parallel)
- **Intelligent delegation** (tasks assigned to appropriate agent categories)
- **Progress tracking** (status updates as work progresses)
- **Cross-session resumption** (pick up where you left off)

```json
{
  "tasks": [
    {
      "id": "task-001",
      "subject": "Create dark mode theme CSS variables",
      "description": "Set up CSS custom properties for dark/light themes (colors, spacing, shadows). Define in a variables.css file that can be toggled via a data-theme attribute on the root element.",
      "category": "visual-engineering",
      "skills": ["frontend-ui-ux"],
      "estimatedEffort": "45m",
      "status": "pending",
      "blockedBy": [],
      "blocks": ["task-003", "task-004", "task-005"],
      "wave": 1,
      "createdAt": "2026-02-24T00:00:00Z"
    },
    {
      "id": "task-002",
      "subject": "Build theme context and hook",
      "description": "Create React Context for theme state management. Build useTheme hook that provides currentTheme and toggleTheme. Include logic to detect and persist user preference via localStorage.",
      "category": "visual-engineering",
      "skills": ["frontend-ui-ux"],
      "estimatedEffort": "1h",
      "status": "pending",
      "blockedBy": [],
      "blocks": ["task-003", "task-005"],
      "wave": 1,
      "createdAt": "2026-02-24T00:00:00Z"
    },
    {
      "id": "task-003",
      "subject": "Implement theme toggle in settings page",
      "description": "Add a toggle switch component in the Settings page that uses the useTheme hook. Component should show current theme state and allow user to switch between light and dark modes.",
      "category": "visual-engineering",
      "skills": ["frontend-ui-ux"],
      "estimatedEffort": "30m",
      "status": "pending",
      "blockedBy": ["task-001", "task-002"],
      "blocks": ["task-006"],
      "wave": 2,
      "createdAt": "2026-02-24T00:00:00Z"
    },
    {
      "id": "task-004",
      "subject": "Update component library with theme support",
      "description": "Audit all existing components (Button, Card, Input, etc.) and update them to use theme CSS variables instead of hardcoded colors. Ensure components respect the current theme.",
      "category": "visual-engineering",
      "skills": ["frontend-ui-ux"],
      "estimatedEffort": "2h",
      "status": "pending",
      "blockedBy": ["task-001"],
      "blocks": ["task-006"],
      "wave": 2,
      "createdAt": "2026-02-24T00:00:00Z"
    },
    {
      "id": "task-005",
      "subject": "Add system preference detection",
      "description": "Implement detection of user's system dark mode preference using prefers-color-scheme media query. Default theme should match system preference on first visit, then respect user's manual selection.",
      "category": "visual-engineering",
      "skills": ["frontend-ui-ux"],
      "estimatedEffort": "45m",
      "status": "pending",
      "blockedBy": ["task-001", "task-002"],
      "blocks": ["task-006"],
      "wave": 2,
      "createdAt": "2026-02-24T00:00:00Z"
    },
    {
      "id": "task-006",
      "subject": "Write tests for dark mode functionality",
      "description": "Write unit and integration tests covering: theme toggle functionality, persistence, system preference detection, component theme updates. Verify all pages render correctly in both light and dark modes.",
      "category": "quick",
      "skills": [],
      "estimatedEffort": "1.5h",
      "status": "pending",
      "blockedBy": ["task-003", "task-004", "task-005"],
      "blocks": ["task-007"],
      "wave": 3,
      "createdAt": "2026-02-24T00:00:00Z"
    },
    {
      "id": "task-007",
      "subject": "Create dark mode documentation",
      "description": "Document the dark mode feature for users: how to toggle, what browsers support it, note about system preference detection. Include screenshots of both light and dark modes.",
      "category": "writing",
      "skills": [],
      "estimatedEffort": "1h",
      "status": "pending",
      "blockedBy": ["task-006"],
      "blocks": [],
      "wave": 4,
      "createdAt": "2026-02-24T00:00:00Z"
    }
  ]
}
```

---

## Execution Waves

The system automatically calculated these execution waves based on task dependencies:

**Wave 1** (Parallel): Setup phase

- task-001: Create dark mode theme CSS variables
- task-002: Build theme context and hook

**Wave 2** (Parallel): Component updates

- task-003: Implement theme toggle in settings page
- task-004: Update component library with theme support
- task-005: Add system preference detection

**Wave 3** (Sequential): Testing

- task-006: Write tests for dark mode functionality

**Wave 4** (Sequential): Documentation

- task-007: Create dark mode documentation

---

## Delegation Strategy

### Wave 1 Tasks

- **task-001** → `visual-engineering` agent (CSS/styling expert)
- **task-002** → `visual-engineering` agent (React/hooks expert)

### Wave 2 Tasks

- **task-003** → `visual-engineering` agent (UI component expert)
- **task-004** → `visual-engineering` agent (component updates)
- **task-005** → `visual-engineering` agent (browser APIs expert)

### Wave 3 Tasks

- **task-006** → `quick` agent (straightforward testing)

### Wave 4 Tasks

- **task-007** → `writing` agent (documentation specialist)

---

## Execution Instructions

To execute this plan with the task-driven workflow:

```bash
# 1. Create the workflow (generates task breakdown)
/ghostwire:workflows:create "Implement dark mode feature"

# 2. Check workflow status
/ghostwire:workflows:status

# 3. Execute the plan (automatically parallelizes and delegates tasks)
/ghostwire:workflows:execute

# 4. Monitor progress
/ghostwire:workflows:status

# 5. Complete the workflow when done
/ghostwire:workflows:complete
```

---

## Key Features Demonstrated

### 1. Structured Task Metadata

Each task includes:

- `id`: Unique identifier
- `subject`: One-line title
- `description`: Detailed description suitable for subagent execution
- `category`: Delegation category (visual-engineering, quick, writing, etc.)
- `skills`: Custom skills this task needs
- `estimatedEffort`: Time estimate (45m, 1h, 2h, etc.)
- `status`: Current status (pending → in_progress → completed)
- `blockedBy`: Tasks that must complete first
- `blocks`: Tasks waiting on this one
- `wave`: Auto-calculated execution wave

### 2. Automatic Parallelization

Tasks with no dependencies execute in parallel (Wave 1):

- Both task-001 and task-002 can run simultaneously
- Saves ~1h 45m of execution time
- System automatically groups independent work

### 3. Intelligent Delegation

Tasks automatically routed to appropriate agents:

- UI/styling work → `visual-engineering` agent
- Simple testing → `quick` agent (cheaper)
- Documentation → `writing` agent (specialized)

### 4. Progress Tracking

Status updates tracked across sessions:

- Pick up where you left off
- View which tasks completed
- Know which tasks are in progress
- Clear visibility into overall progress

---

## How to Use This Example

1. **Copy this file as a template** when starting new features
2. **Adjust task breakdown** for your specific feature
3. **Assign appropriate categories** based on task type
4. **Let the system auto-parallelize** based on dependencies
5. **Run `/ghostwire:workflows:execute`** to start

The system will:

- Parse the JSON task structure
- Validate dependencies (no circular dependencies)
- Calculate optimal execution waves
- Delegate individual tasks to appropriate agents
- Track progress and allow resumption

---

## Expected Outcome

After completing this workflow:

- ✅ Dark mode CSS variables defined and tested
- ✅ React Context and hook implemented
- ✅ Theme toggle in settings page
- ✅ All components updated to support themes
- ✅ System preference detection working
- ✅ Full test coverage for dark mode
- ✅ User documentation complete

**Total Estimated Time**: ~7 hours (with parallelization)  
**Parallelization Benefit**: ~2 hours saved by running Wave 2 tasks in parallel

---

## Reference

- Task-Driven Architecture Guide: `.ghostwire/TASK_DRIVEN_ARCHITECTURE_GUIDE.md`
- Command Reference: See `/ghostwire:workflows:help` or AGENTS.md
- Agent Categories: See AGENTS.md "Delegation Categories" section
