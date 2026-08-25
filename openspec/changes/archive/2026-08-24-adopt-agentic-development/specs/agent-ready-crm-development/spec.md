## Purpose

Defines truthful repository guidance and validation for safely evolving the Pulso CRM contacts remote with coding agents and human contributors.

## ADDED Requirements

### Requirement: Accurate CRM documentation

The repository SHALL document the remote contract, contacts routes, current UI and persistence maturity, feature boundaries, startup modes, testing, CI, deployment, and troubleshooting in English.

#### Scenario: Contributor evaluates contact behavior

- **WHEN** a contributor reads the project documentation
- **THEN** they can distinguish implemented UI and routing from absent durable persistence before proposing a change

### Requirement: Contacts boundary instructions

The authoritative instructions SHALL define ownership for domain, data-access, routed features, forms, and interactions and SHALL prohibit invented persistence or exposed customer data.

#### Scenario: Agent adds contact behavior

- **WHEN** an agent plans a contact capability
- **THEN** it places each concern in its owned boundary and defines relevant loading, empty, success, validation, and failure behavior

### Requirement: Local specification and documentation gates

The repository SHALL validate authored Markdown and all OpenSpec artifacts strictly before lint, unit tests, and production build in public checks and Firebase workflows.

#### Scenario: Invalid change reaches CI

- **WHEN** documentation or specifications are invalid
- **THEN** the Firebase workflow fails before build and deployment steps

### Requirement: Focused portable Skill

The repository SHALL provide one canonical contact-feature Skill and synchronized discovery layouts for Codex, Claude Code, and GitHub Copilot.

#### Scenario: Supported agent begins contact work

- **WHEN** the agent discovers repository Skills
- **THEN** it receives the same contacts workflow and boundary guidance in its supported layout
