# Pulso CRM Architecture

## System role

Pulso CRM is a Native Federation remote owned and deployed independently from the shell. It exposes Angular routes as `./Routes`, runs on port 4201 in development, and is mounted below `/crm` by the authenticated host.

## Contacts boundaries

The contacts area separates business concepts from delivery concerns:

- Domain code defines contact types and invariants without UI or transport dependencies.
- Data-access code owns state, persistence gateways, and external integrations.
- Feature code composes routed screens.
- Form code owns reusable form state, controls, and validation presentation.
- Interaction code owns focused user actions that do not belong to a routed screen.

These boundaries should grow from real product behavior. Generic abstraction layers are not a substitute for clear ownership.

## Current maturity

The application has routed contact list, creation, detail, and edit surfaces, but does not yet provide complete durable contact persistence. Architecture and documentation must distinguish implemented behavior from visual or routing scaffolds.

## Federation and authentication

The shell owns authentication and the protected `/crm` mount point. CRM owns the routes and screens inside that boundary. Changes to the remote name, `./Routes` exposure, or mount expectations require coordinated OpenSpec changes and an integrated smoke test.

## Testing and delivery

Vitest is the unit-test runner and Playwright verifies standalone browser behavior. Route-contract changes also require shell integration. Firebase Hosting workflows create pull-request previews and main-branch deployments after quality checks.

## Repository independence

CRM retains its own Nx configuration, dependencies, lockfile, cache, CI, and deployment target. It does not import source code from sibling repositories.
