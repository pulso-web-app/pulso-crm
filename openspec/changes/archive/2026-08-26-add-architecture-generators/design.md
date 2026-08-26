## Context

This repository participates in the cross-repository `add-architecture-generators` change coordinated by `pulso-tooling`.

## Decisions

- Keep the application project as a thin composition/federation adapter.
- Store capability dependencies in `architecture.config.json` and translate them into Nx constraints at ESLint configuration time.
- Keep legacy named route exports as compatibility aliases while adopting `REMOTE_ROUTES`.
