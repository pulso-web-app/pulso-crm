# Pulso CRM

Pulso CRM is the customer-relationship remote for the Pulso web application. It is an independent Angular 22 and Nx 23 workspace that exposes its routes through Native Federation and can run either inside Pulso Shell or by itself during development.

## Current status

The repository currently implements the contacts navigation and visual foundations:

- Firestore-backed contacts list with organization-name prefix search, stage/status filters, aggregate metrics, and cursor pagination.
- New-contact route and form shell.
- Contact details and edit route shells.
- Feature-first `contacts-feature` and `contacts-data-access` Nx projects and CRM-local shared libraries.

The directory reads shared Firestore contacts for every authenticated user. Clicking a card opens the editing dialog, prefilled with the selected contact and activity history. Saving persists edits with loading and outcome feedback, then updates the visible card locally without extra reads. Creating contacts and separate interaction persistence remain unimplemented. See [the Firestore guide](docs/firestore-contacts.md) for the data contract, index preparation, and explicit synthetic seed command.

## Federation contract

- Remote name: `crm`.
- Exposed module: `./Routes`.
- Standalone development URL: <http://localhost:4201>.
- Host route: <http://localhost:4200/crm>.

Changing the remote name, exposure, or top-level route is a cross-repository contract change and must be specified and validated with `pulso-shell`.

## Prerequisites

- Git and npm.
- Node.js `^22.22.3`, `^24.15.0`, or `^26.0.0`.
- Playwright browsers for E2E: `npm exec playwright install`.

## Recommended integrated setup

1. Clone [`pulso-tooling`](https://github.com/pulso-web-app/pulso-tooling) into the same parent directory as the app repositories.
2. Run `npm ci` inside `pulso-tooling`.
3. Run `npm run setup`, then `npm run doctor`.
4. Run `npm run open` to open the four-folder VS Code workspace.
5. Start `Pulso: dev all` from **Terminal → Run Task**.
6. Open <http://localhost:4200/crm> and authenticate through the shell.

## Standalone setup

1. Clone this repository.
2. Run `npm ci`.
3. Run `npm run dev`.
4. Open <http://localhost:4201>.

Standalone mode is best for focused UI work. Use integrated mode for federation, authentication assumptions, navigation, or exposed-route changes.

## Commands

From the multi-root workspace, use **Pulso: Create Feature Here** for a contacts slice and **Pulso: Create Library Here** only for a justified domain, data-access, UI, or util boundary. Both commands preview canonical paths, aliases, and tags before writing.

| Command                 | Purpose                                                          |
| ----------------------- | ---------------------------------------------------------------- |
| `npm run dev`           | Serve CRM on port 4201.                                          |
| `npm run build`         | Create a production build.                                       |
| `npm run lint`          | Run ESLint.                                                      |
| `npm test`              | Run Vitest once.                                                 |
| `npm run test:watch`    | Run unit tests in watch mode.                                    |
| `npm run e2e`           | Run Playwright against standalone CRM.                           |
| `npm run format`        | Apply Nx formatting.                                             |
| `npm run format:check`  | Check formatting without writing.                                |
| `npm run docs:check`    | Lint authored Markdown.                                          |
| `npm run spec:validate` | Strictly validate all OpenSpec artifacts.                        |
| `npm run spec:update`   | Refresh OpenSpec-managed agent integrations.                     |
| `npm run check`         | Run docs, specs, lint, unit tests, and production build.         |
| `npm run graph`         | Open the Nx project graph.                                       |
| `npm run affected`      | Lint, test, and build projects affected by the current Git diff. |

## Feature boundaries

Contacts code is grouped by capability first:

- `contacts-feature` owns the current list, create, detail, edit, and route composition.
- `contacts-data-access` owns contact contracts, document validation, and shared Firestore reads.
- `shared-ui` contains only CRM-local, domain-neutral presentation.
- `crm` is the thin bootstrap and Native Federation adapter.

Extract contact domain, data-access, form, or interaction projects only when concrete rules, state, integrations, or reuse create meaningful boundaries. Cross-project imports use `@pulso-crm/*` public APIs, and Nx tags enforce dependency direction. A new screen does not require another MFE while it shares CRM ownership and deployment.

## Testing

Vitest covers unit behavior and Playwright covers user-observable standalone flows. Install browsers once with `npm exec playwright install`. For route or federation changes, also run all Pulso apps and confirm the CRM route loads from the authenticated shell without federation errors.

New data behavior should define and test relevant loading, empty, success, validation, and failure states. Tests must not imply persistence that does not exist.

## Spec-driven and agent-assisted work

`AGENTS.md` is authoritative. The scoped contacts instructions define feature boundaries. The canonical `pulso-contact-feature` Skill is under `.agents/skills` and is mirrored for Claude and Copilot by `pulso-tooling`.

Use OpenSpec for meaningful changes: explore, propose, obtain human review, apply, strictly validate, run repository checks, and archive. Cross-repository changes share one kebab-case ID with the tooling umbrella and other affected apps.

## Shared data

All signed-in users see the same contacts in the root Firestore collection. Interactions and projects follow the same shared contract; personal account profiles remain private. See [the directory and migration guide](docs/firestore-contacts.md).

## CI and deployment

The Firebase workflows validate documentation and OpenSpec before lint, unit tests, and the production build. Pull requests use a Hosting preview channel, and the main branch targets the configured live CRM site.

Deployment, hosting target, CI secret, and environment changes require explicit approval.

## Troubleshooting

- **The host cannot load CRM:** verify port 4201, `remoteEntry.json`, the `crm` name, and the `./Routes` exposure.
- **Nx is unavailable:** run `npm ci` locally; do not rely on a global Nx installation.
- **Playwright has no browser:** run `npm exec playwright install`.
- **The directory requests sign-in:** authenticate through Pulso Shell; standalone CRM has no separate login form.
- **Filtered reads fail:** verify that the documented contacts indexes are ready and the current user owns the collection.
- **Nx Console targets another repository:** use the `Pulso:` multi-root tasks for normal workflows.

See [CONTRIBUTING.md](CONTRIBUTING.md) and [docs/architecture.md](docs/architecture.md).
