# Command Word Coach v0.1.22

Archived before the v0.1.23 maintainability refactor.

v0.1.22 refactored shared helper logic out of `app.js` into `app-helpers.js` while keeping behaviour largely unchanged.

v0.1.23 begins the next maintainability step:

- separates runtime config/version values;
- removes the need for the temporary command-groove fallback patch script;
- adds a code-organisation guide for feature areas;
- prepares for future staged splitting of `app.js` and CSS.

The full v0.1.22 source is recoverable from Git history immediately before the v0.1.23 release.
