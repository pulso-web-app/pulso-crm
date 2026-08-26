# Pulso CRM Agent Instructions

## Purpose

This Angular/Nx repository is the CRM Native Federation remote. It owns the contacts experience and exposes its top-level routes to the Pulso Shell.

## Working Agreement

- Read the nearest scoped `AGENTS.md` before changing files below it.
- Keep this repository independently installable, testable, buildable, and deployable.
- Use documented npm scripts and the local Nx installation.
- Keep authored documentation, OpenSpec artifacts, code, and user-facing copy in English unless a product requirement says otherwise.
- Preserve uncommitted work and avoid unrelated refactors.

## Architecture Boundaries

- Keep `apps/crm` as a thin bootstrap/federation adapter and put owned behavior in feature-first projects under `libs/<capability>/<type>`.
- Keep the current contacts screens cohesive in `contacts-feature`; extract domain, data-access, form, or interaction projects only when real behavior creates those boundaries.
- Import Nx projects only through `@pulso-crm/*` public entry points and preserve the enforced scope/type dependency direction.
- Do not split screens into additional microfrontends without independent runtime ownership and deployment.
- The remote exposes `./Routes`; coordinate contract changes with `pulso-shell`.
- Do not import application code from sibling repositories or move shell authentication into this remote.
- Keep feature code inside explicit contacts boundaries rather than generic shared folders.

## Commands

- `npm run dev` — serve the remote on port 4201.
- `npm test` — run unit tests once.
- `npm run e2e` — run standalone Playwright tests.
- `npm run check` — documentation, specifications, lint, unit tests, and production build.
- `npm run spec:validate` — strict OpenSpec validation.
- `npm run affected` — run lint, tests, and builds only for projects affected by the current Git diff.

## Spec-Driven Development

- Use OpenSpec for non-trivial behavior changes: explore, propose, human review, apply, strict validation, repository checks, archive.
- Cross-repository changes use one kebab-case ID in tooling and every affected repository.
- Specify CRM-owned deltas here; tooling owns cross-repository coordination.
- Do not backfill unrelated legacy behavior while implementing a focused change.

## Validation

- Add tests at the narrowest useful layer and keep Playwright assertions user-observable.
- Run `npm run check` before handoff.
- For exposed route changes, verify both standalone port 4201 and shell integration on port 4200.
- Include screenshots for visible changes when practical.

## Security and Prohibited Actions

- Never commit secrets, tokens, credentials, or customer data.
- Do not invent persistence behavior or claim that scaffolded UI is production-complete.
- Do not change hosting targets, CI secrets, deployment behavior, or federation contracts without explicit approval.
- Do not deploy, push, pull, switch branches, rewrite history, or discard user changes unless explicitly requested.
- Do not manually edit OpenSpec-managed integrations; use `npm run spec:update`.
