## Purpose

Defines a safe, understandable JSON workflow for creating many contacts atomically from pasted or locally selected data.

## ADDED Requirements

### Requirement: JSON import input

The CRM SHALL accept a JSON array containing between one and 500 contacts from either editable pasted text or a locally selected `.json` file whose contents populate the same editor.

#### Scenario: paste or load valid JSON

- **WHEN** an authenticated user pastes JSON or selects a readable `.json` file
- **THEN** the editor contains that text and automatically reports the number of valid contacts available to import

#### Scenario: edit loaded file contents

- **WHEN** the user changes text previously loaded from a file
- **THEN** validation uses the edited text without modifying or uploading the local file

#### Scenario: unreadable or unsupported file

- **WHEN** the user selects a non-JSON or unreadable file
- **THEN** the dialog reports an accessible file error and performs no contact write

### Requirement: Import contact validation

The CRM SHALL require a non-empty `organizationName`, accept only documented public fields, apply Contact, New, null last-contact, and empty activity defaults when their fields are omitted, and validate classifications, optional strings, ISO dates, and complete activities before enabling import.

#### Scenario: minimal contact

- **WHEN** an item contains only a valid `organizationName`
- **THEN** it is normalized with `stage` set to `contact`, `status` set to `new`, `lastContactAt` set to null, and `activities` set to an empty array

#### Scenario: complete contact

- **WHEN** an item includes documented optional channels, a valid stage and status, a valid ISO last-contact value or null, and activities with text and valid ISO created and updated dates
- **THEN** those values are accepted and preserved for import while blank optional strings are omitted

#### Scenario: malformed structure or field

- **WHEN** the text is malformed JSON, its root is not an array, its array is empty or exceeds 500 items, or an item has an unknown, internal, incorrectly typed, empty required, invalid classification, or invalid date field
- **THEN** import remains disabled, no write occurs, and accessible feedback identifies the affected contact position and field when applicable

#### Scenario: repeated contacts

- **WHEN** two or more valid items contain the same values
- **THEN** each item remains eligible to create an independent contact

### Requirement: Atomic contact import

The CRM SHALL validate the complete input before issuing one atomic write that assigns generated IDs and stores normalized contact documents in the shared contacts collection.

#### Scenario: successful import

- **WHEN** every input item is valid and the backend commits the batch
- **THEN** every contact is created, the dialog closes, and an accessible message reports the imported quantity

#### Scenario: validation or commit failure

- **WHEN** any item is invalid or the backend rejects the batch
- **THEN** no item from that attempt is created or reported as successful and the dialog retains the source text for correction or retry

#### Scenario: import is pending

- **WHEN** the atomic write is pending
- **THEN** editing, repeated submission, cancellation, Escape, and backdrop dismissal are disabled and visible progress is shown

### Requirement: Import assistance

The import dialog SHALL let users copy a complete JSON example and a Portuguese AI prompt that defines the accepted fields, classifications, dates, defaults, and JSON-array-only output requirement.

#### Scenario: copy helper succeeds

- **WHEN** the user copies either helper and clipboard access succeeds
- **THEN** accessible feedback identifies the copied helper without replacing the import editor

#### Scenario: clipboard access fails

- **WHEN** clipboard access is unavailable or denied
- **THEN** an accessible error is shown and the editor remains unchanged
