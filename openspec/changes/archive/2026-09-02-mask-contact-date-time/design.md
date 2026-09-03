## Context

The Material controls already parse strict Brazilian values, but do not insert separators. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:** Immediate masking compatible with both Material value accessors and reactive validation.

**Non-Goals:** Replacing the date adapter, changing persistence or modifying the phone mask.

## Decisions

Use one feature-local directive with date/time modes. A capture-phase input listener formats the DOM before Material's input listener parses it, avoiding duplicate value accessors or a dependency on directive listener order. Remove native listeners on destruction. Keep nonnumeric invalid input and excess digits invalid. Handle separator deletion through beforeinput and preserve caret position by digit count.

## Risks / Trade-offs

- Event ordering can leave stale form values: verify immediate ISO emissions through the real Material controls without blur.
- Masks can trap deletion at separators: test Backspace, Delete and selection replacement.
- Programmatic picker values must remain intact: retain existing picker/Agora/clear tests.
