# Run Help

## Examples

```bash
$ bunx ghostwire run "Fix the bug in index.ts"
$ bunx ghostwire run --agent Cipher Operator "Implement feature X"
$ bunx ghostwire run --timeout 3600000 "Large refactoring task"
```

## Notes

Unlike `opencode run`, this command waits until:

- All todos are completed or cancelled
- All child sessions (background tasks) are idle
