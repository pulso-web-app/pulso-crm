import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  DestroyRef,
  ElementRef,
  effect,
  inject,
  OnDestroy,
  signal,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ContactDialogService } from './contact-details-edit-dialog/contact-dialog.service';
import { MatButtonModule } from '@angular/material/button';
import {
  MatPaginatorIntl,
  MatPaginatorModule,
} from '@angular/material/paginator';
import { ContactMetricCardsComponent } from './contact-metric-cards/contact-metric-cards.component';
import { ContactFiltersComponent } from './contact-filters/contact-filters.component';
import { ContactCardComponent } from './contact-card/contact-card.component';
import { ContactsListStore } from './contacts-list.store';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ContactImportDialogService } from './contact-import-dialog/contact-import-dialog.service';

import '@phosphor-icons/webcomponents/PhCloudSlash';
import '@phosphor-icons/webcomponents/PhFunnelX';
import '@phosphor-icons/webcomponents/PhLock';
import '@phosphor-icons/webcomponents/PhUserFocus';

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
    MatPaginatorModule,
    MatProgressSpinnerModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
export class ContactsListComponent implements AfterViewInit, OnDestroy {
  protected readonly store = inject(ContactsListStore);
  private readonly dialog = inject(ContactDialogService);
  private readonly importDialog = inject(ContactImportDialogService);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly destroyRef = inject(DestroyRef);
  private createDialogOpen = false;
  private importDialogOpen = false;
  protected readonly bottomSentinel =
    viewChild<ElementRef<HTMLElement>>('bottomSentinel');
  protected readonly isAtBottom = signal(true);

  private observer?: IntersectionObserver;

  constructor() {
    effect(() => {
      this.store.pageSize();
      this.isAtBottom.set(false);
    });
  }

  ngAfterViewInit(): void {
    const target = this.bottomSentinel()?.nativeElement;
    if (!target || typeof IntersectionObserver === 'undefined') return;
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          this.isAtBottom.set(entry.isIntersecting);
        }
      },
      { root: null, threshold: 0 },
    );
    this.observer.observe(target);
  }

  protected openNewContact(): void {
    if (this.createDialogOpen || this.store.state() !== 'success') return;
    this.createDialogOpen = true;
    this.dialog
      .open({ mode: 'create' }, this.viewContainerRef)
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((created) => {
        this.createDialogOpen = false;
        if (created) this.store.applyCreatedContact(created);
      });
  }

  protected openImport(): void {
    if (this.importDialogOpen || this.store.state() !== 'success') return;
    this.importDialogOpen = true;
    this.importDialog
      .open(this.viewContainerRef)
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((importedCount) => {
        this.importDialogOpen = false;
        if (importedCount !== undefined) this.store.refreshAfterImport();
      });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
