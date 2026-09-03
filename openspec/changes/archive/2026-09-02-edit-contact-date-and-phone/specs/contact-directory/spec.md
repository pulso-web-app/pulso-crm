## ADDED Requirements

### Requirement: Editable last-contact date and time

The shared creation and editing dialog SHALL accept optional last-contact date and time in local Brazilian DD/MM/YYYY and 24-hour HH:mm format, support keyboard entry and pickers, and persist the corresponding ISO instant or null when both are cleared.

#### Scenario: enter or adjust an event

- **WHEN** a user selects or types a valid date and time
- **THEN** the badge reflects the local event and a successful save returns the corresponding instant through existing directory reconciliation
- **AND** opening a persisted event displays its local date and time without modifying it until edited

#### Scenario: record the current moment

- **WHEN** the user clicks Agora beside the last-contact badge
- **THEN** both fields and the badge use the machine's current date and time

#### Scenario: invalid or incomplete event

- **WHEN** either field is invalid or only one is filled
- **THEN** feedback explains the required formats or missing field and saving issues no write

#### Scenario: clear or save an event

- **WHEN** both fields are cleared
- **THEN** the unknown event is saved as null
- **AND** while any write is pending the fields, pickers and Agora are disabled and failure preserves the draft

### Requirement: Brazilian WhatsApp input mask

The dialog SHALL format Brazilian phone input during typing and pasting with an area code and eight- or nine-digit subscriber number, preserve cursor editing, and allow clearing the optional number.

#### Scenario: type or paste a phone

- **WHEN** a user types a national number or pastes a Brazilian number prefixed with +55
- **THEN** the input shows (DD) NNNN-NNNN or (DD) NNNNN-NNNN as appropriate and opening WhatsApp uses exactly one country code

#### Scenario: change or clear a phone

- **WHEN** the user edits within the number, deletes digits, or clears the field
- **THEN** the mask follows the remaining digits and a cleared field remains optional
