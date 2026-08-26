## ADDED Requirements

### Requirement: Contact cards

The CRM SHALL present each visible contact in a card that identifies the organization, primary person, funnel stage, communication status, available contact channels, and last-contact date.

#### Scenario: contacts are available

- **WHEN** the contacts page opens with contact records
- **THEN** it displays the current page of records as contact cards

### Requirement: Contact discovery

The CRM SHALL let users search contacts and filter them by funnel stage and communication status.

#### Scenario: criteria match contacts

- **WHEN** the user enters search text or selects a filter
- **THEN** only contacts matching every active criterion are shown and pagination returns to the first page

#### Scenario: criteria match no contacts

- **WHEN** no contact matches the active criteria
- **THEN** the page presents an explanatory empty state and no paginator

### Requirement: Contact pagination

The CRM SHALL paginate the filtered contact collection using an Angular Material paginator.

#### Scenario: the user changes page

- **WHEN** the filtered collection contains more contacts than the configured page size and the user advances the paginator
- **THEN** the next slice of matching contact cards is displayed
