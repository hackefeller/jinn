/**
 * Default configuration values
 */

import type { GhostwireConfig } from './schema.js';

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: GhostwireConfig = {
  version: '1.0.0',
  tools: [],
  profile: 'core',
  delivery: 'both',
  featureFlags: {},
};

/**
 * Default configuration filename
 */
export const DEFAULT_CONFIG_FILENAME = 'config.yaml';

/**
 * Ghostwire directory name
 */
export const GHOSTWIRE_DIR_NAME = '.ghostwire';

/**
 * Current configuration schema version
 */
export const CONFIG_VERSION = '1.0.0';
