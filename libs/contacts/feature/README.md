# Contacts Feature

`contacts-feature` owns CRM's routed contact list, create, detail, and edit experience. The screens remain one cohesive capability today; domain and data-access libraries should be extracted only when implemented business or persistence behavior gives those boundaries real meaning.

The remote consumes its public `CONTACTS_ROUTES` API through `@pulso-crm/contacts-feature`. Other projects must not import internal files.

Run `npx nx test contacts-feature` for focused tests.
