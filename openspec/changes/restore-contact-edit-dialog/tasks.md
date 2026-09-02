# Tasks

- [x] Restore the original dialog, card interactions, and utility dependency with the public contact model.
- [x] Add regression coverage for full contact handoff, pagination, optional fields, and draft isolation; retain the original dialog behavior tests.
- [x] Update capability documentation to describe the restored UI and pending backend update integration.
- [x] Run focused tests and `npm run check`; manually verify the dialog in Shell and standalone CRM state without running E2E suites.
- [x] Sync the capability specification.
- [ ] Archive the change with the supported CLI.

## Validation evidence

- `npm run check` passed documentation/spec validation, lint, all 91 CRM unit tests (84 Angular/library tests and 7 migration tests), and the production build.
- Final focused lint and all 49 contacts feature tests passed without lint warnings after removing a test-only non-null assertion.
- Browser smoke: authenticated Shell loaded 36 shared contacts; original dialog opened for Aurora Studio on page one and Farol Marketing on page two with their respective fields; editing and cancelling worked; card menu exposed both existing navigation actions. Standalone CRM preserved the signed-out state. The development server was restarted after the production build.
- The card and dialog HTML/SCSS are identical to their original Git versions. Only imports, typed data boundaries, and activity draft isolation changed in the restored implementation.
- No Firestore write, deployment, or E2E suite was run.
- Archival remains pending: `npx openspec archive restore-contact-edit-dialog --skip-specs --yes` failed with Windows `EPERM` while staging the source directory. The supported CLI attempted no fallback copy. The source change remains intact and the main capability specification is already synchronized.
