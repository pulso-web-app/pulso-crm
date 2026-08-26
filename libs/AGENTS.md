# CRM Library Rules

- Organize CRM behavior feature-first under `libs/<capability>/<type>` and expose intentional APIs from `src/index.ts`.
- Start with a coherent feature library. Extract `domain`, `data-access`, or focused UI libraries only when concrete behavior creates a reusable or independently testable boundary.
- Import projects through `@pulso-crm/*`; never reach into another library's `src/lib` internals.
- Keep dependency direction compatible with the enforced Nx tags: apps compose features, features may use domain, data access, and UI, while lower layers must not depend on features.
- Keep domain-specific code with its capability; `shared/ui` is reserved for CRM-local, domain-neutral presentation.
- Test the narrowest affected project while iterating and run repository-level scripts before handoff.
