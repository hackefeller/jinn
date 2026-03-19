# Example: Commands Only

Historical example from the pre-skill-first model. The current configuration schema no longer supports `delivery: commands`.

## Files

### .jinn/config.yaml

```yaml
version: "1.0.0"
tools:
  - opencode
  - cursor
profile: core
delivery: skills
```

## Usage

```bash
# Initialize skills only
jinn init --tools opencode,cursor --delivery skills

# Use the installed workflows through your tool's skill system
```

## When to Use

- You only need skills
- Don't need native agents
- Want minimal setup
- Just need workflow guidance

## What You Get

- The full skill catalog
- NO agents
