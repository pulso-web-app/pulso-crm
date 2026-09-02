import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  MatPaginatorIntl,
  MatPaginatorModule,
} from '@angular/material/paginator';
import { ContactMetricCardsComponent } from './contact-metric-cards/contact-metric-cards.component';
import { ContactFiltersComponent } from './contact-filters/contact-filters.component';
import { ContactCardComponent } from './contact-card/contact-card.component';
import { ContactsListStore } from './contacts-list.store';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

function createPortuguesePaginatorIntl(): MatPaginatorIntl {
  const paginatorIntl = new MatPaginatorIntl();
  paginatorIntl.itemsPerPageLabel = 'Contatos por página';
  paginatorIntl.nextPageLabel = 'Próxima página';
  paginatorIntl.previousPageLabel = 'Página anterior';
  paginatorIntl.firstPageLabel = 'Primeira página';
  paginatorIntl.lastPageLabel = 'Última página';
  paginatorIntl.getRangeLabel = (page, pageSize, length) => {
    if (length === 0 || pageSize === 0) {
      return `0 de ${length}`;
    }

    const startIndex = page * pageSize;
    const endIndex = Math.min(startIndex + pageSize, length);
    return `${startIndex + 1}–${endIndex} de ${length}`;
  };

  return paginatorIntl;
}

@Component({
  selector: 'pulso-crm-contacts-list',
  imports: [
    ContactMetricCardsComponent,
    ContactFiltersComponent,
    ContactCardComponent,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
  ],
  providers: [
    ContactsListStore,
    {
      provide: MatPaginatorIntl,
      useFactory: createPortuguesePaginatorIntl,
    },
  ],
  templateUrl: './contacts-list.component.html',
  styleUrl: './contacts-list.component.scss',
})
export class ContactsListComponent {
  protected readonly store = inject(ContactsListStore);
}
