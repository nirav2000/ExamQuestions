# ExamQuestions

Practice and help students answer questions fully and exceptionally by fully addressing the command word in the question.

Live app: https://nirav2000.github.io/ExamQuestions/

## Current version

`v0.1.18`

## v0.1.18 changes

- Replaces the global hardcoded `Reason → Effect → Link` default with neutral command-word strategy wording.
- Keeps `Reason → Effect → Link` as a `why`-specific pattern rather than a universal command-word pattern.
- Updates the hero copy and answer placeholder so they no longer imply all command words use the same structure.
- Adds a small fallback patch script that neutralises any old why-specific fallback content if an explainer lacks its own heading or intro.
- Updates the central `versions.json` history.

## Versioning

Version history is stored centrally in `versions.json`. This file is universal and should not be copied into each version archive.

For every future semantic version:

1. Archive the full current app into `versions/vX.Y.Z/` before changing the live root files.
2. Include all app files in the archive: `index.html`, `styles.css`, `app.js`, `README.md`, and `data/questions.json`.
3. Update the live root app files.
4. Update `versions.json` with the new current version and the archive path for the previous version.

Archived versions are available at paths such as:

- `https://nirav2000.github.io/ExamQuestions/versions/v0.1.15/`
- `https://nirav2000.github.io/ExamQuestions/versions/v0.1.14/`
- `https://nirav2000.github.io/ExamQuestions/versions/v0.1.13/`
- `https://nirav2000.github.io/ExamQuestions/versions/v0.1.12/`
- `https://nirav2000.github.io/ExamQuestions/versions/v0.1.11/`
- `https://nirav2000.github.io/ExamQuestions/versions/v0.1.10/`
- `https://nirav2000.github.io/ExamQuestions/versions/v0.1.9/`
- `https://nirav2000.github.io/ExamQuestions/versions/v0.1.8/`
- `https://nirav2000.github.io/ExamQuestions/versions/v0.1.7/`
- `https://nirav2000.github.io/ExamQuestions/versions/v0.1.6/`
- `https://nirav2000.github.io/ExamQuestions/versions/v0.1.5/`
- `https://nirav2000.github.io/ExamQuestions/versions/v0.1.4/`
- `https://nirav2000.github.io/ExamQuestions/versions/v0.1.3/`
- `https://nirav2000.github.io/ExamQuestions/versions/v0.1.2/`
- `https://nirav2000.github.io/ExamQuestions/versions/v0.1.1/`
- `https://nirav2000.github.io/ExamQuestions/versions/v0.1.0/`

## Loading a command-word pack

Use **Upload JSON / ZIP pack** and choose the full command-word JSON pack ZIP. The app reads the manifest, explainers, all-in-one question file, and separate command-set files directly in the browser.
