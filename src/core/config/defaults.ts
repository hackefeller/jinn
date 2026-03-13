/**
 * Default configuration values
 */

import type { JinnConfig } from './schema.js';

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: JinnConfig = {
  version: '1.0.0',
  tools: [],
  profile: 'core',
  delivery: 'both',
  featureFlags: {},
  workflow: {
    backend: 'filesystem',
  },
};

/**
 * Default configuration filename
 */
export const DEFAULT_CONFIG_FILENAME = 'config.yaml';

/**
 * Jinn directory name
 */
export const JINN_DIR_NAME = '.jinn';

/**
 * Current configuration schema version
 */
export const CONFIG_VERSION = '1.0.0';
