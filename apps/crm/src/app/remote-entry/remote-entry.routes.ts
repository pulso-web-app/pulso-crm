import { Routes } from '@angular/router';

export const CRM_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'contacts',
  },
  {
    path: 'contacts',
    loadChildren: () =>
      import('@pulso-crm/contacts-feature').then(
        (module) => module.CONTACTS_ROUTES,
      ),
  },
];
