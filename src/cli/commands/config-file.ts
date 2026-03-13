import * as yaml from 'yaml';

import { JinnConfigSchema, type JinnConfig } from '../../core/config/schema.js';

export function parseConfig(content: string): JinnConfig {
  const parsed = yaml.parse(content) ?? {};
  return JinnConfigSchema.parse(parsed);
}

export function serializeConfig(config: JinnConfig): string {
  return yaml.stringify(JinnConfigSchema.parse(config), {
    indent: 2,
    sortMapEntries: true,
  });
}
