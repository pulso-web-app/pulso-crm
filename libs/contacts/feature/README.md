# Contacts Feature

`contacts-feature` owns CRM's routed contact list and the create, detail, and edit route shells. The list reads persisted contacts through `contacts-data-access`, which owns the Firestore contract and shared application queries.

The remote consumes its public `CONTACTS_ROUTES` API through `@pulso-crm/contacts-feature`. Other projects must not import internal files.

The internal layout is capability-first: routed screens live in `list`, `create`, `detail`, and `edit`; components and request state used only by the list stay beside it. The directory supports bounded server pagination, organization-name prefix search, stage/status filters, real aggregate metrics, and explicit asynchronous states. It offers no simulated writes. See [the Firestore guide](../../../docs/firestore-contacts.md).

Run `npx nx test contacts-feature` for focused tests.

Clicking a contact card opens the existing editing dialog with the complete selected Firestore contact, including channels, last-contact time, and activities. The original form validation, channel shortcuts, activity draft controls, and action menu remain available. Saving returns an edited draft through the card output; backend updates are not connected and the persisted listing is not changed locally. Cancelling discards the draft. The dialog owns copies of the activity objects so form metadata and draft changes do not mutate the source record.
