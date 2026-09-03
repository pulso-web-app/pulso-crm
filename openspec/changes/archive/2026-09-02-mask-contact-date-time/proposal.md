## Why

The last-contact fields currently require users to type separators. Numeric date and time entry should receive the Brazilian separators automatically.

## What Changes

- Mask date and time during typing and paste, preserving caret editing and deletion.
- Preserve strict date/time validation, picker selection and protected saving.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `contact-directory`: automatic separators for numeric last-contact input.

## Impact

Feature-local input behavior and tests only. No dependencies, persistence, graph, federation or deployment changes. Layout changes and permissive date parsing are non-goals.
