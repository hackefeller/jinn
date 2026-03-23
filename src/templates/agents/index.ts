import type { AgentTemplate } from "../../core/templates/types.js";

import { getPlanAgentTemplate as planAgentTemplate } from "./plan/template.js";
import { getDoAgentTemplate as doAgentTemplate } from "./do/template.js";
import { getCaptureAgentTemplate as captureAgentTemplate } from "./capture/template.js";
import { getReviewAgentTemplate as reviewAgentTemplate } from "./review/template.js";
import { getArchitectAgentTemplate as architectAgentTemplate } from "./architect/template.js";
import { getDesignerAgentTemplate as designerAgentTemplate } from "./designer/template.js";
import { getGitAgentTemplate as gitAgentTemplate } from "./git/template.js";
import { getSearchAgentTemplate as searchAgentTemplate } from "./search/template.js";

export { getPlanAgentTemplate } from "./plan/template.js";
export { getDoAgentTemplate } from "./do/template.js";
export { getCaptureAgentTemplate } from "./capture/template.js";
export { getReviewAgentTemplate } from "./review/template.js";
export { getArchitectAgentTemplate } from "./architect/template.js";
export { getDesignerAgentTemplate } from "./designer/template.js";
export { getGitAgentTemplate } from "./git/template.js";
export { getSearchAgentTemplate } from "./search/template.js";

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
