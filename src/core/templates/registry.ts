/**
 * Template registry
 *
 * Central registry for managing command, skill, and agent templates.
 */

import type { CommandTemplate, SkillTemplate, AgentTemplate, TemplateEntry } from './types.js';

class TemplateRegistryImpl {
  private commands: Map<string, TemplateEntry<CommandTemplate>> = new Map();
  private skills: Map<string, TemplateEntry<SkillTemplate>> = new Map();
  private agents: Map<string, TemplateEntry<AgentTemplate>> = new Map();

  registerCommand(entry: TemplateEntry<CommandTemplate>): void {
    this.commands.set(entry.id, entry);
  }

  getCommand(id: string): CommandTemplate | undefined {
    const entry = this.commands.get(id);
    return entry?.template();
  }

  getAllCommands(): TemplateEntry<CommandTemplate>[] {
    return Array.from(this.commands.values());
  }

  getCoreCommands(): TemplateEntry<CommandTemplate>[] {
    return this.getAllCommands().filter((cmd) => cmd.isCore);
  }

  registerSkill(entry: TemplateEntry<SkillTemplate>): void {
    this.skills.set(entry.id, entry);
  }

  getSkill(id: string): SkillTemplate | undefined {
    const entry = this.skills.get(id);
    return entry?.template();
  }

  getAllSkills(): TemplateEntry<SkillTemplate>[] {
    return Array.from(this.skills.values());
  }

  getCoreSkills(): TemplateEntry<SkillTemplate>[] {
    return this.getAllSkills().filter((skill) => skill.isCore);
  }

  registerAgent(entry: TemplateEntry<AgentTemplate>): void {
    this.agents.set(entry.id, entry);
  }

  getAgent(id: string): AgentTemplate | undefined {
    const entry = this.agents.get(id);
    return entry?.template();
  }

  getAllAgents(): TemplateEntry<AgentTemplate>[] {
    return Array.from(this.agents.values());
  }

  getCoreAgents(): TemplateEntry<AgentTemplate>[] {
    return this.getAllAgents().filter((agent) => agent.isCore);
  }
}

export interface TemplateRegistry {
  registerCommand(entry: TemplateEntry<CommandTemplate>): void;
  getCommand(id: string): CommandTemplate | undefined;
  getAllCommands(): TemplateEntry<CommandTemplate>[];
  getCoreCommands(): TemplateEntry<CommandTemplate>[];

  registerSkill(entry: TemplateEntry<SkillTemplate>): void;
  getSkill(id: string): SkillTemplate | undefined;
  getAllSkills(): TemplateEntry<SkillTemplate>[];
  getCoreSkills(): TemplateEntry<SkillTemplate>[];

  registerAgent(entry: TemplateEntry<AgentTemplate>): void;
  getAgent(id: string): AgentTemplate | undefined;
  getAllAgents(): TemplateEntry<AgentTemplate>[];
  getCoreAgents(): TemplateEntry<AgentTemplate>[];
}

export function createTemplateRegistry(): TemplateRegistry {
  return new TemplateRegistryImpl();
}

export const templateRegistry = createTemplateRegistry();
