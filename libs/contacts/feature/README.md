# Contacts Feature

`contacts-feature` owns CRM's routed contact list and the create, detail, and edit route shells. The list reads persisted contacts through `contacts-data-access`, which owns the Firestore contract and shared application queries.

The remote consumes its public `CONTACTS_ROUTES` API through `@pulso-crm/contacts-feature`. Other projects must not import internal files.

The internal layout is capability-first: routed screens live in `list`, `create`, `detail`, and `edit`; components and request state used only by the list stay beside it. The directory supports bounded server pagination, organization-name prefix search, stage/status filters, real aggregate metrics, and explicit asynchronous states. It offers no simulated writes. See [the Firestore guide](../../../docs/firestore-contacts.md).

Run `npx nx test contacts-feature` for focused tests.

Clicking a contact card opens the existing editing dialog with the complete selected Firestore contact, including channels, last-contact time, and activities. The dialog inherits the route's repository through the card view container. Saving disables editing, save, cancel, Escape and backdrop dismissal while showing a spinner. Failure retains the draft with an accessible error and permits retry or cancellation. Success shows a snackbar and returns the saved contact through the card output; the list replaces that record and adjusts stage metrics without extra reads. Cleared optional fields are removed. The current page, filters, total and query cursors remain a snapshot until the next normal query. Cancelling discards the draft. The dialog owns copies of activity objects so draft changes do not mutate the source record.
