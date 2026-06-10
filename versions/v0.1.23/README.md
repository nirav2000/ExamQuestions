# ExamQuestions

Practice and help students answer questions fully and exceptionally by fully addressing the command word in the question.

Live app: https://nirav2000.github.io/ExamQuestions/

## Current version

`v0.1.23`

## v0.1.23 changes

This is a maintainability/refactor-only release. It keeps the existing UI and practice behaviour, while making the codebase easier to work on safely.

- Adds `app-config.js` for app version, data URLs and neutral command-groove defaults.
- Adds `app-maintenance.js` for runtime version display and neutral command-groove safety.
- Updates `app-helpers.js` so generic command-word fallback content is neutral, not `why`-specific.
- Removes the need to keep extending the old `command-groove-fallback-fix.js` workaround.
- Adds `CODEMAP.md`, which explains where each feature currently lives and where it should move during future modularisation.
- Updates the central `versions.json` history.

## Code map

Start with [`CODEMAP.md`](./CODEMAP.md) when changing a feature. It explains the current files, functional areas, and future target modules.

Current important files:

- `index.html` — app shell and DOM structure.
- `styles.css` — all current styling.
- `app-config.js` — app version, data URLs, neutral command-groove defaults.
- `app-helpers.js` — reusable helper functions.
- `app.js` — main app behaviour; still monolithic and the next refactor target.
- `app-maintenance.js` — version display and neutral groove runtime guard.
- `versions.json` — universal version history.

## Versioning

Version history is stored centrally in `versions.json`. This file is universal and should not be copied into each version archive.

For every future semantic version:

1. Archive the full current app into `versions/vX.Y.Z/` before changing the live root files.
2. Include all app files in the archive: `index.html`, `styles.css`, `app.js`, `README.md`, and `data/questions.json`.
3. Update the live root app files.
4. Update `versions.json` with the new current version and the archive path for the previous version.

## Loading a command-word pack

Use **Upload JSON / ZIP pack** and choose the full command-word JSON pack ZIP. The app reads the manifest, explainers, all-in-one question file, and separate command-set files directly in the browser.
