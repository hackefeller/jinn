# Example: Minimal Setup

Minimal ghostwire setup with just OpenCode.

## Files

### .ghostwire/config.yaml
```yaml
version: "1.0.0"
tools:
  - opencode
profile: core
delivery: both
```

## Usage

```bash
# Initialize
ghostwire init --tools opencode --yes

# Use commands
/ghostwire:propose
/ghostwire:apply
```

## What You Get

- 4 workflow commands
- 4 code commands
- 4 git commands
- 4 agents
- 2 skills
