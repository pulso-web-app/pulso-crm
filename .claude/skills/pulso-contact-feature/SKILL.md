---
name: pulso-contact-feature
description: Design and implement Pulso CRM contact capabilities while preserving the domain, data-access, feature, form, and interaction boundaries. Use for contact list, details, create, edit, search, validation, state, persistence, or routing changes.
---

# Pulso Contact Feature

1. Read the root, library, and contacts `AGENTS.md` files.
2. Explore the current routed screen and identify whether persistence is real, mocked, or absent; do not infer capabilities from visual scaffolding.
3. Create or update the local OpenSpec change before non-trivial implementation.
4. Keep behavior in `contacts-feature` while it is cohesive. Extract a domain, data-access, form, or interaction Nx project only when real rules, integrations, reuse, or ownership justify an independently testable boundary.
5. Use `@pulso-crm/*` public entry points across projects and preserve Nx scope/type dependency constraints.
6. Define loading, empty, success, validation, and failure behavior relevant to the change.
7. Test the narrowest affected Nx projects and user-observable screen behavior. Verify port 4201 standalone and, for route-contract changes, integration through the shell.
8. Run `npm run check` and document graph, federation, data, UI, and deployment impact.

Do not fabricate backend persistence, leak customer data, or deploy.
