## 1. Nx Project Architecture

- [x] 1.1 Create tagged buildable contacts feature and shared UI projects and verify they appear in `nx show projects`.
- [x] 1.2 Move implemented contact and presentation source, resources, tests, and scoped instructions behind public entry points and verify all existing unit tests remain green.
- [x] 1.3 Remove empty speculative folders, reduce `apps/crm` to composition concerns, and verify the production Native Federation build succeeds.

## 2. Enforcement and Developer Experience

- [x] 2.1 Configure type and scope dependency constraints and verify lint accepts the intended CRM graph.
- [x] 2.2 Update public scripts and CI to lint and test all applicable Nx projects and verify failures propagate.
- [x] 2.3 Update architecture, README, contributor guidance, AGENTS, and the canonical contacts Skill and verify Markdown and agent synchronization.

## 3. Validation

- [x] 3.1 Run strict OpenSpec validation, lint, all unit tests, library builds, and the production CRM build.
- [x] 3.2 Verify port 4201 standalone behavior and Shell integration without changing the `crm` or `./Routes` contracts.
