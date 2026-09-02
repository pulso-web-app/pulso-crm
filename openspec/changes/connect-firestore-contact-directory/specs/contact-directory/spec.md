## MODIFIED Requirements

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

## ADDED Requirements

### Requirement: User-owned persisted directory

The CRM SHALL read contacts only from the authenticated user's Firestore collection and SHALL NOT substitute bundled data or simulate successful writes.

#### Scenario: signed-in user

- **WHEN** the authenticated user opens the directory
- **THEN** persisted contacts and summary counts belonging to that user are displayed

#### Scenario: session changes

- **WHEN** the user signs out or a different account becomes active
- **THEN** previous contacts, counts, and cursors are discarded and no previous request can restore them

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

The repository SHALL provide an explicit repeatable command to insert enough clearly marked synthetic contacts to exercise multiple pages for a selected existing user.

#### Scenario: initial seed and rerun

- **WHEN** the seed command is run for the selected user and then run again
- **THEN** it creates the expected test documents once, skips existing seed documents, and preserves other documents

#### Scenario: application starts

- **WHEN** the application starts normally
- **THEN** it does not seed or modify Firestore data
