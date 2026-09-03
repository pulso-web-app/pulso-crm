## Context

See proposal.md for motivation. The existing card output already carries a Contact, but the list has no listener. The repository writes shared documents and uses deleteField for optional values. The route provides the backend; dialogs inherit that context through the card's view container. The current OpenSpec context predates these fixes and will be corrected as part of this change.

## Goals / Non-Goals

Goals: implement the specified save lifecycle and confirmed local reconciliation within contacts-feature, preserving user-authored persistence work.

Non-goals: global state, realtime subscriptions, automatic refetch, server-side write conflict resolution, and browser/tab-close prevention.

## Decisions

- Keep saving/error signals in the dialog. Guard save and cancel synchronously; set MatDialogRef.disableClose before starting the write and restore its previous value in finally. Disable form fields and activity controls during the write. Use Material's existing spinner and snackbar; render a persistent role=alert error in the dialog. A successful save alone closes with a Contact. An optimistic update was rejected because failure must preserve the persisted listing.
- The list subscribes to the existing card output and calls a store reconciliation method. Replace the entire record by ID, rather than merging, so removed optional fields disappear. Update cached stage metrics by the old/new stage delta. Ignore results when the store is not successful or the ID is absent.
- Preserve the current query snapshot's visible slots, filters, total, and cursor boundaries until normal navigation/filtering queries again. Reordering or refilling immediately would require reads and violate the requested request budget. Query cursors must not be derived from a renamed card because that would skip records between the previous boundary and the new name.
- Keep Portuguese feedback consistent with the existing product. Validate trimmed organization names before allowing a write. Freeze the submitted draft while saving.

## Risks / Trade-offs

- A renamed or reclassified contact can temporarily remain outside its query order/filter and the filtered total is a snapshot → explicitly specify snapshot behavior; normal page/filter actions query the server again.
- Separate server snapshots and concurrent remote edits can make cached counts stale → this change only applies known local stage deltas and does not claim realtime consistency.
- Browser unload or leaving the routed page is not prevented → protect dialog dismissal controls during the operation; do not install global navigation locks.

## Migration Plan

No data migration, deployment action, or federation change. Validate regression tests and the repository check, synchronize the capability specification and guides, and archive this change. Reverting the UI/store changes restores prior behavior without reverting stored records.
