import type { CommandDefinition } from "../../execution/command-loader";
import { PROJECT_MAP_TEMPLATE } from "../templates/project.map";

export const NAME = "ghostwire:project:map";

export const DESCRIPTION =
  "Map project structure and generate hierarchical AGENTS.md knowledge base";

export const TEMPLATE = PROJECT_MAP_TEMPLATE;

export const ARGUMENT_HINT = "[--create-new] [--max-depth=N]";
export const COMMAND: CommandDefinition = {
  name: NAME,
  description: DESCRIPTION,
  template: TEMPLATE,
  argumentHint: ARGUMENT_HINT,
};
