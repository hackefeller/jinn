import type { AgentTemplate } from "../../core/templates/types.js";

import { getPlanAgentTemplate as planAgentTemplate } from "./kernel-plan/template.js";
import { getDoAgentTemplate as doAgentTemplate } from "./kernel-do/template.js";
import { getCaptureAgentTemplate as captureAgentTemplate } from "./kernel-capture/template.js";
import { getReviewAgentTemplate as reviewAgentTemplate } from "./kernel-review/template.js";
import { getArchitectAgentTemplate as architectAgentTemplate } from "./kernel-architect/template.js";
import { getDesignerAgentTemplate as designerAgentTemplate } from "./kernel-designer/template.js";
import { getGitAgentTemplate as gitAgentTemplate } from "./kernel-git/template.js";
import { getSearchAgentTemplate as searchAgentTemplate } from "./kernel-search/template.js";

export { getPlanAgentTemplate } from "./kernel-plan/template.js";
export { getDoAgentTemplate } from "./kernel-do/template.js";
export { getCaptureAgentTemplate } from "./kernel-capture/template.js";
export { getReviewAgentTemplate } from "./kernel-review/template.js";
export { getArchitectAgentTemplate } from "./kernel-architect/template.js";
export { getDesignerAgentTemplate } from "./kernel-designer/template.js";
export { getGitAgentTemplate } from "./kernel-git/template.js";
export { getSearchAgentTemplate } from "./kernel-search/template.js";

export const ALL_AGENTS: Array<() => AgentTemplate> = [
  planAgentTemplate,
  doAgentTemplate,
  captureAgentTemplate,
  reviewAgentTemplate,
  architectAgentTemplate,
  designerAgentTemplate,
  gitAgentTemplate,
  searchAgentTemplate,
];
