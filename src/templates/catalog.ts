import type { AgentTemplate, SkillTemplate } from "../core/templates/types.js";
import { getDoAgentTemplate, getPlanAgentTemplate, getCaptureAgentTemplate } from "./agents/index.js";
import { getFrontendDesignSkillTemplate } from "./skills/code/jinn-frontend-design.js";
import { getGitMasterSkillTemplate } from "./skills/git/jinn-git-master.js";
import { getJinnApplySkillTemplate } from "./skills/workflow/jinn-apply.js";
import { getJinnArchiveSkillTemplate } from "./skills/workflow/jinn-archive.js";
import { getCodeQualitySkillTemplate } from "./skills/code/jinn-code-quality.js";
import { getDevEnvironmentSkillTemplate } from "./skills/code/jinn-dev-environment.js";
import { getDocsWorkflowSkillTemplate } from "./skills/docs/jinn-docs-workflow.js";
import { getJinnExploreSkillTemplate } from "./skills/workflow/jinn-explore.js";
import { getJinnProposeSkillTemplate } from "./skills/workflow/jinn-propose.js";
import { getReadyForProdSkillTemplate } from "./skills/workflow/jinn-ready-for-prod.js";
import { getJinnSyncSkillTemplate } from "./skills/workflow/jinn-sync.js";
import { getJinnTriageSkillTemplate } from "./skills/workflow/jinn-triage.js";
import { getJinnUnblockSkillTemplate } from "./skills/support/jinn-unblock.js";

export function getDefaultSkillTemplates(): SkillTemplate[] {
  return [
    getGitMasterSkillTemplate(),
    getFrontendDesignSkillTemplate(),
    getJinnProposeSkillTemplate(),
    getJinnExploreSkillTemplate(),
    getJinnApplySkillTemplate(),
    getJinnArchiveSkillTemplate(),
    getReadyForProdSkillTemplate(),
    getJinnSyncSkillTemplate(),
    getJinnTriageSkillTemplate(),
    getJinnUnblockSkillTemplate(),
    getCodeQualitySkillTemplate(),
    getDocsWorkflowSkillTemplate(),
    getDevEnvironmentSkillTemplate(),
  ];
}

export function getDefaultAgentTemplates(): AgentTemplate[] {
  return [getDoAgentTemplate(), getPlanAgentTemplate(), getCaptureAgentTemplate()];
}
