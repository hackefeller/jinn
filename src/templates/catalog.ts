import type { AgentTemplate, SkillTemplate } from "../core/templates/types.js";
import { ALL_AGENTS } from "./agents/index.js";

// Code skills
import { getDesignSkillTemplate } from "./skills/design/template.js";
import { getCodeQualitySkillTemplate } from "./skills/code-quality/template.js";
import { getDevEnvironmentSkillTemplate } from "./skills/dev-environment/template.js";
import { getProjectInitSkillTemplate } from "./skills/project-init/template.js";
import { getBuildSkillTemplate } from "./skills/build/template.js";
import { getDeploySkillTemplate } from "./skills/deploy/template.js";
import { getConventionsSkillTemplate } from "./skills/conventions/template.js";
import { getMapCodebaseSkillTemplate } from "./skills/map-codebase/template.js";

// Git skills
import { getGitMasterSkillTemplate } from "./skills/git-master/template.js";

// Workflow skills
import { getApplySkillTemplate } from "./skills/apply/template.js";
import { getArchiveSkillTemplate } from "./skills/archive/template.js";
import { getCheckSkillTemplate } from "./skills/check/template.js";
import { getExploreSkillTemplate } from "./skills/explore/template.js";
import { getProposeSkillTemplate } from "./skills/propose/template.js";
import { getReadyForProdSkillTemplate } from "./skills/ready-for-prod/template.js";
import { getReviewSkillTemplate } from "./skills/review/template.js";
import { getSyncSkillTemplate } from "./skills/sync/template.js";
import { getTriageSkillTemplate } from "./skills/triage/template.js";

// Docs skills
import { getDocsWorkflowSkillTemplate } from "./skills/docs-workflow/template.js";

// Support skills
import { getUnblockSkillTemplate } from "./skills/unblock/template.js";

export function getDefaultSkillTemplates(): SkillTemplate[] {
  return [
    // Design
    getDesignSkillTemplate(),

    // Code quality and tooling
    getCodeQualitySkillTemplate(),
    getConventionsSkillTemplate(),
    getBuildSkillTemplate(),
    getDeploySkillTemplate(),
    getProjectInitSkillTemplate(),
    getDevEnvironmentSkillTemplate(),
    getMapCodebaseSkillTemplate(),

    // Git
    getGitMasterSkillTemplate(),

    // Workflow
    getProposeSkillTemplate(),
    getExploreSkillTemplate(),
    getApplySkillTemplate(),
    getCheckSkillTemplate(),
    getReviewSkillTemplate(),
    getArchiveSkillTemplate(),
    getReadyForProdSkillTemplate(),
    getSyncSkillTemplate(),
    getTriageSkillTemplate(),

    // Docs
    getDocsWorkflowSkillTemplate(),

    // Support
    getUnblockSkillTemplate(),
  ];
}

export function getDefaultAgentTemplates(): AgentTemplate[] {
  return ALL_AGENTS.map((getAgentTemplate) => getAgentTemplate());
}
