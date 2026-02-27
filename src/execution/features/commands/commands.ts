import type { CommandDefinition } from "../claude-code-command-loader";
import type { CommandName, Commands } from "./types";
import { COMMANDS_MANIFEST } from "./commands-manifest";

/**
 * Wrap template content with command-instruction tags
 */
function wrapTemplate(template: string): string {
  // Already wrapped - skip
  if (template.includes("<command-instruction>")) {
    return template;
  }
  return `<command-instruction>
${template}
</command-instruction>`;
}

export const COMMAND_DEFINITIONS: Record<
  CommandName,
  Omit<CommandDefinition, "name">
> = COMMANDS_MANIFEST.reduce(
  (acc, entry) => {
    acc[entry.name as CommandName] = {
      ...entry.command,
      template: wrapTemplate(entry.command.template),
    };
    return acc;
  },
  {} as Record<CommandName, Omit<CommandDefinition, "name">>,
);

export function loadCommands(disabledCommands?: CommandName[]): Commands {
  const disabled = new Set(disabledCommands ?? []);
  const commands: Commands = {};

  for (const [name, definition] of Object.entries(COMMAND_DEFINITIONS)) {
    if (!disabled.has(name as CommandName)) {
      const { argumentHint: _argumentHint, ...openCodeCompatible } = definition;
      commands[name] = { ...openCodeCompatible, name } as CommandDefinition;
    }
  }

  return commands;
}
