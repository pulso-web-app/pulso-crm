## Context

The configured Standard Firestore database has no contacts. Existing rules authorize only `users/{uid}/contacts` for the matching authenticated user. The shell restores the Firebase Auth session before entering CRM; standalone CRM must clearly explain when sign-in is needed. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:** A separately testable Firestore boundary, bounded cursor pagination, typed document validation, current-request-only state updates, and reproducible synthetic seeding.

**Non-Goals:** CRUD, interaction persistence, authentication ownership changes, subscriptions to the entire collection, offline persistence, hosting or security-rule changes.

## Decisions

- Extract `contacts-data-access` with contact contracts, a Firestore repository, and explicit Firebase providers. Keep presentation and directory state in `contacts-feature`. A separate domain library is unnecessary for the current data-only contract.
- Supply the existing Firebase app at the CRM route boundary, including the federated entry. Observe the existing Firebase Auth session and clear all local state on account changes. Never query a root-level contacts collection.
- Order by `organizationNameSearch` and document ID. Use `limit` plus `startAfter` for forward pages and `limitToLast` plus `endBefore` for backward pages. First and last pages use bounded queries directly. Read counts with aggregation; never use offsets or load all contacts to paginate.
- Normalize the organization name on write and search with prefix bounds. Equality filters compose with this ordering. Store three collection-scoped composite indexes for stage, status, and their combination with name ordering. No search service or oversized substring index is added.
- Debounce search, invalidate pending requests immediately, and discard results after filter, page, session, or component-lifetime changes. Keep page sizes at 9, 18, and 27; size/filter changes reset to page zero. Counts and summary are reused during navigation and refreshed on a fresh filter request or retry as appropriate.
- Replace static metrics with aggregations across the user's full directory. Remove the in-memory edit dialog and its call sites while retaining the existing standalone create/detail/edit route shells.
- Seed 36 deterministic synthetic records through an explicit Node command using the existing Firebase CLI login. Use create preconditions and a seed marker, and never overwrite existing records. The command requires project and user arguments and stays outside browser code. Verify remote counts and bounded queries after insertion.

## Risks / Trade-offs

- Prefix search differs from arbitrary local substring matching; disclose the precise search behavior in the input label and documentation.
- Count and page reads are separate snapshots; this listing-only phase is not a live subscription. Retry refreshes counts and recovers a page that becomes empty after external deletion.
- Composite indexes must be ready before filtered reads; provision only the required additive Firestore indexes, without deploying hosting or rules.
- Standalone CRM has no login form; signed-out visitors receive a sign-in explanation and authenticate through the existing shell.
- Client writes remain governed by the existing rules; this feature provides no write path. Synthetic records can later be identified by their exact seed marker.
