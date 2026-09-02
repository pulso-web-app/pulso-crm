## 1. Firestore boundary

This completed implementation was subsequently updated by `share-application-data`: the current directory is shared across authenticated accounts, and Shell now owns canonical indexes. The synchronized main specification reflects that newer contract. Windows `EPERM` currently prevents archiving this completed historical change.

- [x] 1.1 Extract contacts data access, validate documents, and wire existing Firebase through public APIs; verify library lint, build, and decoder tests.
- [x] 1.2 Implement user-scoped queries, counts, filters, and cursor navigation; verify focused repository tests including equal names and partial last pages.

## 2. Directory behavior

- [x] 2.1 Connect listing state and real metrics, with search debounce and session/request invalidation; verify loading, empty, success, signed-out, failure, retry, and stale-response tests.
- [x] 2.2 Remove bundled mocks and simulated directory writes; verify read-only cards and existing route-shell unit tests.

## 3. Test data and validation

- [x] 3.1 Add and execute an idempotent synthetic seed for the existing demo user and prepare required indexes; verify stored counts, page boundaries, filtered reads, and a no-op rerun.
- [x] 3.2 Update data-contract and operational documentation; run strict OpenSpec validation and npm run check without e2e, and verify standalone loading when practical.
