## Why

The New contact action navigates to a scaffold instead of creating a record. The existing edit dialog already provides the fields, validation and save lifecycle needed for creation.

## What Changes

- Open the shared contact dialog in an explicit creation mode with blank identity/channel fields and no activities.
- Create a shared Firestore contact with a generated ID, normalized search name and safe optional values; retain edit behavior.
- Reuse validation, pending dismissal protection, error recovery and success feedback.
- After creation, update cached counts and request only the current bounded page to maintain server ordering and pagination. Existing edit saves continue to reconcile without reads.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `contact-directory`: New contact creation through the existing modal.

## Impact

CRM contacts feature and data-access only, with existing dependencies and Portuguese UI. No federation, route contract, security rules, indexes or deployment changes. New documents use the existing contact schema. Non-goals: implementing the standalone new/detail/edit route shells, importing contacts, realtime synchronization, and changing the edit reconciliation behavior.
