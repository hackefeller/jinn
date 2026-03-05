# Types

Shared type definitions exported from ghostwire.

## Exports

This module re-exports types from core modules for convenience:

```typescript
// From core/templates
export type { SkillTemplate, CommandTemplate, AgentTemplate } from '../core/templates/types.js';

// From core/adapters
export type { ToolCommandAdapter, CommandContent } from '../core/adapters/types.js';

// From core/config
export type { GhostwireConfig, ToolId, Profile, Delivery } from '../core/config/schema.js';
```

## Usage

```typescript
import type { GhostwireConfig, SkillTemplate } from 'ghostwire/types';
```
