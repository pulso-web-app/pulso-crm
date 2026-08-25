# Contacts Feature Rules

- Keep contact models and invariants in `domain`, external state and persistence adapters in `data-access`, routed screens in `features`, reusable form behavior in `form`, and user interactions in `interactions`.
- Do not add fake persistence or hide missing backend behavior behind optimistic UI.
- Preserve the public contacts routes: list, new, details, and edit, unless an approved spec changes them.
- Prefer typed boundaries and observable user behavior over implementation-coupled tests.
- Any new state transition needs empty, loading, success, and failure behavior defined or explicitly marked out of scope.
