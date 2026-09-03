## ADDED Requirements

### Requirement: Automatic last-contact input masks

The shared dialog SHALL insert Brazilian date and time separators during numeric typing and paste, without requiring blur, while preserving strict validation and keyboard editing.

#### Scenario: numeric date and time entry

- **WHEN** a user types or pastes 12122012 and 1330 into the date and time fields
- **THEN** the fields display 12/12/2012 and 13:30 and a successful save uses that local instant

#### Scenario: edit or clear masked input

- **WHEN** a user replaces selected digits, deletes near a separator, or clears a field
- **THEN** the caret stays near the edit, separators follow the digits, and incomplete input prevents saving until corrected or both fields are cleared

#### Scenario: invalid numeric input or picker selection

- **WHEN** digits represent an impossible date or time, or contain too many digits
- **THEN** the dialog rejects the value instead of silently converting it to a different valid event
- **AND** selecting values through the pickers and using Agora or clear retain their existing behavior
