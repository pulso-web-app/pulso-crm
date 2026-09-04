## Purpose

Defines expressive and branded contact iconography while retaining the CRM's established Material components, layouts, and contact workflows.

## ADDED Requirements

### Requirement: Contact surfaces render Phosphor icons

The CRM SHALL render Phosphor icons for authored icons in list state, filters, metric cards, contact cards, contact dialogs, import dialogs, and last-contact controls.

#### Scenario: User views a contact workflow

- **WHEN** a CRM contact surface displays an authored interface or channel icon
- **THEN** the icon is rendered from the Phosphor icon set
- **AND** Instagram and WhatsApp channels use their recognizable Phosphor brand icons
- **AND** no Material Icons font glyph is required

### Requirement: Material contact components are preserved

The icon migration SHALL preserve existing Angular Material components, theme styling, validation, layout, and interactions across contact workflows.

#### Scenario: User operates a contact workflow

- **WHEN** the user interacts with filters, selects, buttons, menus, cards, pagination, dialogs, imports, or date/time controls
- **THEN** the existing Material components and behavior remain available
- **AND** only authored icon rendering differs

### Requirement: Contact icons align with Material hosts

CRM icons MUST retain appropriate size, color inheritance, spacing, and accessible treatment within Material controls and status presentation.

#### Scenario: Icon is displayed beside contact content

- **WHEN** a Phosphor icon appears in a field, button, menu, card, dialog, state message, or metric badge
- **THEN** it is visually centered and proportionate to the surrounding Material component
- **AND** decorative icons do not duplicate an existing accessible name
