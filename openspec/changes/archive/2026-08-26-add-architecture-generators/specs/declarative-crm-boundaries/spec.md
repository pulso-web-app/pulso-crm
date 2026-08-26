## Purpose

Defines crm participation in generated Pulso architecture.

## ADDED Requirements

### Requirement: Declarative CRM architecture

CRM SHALL derive Nx scope constraints from its capability registry and expose its routes through both CRM_ROUTES and REMOTE_ROUTES.

#### Scenario: the Shell loads CRM through the common contract

- **WHEN** the Shell loads CRM through the common contract
- **THEN** REMOTE_ROUTES references the same route array as CRM_ROUTES
