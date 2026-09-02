## REMOVED Requirements

### Requirement: User-owned persisted directory

**Reason**: Business records belong to the shared application, not the original user.
**Migration**: Transfer legacy user-scoped records to root collections, preserving IDs and document contents. Query shared contacts for every authenticated session.

## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Explicit synthetic test data

The repository SHALL provide an explicit repeatable command to insert enough clearly marked synthetic contacts to exercise multiple pages in the shared root collection of an explicitly selected Firebase project.

#### Scenario: initial seed and rerun

- **WHEN** the seed command is run for the selected project and then run again
- **THEN** it creates the expected shared test documents once, skips existing seed documents, and preserves other documents

#### Scenario: application starts

- **WHEN** the application starts normally
- **THEN** it does not seed or modify Firestore data
