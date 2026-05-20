# ExamQuestions

Practice and help students answer questions fully and exceptionally by fully addressing the command word in the question.

Live app: https://nirav2000.github.io/ExamQuestions/

## Current version

`v0.1.24`

## v0.1.24 changes

This is a maintainability/refactor-only release. It keeps the existing UI and practice behaviour, while making visual styling easier to edit safely.

- Adds `styles/main.css` as the styling entrypoint.
- Splits the old monolithic CSS into labelled files under `styles/`:
  - `tokens-base.css` — design tokens, shared base styles, buttons and common utilities.
  - `header-groove.css` — hero, top navigation, menu and command-groove card.
  - `pack-practice.css` — pack panel, selectors, question list and question card.
  - `answer-feedback.css` — answer input, drawing pad, feedback, coach notes and model answer breakdown.
  - `forms-responsive.css` — manual-entry dialog and mobile responsive rules.
- Keeps the old root `styles.css` file in place as a compatibility/reference file for now.
- Updates `index.html` to load `styles/main.css?v=0.1.24`.
- Updates the central `versions.json` history.

## Code map

Start with [`CODEMAP.md`](./CODEMAP.md) when changing a feature. It explains the current files, functional areas, and future target modules.

Current important files:

- `index.html` — app shell and DOM structure.
- `styles/main.css` — current CSS entrypoint.
- `styles/*.css` — split styling by feature area.
- `styles.css` — old monolithic styling retained temporarily as a reference/compatibility file.
- `app-config.js` — app version, data URLs, neutral command-groove defaults.
- `app-helpers.js` — reusable helper functions.
- `app.js` — main app behaviour; still monolithic and the next refactor target.
- `app-maintenance.js` — version display and neutral groove runtime guard.
- `versions.json` — universal version history.

## Versioning

Version history is stored centrally in `versions.json`. This file is universal and should not be copied into each version archive.

For every future semantic version:

1. Archive the full current app into `versions/vX.Y.Z/` before changing the live root files.
2. Include all app files in the archive: `index.html`, CSS files, `app.js`, helper/config scripts, `README.md`, and `data/questions.json`.
3. Update the live root app files.
4. Update `versions.json` with the new current version and the archive path for the previous version.

## Loading a command-word pack

Use **Upload JSON / ZIP pack** and choose the full command-word JSON pack ZIP. The app reads the manifest, explainers, all-in-one question file, and separate command-set files directly in the browser.
