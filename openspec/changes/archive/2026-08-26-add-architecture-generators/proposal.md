## Why

CRM capability constraints are manually duplicated in ESLint and its exposed route name differs from the common remote contract.

## What Changes

- Derive scope constraints from architecture.config.json.
- Expose REMOTE_ROUTES while preserving CRM_ROUTES.

## Capabilities

### New Capabilities

- `declarative-crm-boundaries`: repository-owned architecture behavior required by the shared generator workflow.

### Modified Capabilities

None.

## Impact

Configuration, route contracts, and focused tests change. Product behavior and deployment ownership remain unchanged.
