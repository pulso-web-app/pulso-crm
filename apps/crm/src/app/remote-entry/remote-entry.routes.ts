import { Routes } from '@angular/router';
import { provideContactsDataAccess } from '@pulso-crm/contacts-data-access';
import { getFirebaseApp } from '../core/firebase/firebase';

export const CRM_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'contacts',
  },
  {
    path: 'contacts',
    providers: [provideContactsDataAccess(getFirebaseApp)],
    loadChildren: () =>
      import('@pulso-crm/contacts-feature').then(
        (module) => module.CONTACTS_ROUTES,
      ),
  },
];

export const REMOTE_ROUTES = CRM_ROUTES;
