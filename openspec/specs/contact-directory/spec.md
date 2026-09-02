## Purpose

Defines the searchable and paginated contact directory behavior owned by the CRM contacts feature.

## Requirements

### Requirement: Existing contact editing dialog

The CRM SHALL preserve the existing card click, action menu, and editing dialog, initializing the form from the complete selected persisted contact without implementing backend updates.

#### Scenario: open a contact from any page

- **WHEN** a user clicks a contact card on the current directory page
- **THEN** the original dialog opens with that contact's identity, organization, person, classification, channels, last-contact timestamp, and activity history

#### Scenario: optional fields are absent

- **WHEN** the selected record has no optional person or channel fields
- **THEN** those form fields are empty and no values from another contact appear

#### Scenario: edit or cancel a draft

- **WHEN** the user edits fields, adds an activity draft, saves the draft, or cancels the dialog
- **THEN** the existing form controls and result contract remain available without modifying the source contact, issuing a Firestore write, or claiming a persisted update

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
