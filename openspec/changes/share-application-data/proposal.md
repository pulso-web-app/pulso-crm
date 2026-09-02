## Why

The directory currently isolates contacts under each user's document. Pulso is one shared application: all signed-in users must access the same business records.

## What Changes

- Query the root `contacts` collection for every authenticated session.
- Remove user IDs from read, count, and seed APIs; retain session gating and stale-response protection.
- Migrate legacy contacts, interactions, and projects into shared paths with collision detection, backups, and atomic transfers.
- Preserve pagination, filtering, and existing IDs; update tests and documentation.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `contact-directory`: Replace per-user ownership with shared authenticated access.

## Impact

CRM owns queries, seeding, and migration. Shell owns the published Firestore rules. The same `share-application-data` change in Tooling coordinates Shell, CRM, and Projects. Existing Firebase project, login, routes, federation names, ports, hosting, and CI remain unchanged. Only the rules update and data migration are published; application hosting is outside scope. No editing UI, roles, tenants, or Projects features are added.
