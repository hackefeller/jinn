Publish documentation, cut versioned releases, and record feature demos.

## Deploying Documentation

### Build

```bash
# Vitepress (preferred)
bun run docs:build        # outputs to docs/.vitepress/dist/

# Docusaurus
bun run build             # outputs to build/

# Verify the output before deploying
bun run docs:preview      # serve locally at http://localhost:4173
```

### Validate before publishing

```bash
# Check for broken links
bun run docs:check-links  # or: npx linkcheck ./docs/.vitepress/dist

# Confirm search index is up to date (Vitepress: built-in; Docusaurus: Algolia)
```

### Deploy

```bash
# Vercel (recommended)
vercel deploy --prod

# GitHub Pages (via CI — do not deploy manually)
# Trigger via: git push origin main → CI workflow deploys automatically

# Manual upload to S3
aws s3 sync docs/.vitepress/dist s3://your-bucket/docs --delete
aws cloudfront create-invalidation --distribution-id $CF_ID --paths "/docs/*"
```

### Verify after deploy

- Confirm the URL is live and content is correct
- Test navigation and search on desktop and mobile
- Check heading hierarchy (`h1` → `h2` → `h3`, no skips)
- Confirm all images have alt text

## Versioned Documentation Releases

When a software version ships:

```bash
# Vitepress versioning — copy current docs snapshot
cp -r docs/ docs-versions/v1.2.3/

# Docusaurus versioning
bun run docusaurus docs:version 1.2.3
```

Steps:
1. Audit docs against the new version — flag outdated content and missing coverage
2. Write breaking-change notices and migration guides before cutting the version
3. Update the "latest" pointer in the docs config
4. Generate release notes from git log:
   ```bash
   git log v1.1.0..v1.2.3 --oneline --no-merges
   ```
5. Deploy and confirm the version switcher works

## Feature Demo Videos

When recording a feature demonstration:

1. **Script** — write a concise script: goal, exact steps, expected outcome. Keep it under 5 minutes.
2. **Prepare** — reset the environment to a clean state; use realistic but non-sensitive data; close unrelated windows.
3. **Record** — 1080p minimum; use a screen recorder with system audio muted.
4. **Edit** — cut dead air and pauses; add captions for accessibility; highlight UI actions with zoom or callouts.
5. **Publish** — upload to the designated platform (Loom for internal, YouTube for public).
6. **Link** — add the video to the relevant docs page or changelog entry immediately after publishing.

## Guardrails

- Never deploy docs from a local machine to production — use CI or the platform CLI with proper credentials
- Never publish docs for an unreleased version — version snapshots are cut at release time only
- Every breaking change must have a migration guide before the version is published
- Broken links are a deploy blocker — run link validation before every publish
