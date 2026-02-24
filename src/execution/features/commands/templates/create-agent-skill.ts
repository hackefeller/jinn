export const CREATE_AGENT_SKILL_TEMPLATE = `<command-instruction>
Invoke the create-agent-skills skill for: $ARGUMENTS
</command-instruction>

<skill-context>
$ARGUMENTS
</skill-context>`;
