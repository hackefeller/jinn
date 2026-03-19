import type { AgentTemplate } from "../../core/templates/types.js";

import { getPlanAgentTemplate as planAgentTemplate } from "./orchestrators/jinn-plan.js";
import { getDoAgentTemplate as doAgentTemplate } from "./orchestrators/jinn-do.js";
import { getCaptureAgentTemplate as captureAgentTemplate } from "./orchestrators/jinn-capture.js";
import { getReviewAgentTemplate as reviewAgentTemplate } from "./specialists/jinn-review.js";
import { getArchitectAgentTemplate as architectAgentTemplate } from "./specialists/jinn-architect.js";
import { getDesignerAgentTemplate as designerAgentTemplate } from "./specialists/jinn-designer.js";
import { getGitAgentTemplate as gitAgentTemplate } from "./specialists/jinn-git.js";
import { getSearchAgentTemplate as searchAgentTemplate } from "./specialists/jinn-search.js";

export { getPlanAgentTemplate } from "./orchestrators/jinn-plan.js";
export { getDoAgentTemplate } from "./orchestrators/jinn-do.js";
export { getCaptureAgentTemplate } from "./orchestrators/jinn-capture.js";
export { getReviewAgentTemplate } from "./specialists/jinn-review.js";
export { getArchitectAgentTemplate } from "./specialists/jinn-architect.js";
export { getDesignerAgentTemplate } from "./specialists/jinn-designer.js";
export { getGitAgentTemplate } from "./specialists/jinn-git.js";
export { getSearchAgentTemplate } from "./specialists/jinn-search.js";

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
