import { Routes } from '@angular/router';

export const CONTACTS_ROUTES: Routes = [
	{
		path: '',
		title: 'Contatos',
		loadComponent: () =>
			import('./list/contacts-list.component').then(
				(module) => module.ContactsListComponent,
			),
	},
	{
		path: 'new',
		title: 'Novo contato',
		loadComponent: () =>
			import('./create/contact-create.component').then(
				(module) => module.ContactCreateComponent,
			),
	},
	{
		path: ':id/edit',
		title: 'Editar contato',
		loadComponent: () =>
			import('./edit/contact-edit.component').then(
				(module) => module.ContactEditComponent,
			),
	},
	{
		path: ':id',
		title: 'Detalhes do contato',
		loadComponent: () =>
			import('./detail/contact-detail.component').then(
				(module) => module.ContactDetailComponent,
			),
	},
];
