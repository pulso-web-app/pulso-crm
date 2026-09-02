## Why

The directory currently filters and paginates bundled mock contacts. The configured Firestore database should become the source of truth so that listing behavior can be exercised with persisted test records.

## What Changes

- Read the signed-in user's `users/{uid}/contacts` collection under the existing security rules.
- Fetch bounded pages with Firestore cursors and server-side counts, filters, and normalized organization-name prefix search.
- Define loading, empty, success, signed-out, and retryable failure states and prevent stale requests from replacing newer results.
- Replace invented summary values with server counts and remove mock data and local-only editing from the directory.
- Add an explicit, repeatable seed command for synthetic contacts, outside application startup.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `contact-directory`: Persisted, user-scoped queries and cursor pagination replace local mocks.

## Impact

Extract a contacts data-access Nx library for the Firestore boundary. CRM supplies the existing Firebase application through route providers; the shell retains authentication ownership. UI copy stays Portuguese to match the existing product. Test data is synthetic and explicitly marked for cleanup. Required query indexes are documented separately from hosting. No hosting, security-rule, CI, federation exposure, or route-path changes. Creating, editing, importing, interactions, full-text search services, and e2e execution are outside this change.

Organization-name prefix search is the agreed scope for textual discovery in this phase.
