## Why

Contact edits now reach Firestore, but the dialog lacks save feedback and allows dismissal while saving. The directory ignores the saved result, and its specification still describes draft-only editing.

## What Changes

- Specify the existing route-scoped repository injection and Firestore update contract, including clearing optional fields.
- Show pending, success, validation, and retryable failure feedback; prevent duplicate saves and dialog dismissal during a write.
- Apply the confirmed saved contact to the visible page by ID without additional reads or aggregations.
- Synchronize the capability specification and documentation with the implemented editing flow.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `contact-directory`: Persist edits, protect pending saves, report outcomes, and reconcile confirmed edits locally.

## Impact

CRM contacts feature and data-access tests/documentation only. Existing Firestore documents are updated through the existing repository; no schema, rules, indexes, federation contract, dependencies, or deployment changes are required. New feedback follows the existing Portuguese UI. Non-goals: create/detail/edit route implementation, live synchronization, conflict resolution, automatic page refill or server reordering after an edit, and changes to unrelated OpenSpec changes.
