import { Component } from '@angular/core';
import { ContactMetricCardsComponent } from './contact-metric-cards/contact-metric-cards.component';
import { ContactFiltersComponent } from './contact-filters/contact-filters.component';

@Component({
  selector: 'pulso-crm-contacts-list',
  imports: [ContactMetricCardsComponent, ContactFiltersComponent],
  templateUrl: './contacts-list.component.html',
  styleUrl: './contacts-list.component.scss',
})
export class ContactsListComponent {}
