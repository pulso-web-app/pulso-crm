## Why

CRM already describes contacts as a bounded capability, but its screens and presentation utilities remain inside one application project and its documented domain/data-access folders are placeholders. A feature-first Nx structure should represent only implemented ownership while enabling real graph, boundary, test, build, and cache behavior.

## What Changes

- Keep `apps/crm` as the standalone and Native Federation composition root.
- Move the implemented contacts route and screens into a buildable `contacts-feature` Nx project.
- Move genuinely cross-feature presentation primitives into a buildable `shared-ui` Nx project.
- Remove placeholder architecture folders that contain no implementation and document when real domain or data-access projects should be introduced.
- Add effective type and scope tags, dependency constraints, project-aware scripts, CI checks, and updated agent guidance.

## Capabilities

### New Capabilities

- `feature-first-crm-architecture`: Defines composition-root, feature ownership, dependency, and validation guarantees for CRM development.

### Modified Capabilities

- `agent-ready-crm-development`: Contributor and agent guidance uses explicit Nx project ownership and prohibits speculative layers as well as invented persistence.

## Impact

CRM source paths, TypeScript aliases, Nx projects, task graph, development dependency set, scripts, CI, documentation, tests, AGENTS, and the contacts Skill change. The `crm` remote name, `./Routes` exposure, port 4201, contact URLs, Firebase project, hosting target, UI behavior, and current absence of durable contact persistence remain unchanged. `ng-packagr` is added for buildable internal libraries.
