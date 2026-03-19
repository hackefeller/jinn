import type { AgentTemplate, SkillTemplate } from "../core/templates/types.js";
import { getDoAgentTemplate, getPlanAgentTemplate } from "./agents/index.js";
import { getFrontendDesignSkillTemplate, getGitMasterSkillTemplate } from "./skills/index.js";
import {
  getJinnApplySkillTemplate,
  getJinnArchiveSkillTemplate,
  getJinnExploreSkillTemplate,
  getJinnProposeSkillTemplate,
  getJinnSyncSkillTemplate,
  getJinnTriageSkillTemplate,
  getJinnUnblockSkillTemplate,
  getReadyForProdSkillTemplate,
} from "./skills/skills.js";
import { getCodeQualitySkillTemplate } from "./skills/code.js";
import { getProjectWorkflowSkillTemplate } from "./skills/project.js";
import { getDocsWorkflowSkillTemplate } from "./skills/docs.js";
import { getDevEnvironmentSkillTemplate } from "./skills/dev.js";
import { getWorkflowPrimitivesSkillTemplate } from "./skills/workflow.js";

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
    getProjectWorkflowSkillTemplate(),
    getDocsWorkflowSkillTemplate(),
    getDevEnvironmentSkillTemplate(),
    getWorkflowPrimitivesSkillTemplate(),
  ];
}

export function getDefaultAgentTemplates(): AgentTemplate[] {
  return [getDoAgentTemplate(), getPlanAgentTemplate()];
}
