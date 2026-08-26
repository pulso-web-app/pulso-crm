# Contributing to Pulso CRM

## Before you start

Read `AGENTS.md`, `docs/architecture.md`, and the scoped contacts instructions. Confirm whether the behavior you are changing is implemented, scaffolded, or intentionally absent.

Use a reviewed OpenSpec change for non-trivial behavior. If shell integration or another repository is affected, use the same kebab-case change ID everywhere and link the tooling umbrella.

## Development workflow

1. Run `npm ci`.
2. Explore the current route, feature boundary, and tests.
3. Define user outcomes, data ownership, failure behavior, and non-goals in OpenSpec.
4. Implement in the cohesive contacts feature first; extract domain, data-access, form, or interaction projects only when concrete behavior gives the boundary meaning.
5. Import other Nx projects through public `@pulso-crm/*` APIs and add focused project tests.
6. Inspect `npm run graph` or run `npm run affected` when useful, then run `npm run check`.
7. For route-contract changes, verify standalone CRM and authenticated shell integration.
8. Complete the pull-request template with evidence and honest maturity notes.

Avoid unrelated formatting and refactors. Never add real customer data, credentials, tokens, or unapproved service endpoints.

Prefer `Pulso: Create Feature Here` for a vertical slice and `Pulso: Create Library Here` only for a justified Nx boundary. Capability dependencies belong in `architecture.config.json`, and generated libraries expose intentional APIs only through `src/index.ts`.

## Pull requests

Explain what the user can now do, what remains out of scope, and whether persistence is real. Link the OpenSpec change, include screenshots for visible changes, and call out federation, data migration, hosting, and rollback impact.
