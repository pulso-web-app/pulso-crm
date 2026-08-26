## Why

The contacts page exposes summary metrics and filter controls but does not yet render the contacts that users need to browse.

## What Changes

- Add typed contact, stage, status, and filter contracts inside the contacts feature.
- Render mock contacts as responsive Angular Material cards.
- Connect search, stage, and status controls to the visible contact collection.
- Add working client-side pagination with an empty result state.

## Capabilities

### New Capabilities

- `contact-directory`: searchable, filterable, paginated presentation of CRM contacts.

### Modified Capabilities

None.

## Impact

The contacts list feature, its focused unit tests, and CRM list presentation change. Data remains in-memory mock data; federation contracts and deployment behavior are unchanged.

## Non-goals

- Backend persistence, server-side pagination, imports, and contact mutations.
- Changes to the public contacts routes or Shell federation contract.
