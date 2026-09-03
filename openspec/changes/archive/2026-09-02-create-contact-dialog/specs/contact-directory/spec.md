## ADDED Requirements

### Requirement: New contact dialog

The CRM SHALL open the shared contact editing dialog in creation mode from New contact without navigating away from the directory or copying another contact's data.

#### Scenario: open a fresh form

- **WHEN** an authenticated user clicks New contact on a loaded directory, including an empty directory
- **THEN** the shared modal opens with a New contact title, blank organization/person/channel fields, stage Contact, status New, no last-contact date and an empty activity list
- **AND** no backend write occurs until a valid form is saved

#### Scenario: invalid or cancelled draft

- **WHEN** the organization name is empty or whitespace-only, or the user cancels before saving
- **THEN** no contact is created, cancellation leaves the directory unchanged, and reopening starts a fresh draft

#### Scenario: unavailable session or pending directory

- **WHEN** the directory is signed out, loading, or failed
- **THEN** the New contact action is disabled

### Requirement: Persist new contacts

The CRM SHALL create one shared contact with a generated document ID, trimmed editable fields, a normalized organization search name and the entered activity history. Empty optional strings SHALL be omitted and an unknown last-contact date SHALL be stored as null and displayed without inventing a contact event.

#### Scenario: create successfully

- **WHEN** the user saves a valid creation draft and the backend confirms success
- **THEN** the modal closes with the persisted contact including its generated ID and displays a creation success message

#### Scenario: pending creation or failed creation

- **WHEN** a creation write is pending or fails
- **THEN** the same spinner, disabled editing, duplicate-submit guard and Escape/backdrop/cancel protection as editing apply while pending
- **AND** failure keeps the draft open with an accessible error and permits retry or cancellation without claiming success

#### Scenario: read or edit a contact without a last-contact date

- **WHEN** a contact with a null last-contact date is displayed or edited
- **THEN** the card and dialog indicate no recorded contact date and preserve the null value when saving

### Requirement: Directory reconciliation after creation

The directory SHALL update known cached totals and stage metrics after confirmed creation and refresh only the first bounded page with the existing filters and page size, without requesting new aggregations. Edit saves SHALL retain their existing local-only reconciliation.

#### Scenario: creation matches current filters

- **WHEN** creation succeeds for a contact matching all current filters
- **THEN** the matching total and global total increase by one, the relevant global stage metric increases, and one bounded first-page query applies server ordering

#### Scenario: creation does not match current filters

- **WHEN** creation succeeds for a contact outside the current filters
- **THEN** global metrics reflect the new record, the filtered total is unchanged, and the refreshed page continues to honor those filters

#### Scenario: follow-up page read fails

- **WHEN** creation succeeds but the bounded page refresh fails
- **THEN** the creation remains confirmed and the directory exposes its retryable read-error state without requesting another creation
