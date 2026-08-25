---
name: pulso-contact-feature
description: Design and implement Pulso CRM contact capabilities while preserving the domain, data-access, feature, form, and interaction boundaries. Use for contact list, details, create, edit, search, validation, state, persistence, or routing changes.
---

# Pulso Contact Feature

1. Read the root and contacts `AGENTS.md` files.
2. Explore the current routed screen and identify whether persistence is real, mocked, or absent; do not infer capabilities from visual scaffolding.
3. Create or update the local OpenSpec change before non-trivial implementation.
4. Place invariants in `domain`, integrations in `data-access`, routed screens in `features`, reusable form logic in `form`, and UI actions in `interactions`.
5. Define loading, empty, success, validation, and failure behavior relevant to the change.
6. Test domain rules and user-observable screen behavior. Verify port 4201 standalone and, for route-contract changes, integration through the shell.
7. Run `npm run check` and document federation, data, UI, and deployment impact.

Do not fabricate backend persistence, leak customer data, or deploy.
