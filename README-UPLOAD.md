# Command Word Coach v2.0.1 upload pack

This package adds the command-word quick guide requested from the printable PDF work and bumps the app to v2.0.1.

## Files to upload/replace

1. Replace `/index.html` with the included `index.html`.
2. Replace `/app-config.js` with the included `app-config.js`.
3. Replace `/versions.json` with the included `versions.json`.
4. Optional: upload `data/command-word-coach-same-passage.json` so the same-passage practice items can be reused as an uploadable JSON set.

## Archive requirement

Before replacing root files, archive the current live v0.1.26 snapshot under:

`/versions/v0.1.26/`

The repository CODEMAP says archives in `versions/vX.Y.Z/` must be runnable static snapshots and `versions.json` should stay at root. Copy the current root runtime files before upload, then upload the v2.0.1 root files.

Minimum current runtime files to copy into `/versions/v0.1.26/` before replacing root:

- index.html
- app-config.js
- app-helpers.js
- app.js
- app-maintenance.js
- styles/
- data/
- command-set/

Then run the repo verification script if available:

```bash
node scripts/verify-archives.js
```

## Version-history change

`versions.json` has been updated so:

- v2.0.1 points to `/ExamQuestions/`
- v0.1.26 now points to `/ExamQuestions/versions/v0.1.26/`

## What changed

- Adds a `Command guide` link in the top actions.
- Adds a quick guide table with `Command word`, `What it asks you to do`, and `Simple meaning`.
- Adds a same-passage section showing how model answers differ for identify, describe, explain, outline, show, infer, analyse and evaluate.
- Keeps the existing practice app JavaScript unchanged.
