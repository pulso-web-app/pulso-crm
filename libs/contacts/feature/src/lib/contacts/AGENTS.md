# Contacts Feature Rules

- Keep the routed list, create, detail, and edit experience cohesive inside `contacts-feature` while the capability is small.
- Extract contact `domain`, `data-access`, form, or interaction libraries only when real behavior needs an independent dependency or test boundary.
- Use relative imports within this library and its public `@pulso-crm/contacts-feature` entry point from other projects.
- Do not add fake persistence or hide missing backend behavior behind optimistic UI.
- Preserve the public contacts routes: list, new, details, and edit, unless an approved spec changes them.
- Prefer typed boundaries and observable user behavior over implementation-coupled tests.
- Any new state transition needs empty, loading, success, and failure behavior defined or explicitly marked out of scope.
