# Firestore Contact Directory

## Ownership and behavior

Contacts live at `contacts/{contactId}` in the existing `(default)` database. Every authenticated account reads the same directory; there is no owner filter or role hierarchy. Contact interactions belong at `contacts/{contactId}/interactions/{interactionId}` and projects at `projects/{projectId}`. The shared rules cover their descendants. Authentication remains in Pulso Shell; a signed-out standalone CRM displays an explanation and issues no directory reads. Account profiles at `users/{uid}` remain private and must not contain business collections.

The directory fetches one page at a time with `getDocsFromServer`. Results sort by `organizationNameSearch`, then document ID to resolve equal names. Next and previous pages use cursors; first and last pages use bounded queries directly. Page sizes are 9, 18, and 27. Changing size or filters returns to the first page. Aggregations provide matching totals and full-directory metric values without downloading all contacts. Metrics and totals are reused during page navigation, not recalculated from visible cards.

Search matches the beginning of the organization name, ignoring case, accents, and surrounding spaces. It is debounced by 300 ms and combines with stage and status filters in Firestore. It does not search arbitrary substrings, person names, or contact channels. The input explicitly describes this behavior.

Reads are not live subscriptions: remote edits become visible on a new query or reload. Counts and pages are separate server snapshots. If an external deletion empties a later page, the directory refreshes and returns to the first page. Loading, empty, signed-out, error, and retry states are explicit. Account changes discard previous data and cursors; obsolete requests cannot restore them.

## Document contract

| Field                                                      | Type                                         | Notes                                                                                                    |
| ---------------------------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `organizationName`                                         | Nonempty string                              | Display name.                                                                                            |
| `organizationNameSearch`                                   | String                                       | Trimmed name, NFD diacritics removed, lowercase using `pt-BR`. Required for ordering and prefix queries. |
| `stage`                                                    | String                                       | `contact`, `cold-lead`, `warm-lead`, `hot-lead`, `client`, `no-response`, or `not-interested`.           |
| `status`                                                   | String                                       | `new`, `contacted`, `awaiting-response`, or `closed`.                                                    |
| `lastContactAt`                                            | Firestore timestamp, ISO date string or null | Non-null dates become ISO strings; null means no contact date is recorded.                               |
| `contactName`                                              | Optional string                              | Primary person.                                                                                          |
| `instagramHandle`, `instagramProfileUrl`, `whatsappNumber` | Optional strings                             | Display information.                                                                                     |
| `activities`                                               | Optional array                               | Entries have `text`, `createdAt`, and `updatedAt`; saved with contact edits.                             |
| `seedId`                                                   | Optional string                              | Synthetic records created by this workflow use `crm-directory-v1`.                                       |

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

Clicking a card opens the contact editing dialog with every field from the selected record. The form owns its draft data. A valid save updates the existing document's editable fields and activity array, normalizes the organization search name, and uses `deleteField()` for cleared optional fields. Unrelated stored fields are preserved. The save button shows a spinner and editing, save, cancel, Escape and backdrop dismissal are disabled until the write settles. Failure preserves the draft, shows an accessible error, and permits retry or cancellation. Success closes the dialog with confirmed values and displays a snackbar.

The card emits the saved contact to the listing, which replaces the record by ID and adjusts cached stage metrics. Editing issues no page or aggregation reads. The page index, size, filter, total, visible slots and original query cursors remain unchanged; a renamed or reclassified card stays visible until the next normal query applies server ordering and filters. Cancellation or failure leaves the listing unchanged. Late results cannot reinsert missing records or populate a signed-out/loading view. Counts are snapshots, not realtime values. Separate interaction persistence and standalone create/detail/edit route implementation remain outside this feature.

New contact opens that same modal in creation mode without route navigation. Identity and channel fields start blank, classification defaults to Contact/New, activities are empty and lastContactAt is null. Saving uses addDoc in the shared collection, validates the stored contract, omits blank optional strings and returns the generated ID. The same pending and failure protections apply. After success, global metrics and the matching total are adjusted locally and only the first bounded page is queried again, preserving filters and size without new aggregation requests. The record can sort onto another page or fall outside the current filters. A failed follow-up read exposes the directory retry state and does not repeat the creation.

Import contacts accepts an editable JSON array loaded through paste or a local `.json` file. The public shape excludes IDs and `organizationNameSearch`; organization is required, optional strings are trimmed or omitted, classification defaults to Contact/New, last contact defaults to null, and activities default to an empty array. Dates must be valid ISO values, unknown fields are rejected, and a batch contains one to 500 entries. The client validates the complete array before allocating generated document references and issuing one Firestore batch commit, so a rejected commit creates none of its contacts. Repeated input objects remain independent contacts. After confirmation, the directory reloads its first bounded page, filtered count, and global summary from the server. Uploaded file content remains local to the browser and is not stored separately.
