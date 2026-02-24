export const HOOK_NAME = "auto-slash-command" as const;

export const AUTO_SLASH_COMMAND_TAG_OPEN = "<grid-auto-slash-command>";
export const AUTO_SLASH_COMMAND_TAG_CLOSE = "</grid-auto-slash-command>";

export const SLASH_COMMAND_PATTERN = /^\/([a-zA-Z][\w:]*(?:[\w-][\w:]*)*)\s*(.*)/;

export const EXCLUDED_COMMANDS = new Set([
  // Work loop commands (old and new names)
  "ghostwire:ultrawork-loop",
  "ghostwire:work:loop",
  "ghostwire:cancel-ultrawork",
  "ghostwire:work:cancel",
]);
