## Why

CRM tests emit runtime errors because the DOM test environment does not implement `ResizeObserver`, and the Angular unit-test builder reports the Native Federation build target as unsupported.

## What Changes

- Provide a deterministic test-only `ResizeObserver` implementation.
- Point unit tests at the existing Angular application build target.
- Preserve production directive behavior and federation configuration.

## Capabilities

### New Capabilities

None. This change corrects test infrastructure only.

### Modified Capabilities

None.

## Impact

Only CRM unit-test setup and configuration change. Contact behavior, routing, federation, and deployment remain unchanged.
