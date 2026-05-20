# Command Word Coach code map

This file explains where each feature area currently lives and where future refactors should move it.

## Current runtime files

| File | Owns | Notes |
| --- | --- | --- |
| `index.html` | App shell and DOM structure | Keep IDs stable because `app.js` reads them through the `els` registry. |
| `styles.css` | All styling | Still monolithic. Next CSS refactor should split this into labelled files under `styles/`. |
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

### 3. App state

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

### 4. DOM registry

Current file:

- `els` object in `app.js`

Future target:

- `src/dom.js`

Rule:

- Only one file should query the DOM. Other modules should import/use the registry.

### 5. Data loading and pack import

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

### 6. Command-word teaching logic

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

### 7. Pack and command-set selector

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

### 8. Question display

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

### 9. Answer input and checks

Current file:

- `app.js`

Current functions:

- `saveCurrentAnswer`
- `answerKey`
- `updateChecks`

Future target:

- `src/answer-input.js`

### 10. Feedback and answer breakdown

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

### 11. Manual entry

Current file:

- `app.js`

Current function:

- `setupManualEntry`

Future target:

- `src/manual-entry.js`

### 12. Speech input

Current file:

- `app.js`

Current function:

- `setupSpeech`

Future target:

- `src/speech.js`

### 13. Drawing pad

Current file:

- `app.js`

Current functions:

- `setupCanvas`
- `clearCanvas`

Future target:

- `src/drawing-pad.js`

### 14. Small UI controls

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

1. Split `styles.css` into labelled CSS files under `styles/`.
2. Move constants and state to `src/config.js` and `src/state.js`.
3. Move `els` to `src/dom.js`.
4. Move data loading into `src/data-loader.js`.
5. Move command explainers into `src/command-explainers.js`.
6. Move renderers into `src/question-renderer.js` and `src/feedback-renderer.js`.
7. Move tools into `src/speech.js`, `src/drawing-pad.js`, and `src/manual-entry.js`.

## Editing guide

- To change colours, layout or visual design: start in `styles.css`.
- To change version or data URLs: use `app-config.js`.
- To change safe helper behaviour: use `app-helpers.js`.
- To change command-word learning content: currently use `app.js` built-in explainers or `data/command-explainers.json`; future home should be `src/command-explainers.js`.
- To change startup/data loading: currently use `app.js`; future home should be `src/data-loader.js`.
- To change version dropdown fixes or neutral fallback guard: use `app-maintenance.js`.
