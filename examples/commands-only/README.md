# Example: Commands Only

Only generate commands, no skills or agents.

## Files

### .ghostwire/config.yaml
```yaml
version: "1.0.0"
tools:
  - opencode
  - cursor
profile: core
delivery: commands
```

## Usage

```bash
# Initialize commands only
ghostwire init --tools opencode,cursor --delivery commands

# Use commands
/ghostwire:propose
/ghostwire:apply
/ghostwire:code:format
```

## When to Use

- You only need slash commands
- Don't need AI agents
- Want minimal setup
- Just need workflow guidance

## What You Get

- All workflow commands
- All code commands  
- All git commands
- NO skills
- NO agents
