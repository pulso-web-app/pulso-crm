## 1. Form controls

- [x] 1.1 Implement Brazilian date/time entry, Agora, clearing and pending protection; verify parsing, ISO round trips and invalid drafts in tests.
- [x] 1.2 Implement WhatsApp masking; verify typing, paste, clearing and caret editing.

## 2. Integration and verification

- [x] 2.1 Integrate both controls into creation and editing; test saved values and existing lifecycle behavior.
- [x] 2.2 Run contacts tests, npm run check and standalone verification; document limitations and impact.
- [x] 2.3 Synchronize main specifications, validate strictly and archive the completed change.

## Verification evidence

- `npm run check` passed: documentation, strict OpenSpec validation, lint, unit/tooling tests, and production build. Contacts feature: 86 tests passed; data access: 31 tests passed.
- Tests exercise Brazilian keyboard parsing, invalid dates/times and recovery, midnight, localized calendar and timepicker opening/selection, Agora, clearing, pending protection, phone typing/paste/caret deletion, and create/edit persistence payloads.
- Port 4201 opened successfully in the in-app browser. The session is signed out and correctly disables creation; authenticated modal behavior was verified through Angular integration tests with repository mocks, without live database writes.
- Graph, federation and deployment contracts are unchanged. Data remains ISO/null; no migration or new dependency is required.
- The OpenSpec archive CLI failed with EPERM while staging its directory rename after reporting all tasks complete. Archive finalization uses native PowerShell Move-Item with verified repository-contained source and destination paths; specifications were already synchronized and validated.
