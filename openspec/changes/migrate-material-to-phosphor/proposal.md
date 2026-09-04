## Why

The CRM needs broader icon coverage, especially branded contact-channel icons, while preserving the existing Angular Material contact experience and its interaction behavior.

## What Changes

- Replace authored Material icon glyphs across contact list, filters, cards, dialogs, import feedback, and last-contact controls with equivalent Phosphor icons.
- Use Phosphor brand icons for Instagram and WhatsApp contact channels.
- Keep every Angular Material component, directive, theme, dialog, date/time control, form field, button, menu, spinner, card, and paginator intact.
- Remove the Material Icons font link only after authored `mat-icon` usage is eliminated.
- Add focused regression tests and visual verification for both icon rendering and Material component preservation.

## Capabilities

### New Capabilities

- `contact-iconography`: Defines Phosphor icon presentation across CRM contact surfaces while preserving Material components and behavior.

### Modified Capabilities

None.

## Impact

- UI: icon elements and icon-specific sizing/spacing only; contact routes, dialogs, forms, validation, Firestore behavior, pagination, and import behavior are unchanged.
- Data: no schema, query, write, or cache changes.
- Dependencies: add Phosphor Web Components; retain Angular Material and CDK.
- Federation: the `crm` remote name and `./Routes` exposure remain unchanged.
- Non-goals: component rewrites, custom replacements for Material controls, layout restyling, route changes, backend changes, or deployment changes.
