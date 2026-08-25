## Context

CRM exposes working contact routes and evolving visual surfaces, but complete durable persistence is absent. Existing feature folders provide useful boundaries that need explicit guidance.

## Goals / Non-Goals

**Goals:** document current maturity, codify contacts boundaries, add focused agent guidance, adopt local specifications, and gate documentation/specifications in CI.

**Non-Goals:** add contact persistence, redesign screens, change routes or federation, or alter Firebase deployment.

## Decisions

- Scope contacts-specific instructions at the contacts feature root so boundary rules apply only where relevant.
- Use one instruction-only Skill focused on contact work and mirror it through tooling.
- Describe missing persistence explicitly in README, architecture, OpenSpec context, and review guidance.
- Run documentation and strict OpenSpec validation before existing Firebase quality and deployment steps.

## Risks / Trade-offs

- [Visual scaffolds are mistaken for complete behavior] → Require maturity and data-impact statements in documentation and pull requests.
- [Feature boundaries become ceremonial] → Tie each boundary to explicit ownership and review scenarios.

## Migration Plan

Add the development layer without changing application source, synchronize Skill mirrors, run local and integrated validation, and archive this local change before the tooling umbrella.
