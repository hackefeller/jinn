import type { AgentTemplate, SkillTemplate } from "../core/templates/types.js";
import type { Profile } from "../core/config/schema.js";
import { ALL_AGENTS } from "./agents/index.js";

// Code skills
import { getDesignSkillTemplate } from "./skills/kernel-design/template.js";
import { getCodeQualitySkillTemplate } from "./skills/kernel-code-quality/template.js";
import { getDevEnvironmentSkillTemplate } from "./skills/kernel-dev-environment/template.js";
import { getProjectInitSkillTemplate } from "./skills/kernel-project-init/template.js";
import { getBuildSkillTemplate } from "./skills/kernel-build/template.js";
import { getDeploySkillTemplate } from "./skills/kernel-deploy/template.js";
import { getConventionsSkillTemplate } from "./skills/kernel-conventions/template.js";
import { getMapCodebaseSkillTemplate } from "./skills/kernel-map-codebase/template.js";

// Git skills
import { getGitMasterSkillTemplate } from "./skills/kernel-git-master/template.js";

// Workflow skills
import { getApplySkillTemplate } from "./skills/kernel-apply/template.js";
import { getArchiveSkillTemplate } from "./skills/kernel-archive/template.js";
import { getCheckSkillTemplate } from "./skills/kernel-check/template.js";
import { getExploreSkillTemplate } from "./skills/kernel-explore/template.js";
import { getProposeSkillTemplate } from "./skills/kernel-propose/template.js";
import { getReadyForProdSkillTemplate } from "./skills/kernel-ready-for-prod/template.js";
import { getReviewSkillTemplate } from "./skills/kernel-review/template.js";
import { getSyncSkillTemplate } from "./skills/kernel-sync/template.js";
import { getTriageSkillTemplate } from "./skills/kernel-triage/template.js";

// Docs skills
import { getDocsWorkflowSkillTemplate } from "./skills/kernel-docs-workflow/template.js";

// Support skills
import { getUnblockSkillTemplate } from "./skills/kernel-unblock/template.js";

export function getDefaultSkillTemplates(profile: Profile = "extended"): SkillTemplate[] {
  const all = [
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

  if (profile === "core") {
    return all.filter((t) => t.profile === "core");
  }
  return all;
}

export function getDefaultAgentTemplates(profile: Profile = "extended"): AgentTemplate[] {
  const all = ALL_AGENTS.map((getAgentTemplate) => getAgentTemplate());
  if (profile === "core") {
    return all.filter((t) => t.profile === "core");
  }
  return all;
}
