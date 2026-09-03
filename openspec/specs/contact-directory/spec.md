## Purpose

Defines the searchable and paginated contact directory behavior owned by the CRM contacts feature.

## Requirements

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

### Requirement: Contact cards

The CRM SHALL present each visible contact in a card that identifies the organization, primary person, funnel stage, communication status, available contact channels, and last-contact date.

#### Scenario: contacts are available

- **WHEN** the contacts page opens with contact records
- **THEN** it displays the current page of records as contact cards

### Requirement: Contact discovery

The CRM SHALL search organization names by normalized, case- and accent-insensitive prefix and combine this criterion with funnel stage and communication status filters on the server.

#### Scenario: criteria match contacts

- **WHEN** the user enters search text or selects a filter
- **THEN** only contacts matching every active criterion are shown and pagination returns to the first page

#### Scenario: criteria match no contacts

- **WHEN** no contact matches the active criteria
- **THEN** the page presents an explanatory empty state and no paginator

### Requirement: Contact pagination

The CRM SHALL paginate the filtered contact collection using an Angular Material paginator and bounded server queries with a stable organization-name and document-identity order.

#### Scenario: the user changes page

- **WHEN** the filtered collection contains more contacts than the configured page size and the user advances the paginator
- **THEN** the next slice of matching contact cards is displayed

#### Scenario: navigating backward or to either boundary

- **WHEN** the user requests the previous, first, or last page
- **THEN** the requested page is retrieved without downloading intervening pages, including a partial last page

#### Scenario: page size changes

- **WHEN** the user changes the page size to 9, 18, or 27
- **THEN** the directory returns to the first page with the selected size

### Requirement: Honest asynchronous states

The directory SHALL distinguish loading, empty, success, signed-out, and retryable failure states.

#### Scenario: pending or failed reads

- **WHEN** a read is pending or fails
- **THEN** the page displays the corresponding accessible state without claiming that zero contacts exist and failures offer retry

#### Scenario: stale request completes

- **WHEN** an older page or filter request finishes after the active request changes
- **THEN** its result does not replace the current directory state

#### Scenario: invalid stored record

- **WHEN** a returned record does not satisfy the contact data contract
- **THEN** the directory reports a load failure instead of rendering corrupted data or inventing field values

### Requirement: Explicit synthetic test data

The repository SHALL provide an explicit repeatable command to insert enough clearly marked synthetic contacts to exercise multiple pages in the shared root collection of an explicitly selected Firebase project.

#### Scenario: initial seed and rerun

- **WHEN** the seed command is run for the selected project and then run again
- **THEN** it creates the expected shared test documents once, skips existing seed documents, and preserves other documents

#### Scenario: application starts

- **WHEN** the application starts normally
- **THEN** it does not seed or modify Firestore data

### Requirement: Shared persisted directory

The CRM SHALL read the same root contacts collection for every authenticated user and SHALL NOT filter business records by user identity or simulate successful writes.

#### Scenario: different users open the directory

- **WHEN** two authenticated users open the same directory and filters
- **THEN** both receive the same persisted contacts and aggregate counts

#### Scenario: session changes

- **WHEN** a user signs out or switches accounts
- **THEN** pending requests and local state are invalidated, signed-out clients issue no new reads, and a new authenticated session reloads the same shared directory

### Requirement: Safe shared-data migration

Migration SHALL preserve existing IDs, fields, document references, and descendants and SHALL refuse destination collisions before changing data.

#### Scenario: legacy records exist

- **WHEN** migration runs against legacy user-scoped business records
- **THEN** it writes a backup and atomically creates each shared document tree and removes its matching source records with version preconditions

#### Scenario: conflicting shared identifier

- **WHEN** a destination ID already exists or two source records map to the same destination
- **THEN** migration reports the conflict without overwriting any record

#### Scenario: migration or seed is rerun

- **WHEN** migration completes and its command or the shared seed is run again
- **THEN** contacts are not duplicated or reset and ordinary application startup does not write data

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
