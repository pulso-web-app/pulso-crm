# Design

Recover the existing dialog and card presentation from Git without reintroducing mock data or the old mock-list mutation handler. Use `@pulso-crm/contacts-data-access` for the shared `Contact` type and classification options, and restore `@pulso-crm/shared-util` for the existing draft cleanup.

The card opens the dialog with its current input. The dialog owns a separate form model initialized from every contact field, including channel URLs, timestamps, and activity history. Save continues to return the edited draft through the existing card output; cancel returns no value. The directory does not consume that output as a successful write. No optimistic update, success message, or backend call is added.

Preserve the original menu navigation, hover affordance, dialog dimensions, HTML, and SCSS. Existing asynchronous loading and error states remain owned by the directory store. Cover the original modal controls and the complete list-to-modal data path, including a selected contact on a later page, absent optional fields, and draft edits that leave the source record unchanged.
