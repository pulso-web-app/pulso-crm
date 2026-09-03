## Why

Creating contacts one at a time makes onboarding an existing prospect list slow and error-prone. The directory needs a safe bulk path that accepts AI-friendly JSON, explains invalid data before writing, and preserves the existing shared Firestore contract.

## What Changes

- Add an "Import contacts" action and responsive dialog for pasted JSON or a local `.json` file.
- Validate one to 500 contacts continuously, report errors by item and field, and provide copyable AI prompt and JSON example helpers.
- Accept a minimal public import shape with documented defaults while rejecting unknown or internal fields.
- Persist every valid import as one atomic Firestore batch and refresh the directory from the server after success.
- Keep failed input available for correction or retry and provide accessible loading, copy, validation, success, and persistence feedback.
- Non-goals: updating or merging contacts, detecting duplicates, storing uploaded files, changing contact routes, or adding server-side import processing.

## Capabilities

### New Capabilities

- `contact-json-import`: JSON input, validation, assistance, atomic persistence, and directory reconciliation for bulk contact creation.

### Modified Capabilities

- `contact-directory`: Expose bulk import from the existing directory and refresh its page, count, and summary after success.

## Impact

- **Data:** Creates generated-ID documents in the shared root `contacts` collection through one Firestore batch; no rules, indexes, or migration changes.
- **UI:** Adds one list action and one CRM-owned Material dialog with Portuguese copy.
- **APIs:** Adds reusable import parsing contracts and a batch import method to `contacts-data-access`.
- **Federation:** No route or `./Routes` contract changes.
- **Deployment:** No hosting, Firebase deployment, or environment changes.
