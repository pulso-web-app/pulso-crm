## Context

See proposal.md. The filters own the New contact link; the card owns edit dialog opening; the repository currently updates documents. The dialog owns save state and field validation. A last-contact string is currently required even though a new contact has no real contact event.

## Goals / Non-Goals

Reuse the form and save lifecycle with an explicit create/edit discriminated union. Keep persistence and serialization in data-access, opening configuration in a feature-local dialog service, and page reconciliation in the list store. No new Nx projects or route changes.

## Decisions

- Add a ContactInput type without document identity. Widen lastContactAt to string or null and retain timestamp/string decoding for existing records. Null is displayed as no contact date; creating a fake timestamp was rejected.
- Use an explicit create/edit mode and a shared form factory. The dialog produces a clean ContactInput; creation calls repository.createContact and editing calls updateContact with the original ID. A small feature-local service centralizes dialog dimensions and view-container injection for both entry points.
- The filters emit createRequested; the list opens the dialog and reconciles its confirmed result. Disable creation until a directory load succeeds, including successful empty pages.
- Use Firestore addDoc for generated identity and omit blank optional fields on create. Update retains deleteField semantics. No allocation or write occurs on opening or cancelling. Pending save guards prevent duplicate user submissions; cross-session idempotency is outside scope.
- After creation update cached global metrics and matching total, then use the existing loader for one first-page query without recounting. An inserted document changes page boundaries; a bounded read preserves server sorting and avoids overflowing or corrupting cursor pages. Existing filters remain active, so a newly created record can be outside the visible page.

## Risks / Trade-offs

- A created record can sort onto another page or fall outside filters → show a clear creation confirmation and retain explicit current query behavior.
- A page read may fail after a successful write → preserve success and expose the existing directory retry UI.
- Nullable dates affect existing display/decoder paths → add roundtrip and card/dialog regressions.

## Migration Plan

No migration for existing documents: strings and timestamps remain accepted. New records may store null last-contact dates. Run targeted tests, standalone browser smoke and the repository gate; synchronize specs and archive. No deployment is performed.
