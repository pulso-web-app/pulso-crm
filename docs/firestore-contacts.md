# Firestore Contact Directory

## Ownership and behavior

Contacts live at `contacts/{contactId}` in the existing `(default)` database. Every authenticated account reads the same directory; there is no owner filter or role hierarchy. Contact interactions belong at `contacts/{contactId}/interactions/{interactionId}` and projects at `projects/{projectId}`. The shared rules cover their descendants. Authentication remains in Pulso Shell; a signed-out standalone CRM displays an explanation and issues no directory reads. Account profiles at `users/{uid}` remain private and must not contain business collections.

The directory fetches one page at a time with `getDocsFromServer`. Results sort by `organizationNameSearch`, then document ID to resolve equal names. Next and previous pages use cursors; first and last pages use bounded queries directly. Page sizes are 9, 18, and 27. Changing size or filters returns to the first page. Aggregations provide matching totals and full-directory metric values without downloading all contacts. Metrics and totals are reused during page navigation, not recalculated from visible cards.

Search matches the beginning of the organization name, ignoring case, accents, and surrounding spaces. It is debounced by 300 ms and combines with stage and status filters in Firestore. It does not search arbitrary substrings, person names, or contact channels. The input explicitly describes this behavior.

Reads are not live subscriptions: remote edits become visible on a new query or reload. Counts and pages are separate server snapshots. If an external deletion empties a later page, the directory refreshes and returns to the first page. Loading, empty, signed-out, error, and retry states are explicit. Account changes discard previous data and cursors; obsolete requests cannot restore them.

## Document contract

| Field                                                      | Type                                   | Notes                                                                                                    |
| ---------------------------------------------------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `organizationName`                                         | Nonempty string                        | Display name.                                                                                            |
| `organizationNameSearch`                                   | String                                 | Trimmed name, NFD diacritics removed, lowercase using `pt-BR`. Required for ordering and prefix queries. |
| `stage`                                                    | String                                 | `contact`, `cold-lead`, `warm-lead`, `hot-lead`, `client`, `no-response`, or `not-interested`.           |
| `status`                                                   | String                                 | `new`, `contacted`, `awaiting-response`, or `closed`.                                                    |
| `lastContactAt`                                            | Firestore timestamp or ISO date string | Converted into an ISO string by the reader.                                                              |
| `contactName`                                              | Optional string                        | Primary person.                                                                                          |
| `instagramHandle`, `instagramProfileUrl`, `whatsappNumber` | Optional strings                       | Display information.                                                                                     |
| `activities`                                               | Optional array                         | Each existing entry has `text`, `createdAt`, and `updatedAt`; no activity writes are implemented.        |
| `seedId`                                                   | Optional string                        | Synthetic records created by this workflow use `crm-directory-v1`.                                       |

The Firestore document ID is authoritative. Returned malformed records fail the read instead of being silently skipped. Firestore ordering excludes documents missing `organizationNameSearch`, so future writers and imports must always populate and update it using `normalizeContactSearch`.

## Index preparation

The canonical `pulso-shell/firestore.indexes.json` defines three collection-scoped indexes: stage/name, status/name, and stage/status/name. Firestore appends document identity to each index. The existing single-field name index covers unfiltered and prefix-only queries. Shell owns both rules and index deployment, preventing conflicting configurations between remotes.

```sh
cd ../pulso-shell
npx firebase deploy --only firestore:indexes --project pulso-web-app
```

Run index deployment only for an approved database change, reviewing any proposed deletions from Firebase CLI. Newly created indexes build asynchronously and must reach `READY` before filtered reads. The three existing indexes also support the shared collection; moving contacts does not require rebuilding them. See the [Shell Firestore guide](../../pulso-shell/docs/firestore.md).

## Synthetic seed

From CRM, authenticate with `npx firebase login`, then pass the project explicitly:

```sh
npm run contacts:seed -- --project pulso-web-app --dry-run
npm run contacts:seed -- --project pulso-web-app
```

The command creates 36 clearly synthetic contacts, including accented and repeated organization names, all stages/statuses, and missing optional channels. It uses deterministic IDs (`seed-crm-directory-v1-001` through `seed-crm-directory-v1-036`), a `seedId` marker, and create-only preconditions. Reruns skip existing records without overwriting edits or touching other documents. No seed runs during application startup. Administrative credentials never enter the application bundle or repository.

To clean up later, review records in the root `contacts` collection with `seedId == "crm-directory-v1"` and remove only the intended synthetic records. No automatic cleanup or database-wide deletion is provided.

## Legacy data migration

The one-time migration discovers business records under every `users/{uid}/contacts` and `users/{uid}/projects` tree, including descendants of nonexistent parent documents. It preserves IDs and fields, updates typed Firestore document references inside migrated data, and leaves account profiles untouched.

```sh
npm run data:migrate-shared -- --project pulso-web-app --dry-run
npm run data:migrate-shared -- --project pulso-web-app
```

The command rejects collisions across users or existing destination documents before making changes. Before its first write it saves a complete source snapshot under ignored `tmp/shared-data-backups/`. Each source tree transfers in an atomic commit with create-only destination preconditions and source update-time preconditions. Trees larger than 250 documents are rejected before any writes. Commits are atomic per tree, not across the entire migration; a failed run can resume safely for the remaining trees. Avoid business writes during migration, then deploy the tested shared rules from Shell and use the updated CRM.

References in unrelated collections and plain string fields are not rewritten. Future migrations involving such relationships require their own explicit mapping. After migration, rerunning the command is a no-op and rerunning the seed skips existing shared test records. The old nested business paths are denied by the new rules.

## Validation

`npm run check` runs documentation lint, strict OpenSpec validation, lint, all unit tests (including the migration planner), and production build. E2E execution remains separate and was explicitly excluded from this change. Unit tests replace only the external I/O boundary and cover shared query constraints, document decoding, asynchronous states, pagination, and session lifecycle. Shell's separate `npm run test:rules` proves shared CRUD and queries for two accounts and denial without authentication using the Firestore emulator.

Clicking a card opens the original contact editing dialog with every field from the selected persisted record, including activity history. The original form layout, validation, channel shortcuts, activity draft controls, and card action menu are preserved. The form owns its draft data; saving returns the draft through the existing card output, and cancelling discards it. Neither action writes to Firestore or changes the persisted directory locally. Creating, updating, importing, and interaction persistence remain outside this feature. The existing create/detail/edit route shells are also preserved.
