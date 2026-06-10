# ExamQuestions

Practice and help students answer questions fully and exceptionally by fully addressing the command word in the question.

Live app: https://nirav2000.github.io/ExamQuestions/

## Current version

`v0.1.12`

## v0.1.12 changes

- Adds support for uploading the full command-word JSON ZIP pack.
- Supports pack contents with `manifest.json`, `command-explainers.json`, `all-command-word-questions.json`, and `command-sets/*.json`.
- Adds a command-word practice-set selector so learners can practise one command word at a time.
- Uses external command explainers where available, including groove, answer pattern, steps, and helpful words.
- Displays richer question metadata such as skill focus, answer pattern, and teaching tip.
- Keeps compatibility with the original uploadable JSON array format.
- Rebuilds the default bundled-pack startup flow so the app first loads version history/explainers, then loads starter questions, then auto-loads the repository ZIP pack when available.
- Keeps a safe fallback to built-in data + local manifest if the bundled ZIP is unavailable.
- Keeps command-word groove guidance in the top-right coach panel.
- Restores the command-word explainer block to the feedback area (as in v0.1.2 layout).
- Updates the central `versions.json` history.

## Versioning

Version history is stored centrally in `versions.json`. This file is universal and should not be copied into each version archive.

For every future semantic version:

1. Archive the full current app into `versions/vX.Y.Z/` before changing the live root files.
2. Include all app files in the archive: `index.html`, `styles.css`, `app.js`, `README.md`, and `data/questions.json`.
3. Update the live root app files.
4. Update `versions.json` with the new current version and the archive path for the previous version.

Archived versions are available at paths such as:

- `https://nirav2000.github.io/ExamQuestions/versions/v0.1.2/`
- `https://nirav2000.github.io/ExamQuestions/versions/v0.1.3/`
- `https://nirav2000.github.io/ExamQuestions/versions/v0.1.4/`
- `https://nirav2000.github.io/ExamQuestions/versions/v0.1.5/`
- `https://nirav2000.github.io/ExamQuestions/versions/v0.1.6/`
- `https://nirav2000.github.io/ExamQuestions/versions/v0.1.1/`
- `https://nirav2000.github.io/ExamQuestions/versions/v0.1.0/`

## Loading a command-word pack

Use **Upload JSON / ZIP pack** and choose the full command-word JSON pack ZIP. The app reads the manifest, explainers, all-in-one question file, and separate command-set files directly in the browser.
