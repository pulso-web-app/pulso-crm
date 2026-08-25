## 1. Dependencies and Integrations

- [x] 1.1 Pin OpenSpec and markdownlint and verify the lockfile records exact versions
- [x] 1.2 Initialize the core agent integrations and verify generated Codex, Claude Code, and Copilot files

## 2. Documentation and Agent Guidance

- [x] 2.1 Add the English README, contribution guide, architecture document, and pull-request template and verify `npm run docs:check`
- [x] 2.2 Add root/contacts instructions, thin adapters, and the contact Skill and verify Skill Creator validation and synchronized mirrors

## 3. Quality Gates

- [x] 3.1 Add docs/spec scripts and include them before existing application checks and verify package script order
- [x] 3.2 Add docs/spec validation to both Firebase workflows and verify both run before lint, test, build, and deploy

## 4. Validation and Archive

- [x] 4.1 Run `npm run check` and the CRM E2E suite and verify both succeed
- [x] 4.2 Verify standalone and shell-integrated remote availability, then archive this change
