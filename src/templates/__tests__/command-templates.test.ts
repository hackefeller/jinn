import { describe, expect, it } from "bun:test";

import { getBuiltInCatalog } from "../../core/brain/catalog.js";
import { getDefaultCommandTemplates, getDefaultSkillTemplates } from "../catalog.js";
import { COMMAND_NAMES, SKILL_NAMES } from "../constants.js";

describe("command templates", () => {
  const commands = getDefaultCommandTemplates();
  const skillNames = new Set(getDefaultSkillTemplates().map((template) => template.name));

  it("registers the shipped system, workflow, and specialist commands", () => {
    const names = new Set(commands.map((command) => command.name));

    expect(names).toEqual(
      new Set([
        COMMAND_NAMES.INIT,
        COMMAND_NAMES.SYNC,
        COMMAND_NAMES.DOCTOR,
        COMMAND_NAMES.WORK_NEW,
        COMMAND_NAMES.WORK_PLAN,
        COMMAND_NAMES.WORK_NEXT,
        COMMAND_NAMES.WORK_DONE,
        COMMAND_NAMES.WORK_STATUS,
        COMMAND_NAMES.WORK_ARCHIVE,
        COMMAND_NAMES.GH_PR_ERRORS,
      ]),
    );
  });

  it("uses command templates as the built-in catalog source of truth", () => {
    expect(getBuiltInCatalog().commands).toEqual(commands);
  });

  it("keeps backedBySkill references valid", () => {
    for (const command of commands) {
      if (!command.backedBySkill) continue;
      expect(skillNames.has(command.backedBySkill)).toBe(true);
    }
  });

  it("assigns workflow targets for the local work lifecycle", () => {
    const workflowCommands = commands.filter((command) => command.group === "workflow");

    expect(new Set(workflowCommands.map((command) => command.target))).toEqual(
      new Set([
      "work new",
      "work plan",
      "work next",
      "work done",
      "work status",
      "work archive",
      ]),
    );
  });

  it("preserves gh-pr-errors intent and routing", () => {
    const command = commands.find((entry) => entry.name === COMMAND_NAMES.GH_PR_ERRORS);
    expect(command).toBeDefined();
    expect(command!.backedBySkill).toBe(SKILL_NAMES.GH_PR_ERRORS);
    expect(command!.instructions).toContain("Use the `kernel-gh-pr-errors` skill.");
    expect(command!.instructions).toContain("first actionable error");
    expect(command!.group).toBe("specialist");
  });

  it("removes legacy change and spec surfaces from command content", () => {
    for (const command of commands) {
      expect(command.name).not.toContain("kernel-change");
      expect(command.name).not.toContain("kernel-spec");
      expect(command.instructions).not.toContain("kernel-change-");
      expect(command.instructions).not.toContain("kernel-spec-");
      expect(command.instructions).not.toContain("AskUserQuestion");
      expect(command.instructions).not.toContain("TodoWrite");
      expect(command.instructions).not.toContain(".kernel/scripts");
      expect(command.instructions).not.toContain(".kernel/extensions.yml");
      expect(command.instructions).not.toContain(".specify/");
    }
  });
});
