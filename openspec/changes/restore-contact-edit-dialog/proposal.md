# Restore contact editing UI

## Why

The Firestore listing change removed the existing card click, action menu, and contact editing dialog. That removal was outside the requested persistence scope and discarded working user-authored UI.

## What Changes

- Restore the original card interactions and dialog template, styles, validation, channel shortcuts, and activity draft controls.
- Pass the complete current contact from the persisted page into the dialog through the public contact data contract.
- Preserve the dialog result and card output without adding a Firestore update or changing the persisted directory locally.
- Cover data handoff after pagination and draft isolation with unit tests and a manual browser smoke check.

## Impact

CRM contacts feature only. Restore its existing shared utility dependency. No changes to Firestore data, queries, rules, federation contracts, or deployment. Backend updates, new route implementations, and E2E execution are outside this change.
