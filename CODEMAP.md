# Command Word Coach code map

This file explains where each feature area currently lives and where future refactors should move it.

## Current runtime files

| File | Owns | Notes |
| --- | --- | --- |
| `index.html` | App shell and DOM structure | Keep IDs stable because `app.js` reads them through the `els` registry. |
| `styles/main.css` | CSS entrypoint | Imports the feature-specific CSS files under `styles/`. |
| `styles/tokens-base.css` | Design tokens, base styles and shared utilities | Colours, common buttons, common cards, utility classes. |
| `styles/header-groove.css` | Header, menu, hero and command-groove card | Edit this for top navigation, hero copy layout and groove carousel visuals. |
| `styles/pack-practice.css` | Pack panel, command-set selectors, question list and question card | Edit this for the pack sidebar/filter UI or practice workspace layout. |
| `styles/answer-feedback.css` | Answer entry, drawing pad, feedback cards and model-answer breakdown | Edit this for coach notes, stamps, weak/full-mark boxes and breakdown highlighting. |
| `styles/forms-responsive.css` | Manual-entry dialog and responsive rules | Edit this for modal form layout or mobile breakpoints. |
| `styles.css` | Legacy monolithic CSS reference | Kept temporarily for compatibility/reference. New styling edits should use `styles/`. |
| `app-config.js` | Version, URL constants, neutral command-groove defaults | Single place for app version and fetch paths. |
| `app-helpers.js` | Generic utilities | Safe HTML, title casing, path normalisation, explainer normalisation, downloads. Avoid feature-specific UI logic here. |
| `app.js` | Main app behaviour | Still monolithic. Contains state, loading, rendering, selection, feedback, input tools, and UI controls. |
| `app-maintenance.js` | Runtime glue and safety fixes | Owns version dropdown correction and neutral groove fallback until `app.js` is fully modularised. |
| `versions.json` | Universal version history | Do not archive/copy per version. |

## Functional areas in the app

### 1. Config and versioning

Current files:

- `app-config.js`
- `versions.json`
- version dropdown code inside `app.js`
- runtime correction inside `app-maintenance.js`

Future target:

- `src/config.js`
- `src/versioning.js`

### 2. Generic helpers

Current file:

- `app-helpers.js`

Future target:

- `src/helpers.js`

Rules:

- Keep only generic, reusable functions here.
- Do not put feature rendering or business flow here.
- Command-word teaching defaults can be normalised here only if they come from `app-config.js` or a future `command-explainers.js`.

### 3. Styling

Current files:

- `styles/main.css`
- `styles/tokens-base.css`
- `styles/header-groove.css`
- `styles/pack-practice.css`
- `styles/answer-feedback.css`
- `styles/forms-responsive.css`

Rule:

- New visual edits should go into the matching feature file under `styles/`.
- Keep `styles/main.css` as the only CSS file linked from `index.html`.
- Keep `styles.css` unchanged unless intentionally updating/removing the legacy reference.

### 4. App state

Current file:

- top of `app.js`

Current state includes:

- `allQuestions`
- `questions`
- `currentIndex`
- `versionHistory`
- `packManifest`
- `packFiles`
- `currentSource`
- `currentSelectionMode`
- `commandExplainers`

Future target:

- `src/state.js`

### 5. DOM registry

Current file:

- `els` object in `app.js`

Future target:

- `src/dom.js`

Rule:

- Only one file should query the DOM. Other modules should import/use the registry.

### 6. Data loading and pack import

Current file:

- `app.js`

Current functions:

- `initialiseApp`
- `loadQuestions`
- `loadExternalExplainers`
- `loadExternalManifest`
- `loadBundledPack`
- `handleUpload`
- `handleZipUpload`

Future target:

- `src/data-loader.js`

### 7. Command-word teaching logic

Current files:

- built-in `commandExplainers` object in `app.js`
- normalisation in `app-helpers.js`
- neutral fallback in `app-config.js`
- runtime safety in `app-maintenance.js`

Future target:

- `src/command-explainers.js`

Rule:

- `why` can use `Reason → Effect → Link`.
- Generic/default command-word fallback must stay neutral: `Match the command word`.

### 8. Pack and command-set selector

Current file:

- `app.js`

Current functions:

- `buildManifestFromQuestions`
- `renderCommandSetSelect`
- `getVisibleManifest`
- `renderSetTabs`
- `renderSetCards`
- `renderChecklist`
- `renderFilterChips`
- `applySelectionMode`
- `selectCommandSet`

Future target:

- `src/command-set-selector.js`

### 9. Question display

Current file:

- `app.js`

Current functions:

- `render`
- `renderList`
- `renderQuestion`
- `renderSource`
- `renderQuestionEnrichment`
- `renderCommandExplainer`

Future target:

- `src/question-renderer.js`

### 10. Answer input and checks

Current file:

- `app.js`

Current functions:

- `saveCurrentAnswer`
- `answerKey`
- `updateChecks`

Future target:

- `src/answer-input.js`

### 11. Feedback and answer breakdown

Current file:

- `app.js`

Current functions:

- `revealFeedback`
- `renderExceptionalAnswer`
- `renderBreakdown`
- `setActivePart`
- `clearActivePart`

Future target:

- `src/feedback-renderer.js`

### 12. Manual entry

Current file:

- `app.js`

Current function:

- `setupManualEntry`

Future target:

- `src/manual-entry.js`

### 13. Speech input

Current file:

- `app.js`

Current function:

- `setupSpeech`

Future target:

- `src/speech.js`

### 14. Drawing pad

Current file:

- `app.js`

Current functions:

- `setupCanvas`
- `clearCanvas`

Future target:

- `src/drawing-pad.js`

### 15. Small UI controls

Current file:

- `app.js`

Current functions:

- `setupVersionSwitcher`
- `setupCommandSetSwitcher`
- `cycleCommandWord`
- `setupGrooveCarousel`
- `setupPackPanelToggle`

Future target:

- `src/ui-controls.js`

## Recommended next refactor order

1. Move constants and state to `src/config.js` and `src/state.js`.
2. Move `els` to `src/dom.js`.
3. Move data loading into `src/data-loader.js`.
4. Move command explainers into `src/command-explainers.js`.
5. Move renderers into `src/question-renderer.js` and `src/feedback-renderer.js`.
6. Move tools into `src/speech.js`, `src/drawing-pad.js`, and `src/manual-entry.js`.

## Editing guide

- To change colours, shared buttons or common cards: edit `styles/tokens-base.css`.
- To change the top hero, menu, or command-groove card: edit `styles/header-groove.css`.
- To change pack filters, command-set selection, question list, or question card: edit `styles/pack-practice.css`.
- To change answer input, coach feedback, model answers, stamps, or breakdowns: edit `styles/answer-feedback.css`.
- To change the manual dialog or mobile layout: edit `styles/forms-responsive.css`.
- To change version or data URLs: use `app-config.js`.
- To change safe helper behaviour: use `app-helpers.js`.
- To change command-word learning content: currently use `app.js` built-in explainers or `data/command-explainers.json`; future home should be `src/command-explainers.js`.
- To change startup/data loading: currently use `app.js`; future home should be `src/data-loader.js`.
- To change version dropdown fixes or neutral fallback guard: use `app-maintenance.js`.

## Archive policy
- Archives in `versions/vX.Y.Z/` must be runnable static snapshots.
- Keep universal `versions.json` at root.
- Verify using `node scripts/verify-archives.js`.
- Semantic versioning: MAJOR breaking, MINOR features, PATCH fixes/maintenance.
