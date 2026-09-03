## MODIFIED Requirements

### Requirement: Existing contact editing dialog

The CRM SHALL preserve the existing card click, action menu, and editing dialog, initializing an isolated form from the complete selected persisted contact and persisting valid edits before returning a successful result.

#### Scenario: open a contact from any page

- **WHEN** a user clicks a contact card on the current directory page
- **THEN** the original dialog opens with that contact's identity, organization, person, classification, channels, last-contact timestamp, and activity history using the directory's configured backend

#### Scenario: optional fields are absent

- **WHEN** the selected record has no optional person or channel fields
- **THEN** those form fields are empty and no values from another contact appear

#### Scenario: edit or cancel a draft

- **WHEN** the user edits fields or adds an activity draft without completing a save, or cancels while idle
- **THEN** source contacts remain unchanged and cancelling issues no write or successful result

#### Scenario: use the card action menu

- **WHEN** the user opens the card action menu
- **THEN** the existing detail and edit navigation actions remain available without also opening the dialog

## ADDED Requirements

### Requirement: Persisted contact edits

The CRM SHALL update the selected shared contact's editable fields and activity history, normalize the organization search value, preserve unrelated stored fields, and remove cleared optional person and channel fields without sending undefined values.

#### Scenario: save valid fields and activities

- **WHEN** a valid edited contact is saved successfully
- **THEN** one backend update persists the submitted contact fields and added activities under the original contact ID, the dialog returns the confirmed saved values, and an accessible success message is displayed

#### Scenario: clear optional fields

- **WHEN** the user saves with a person or channel field empty or containing only whitespace
- **THEN** the corresponding stored field is removed and remains empty when the dialog is reopened

#### Scenario: organization name is invalid

- **WHEN** the organization name is empty or whitespace-only
- **THEN** save is disabled, validation feedback is available, and invoking save issues no write

### Requirement: Protected save lifecycle

The dialog SHALL visibly distinguish idle, saving, success, and failure, block duplicate submissions and user dismissal during the write, and retain the draft after failure.

#### Scenario: save is pending

- **WHEN** a save starts and its backend result is pending
- **THEN** the save button shows a spinner and saving label, save and cancel are disabled, editing is disabled, and neither Escape nor backdrop clicks nor the cancel action dismiss the dialog

#### Scenario: save fails and is retried

- **WHEN** a write fails
- **THEN** an accessible error message appears, the dialog remains open with the draft intact, the spinner stops, editing and dismissal become available, and a retry starts a new write without changing the listing before success

### Requirement: Local reconciliation after confirmed edits

The directory SHALL replace the visible contact by ID only after confirmed persistence, without issuing page reads or aggregation requests as a consequence of saving.

#### Scenario: save completes on a paginated or filtered page

- **WHEN** a visible contact is saved successfully
- **THEN** its card and any reopened dialog show the confirmed values, cleared optional fields disappear, unrelated cards remain unchanged, and the current page index, size, filters, total, card positions, and query cursors are retained
- **AND** the saved card remains visible even if its edited name or classification no longer matches the current query until the next normal query applies server ordering and filtering

#### Scenario: stage changes

- **WHEN** a confirmed edit changes a visible contact's stage
- **THEN** cached directory stage metrics subtract one from the old stage and add one to the new stage when those stages have metric cards, with no count request or total change

#### Scenario: save fails or is cancelled

- **WHEN** a save fails or an idle dialog is cancelled
- **THEN** the list and metrics remain unchanged and no refresh is requested

#### Scenario: result no longer belongs to the active view

- **WHEN** an update arrives after sign-out, during a new load, or for a contact absent from the current page
- **THEN** it does not reinsert the contact or change the active directory state
