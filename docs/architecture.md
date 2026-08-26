# Pulso CRM Architecture

## System role

Pulso CRM is an independently owned and deployed Native Federation remote. It exposes `./Routes`, runs on port 4201 during development, and is mounted below the shell's protected `/crm` route.

The repository is the CRM team, deployment, dependency, and CI boundary. Projects inside the Nx workspace are smaller source-ownership, dependency, test, build, and cache boundaries. Contact list, create, details, and edit remain routes of one CRM microfrontend because they share capability ownership and deployment.

## Feature-first project map

```text
apps/
  crm/                           # bootstrap and federation adapter
  crm-e2e/                       # remote-level browser behavior
libs/
  contacts/
    feature/                     # list, create, details, edit, routes
  shared/
    ui/                          # CRM-local, domain-neutral primitives
```

`apps/crm` is deliberately thin and imports `CONTACTS_ROUTES` from the public `@pulso-crm/contacts-feature` entry point. Contact screens are colocated by capability instead of being scattered among repository-wide component, service, and page folders.

## Evolution rules

The contacts feature currently owns routed presentation and local interaction behavior, but durable persistence is not implemented. Extract `libs/contacts/domain` when concrete business invariants need a framework-independent boundary. Extract `libs/contacts/data-access` when real state, gateways, or backend integration exists. Create focused UI or interaction projects only when they have actual reuse or independent ownership.

This avoids two extremes: a single undifferentiated application project and empty layers created only to resemble an enterprise diagram.

Nx tags enforce dependency direction. The application composes feature libraries; features may use lower-level contact or shared UI projects; domain, data-access, and UI layers must never depend back on features. Cross-project imports use `@pulso-crm/*` public APIs.

## Federation boundary

The shell owns authentication and the protected mount point. CRM owns navigation and behavior inside it. The remote name, `./Routes` exposure, top-level route expectations, and port are public contracts. A future CRM MFE split is justified only by independent runtime ownership or deployment, not simply by adding another screen.

## Why Nx is material here

The Nx graph now contains the CRM app, contacts capability, shared UI, and E2E suite. Repository scripts execute all relevant projects; builds traverse dependencies; unchanged targets can be restored from cache; `nx affected` can select impacted work; and lint rules turn the architectural direction into an executable constraint.

Native Federation composes independently deployed applications at runtime. Nx organizes and validates the source graph inside this repository. Neither substitutes for the other.

## Testing and delivery

Vitest runs at each project boundary and Playwright verifies standalone behavior. Public route changes also require shell integration. Firebase workflows use public repository scripts so future libraries automatically participate in lint, test, and build gates.

CRM keeps its own Nx configuration, dependencies, lockfile, cache, CI, and deployment target and never imports sibling-repository source code.
