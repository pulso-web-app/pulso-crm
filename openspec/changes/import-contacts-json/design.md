## Context

See `proposal.md` for motivation. Contact parsing and Firestore access already live in `contacts-data-access`, while the list, dialogs, and request state live in `contacts-feature`. Individual creation uses `addDoc`; import needs a bounded atomic operation and exact post-commit reconciliation.

## Goals / Non-Goals

**Goals:**

- Share one strict import parser between presentation and persistence.
- Prevent writes until all items are normalized and valid.
- Keep file handling browser-local and preserve editable source text through failures.
- Refresh authoritative directory data only after a confirmed commit.

**Non-Goals:**

- A new Nx project, route, server endpoint, duplicate lookup, merge policy, file storage, or Firestore configuration change.

## Decisions

### Parse into the existing contact input contract

Add an import module to `contacts-data-access` that returns either normalized `ContactInput[]` or structured issues with optional one-based contact index and field path. It owns the public allowlist, defaults, ISO checks, limit, and user-facing Portuguese messages. Reusing it in the repository prevents UI-only validation from becoming a trust boundary. A feature-local parser was rejected because persistence could then receive unchecked or differently normalized inputs.

### Prepare documents once and commit one generated-ID batch

Factor the current creation document preparation into a shared internal function. `importContacts` validates the complete input, allocates document references, adds every prepared document to one Firestore write batch, commits once, and only then returns decoded contacts. The 500-item input cap matches one atomic batch. Sequential `addDoc` calls were rejected because they permit partial success.

### Use one editable source with derived validation state

The dialog uses a visually hidden file input and one Material textarea. A selected `.json` file replaces the textarea contents; subsequent edits are ordinary text edits. Parsing runs whenever the source changes, with empty source represented as an initial guidance state rather than a noisy syntax error. Import is enabled only for a successful non-empty parse. Separate tabs were rejected because they introduce ambiguous source precedence.

### Refresh authoritative list state after success

The dialog returns the imported count, not hundreds of records. The list store invalidates in-flight work, returns to page zero, clears its cached summary, and requests the first bounded page, matching count, and summary under the current filters and page size. Incrementing caches was rejected because batch composition makes exact reconciliation more fragile and a successful batch justifies one authoritative refresh.

### Keep copy content deterministic and outside the editor

Export constants for a pretty-printed complete example and a Portuguese prompt derived from the accepted contract. Clipboard success and failure use accessible inline status so tests do not depend on transient browser UI, and copying never mutates source JSON.

### Reuse the contact dialog visual language

The import shell uses the same surface, content, divider, typography, spacing, footer, button, and responsive conventions as the create/edit dialog. Import-specific helper and validation panels use the existing primary, success, error, text, and container tokens rather than introducing parallel color names or hard-coded theme surfaces. This keeps dark and hosted themes cohesive while allowing the import layout to remain purpose-built.

## Risks / Trade-offs

- **Large pasted input can make synchronous parsing noticeable** → cap input at 500 contacts and keep validation linear.
- **Browser clipboard or file APIs can fail** → expose retryable inline errors without losing editor content.
- **Successful commit followed by failed refresh can hide confirmed records temporarily** → close with confirmed success, then use the directory's existing retryable load error without repeating the write.
- **Client-side atomic batches remain subject to Firestore rules and connectivity** → surface a generic retryable persistence error and never claim partial success.

## Migration Plan

Ship as an additive CRM change. No data migration or deployment ordering is required. Rollback removes the entry point and import code; already imported contacts remain ordinary valid contact documents.
