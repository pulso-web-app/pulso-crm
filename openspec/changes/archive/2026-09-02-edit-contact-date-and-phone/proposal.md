## Why

Users cannot record or correct the last contact event in the shared modal, and unmasked WhatsApp input is difficult to read while typing.

## What Changes

- Add Brazilian date and 24-hour time pickers with strict validation in creation and editing.
- Add Agora beside the last-contact badge and allow clearing an unknown timestamp.
- Format Brazilian WhatsApp numbers during typing and pasting.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `contact-directory`: editable last-contact timestamp and Brazilian phone entry.

## Impact

Contact feature UI and tests change. Existing ISO/null persistence and reconciliation remain compatible. No new dependencies, graph boundaries, federation or deployment changes. International telephone support and route scaffolds are non-goals.
