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
			import('../features/contacts/contacts.routes').then(
				(module) => module.CONTACTS_ROUTES,
			),
	},
];
