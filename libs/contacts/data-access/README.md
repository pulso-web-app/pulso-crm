# Contacts Data Access

`contacts-data-access` owns Firestore directory reads, contact creation, JSON batch import, and updates. Import it through `@pulso-crm/contacts-data-access`. CRM supplies its existing Firebase application with `provideContactsDataAccess`; the shell continues to own sign-in.

The repository observes Firebase Auth and queries the shared root `contacts` collection for every authenticated account. It uses server reads, aggregation counts, and bounded cursor queries. Explicit saves update editable fields and activities, normalize the search name, and delete cleared optional fields. Directory presentation and request state live in `contacts-feature`. No seed data, credentials, or automatic startup writes belong in browser code.

Run `npx nx test contacts-data-access` for contract and query tests. See [the Firestore guide](../../../docs/firestore-contacts.md) for the document schema, indexes, and seed workflow.

`createContact(ContactInput)` validates and writes a new document with a generated ID, returning the decoded saved Contact. Optional blank strings are omitted on creation; existing-field removal still uses deleteField on updates. Unknown last-contact dates are null; existing string and Timestamp dates remain supported. No date or activity is invented for a new record.

`parseContactImportJson` validates one to 500 public contact objects, applies Contact/New/null/empty-activity defaults, rejects unknown and internal fields, and returns structured Portuguese issues for presentation. `importContacts` repeats that validation, prepares the same normalized documents as individual creation, and commits generated references in one atomic Firestore batch. Repeated contacts are independent creations; lookup, merge, and deduplication are intentionally absent.
