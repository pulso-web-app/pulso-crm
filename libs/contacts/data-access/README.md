# Contacts Data Access

`contacts-data-access` owns the read-only Firestore directory contract. Import it through `@pulso-crm/contacts-data-access`. CRM supplies its existing Firebase application with `provideContactsDataAccess`; the shell continues to own sign-in.

The repository observes Firebase Auth and queries the shared root `contacts` collection for every authenticated account. It uses server reads, aggregation counts, and bounded cursor queries. Directory presentation and request state live in `contacts-feature`. No seed data, credentials, local editing, or automatic writes belong in browser code.

Run `npx nx test contacts-data-access` for contract and query tests. See [the Firestore guide](../../../docs/firestore-contacts.md) for the document schema, indexes, and seed workflow.
