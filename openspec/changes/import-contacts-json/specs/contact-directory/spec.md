## ADDED Requirements

### Requirement: Directory import entry and reconciliation

The directory SHALL expose Import contacts immediately before New contact when loaded, prevent duplicate import dialogs, and reload its first page, matching count, and global summary from the server after a confirmed import.

#### Scenario: open import from a loaded directory

- **WHEN** an authenticated user clicks Import contacts while the directory is loaded, including an empty directory
- **THEN** one import dialog opens without route navigation and New contact remains immediately after the import action

#### Scenario: directory is unavailable

- **WHEN** the directory is signed out, loading, or failed
- **THEN** the import action is disabled

#### Scenario: import succeeds

- **WHEN** the batch commit succeeds
- **THEN** the directory returns to its first page and reloads that page, the matching total, and global stage metrics using the current filters and page size

#### Scenario: import is cancelled or fails

- **WHEN** the dialog is cancelled while idle or the import attempt fails
- **THEN** the current directory page, total, metrics, filters, and pagination remain unchanged
