## Context

CRM reads `users/{uid}/contacts`; the only known legacy data is the synthetic directory. The same Firebase project serves all Pulso users. Shell owns the canonical Firestore rules and indexes.

## Goals / Non-Goals

Share business data and preserve bounded queries and session lifecycle behavior. Do not add editing UI, roles, tenants, or application deployment.

## Decisions

- Remove owner arguments from repository read/count/summary methods and query root `contacts`. Auth remains a lifecycle gate, not a data partition.
- Keep session-change invalidation even though records are shared; an old request must never repopulate a signed-out screen.
- Seed root contacts without a user parameter. Keep deterministic IDs and create-only behavior.
- Discover legacy contact/project trees under all user paths, including missing parent documents. Plan every target first, reject collisions, and back up data outside tracked source. Transfer each tree using one atomic commit with destination-missing and source-version preconditions. Preserve descendants and rewrite typed references to migrated paths. Refuse trees above the supported atomic batch size.
- Consolidate Firestore indexes in Shell's existing deployment configuration to prevent a later deployment from dropping required indexes. No cross-repository application source imports.

## Risks / Trade-offs

All authenticated users can change business records by design. Account profiles remain private. Concurrent legacy edits fail version preconditions; retry rediscovers remaining sources. Backups contain data and must remain untracked. Future business collections need an explicit shared root rule; no database-wide wildcard is introduced.
