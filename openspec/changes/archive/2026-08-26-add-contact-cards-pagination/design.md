## Context

The contacts list already owns metric and filter presentation. The new directory behavior remains cohesive in the same feature library until a real API creates a justified data-access boundary.

## Decisions

- Define readonly contracts separately from presentation components so a future data source can replace mocks without changing card inputs.
- Keep filtering and pagination state in the routed list component; keep filter controls and individual cards presentational.
- Use Angular signals and computed values for derived results and reset the page index when filter criteria change.
- Use Angular Material cards, chips, menus, buttons, icons, and paginator as the primary UI building blocks.
- Represent loading and failure as out of scope while the data source is synchronous and in-memory; provide success and empty-result states now.
