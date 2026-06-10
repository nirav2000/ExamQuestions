# Codex Prompt: Repair Runnable Version Archives and Add Semver Migration Plan

Use this prompt with Codex for the `nirav2000/ExamQuestions` repository.

```text
You are working on this GitHub repository:

https://github.com/nirav2000/ExamQuestions

The live app is:

https://nirav2000.github.io/ExamQuestions/

IMPORTANT: You may not have the latest files. Fetch latest before doing anything.

Run first:

git fetch --all --tags --prune
git checkout main
git pull origin main

This task is to repair the version archives and prepare a future semantic-version migration plan.

Do NOT make unrelated UI or feature changes.

============================================================
TASK A — INSPECT CURRENT STATE
============================================================

Inspect:

- versions.json
- README.md
- CODEMAP.md
- index.html
- app.js
- app-config.js
- app-helpers.js
- app-maintenance.js
- scripts/verify-archives.js
- versions/ folder
- git history

Use:

git log --oneline --decorate --all
git log --name-status --oneline --all
git ls-tree -r --name-only HEAD
find versions -maxdepth 3 -type f | sort

Determine:

1. Current live version.
2. All versions listed in versions.json.
3. All version folders under versions/.
4. For each version folder, whether it is a runnable static app.
5. For each version folder, whether internal version constants match the folder version.

Known issues to check and fix:

- versions/v0.1.23/app-config.js currently appears to declare APP_VERSION v0.1.24.
- versions/v0.1.17 through versions/v0.1.22 may contain command-groove-fallback-fix.js hardcoded to v0.1.16.
- Some archives may have copied future files into older version folders.
- Some archives may only contain README notes or may be missing runtime files.
- scripts/verify-archives.js currently checks that files exist, but does not check internal version consistency.

============================================================
TASK B — RECONSTRUCT FULL RUNNABLE ARCHIVES FROM GIT HISTORY
============================================================

For every version in versions.json and every version folder under versions/:

1. Identify the best commit for that version.

Use evidence from:

- versions.json entry
- README.md current version at that time
- app.js APP_VERSION at that time
- app-config.js APP_VERSION at that time
- index.html version selector at that time
- commit messages
- dates in versions.json
- git history around changes

Helpful commands:

git log --oneline --decorate --all -- README.md versions.json index.html app.js app-config.js
git log --oneline --decorate --all --grep="v0.1.23"
git log --oneline --decorate --all --grep="0.1.23"
git show <commit>:app.js
git show <commit>:app-config.js
git show <commit>:index.html
git ls-tree -r --name-only <commit>

2. Reconstruct a full static runnable archive at:

versions/vX.Y.Z/

Each archive should include the files that version actually needed to run at that time, for example:

versions/vX.Y.Z/
  index.html
  README.md
  styles.css                         if used by that version
  styles/                            if used by that version
    main.css
    tokens-base.css
    header-groove.css
    pack-practice.css
    answer-feedback.css
    forms-responsive.css
  app.js
  app-config.js                      if used by that version
  app-helpers.js                     if used by that version
  app-maintenance.js                 if used by that version
  command-groove-fallback-fix.js     if used by that version
  data/
    questions.json
    command-explainers.json          if used
    manifest.json                    if used
    command-sets/                    if used
  command-set/
    ks2_command_word_json_files.zip  if used
  any other local runtime file referenced by index.html or JS

3. Do not merely add README archive notes. Every archive must be runnable at:

https://nirav2000.github.io/ExamQuestions/versions/vX.Y.Z/

4. Use git history to copy accurate files.

Examples:

mkdir -p versions/v0.1.23
git show <commit>:index.html > versions/v0.1.23/index.html
git show <commit>:app.js > versions/v0.1.23/app.js
git show <commit>:app-config.js > versions/v0.1.23/app-config.js

For folders:

git ls-tree -r --name-only <commit> styles
git show <commit>:styles/main.css > versions/v0.1.24/styles/main.css

For binary files such as ZIP files:

git show <commit>:command-set/ks2_command_word_json_files.zip > versions/vX.Y.Z/command-set/ks2_command_word_json_files.zip

5. Preserve the historical behaviour of the archive where possible, but make it runnable from its nested folder.

For archived index.html files:

- Local CSS references should point to local archived files:
  - styles.css
  - styles/main.css

- Local JS references should point to local archived files:
  - app.js
  - app-config.js
  - app-helpers.js
  - app-maintenance.js
  - command-groove-fallback-fix.js

- Local data references should resolve inside the archive where possible:
  - ./data/questions.json
  - ./data/manifest.json
  - ./data/command-explainers.json
  - ./command-set/ks2_command_word_json_files.zip

- The universal version history is the exception:
  - versions.json should stay central at /ExamQuestions/versions.json

============================================================
TASK C — FIX VERSION CONSTANTS INSIDE ARCHIVES
============================================================

For each archive folder:

versions/vX.Y.Z/

ensure all local version declarations agree with X.Y.Z.

Check and fix:

1. index.html

The default selected option should match the archive version:

<option value="vX.Y.Z">vX.Y.Z</option>

Do not let an archived v0.1.23 index say v0.1.24.

2. app-config.js, if present

Must say:

APP_VERSION: 'vX.Y.Z'

3. app.js, if present

Must say:

const APP_VERSION = 'vX.Y.Z';

4. app-maintenance.js, if present

It should derive version from local app-config.js if that version uses app-config.js.

Acceptable:

const VERSION = config.APP_VERSION || 'vX.Y.Z';

Not acceptable in an archive:

const VERSION = 'v0.1.24';

unless the archive is actually v0.1.24.

5. command-groove-fallback-fix.js, if present

If it hardcodes a version, it must match the archive folder.

For example, in versions/v0.1.19/command-groove-fallback-fix.js:

const VERSION = 'v0.1.19';

Not:

const VERSION = 'v0.1.16';

Better still, where safe, change archived fallback helper to derive from app.js/app-config or from a tiny archive-specific global. But do not break old versions.

6. Do not let any archive force the selected version to the current live version or a different archived version.

7. Remove or neutralise old runtime patches that override the selector incorrectly.

For each archive, the selected/displayed version should remain its own version after scripts run.

============================================================
TASK D — FIX VERSION JUMPING
============================================================

The following behaviour must be fixed:

- Selecting v0.1.23 must load/display v0.1.23, not v0.1.24.
- Selecting v0.1.22 must load/display v0.1.22, not v0.1.16 or v0.1.15.
- Selecting v0.1.21 must load/display v0.1.21.
- Selecting v0.1.20 must load/display v0.1.20.
- Selecting v0.1.19 must load/display v0.1.19.
- Selecting v0.1.18 must load/display v0.1.18.
- Selecting v0.1.17 must load/display v0.1.17.
- All other versions should likewise display their own version.

Do not fix this with a new global patch that masks the issue.

Fix the archive files themselves so each archive is internally consistent.

============================================================
TASK E — UPDATE versions.json
============================================================

Update versions.json so it accurately reflects the repaired archives.

Rules:

1. Current live version first:

{
  "version": "vCURRENT",
  "label": "...",
  "path": "/ExamQuestions/",
  "date": "...",
  "notes": "..."
}

2. Archived versions:

{
  "version": "vX.Y.Z",
  "label": "...",
  "path": "/ExamQuestions/versions/vX.Y.Z/",
  "date": "...",
  "notes": "..."
}

3. Every version listed in versions.json must have a runnable archive folder, except the current live version.

4. If a historical version cannot be reconstructed accurately from git history, do not fabricate it. Instead:
   - keep or create an archive folder if there is a closest runnable approximation;
   - document the approximation in notes;
   - add details to SEMVER_MIGRATION.md and README if needed.

5. If a version folder exists but is not listed in versions.json, either:
   - add it to versions.json, or
   - explain why it is not a released version and remove/rename it only if clearly safe.

============================================================
TASK F — CREATE SEMVER_MIGRATION.md
============================================================

Create a new file:

SEMVER_MIGRATION.md

Purpose:

This file should document that the current historical version numbers v0.1.x were used as incremental app releases, but do not properly follow semantic versioning.

Use this semantic versioning policy:

MAJOR.MINOR.PATCH

The user describes this as:

major.minor.fix

Treat PATCH as FIX.

Rules:

- MAJOR: breaking/incompatible changes, data schema breaks, archive URL breaking changes, or app behaviour changes that are not backwards-compatible.
- MINOR: backwards-compatible new functionality, new UI capabilities, new data loading modes, new controls, significant refactors that preserve behaviour.
- PATCH/FIX: backwards-compatible bug fixes, documentation changes, archive repair, version metadata corrections, small styling fixes, and maintenance.

In SEMVER_MIGRATION.md include:

1. Current status

State that the repo currently uses historical versions like v0.1.25, but many v0.1.x releases were actually feature/minor releases.

2. Proposed corrected semantic lineage

Create a table with columns:

- Historical version
- Historical label
- Change type
- Correct semver category
- Proposed semantic version
- Notes

Use the history in versions.json and git commits to propose a mapping.

A reasonable starting point is:

v0.1.0  -> v0.1.0   initial prototype
v0.1.1  -> v0.1.1   patch/fix or small UI improvement, depending on actual change
v0.1.2  -> v0.2.0   command explainer layout / feedback layout feature
v0.1.3  -> v0.3.0   command-word JSON pack support feature
v0.1.4  -> v0.4.0   bundled ZIP pack loader feature
v0.1.5  -> v0.5.0   default bundled pack and panel groove feature
v0.1.6  -> v0.5.1   default startup fix
v0.1.7  -> v0.5.2   explainer placement fix
v0.1.8  -> v0.5.3 or v0.6.0 depending on whether it added new capability
v0.1.9  -> v0.6.0   tabs/dropdown/cards/checklist/source/search controls feature
v0.1.10 -> v0.7.0   split pack controls/layout feature
v0.1.11 -> v0.7.1   manual close/default zip/version compact fix
v0.1.12 -> v0.7.2   ZIP schema support fix
v0.1.13 -> v0.7.3   ZIP parsing fix
v0.1.14 -> v0.8.0   dynamic groove card feature
v0.1.15 -> v0.8.1   groove content normalization fix
v0.1.16 -> v0.8.2   neutral fallback fix
v0.1.17 -> v0.8.3 or v0.9.0 depending on whether canonical pack files are considered new functionality
v0.1.18 -> v0.9.0   groove carousel + collapsible pack sidebar feature
v0.1.19 -> v0.9.1   carousel/sidebar polish fix
v0.1.20 -> v0.9.2   version display/source-of-truth fix
v0.1.21 -> v0.9.3   archive version repair fix
v0.1.22 -> v0.9.4 or v0.10.0 depending on whether helper refactor should be counted as minor
v0.1.23 -> v0.10.0 or v0.10.1 depending on how refactor is classified
v0.1.24 -> v0.10.1 or v0.11.0 depending on whether CSS split is classified as maintenance or minor
v0.1.25 -> patch/fix after final chosen current semantic line, e.g. v0.10.2 or v0.11.1

Do not blindly use that exact mapping if git history suggests a better one. Explain your reasoning.

3. Recommendation

Recommend whether to:

Option A:
Keep historical v0.1.x URLs forever, but start future public semver from the proposed current semantic version.

Option B:
Rename archive folders to semantic versions and add compatibility redirects/wrappers for old v0.1.x URLs.

Strongly prefer Option A unless the user explicitly asks to rename archives, because renaming archive folders may break old URLs.

4. Future release rule

State that going forward:

- feature work bumps MINOR
- fixes/archive repairs/docs bump PATCH/FIX
- breaking changes bump MAJOR
- archive folders must be full runnable static copies

============================================================
TASK G — DO NOT APPLY THE SEMVER RENAME YET
============================================================

Important:

Create SEMVER_MIGRATION.md, but do NOT rename all existing archive folders to the proposed semver names yet.

Do not convert v0.1.25 to v0.10.x in the live app yet unless the user has explicitly asked to apply the migration.

For this task:

- repair current v0.1.x archives;
- keep current version numbering as currently used;
- add SEMVER_MIGRATION.md for later review/application.

This is because archive URLs already exist and should not be broken without an explicit migration step.

============================================================
TASK H — IMPROVE ARCHIVE VERIFICATION SCRIPT
============================================================

Update:

scripts/verify-archives.js

It must check more than file existence.

For each version in versions.json:

1. Validate index.html exists.

2. Validate local CSS/JS refs exist.

3. Validate referenced local data files exist.

4. Validate internal version consistency:

For archived version vX.Y.Z:

- If index.html contains a default option value like vA.B.C, it must include vX.Y.Z.
- If app-config.js exists and contains APP_VERSION, it must be vX.Y.Z.
- If app.js exists and contains APP_VERSION, it must be vX.Y.Z.
- If app-maintenance.js exists and contains fallback VERSION, it must not force a different version.
- If command-groove-fallback-fix.js exists and contains const VERSION, it must be vX.Y.Z.

5. Validate archive paths:

- Archived versions must not have script/link paths that point to the root live app unless intentionally documented.
- Archived CSS/JS should be local to the archive.
- versions.json can remain root/universal.

6. Print a useful report like:

PASS v0.1.24
FAIL v0.1.23 app-config.js APP_VERSION is v0.1.24, expected v0.1.23
FAIL v0.1.19 command-groove-fallback-fix.js VERSION is v0.1.16, expected v0.1.19

7. Exit non-zero if any failures.

============================================================
TASK I — OPTIONAL LOCAL RUNTIME CHECK
============================================================

If practical, add a second script:

scripts/check-archive-runtime.js

This can be a lightweight static check or a Playwright-based runtime check if dependencies already exist.

Do not introduce a heavy framework unless necessary.

Goal:

- Open root app.
- Open each archive index.html.
- Check that #versionSelect value/display matches the folder version after scripts run.
- Report any mismatch.

If Playwright is too heavy, skip this and document it as a manual QA step.

============================================================
TASK J — UPDATE README AND CODEMAP
============================================================

Update README.md and CODEMAP.md to explain:

1. Archives are full runnable static copies.

2. Every archive must be internally version-consistent.

3. versions.json is universal and stays at root.

4. How to run:

node scripts/verify-archives.js

5. SEMVER_MIGRATION.md exists and is only a proposal until explicitly applied.

6. Future release process:

Before changing root files for a new release:

- copy current root app into versions/vCURRENT/
- verify the archive loads from /versions/vCURRENT/
- then update root files
- update versions.json
- update README/CODEMAP if needed
- run scripts/verify-archives.js

============================================================
TASK K — COMMIT / PR
============================================================

Make the changes on a new branch:

archive-repair-and-semver-plan

Commit message:

Fix runnable version archives and add semver migration plan

Open a PR to main if possible.

PR title:

Fix runnable version archives and add semver migration plan

PR body should include:

- summary of archives repaired
- list of versions whose internal version constants were fixed
- verification command and result
- note that SEMVER_MIGRATION.md is a proposal only and does not rename archives yet
- any versions that could not be reconstructed perfectly

If you are operating directly on main instead of a PR, still make a single coherent commit.

============================================================
TASK L — FINAL OUTPUT
============================================================

When done, report:

1. Current live version.
2. Number of archive folders repaired.
3. Which versions had version-jump bugs and how they were fixed.
4. Whether all archives now pass scripts/verify-archives.js.
5. Any archive versions that could not be reconstructed exactly.
6. Location of SEMVER_MIGRATION.md.
7. Whether any semver renaming was actually applied. It should not be applied in this task.
```
