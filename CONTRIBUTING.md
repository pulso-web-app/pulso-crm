# Contributing to Pulso CRM

## Before you start

Read `AGENTS.md`, `docs/architecture.md`, and the scoped contacts instructions. Confirm whether the behavior you are changing is implemented, scaffolded, or intentionally absent.

Use a reviewed OpenSpec change for non-trivial behavior. If shell integration or another repository is affected, use the same kebab-case change ID everywhere and link the tooling umbrella.

## Development workflow

1. Run `npm ci`.
2. Explore the current route, feature boundary, and tests.
3. Define user outcomes, data ownership, failure behavior, and non-goals in OpenSpec.
4. Implement in the appropriate domain, data-access, feature, form, or interaction boundary.
5. Add focused tests and run `npm run check`.
6. For route-contract changes, verify standalone CRM and authenticated shell integration.
7. Complete the pull-request template with evidence and honest maturity notes.

Avoid unrelated formatting and refactors. Never add real customer data, credentials, tokens, or unapproved service endpoints.

## Pull requests

Explain what the user can now do, what remains out of scope, and whether persistence is real. Link the OpenSpec change, include screenshots for visible changes, and call out federation, data migration, hosting, and rollback impact.
