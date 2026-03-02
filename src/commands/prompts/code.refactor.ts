import type { CommandDefinition } from "../../command-loader";
import { CODE_REFACTOR_TEMPLATE } from "../templates/code";

export const NAME = "ghostwire:code:refactor";
export const DESCRIPTION = "Systematically refactor code while maintaining functionality";
export const TEMPLATE = CODE_REFACTOR_TEMPLATE;
export const ARGUMENT_HINT = "<target> [--scope=file|module|project] [--strategy=safe|aggressive]";
export const COMMAND: CommandDefinition = {
  name: NAME,
  description: DESCRIPTION,
  template: TEMPLATE,
  argumentHint: ARGUMENT_HINT,
};
