import { Component, computed, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  MatPaginatorIntl,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { ContactMetricCardsComponent } from './contact-metric-cards/contact-metric-cards.component';
import { ContactFiltersComponent } from './contact-filters/contact-filters.component';
import { ContactCardComponent } from './contact-card/contact-card.component';
import { MOCK_CONTACTS } from './contact.mocks';
import {
  Contact,
  ContactStage,
  ContactStatus,
  contactStageLabel,
  contactStatusLabel,
} from './contact.models';

const DEFAULT_PAGE_SIZE = 9;

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
  ],
  providers: [
    {
      provide: MatPaginatorIntl,
      useFactory: createPortuguesePaginatorIntl,
    },
  ],
  templateUrl: './contacts-list.component.html',
  styleUrl: './contacts-list.component.scss',
})
export class ContactsListComponent {
  protected readonly contacts = signal<readonly Contact[]>(MOCK_CONTACTS);
  protected readonly searchQuery = signal('');
  protected readonly selectedStage = signal<ContactStage | null>(null);
  protected readonly selectedStatus = signal<ContactStatus | null>(null);
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(DEFAULT_PAGE_SIZE);

  protected readonly filteredContacts = computed(() => {
    const normalizedSearch = this.normalize(this.searchQuery().trim());
    const stage = this.selectedStage();
    const status = this.selectedStatus();

    return this.contacts().filter((contact) => {
      if (stage && contact.stage !== stage) {
        return false;
      }

      if (status && contact.status !== status) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return this.contactSearchText(contact).includes(normalizedSearch);
    });
  });

  protected readonly visibleContacts = computed(() => {
    const startIndex = this.pageIndex() * this.pageSize();
    return this.filteredContacts().slice(
      startIndex,
      startIndex + this.pageSize(),
    );
  });

  protected updateSearch(search: string): void {
    this.searchQuery.set(search);
    this.resetPagination();
  }

  protected updateStage(stage: ContactStage | null): void {
    this.selectedStage.set(stage);
    this.resetPagination();
  }

  protected updateStatus(status: ContactStatus | null): void {
    this.selectedStatus.set(status);
    this.resetPagination();
  }

  protected handlePageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  protected clearFilters(): void {
    this.searchQuery.set('');
    this.selectedStage.set(null);
    this.selectedStatus.set(null);
    this.resetPagination();
  }

  private resetPagination(): void {
    this.pageIndex.set(0);
  }

  private contactSearchText(contact: Contact): string {
    return this.normalize(
      [
        contact.organizationName,
        contact.contactName,
        contact.instagramHandle,
        contact.whatsappNumber,
        contactStageLabel(contact.stage),
        contactStatusLabel(contact.status),
      ]
        .filter(Boolean)
        .join(' '),
    );
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLocaleLowerCase('pt-BR');
  }
}
