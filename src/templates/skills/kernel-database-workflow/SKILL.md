Safe, repeatable database schema changes with automated type generation. Every schema change flows through this process — no exceptions.

## Core Principles

- **Migrations are immutable once applied** — never edit a file that has been run against any environment
- **One concern per migration** — a single table, a single column set, a single index group
- **Always write Down** — every migration must be reversible unless you explicitly document why it cannot be
- **Additive by default** — add before removing (expand → backfill → contract)
- **Types must stay in sync** — no migration is complete until generated types are regenerated and verified
- **Report everything** — always tell the user what ran, what changed, and what the rollout risks are

## File Format

### Naming

```
YYYYMMDDHHMMSS_description_of_change.sql
```

Use the scaffold command — never create files by hand:

```bash
make db-new-migration NAME=add_users_table
# or: bun run db:migration:new add_users_table
```

### File Structure (Goose)

```sql
-- +goose Up
-- +goose StatementBegin
CREATE TABLE users (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT        NOT NULL,
  name        TEXT        NOT NULL,
  role        TEXT        NOT NULL DEFAULT 'standard',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_users_email ON users (email);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS users;
-- +goose StatementEnd
```

**Required wrapping:** Use `-- +goose StatementBegin` / `-- +goose StatementEnd` around every block. Apply consistently — even single statements — to prevent parse errors when `DO $$` or semicolons appear.

## Full Migration Lifecycle

### Step 1 — Confirm Scope

Before writing anything, confirm:
- Does this require a migration, or is it an app-layer change?
- Is there a prior migration that should be amended instead? (Only if never applied)
- Does this change conflict with any pending migration in the set?

```bash
make db-status
```

### Step 2 — Scaffold

```bash
make db-new-migration NAME=add_posts_table
```

Edit only the generated file. Never create migration SQL by hand.

### Step 3 — Write Up and Down

Write the `Up` block first. Then write the `Down` block that exactly reverses it.

**Down block rules:**
- `CREATE TABLE` → `DROP TABLE IF EXISTS`
- `ADD COLUMN` → `DROP COLUMN`
- `CREATE INDEX` → `DROP INDEX IF EXISTS`
- `ADD CONSTRAINT` → `ALTER TABLE ... DROP CONSTRAINT`
- `CREATE TYPE` → `DROP TYPE IF EXISTS`

If the Down cannot be made safe (e.g., data was deleted), document it explicitly:

```sql
-- +goose Down
-- +goose StatementBegin
-- IRREVERSIBLE: data deleted in Up cannot be restored.
-- This migration was intentionally made one-way.
-- +goose StatementEnd
```

### Step 4 — Validate Before Applying

1. Inspect the migration set for conflicts — is any table, index, or constraint name duplicated?
2. Verify the Down exactly reverses the Up
3. Check that all referenced tables/columns already exist
4. Confirm `NOT NULL` columns without defaults won't fail on existing rows

### Step 5 — Apply

```bash
# Apply to dev + test, then regenerate types (canonical workflow)
make db-migrate-sync
```

### Step 6 — Regenerate and Verify Types

**Mandatory after any schema-changing migration.**

```bash
make db-generate-types
make db-verify-types
bun run lint
bun run typecheck
```

Never leave a migration merged with stale generated types.

### Step 7 — Report

Always tell the user:
- Which migration file was created or modified
- Whether `db-migrate-sync` passed on dev and test
- Whether `db-verify-types` passed
- Whether lint and typecheck are clean
- Any destructive, irreversible, or rollout-sensitive aspects

## References

- **schema-design.md** — table conventions, column rules, index rules, constraints
- **migration-patterns.md** — expand/backfill/contract, rollback, production deployments, destructive changes, schema drift
- **goose-workflow.md** — make targets and direct Goose commands quick reference

## Guardrails

- Never edit a migration file that has been applied to any environment — create a new migration instead
- Never apply migrations via raw `psql` or direct DB client in any environment
- Never hand-edit generated type files
- Never skip type verification after a schema change — stale types cause runtime type errors
- Never apply a destructive migration without a documented data impact assessment
- Never deploy application code before its required migrations have applied
- Never use `SERIAL` or `INTEGER` primary keys — use `UUID`
- Never use `TIMESTAMP` without time zone — use `TIMESTAMPTZ`
- If `db-migrate-sync` fails, stop — do not proceed to type verification or code deployment
