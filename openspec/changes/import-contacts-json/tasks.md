## 1. Import Contract and Persistence

- [x] 1.1 Add the reusable JSON import parser, defaults, structured Portuguese validation issues, example, and AI prompt; verify parser tests cover valid minimal/full input and every specified invalid boundary.
- [x] 1.2 Add atomic `importContacts` persistence using prepared contact documents and generated references; verify repository tests cover one commit, normalization, returned IDs, pre-write rejection, and commit failure.

## 2. Import Experience

- [x] 2.1 Build the responsive import dialog with file loading, editable source, automatic validation, copy helpers, accessible feedback, and protected pending/retry/success states; verify focused component tests cover each observable state.
- [x] 2.2 Add Import contacts immediately before New contact, prevent duplicate dialogs, and reconcile successful imports through an authoritative first-page/count/summary refresh; verify filters, list, and store tests cover loading, empty, success, cancellation, and failure behavior.

## 3. Documentation and Validation

- [x] 3.1 Update contact data-access, feature, and Firestore documentation for the public import contract and behavior; verify documentation checks pass.
- [ ] 3.2 Run strict OpenSpec validation, focused contacts tests, `npm run check`, and an authenticated standalone CRM smoke test on port 4201; record the verification results without changing federation or deployment configuration.

## Validation Evidence

- Strict OpenSpec validation passed for all nine specifications and changes.
- Focused data-access tests passed: 43 tests across three files.
- Focused contacts feature tests passed: 102 tests across 15 files.
- `npm run check` passed documentation, strict specifications, lint for six projects, 157 workspace tests, seven migration tests, and the production build.
- Standalone CRM loaded `/contacts` on port 4201 with no browser console warnings or errors. Its expected signed-out state displayed both contact actions disabled. An authenticated smoke remains pending because no standalone session was available and the Shell on port 4200 was not running; no authentication or production data was fabricated.
