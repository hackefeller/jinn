import type { SkillTemplate } from "../../../core/templates/types.js";
import { SKILL_NAMES } from "../../constants.js";
import { getSkillInstructions } from "../../.generated/templates.js";

export function getDeploySkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.DEPLOY,
    profile: "extended",
    description:
      "Validates production readiness, prompts for confirmation, then deploys with the right strategy: canary for high-risk, blue-green for routine releases, feature flags for incremental rollout. Use when deploying services, releasing a feature, coordinating database migrations, managing mobile builds, or diagnosing a deployment failure.",
    license: "MIT",
    compatibility: "Any project with staged deployments and CI/CD pipelines.",
    metadata: {
      author: "project",
      version: "2.0",
      category: "Engineering",
      tags: ["deploy", "deployment", "ci-cd", "railway", "testflight", "eas", "migrations", "rollback", "staging", "production"],
    },
    when: [
      "deploying a service to staging or production",
      "releasing a feature and need to validate readiness first",
      "coordinating a database migration with an application release",
      "managing a mobile build for TestFlight or the App Store",
      "diagnosing a deployment failure or deciding to roll back",
      "choosing a deployment strategy for a high-risk change",
      "user asks 'is this ready to ship?' or 'can we deploy?'",
    ],
    applicability: [
      "Use before and during any environment deployment",
      "Use when a release includes schema changes that must precede code deployment",
      "Use when a deployment failed and needs diagnosis or rollback",
    ],
    termination: [
      "Pre-deployment checklist passed",
      "Migrations applied before code deployment",
      "Service deployed and health check passes",
      "Error rates and latency within acceptable range post-deploy",
      "Or: rollback completed and root cause identified",
    ],
    outputs: [
      "Deployed service in target environment",
      "Post-deployment verification results",
      "Or: rollback confirmation + root cause",
    ],
    dependencies: [],
    disableModelInvocation: true,
    instructions: getSkillInstructions(SKILL_NAMES.DEPLOY),
  };
}
