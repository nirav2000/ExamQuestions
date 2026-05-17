# ExamQuestions

Practice and help students answer questions fully and exceptionally by fully addressing the command word in the question.

Live app: https://nirav2000.github.io/ExamQuestions/

## Current version

`v0.1.2`

## v0.1.2 changes

- Moves the exceptional answer below the weak answer.
- Uses the previous exceptional-answer space for a command-word explainer, starting with a `why` explainer.
- Incorporates the `Why it works` breakdown into the full-marks exceptional answer box.
- Makes the breakdown feel more like coach notes.
- Removes visible labels such as `Restating the question` from the model answer itself so it reads naturally.
- Corrects the coach-note font sizing so it is smaller than v0.1.1 but still readable.
- Adds a central `versions.json` file for universal version history.
- Adds a version selector in the app header.

## Versioning

Version history is stored centrally in `versions.json`. This file is universal and should not be copied into each version archive.

For every future semantic version:

1. Archive the full current app into `versions/vX.Y.Z/` before changing the live root files.
2. Include all app files in the archive: `index.html`, `styles.css`, `app.js`, `README.md`, and `data/questions.json`.
3. Update the live root app files.
4. Update `versions.json` with the new current version and the archive path for the previous version.

Archived versions are available at paths such as:

- `https://nirav2000.github.io/ExamQuestions/versions/v0.1.1/`
- `https://nirav2000.github.io/ExamQuestions/versions/v0.1.0/`
