## Context

See `proposal.md` for motivation. CRM has implemented routed contact screens and presentation components, but no durable contact persistence or implemented domain layer. The current `domain`, `data-access`, `form`, and `interactions` directories contain only future-facing README files. The application and E2E project are the only meaningful Nx nodes.

## Goals / Non-Goals

**Goals:**

- Make the application project a thin runtime and federation composition root.
- Put the complete implemented contact vertical in one feature-first project.
- Extract only presentation primitives that are genuinely shared outside the feature composition.
- Establish a tag model that supports later domain and data-access projects without creating them prematurely.
- Give internal projects independent lint, test, build, and cache tasks.

**Non-Goals:**

- Implement contact persistence, domain entities, form behavior, or interactions that do not exist.
- Split list, create, detail, and edit into separate MFEs or projects solely for graph size.
- Change routes, content, metrics, Firebase, federation, or hosting.

## Decisions

### Use a coarse contacts feature first

`contacts-feature` owns `CONTACTS_ROUTES`, all current routed screens, and feature-specific child components. These surfaces change together and share one capability. Further splitting waits for real independent behavior, tests, or ownership.

### Extract only implemented shared UI

`shared-ui` owns the loading overlay and equal-width layout directive because they contain no contact state and can support future features. Contact filters, metric composition, and metric cards remain in the contacts feature because their inputs, labels, or behavior are contact-specific today.

### Do not manufacture empty layers

No domain or data-access Nx project is created until real types, invariants, state, gateway, or persistence behavior exists. Architecture guidance defines the dependency direction future projects must follow. Placeholder READMEs move into architecture documentation instead of masquerading as implemented project boundaries.

### Use buildable Angular projects and public entry points

Both libraries use the supported Nx Angular package and test executors. The app imports `CONTACTS_ROUTES` and shared UI only through public aliases. The app build depends on dependency builds, creating a meaningful Nx task graph.

## Risks / Trade-offs

- [One contacts project remains broad] -> Keep the feature cohesive now and document measurable split signals such as independent ownership, slow tests, or low co-change.
- [Moving lazy routes changes chunks] -> Preserve lazy `loadChildren` and component imports inside the feature and verify route tests plus production output.
- [Buildable packages omit Material peers] -> Declare required peers and run each library build.
- [Boundaries block future valid work] -> Use stable type rules and extend scope constraints only through reviewed feature creation.

## Migration Plan

1. Create tagged buildable `contacts-feature` and `shared-ui` project scaffolds.
2. Move source, resources, tests, and scoped instructions; expose deliberate public APIs and update aliases.
3. Add boundaries, all-project lint/test scripts, CI changes, and truthful documentation.
4. Validate standalone routes, all projects, production federation build, and Shell integration if available.

Rollback restores app-local folders and imports, then removes library projects, aliases, and `ng-packagr`. There is no data migration.
