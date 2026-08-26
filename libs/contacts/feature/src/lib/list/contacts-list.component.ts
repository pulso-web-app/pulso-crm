import { Component, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { ContactMetricCardsComponent } from './contact-metric-cards/contact-metric-cards.component';
import { ContactFiltersComponent } from './contact-filters/contact-filters.component';

@Component({
  selector: 'pulso-crm-contacts-list',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    ContactMetricCardsComponent,
    ContactFiltersComponent,
  ],
  templateUrl: './contacts-list.component.html',
  styleUrl: './contacts-list.component.scss',
})
export class ContactsListComponent {
  value = signal('');
}
