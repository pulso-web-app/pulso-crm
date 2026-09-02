## ADDED Requirements

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
