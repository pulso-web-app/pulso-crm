import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'pulso-crm-contacts-list',
  templateUrl: './contacts-list.component.html',
  styleUrl: './contacts-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactsListComponent {}
