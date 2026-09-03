## 1. Save lifecycle

- [x] 1.1 Add pending button feedback, duplicate/invalid-save guards, disabled editing and dismissal protection; verify with dialog tests.
- [x] 1.2 Show accessible failure feedback with retryable drafts and success feedback after persistence; verify failed-save and retry tests.
- [x] 1.3 Test pending, success, failure/retry, cancellation, trimmed-name validation, and empty optional/activity states; run contacts-feature tests.

## 2. Confirmed local updates

- [x] 2.1 Connect the card output to full contact replacement by ID and cached stage metric adjustments while preserving query state; verify list integration tests.
- [x] 2.2 Test real dialog completion, cleared fields and reopen, no additional requests, retained pagination/filter cursors, and stale-view guards; all list integration tests pass.

## 3. Specifications and verification

- [x] 3.1 Synchronize the contact-directory capability and update the guides and OpenSpec context for real writes; verify strict specification validation.
- [x] 3.2 Run focused tests and npm run check; record verification evidence and limitations.

## Validation evidence

- `npx nx test contacts-feature` passed during implementation; the final `npm run check` passed all 61 contacts-feature tests and all other repository test targets, migration tests, documentation lint, strict OpenSpec validation, ESLint, and production build.
- Real Material dialogs in Angular integration tests verify pending Escape/backdrop/cancel protection, saved-card replacement, clearing a channel and reopening, failure/cancellation isolation, and no additional reads or aggregations. Backend I/O is mocked; no live database writes or browser E2E run were performed in this change.
- Store coverage verifies filtered page snapshots, unchanged cursor boundaries, stage deltas including the uncounted contact stage, and updates ignored during loading or after sign-out.
- The main contact-directory specification is synchronized and `openspec validate --specs --strict --no-interactive` passes. Guides and OpenSpec context now document real updates and the query snapshot trade-off.
- The archive CLI failed with Windows EPERM while staging its temporary rename. After verifying source/destination paths and the absence of an existing destination, the archive skill's native directory-move workflow succeeded with PowerShell Move-Item, preserving all artifacts and metadata.
