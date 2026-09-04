## Context

See `proposal.md` for motivation and `specs/contact-iconography/spec.md` for observable requirements. CRM authored icons currently use Material icon font ligatures within Material components that must remain intact.

## Goals / Non-Goals

**Goals:**

- Replace only authored icon elements and the icon-font dependency.
- Use recognizable Phosphor brand icons for contact channels.
- Preserve Material DOM hosts, directives, date adapter, themes, and workflow behavior.

**Non-Goals:**

- Replace or restyle Material dialogs, cards, fields, selects, inputs, buttons, menus, spinners, paginator, date picker, or time picker.
- Change contacts data, validation, routes, imports, persistence, federation, or responsive layout.

## Decisions

- Use `@phosphor-icons/webcomponents` with explicit per-icon imports. It covers interface and social icons while remaining independently consumable by the remote. A custom icon wrapper was rejected because it would add abstraction without preserving Material integration better.
- Register `CUSTOM_ELEMENTS_SCHEMA` only in standalone components that render Phosphor elements, and retain every Material module still used by the template.
- Replace dynamic ligature names with explicit conditional Phosphor elements so templates remain auditable and icons stay tree-shakeable.
- Use a common icon class and narrowly scoped modifier classes for sizing and spacing; do not alter component layout styles beyond icon accommodation.

## Risks / Trade-offs

- [Custom elements do not inherit `mat-icon`-specific layout rules] -> Preserve host component markup and add explicit icon-only dimensions, alignment, and spacing.
- [Dialogs or date/time controls could regress through accidental module removal] -> Add regression assertions for Material elements and exercise the existing workflow tests plus visual inspection.
- [Remote icon registration can differ standalone versus federated] -> Build standalone and verify the CRM through the running shell.

## Migration Plan

1. Add the Phosphor package without removing Material, CDK, or date/time dependencies.
2. Replace authored `mat-icon` elements and remove only unused `MatIconModule` imports.
3. Preserve all Material component markup and remove the Material Icons font link only after the icon inventory is empty.
4. Run focused tests, the repository check, and federated visual inspection of list and dialog workflows.
5. Roll back by reverting only icon-focused edits; no data migration is required.
