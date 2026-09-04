## 1. Dependency and Icon Migration

- [x] 1.1 Add the Phosphor Web Components dependency while retaining Angular Material, CDK, and date/time dependencies, and verify the lockfile resolves one intended version.
- [x] 1.2 Replace list state, filter, metric-card, and contact-card authored icons with explicit Phosphor elements, including Instagram and WhatsApp brands, while preserving Material cards, fields, selects, buttons, menus, spinner, and paginator.
- [x] 1.3 Replace contact dialog, import dialog, and last-contact editor authored icons with explicit Phosphor elements while preserving Material dialogs, fields, validation, buttons, date picker, and time picker.
- [x] 1.4 Remove only unused Material icon module imports and the Material Icons font link, and verify source inventory contains no authored `mat-icon` or Material Icons font usage.

## 2. Validation

- [x] 2.1 Add regression assertions for Phosphor rendering and retained Material hosts across loading, empty, success, validation, and failure coverage, and verify affected tests pass.
- [x] 2.2 Run strict OpenSpec validation and `npm run check` successfully.
- [x] 2.3 Load CRM through the integrated shell at desktop and narrow viewports and verify the contact list and create/edit dialogs retain their Material layout and behavior with aligned Phosphor icons.

## 3. Alignment Refinement

- [x] 3.1 Normalize Phosphor host boxes and contextual spacing for Material field prefixes, button-leading icons, icon buttons, menus, and inline status content without styling Material internals.
- [x] 3.2 Add regression assertions for the layout roles and visually verify the contact list, import dialog, and contact editor at desktop and narrow viewports.
- [x] 3.3 Match Material's horizontal field and button spacing in standalone and federated rendering, including a 16px field inset and optical compensation for leading button icons.
- [x] 3.4 Use Material's public floating-label policy for prefixed dialog fields so entrance animation cannot compress the empty-value label spacing.
