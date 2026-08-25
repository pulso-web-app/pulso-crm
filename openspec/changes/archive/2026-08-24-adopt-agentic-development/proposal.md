## Why

CRM contributors and coding agents need an honest description of the contacts UI maturity and explicit feature boundaries. Repository-local instructions and specifications make future contact work safer and reviewable.

## What Changes

- Add English CRM documentation, architecture guidance, contribution rules, and a practical pull-request template.
- Establish authoritative root and contacts-scoped instructions plus one focused contact-feature Skill with generated Claude/Copilot mirrors.
- Adopt OpenSpec 1.10.0, documentation linting, public validation scripts, and CI gates.

Non-goals include implementing contact persistence, changing contacts routes, altering the federation contract, changing hosting targets, or modifying runtime application behavior.

## Capabilities

### New Capabilities

- `agent-ready-crm-development`: Repository instructions, specifications, documentation, and validation for safe CRM development.

### Modified Capabilities

None.

## Impact

Development dependencies, repository documentation, agent integrations, OpenSpec artifacts, npm scripts, and Firebase workflows change. Runtime CRM behavior and deployment contracts remain unchanged.
