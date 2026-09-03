## 1. Persistence

- [x] 1.1 Add typed contact creation and nullable last-contact support; verify serialization, returned identity and decoder/card tests.

## 2. Shared dialog and entry point

- [x] 2.1 Introduce explicit dialog modes, shared opening configuration and empty defaults; verify create/edit form tests.
- [x] 2.2 Connect New contact and confirmed list reconciliation; verify empty/list/filtered states, bounded reads and unchanged edit behavior.
- [x] 2.3 Verify creation pending, validation, cancellation, failure/retry and success with automated integration tests.

## 3. Documentation and validation

- [x] 3.1 Synchronize specs and guides, then run strict OpenSpec validation.
- [x] 3.2 Verify standalone UI and npm run check; record evidence and archive the completed change.

## Validation evidence

- `npm run check` passed documentation lint, strict OpenSpec validation, ESLint, all repository tests and the production build. Contacts-feature has 71 passing tests and contacts-data-access has 31.
- Integration tests open the real shared Material dialog, exercise empty initialization, cancellation/reopen, invalid names, pending duplicate/cancel/Escape/backdrop protection, failure/retry and successful creation. They verify one bounded page refresh and no new aggregation calls. Backend I/O is mocked.
- Repository tests verify generated identity, omitted blank fields, normalized names, explicit null last-contact dates, entered activities, invalid inputs and propagation of write failures. Existing edit regressions remain passing.
- Standalone browser smoke at port 4201 verified that the signed-out directory renders and disables New contact. The available standalone browser session was not authenticated, so no live creation or authenticated visual smoke was performed. The development server remains running for manual testing.
- The three added requirements are synchronized into contact-directory. No dependencies, Nx graph boundaries, federation contracts, routes, security rules, indexes, or deployment configuration changed. No live data was written.
- The CLI archive staging rename failed with Windows EPERM. The archive skill's native directory-move workflow succeeded with PowerShell Move-Item after source/destination verification, retaining all artifacts and metadata.
