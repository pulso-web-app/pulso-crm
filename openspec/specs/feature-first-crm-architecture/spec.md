# Feature-First CRM Architecture Specification

## Purpose

Defines the developer-visible project ownership and validation guarantees that keep Pulso CRM feature-first without pretending scaffolded layers are implemented.

## Requirements

### Requirement: Thin CRM composition root

The CRM application project SHALL own bootstrap, application configuration, remote exposure, and route composition while implemented contact behavior and reusable stateless presentation primitives are owned by explicit internal Nx projects.

#### Scenario: Contributor locates contact behavior

- **WHEN** a contributor inspects the workspace graph or architecture documentation
- **THEN** the complete current contacts capability has one discoverable feature owner and `apps/crm` contains only runtime composition and infrastructure concerns

### Requirement: Evidence-based feature-first projects

CRM SHALL create domain, data-access, form, interaction, or additional feature projects only with implemented behavior and a declared owner; it SHALL NOT create empty layers solely to anticipate future work.

#### Scenario: First durable contact persistence is proposed

- **WHEN** an approved change introduces contact models, invariants, state, or a persistence gateway
- **THEN** the change introduces the smallest relevant tagged projects and records their allowed dependency direction

### Requirement: Enforced CRM dependency direction

The CRM workspace SHALL reject imports that cross declared feature-first type or scope boundaries while allowing the application composition root to assemble CRM-owned projects.

#### Scenario: Shared UI attempts to import contacts feature behavior

- **WHEN** lint evaluates an import from shared UI to the contacts feature
- **THEN** the module-boundary quality gate fails before build or deployment

### Requirement: Project-aware CRM validation

Public CRM quality commands SHALL lint and test every applicable application, library, and E2E project and SHALL build project dependencies before the production application.

#### Scenario: Contacts library test fails

- **WHEN** a contributor runs the documented CRM check
- **THEN** the command returns a non-zero result and identifies the contacts project failure

### Requirement: Stable CRM behavior during internal evolution

Internal project organization SHALL preserve the `crm` remote name, `./Routes` exposure, contact list/new/detail/edit URLs, standalone port 4201, existing presentation, and truthful absence of durable persistence unless a separate approved behavior change modifies them.

#### Scenario: Feature-first migration completes

- **WHEN** CRM runs standalone or through Shell
- **THEN** all current contact routes and visible scaffold behavior remain observably equivalent
