## MODIFIED Requirements

### Requirement: Contacts boundary instructions

The authoritative instructions SHALL define the current contacts feature Nx project as owner of implemented routed behavior, shared UI as owner of stateless cross-feature presentation, and future domain, data-access, form, or interaction projects as evidence-based boundaries. They SHALL prohibit empty speculative layers, invented persistence, and exposed customer data.

#### Scenario: Agent adds contact behavior

- **WHEN** an agent plans a contact capability
- **THEN** it identifies the existing owning Nx project or justifies the smallest new tagged project and defines relevant loading, empty, success, validation, and failure behavior

### Requirement: Local specification and documentation gates

The repository SHALL validate authored Markdown and all OpenSpec artifacts strictly before project-wide boundary lint, all application and library unit tests, and production build in public checks and Firebase workflows.

#### Scenario: Invalid change reaches CI

- **WHEN** documentation, specifications, a dependency boundary, or a library test is invalid
- **THEN** the Firebase workflow fails before build and deployment steps
