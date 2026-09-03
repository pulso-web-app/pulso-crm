## Context

See proposal.md. The modal uses signal forms and persists ISO strings or null. Material 22 provides native date and time controls.

## Goals / Non-Goals

**Goals:** Explicit local parsing, reusable date entry within the feature, and compatible saved values.

**Non-Goals:** New domain projects, timezone selection, schema migration, or international phone validation.

## Decisions

- Scope a native DateAdapter with strict Brazilian parsing and 24-hour formatting to the date editor. Native locale alone does not guarantee strict keyboard parsing.
- Encapsulate paired reactive date/time controls in a feature component. Emit valid ISO values and validation state to the existing signal form. Separate controls preserve partial drafts without inventing a date or time.
- Keep existing timestamps unchanged until an edit; Agora retains the current instant. Manual changes use minute precision.
- Use a small input mask directive to format the displayed phone and preserve digit-relative caret position. Avoid a new masking dependency for one domestic format.

## Risks / Trade-offs

- Local timezone conversions can shift calendar days: test local-to-ISO round trips and midnight.
- Partial input must not silently save an old instant: integrate editor validity into the parent form.
- Formatting punctuation can interfere with deletion: handle backward deletion at separators and test cursor position.

## Migration Plan

No data migration or deployment actions. Existing ISO/null fields remain compatible; rollback affects UI only.
