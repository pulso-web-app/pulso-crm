import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { vi } from 'vitest';
import {
  Contact,
  ContactPage,
  ContactsRepository,
  ContactSummary,
} from '@pulso-crm/contacts-data-access';
import { ContactsListComponent } from './contacts-list.component';
import { ContactsListStore } from './contacts-list.store';
import { ContactFiltersComponent } from './contact-filters/contact-filters.component';
import { ContactDetailsEditDialogComponent } from './contact-details-edit-dialog/contact-details-edit-dialog.component';

const SUMMARY: ContactSummary = {
  total: 29,
  'cold-lead': 5,
  'warm-lead': 4,
  'hot-lead': 4,
  client: 4,
  'no-response': 4,
  'not-interested': 4,
};
function page(name = 'Órbita Design', id = 'contact-a'): ContactPage {
  return {
    contacts: [
      {
        id,
        organizationName: name,
        stage: 'client',
        status: 'new',
        lastContactAt: '2026-09-02T12:00:00Z',
        activities: [],
      },
    ],
    first: { name: name.toLowerCase(), id },
    last: { name: name.toLowerCase(), id },
  };
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

describe('ContactsListComponent', () => {
  let fixture: ComponentFixture<ContactsListComponent>;
  let store: ContactsListStore;
  let user: BehaviorSubject<string | null>;
  let repository: {
    userId$: BehaviorSubject<string | null>;
    readPage: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
    summary: ReturnType<typeof vi.fn>;
    updateContact: ReturnType<typeof vi.fn>;
    createContact: ReturnType<typeof vi.fn>;
  };
  let initial: ReturnType<typeof deferred<ContactPage>>;

  beforeEach(async () => {
    user = new BehaviorSubject<string | null>('user-a');
    initial = deferred<ContactPage>();
    repository = {
      userId$: user,
      readPage: vi
        .fn()
        .mockResolvedValue(page())
        .mockImplementationOnce(() => initial.promise),
      count: vi.fn().mockResolvedValue(1),
      summary: vi.fn().mockResolvedValue(SUMMARY),
      updateContact: vi.fn().mockResolvedValue(undefined),
      createContact: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [ContactsListComponent],
      providers: [
        provideRouter([]),
        { provide: ContactsRepository, useValue: repository },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ContactsListComponent);
    store = fixture.debugElement.injector.get(ContactsListStore);
    fixture.detectChanges();
  });

  afterEach(() => vi.useRealTimers());

  async function settle() {
    await fixture.whenStable();
    fixture.detectChanges();
  }
  async function loaded() {
    initial.resolve(page());
    await settle();
  }
  function host(): HTMLElement {
    return fixture.nativeElement;
  }
  function filters(): ContactFiltersComponent {
    return fixture.debugElement.query(By.directive(ContactFiltersComponent))
      .componentInstance;
  }

  async function openCreation() {
    (
      host().querySelector('.filters-right button') as HTMLButtonElement
    ).click();
    await settle();
    const ref = TestBed.inject(MatDialog).openDialogs[0];
    return {
      ref,
      editor: ref.componentInstance as ContactDetailsEditDialogComponent,
    };
  }

  it('opens a clean creation form and cancellation never writes or reuses the draft', async () => {
    await loaded();
    const { ref, editor } = await openCreation();
    expect(editor.isCreating).toBe(true);
    expect(editor.contactFormModel()).toEqual({
      id: '',
      organizationName: '',
      contactName: '',
      instagramHandle: '',
      instagramProfileUrl: '',
      whatsappNumber: '',
      stage: 'contact',
      status: 'new',
      lastContactAt: '',
      activities: [],
    });
    expect(document.getElementById(ref.id)?.textContent).toContain(
      'Novo contato',
    );
    await editor.save();
    editor.contactForm.organizationName().value.set('   ');
    await editor.save();
    editor.contactForm.organizationName().value.set('Cancelled draft');
    const closed = firstValueFrom(ref.afterClosed());
    editor.close();
    await closed;
    expect(repository.createContact).not.toHaveBeenCalled();
    expect(repository.updateContact).not.toHaveBeenCalled();
    expect(repository.readPage).toHaveBeenCalledTimes(1);
    const reopened = await openCreation();
    expect(reopened.editor.contactForm.organizationName().value()).toBe('');
    const cancelled = firstValueFrom(reopened.ref.afterClosed());
    reopened.editor.close();
    await cancelled;
  });

  it('creates through the shared modal, protects pending save, and refreshes one bounded page without recounting', async () => {
    await loaded();
    const created: Contact = {
      ...page('Created contact', 'generated-id').contacts[0],
      stage: 'contact',
      lastContactAt: null,
    };
    const pending = deferred<Contact>();
    repository.createContact.mockReturnValueOnce(pending.promise);
    repository.readPage.mockResolvedValueOnce({
      ...page(created.organizationName, created.id),
      contacts: [created],
    });
    const { ref, editor } = await openCreation();
    editor.contactForm.organizationName().value.set('  Created contact  ');
    const saved = editor.save();
    await settle();
    expect(ref.disableClose).toBe(true);
    expect(
      document.getElementById(ref.id)?.querySelector('mat-spinner'),
    ).not.toBeNull();
    document.querySelector<HTMLElement>('.cdk-overlay-backdrop')?.click();
    document.querySelector<HTMLElement>('.cdk-overlay-pane')?.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        code: 'Escape',
        keyCode: 27,
        bubbles: true,
      }),
    );
    editor.close();
    await editor.save();
    expect(repository.createContact).toHaveBeenCalledExactlyOnceWith({
      organizationName: 'Created contact',
      stage: 'contact',
      status: 'new',
      lastContactAt: null,
      activities: [],
    });
    expect(repository.readPage).toHaveBeenCalledTimes(1);
    expect(TestBed.inject(MatDialog).openDialogs).toHaveLength(1);
    const closed = firstValueFrom(ref.afterClosed());
    pending.resolve(created);
    await saved;
    await closed;
    await settle();
    expect(host().textContent).toContain('Created contact');
    expect(host().textContent).toContain('Sem contato registrado');
    expect(document.body.textContent).toContain('Contato criado com sucesso.');
    expect(repository.updateContact).not.toHaveBeenCalled();
    expect(repository.readPage).toHaveBeenCalledTimes(2);
    expect(repository.readPage).toHaveBeenLastCalledWith({
      direction: 'first',
      size: 9,
      filter: { search: '', stage: null, status: null },
    });
    expect(repository.summary).toHaveBeenCalledTimes(1);
    expect(repository.count).not.toHaveBeenCalled();
    expect(store.total()).toBe(30);
    expect(store.summary()?.total).toBe(30);
  });

  it('creates a contact with an entered last-contact instant and masked WhatsApp', async () => {
    await loaded();
    const { ref, editor } = await openCreation();
    editor.contactForm.organizationName().value.set('Dated contact');
    const dialog = document.getElementById(ref.id);
    if (!dialog) throw new Error('The creation dialog was not rendered.');
    const inputs = dialog.querySelectorAll(
      'pulso-crm-last-contact-editor input',
    ) as NodeListOf<HTMLInputElement>;
    inputs[0].value = '02/09/2026';
    inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
    inputs[1].value = '16:20';
    inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
    const phone = dialog.querySelector('input[type="tel"]') as HTMLInputElement;
    phone.value = '+55 11 91234 5678';
    phone.dispatchEvent(new Event('input', { bubbles: true }));
    await settle();
    const lastContactAt = new Date(2026, 8, 2, 16, 20).toISOString();
    repository.createContact.mockResolvedValueOnce({
      ...editor.contactFormModel(),
      id: 'created-dated',
      lastContactAt,
    });
    await editor.save();
    expect(repository.createContact).toHaveBeenCalledWith(
      expect.objectContaining({
        lastContactAt,
        whatsappNumber: '(11) 91234-5678',
      }),
    );
  });

  it('retains a failed creation draft and can retry without updating an existing record', async () => {
    await loaded();
    repository.createContact
      .mockRejectedValueOnce(new Error('permission-denied'))
      .mockResolvedValueOnce({
        ...page('Retry created', 'new-id').contacts[0],
        lastContactAt: null,
      });
    const { ref, editor } = await openCreation();
    editor.contactForm.organizationName().value.set('Retry created');
    await editor.save();
    await settle();
    expect(ref.disableClose).toBe(false);
    expect(editor.contactForm.organizationName().value()).toBe('Retry created');
    expect(
      document.getElementById(ref.id)?.querySelector('[role="alert"]'),
    ).not.toBeNull();
    expect(repository.readPage).toHaveBeenCalledTimes(1);
    expect(store.total()).toBe(29);
    const closed = firstValueFrom(ref.afterClosed());
    await editor.save();
    await closed;
    await settle();
    expect(repository.createContact).toHaveBeenCalledTimes(2);
    expect(repository.updateContact).not.toHaveBeenCalled();
  });

  it('enables creation for a loaded empty directory but disables it while loading or signed out', async () => {
    expect(
      (host().querySelector('.filters-right button') as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    repository.summary.mockResolvedValue({ ...SUMMARY, total: 0 });
    repository.readPage.mockResolvedValue({
      contacts: [],
      first: null,
      last: null,
    });
    store.retry();
    await settle();
    expect(
      (host().querySelector('.filters-right button') as HTMLButtonElement)
        .disabled,
    ).toBe(false);
    const { ref, editor } = await openCreation();
    expect(editor.isCreating).toBe(true);
    const closed = firstValueFrom(ref.afterClosed());
    editor.close();
    await closed;
    user.next(null);
    await settle();
    expect(
      (host().querySelector('.filters-right button') as HTMLButtonElement)
        .disabled,
    ).toBe(true);
  });

  it.each([true, false])(
    'reconciles a created contact matching current filters: %s',
    async (matches) => {
      await loaded();
      store.filter.set({ search: 'Ór', stage: 'client', status: 'new' });
      store.pageIndex.set(2);
      store.applyCreatedContact({
        ...page(matches ? 'Órbita New' : 'Outside', 'new-id').contacts[0],
      });
      await settle();
      expect(store.total()).toBe(matches ? 30 : 29);
      expect(store.summary()).toEqual({ ...SUMMARY, total: 30, client: 5 });
      expect(store.pageIndex()).toBe(0);
      expect(repository.readPage).toHaveBeenCalledTimes(2);
      expect(repository.count).not.toHaveBeenCalled();
      expect(repository.summary).toHaveBeenCalledTimes(1);
      expect(repository.readPage).toHaveBeenLastCalledWith({
        direction: 'first',
        size: 9,
        filter: { search: 'Ór', stage: 'client', status: 'new' },
      });
    },
  );

  it('reports a failed follow-up read without repeating the confirmed creation', async () => {
    await loaded();
    repository.createContact.mockResolvedValueOnce(
      page('Saved', 'new-id').contacts[0],
    );
    repository.readPage.mockRejectedValueOnce(new Error('unavailable'));
    const { ref, editor } = await openCreation();
    editor.contactForm.organizationName().value.set('Saved');
    const closed = firstValueFrom(ref.afterClosed());
    await editor.save();
    await closed;
    await settle();
    expect(store.state()).toBe('error');
    expect(repository.createContact).toHaveBeenCalledTimes(1);
    expect(TestBed.inject(MatDialog).openDialogs).toHaveLength(0);
  });

  it('shows loading without inventing zero results', () => {
    expect(host().textContent).toContain('Carregando contatos');
    expect(host().textContent).not.toContain('Nenhum contato');
    expect(host().querySelector('mat-paginator')).toBeNull();
  });

  it('renders persisted records and real aggregated counts', async () => {
    await loaded();
    expect(host().textContent).toContain('Órbita Design');
    expect(host().textContent).toContain('29 contatos encontrados');
    expect(
      host().querySelector('pulso-crm-contact-metric-cards')?.textContent,
    ).toContain('29');
    expect(repository.readPage).toHaveBeenCalledWith({
      direction: 'first',
      size: 9,
      filter: { search: '', stage: null, status: null },
    });
    expect(repository.count).not.toHaveBeenCalled();
  });

  it('requests next and previous pages using the displayed cursors without recounting', async () => {
    await loaded();
    fixture.debugElement
      .query(By.directive(MatPaginator))
      .componentInstance.nextPage();
    await settle();
    expect(repository.readPage).toHaveBeenLastCalledWith(
      expect.objectContaining({
        direction: 'next',
        cursor: page().last,
        size: 9,
      }),
    );
    store.changePage(2, 9);
    await settle();
    store.changePage(1, 9);
    await settle();
    expect(repository.readPage).toHaveBeenLastCalledWith(
      expect.objectContaining({
        direction: 'previous',
        cursor: page().first,
        size: 9,
      }),
    );
    expect(repository.summary).toHaveBeenCalledTimes(1);
    expect(repository.count).not.toHaveBeenCalled();
  });

  it('opens the original dialog with every field of the selected contact after pagination', async () => {
    await loaded();
    const selected: Contact = {
      id: 'persisted-contact-b',
      organizationName: 'Segunda Empresa',
      contactName: 'Ana Souza',
      instagramHandle: '@segunda.empresa',
      instagramProfileUrl: 'https://www.instagram.com/segunda.empresa/',
      whatsappNumber: '(11) 98888-7777',
      stage: 'warm-lead',
      status: 'awaiting-response',
      lastContactAt: '2026-09-01T13:15:00.000Z',
      activities: [
        {
          text: 'Proposta enviada',
          createdAt: '2026-08-31T12:30:00.000Z',
          updatedAt: '2026-09-01T13:15:00.000Z',
        },
      ],
    };
    repository.readPage.mockResolvedValueOnce({
      ...page(selected.organizationName, selected.id),
      contacts: [page('Outro contato', 'contact-c').contacts[0], selected],
    });
    fixture.debugElement
      .query(By.directive(MatPaginator))
      .componentInstance.nextPage();
    await settle();

    const selectedSnapshot = structuredClone(selected);
    (
      host().querySelectorAll(
        'pulso-crm-contact-card mat-card',
      )[1] as HTMLElement
    ).click();
    await settle();

    const dialog = TestBed.inject(MatDialog);
    const ref = dialog.openDialogs[0];
    const editor = ref.componentInstance as ContactDetailsEditDialogComponent;
    expect(editor.data.contact).toEqual(selected);
    expect(structuredClone(editor.contactFormModel())).toEqual(selected);
    const dialogElement = document.getElementById(ref.id);
    if (!dialogElement) {
      throw new Error('The selected contact dialog was not rendered.');
    }
    expect(
      Array.from(dialogElement.querySelectorAll('input')).map(
        (input) => input.value,
      ),
    ).toEqual([
      selected.organizationName,
      selected.contactName,
      selected.instagramHandle,
      selected.instagramProfileUrl,
      selected.whatsappNumber,
      new Intl.DateTimeFormat('pt-BR').format(
        new Date(selected.lastContactAt ?? ''),
      ),
      new Intl.DateTimeFormat('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
      }).format(new Date(selected.lastContactAt ?? '')),
    ]);
    expect(dialogElement.textContent).toContain('Proposta enviada');
    expect(dialogElement.textContent).toContain('Lead Morno');
    expect(dialogElement.textContent).toContain('Aguardando resposta');
    expect(selected).toEqual(selectedSnapshot);

    const closed = firstValueFrom(ref.afterClosed());
    editor.close();
    await closed;
    await settle();
    (
      host().querySelectorAll(
        'pulso-crm-contact-card mat-card',
      )[0] as HTMLElement
    ).click();
    await settle();
    const nextEditor = dialog.openDialogs[0]
      .componentInstance as ContactDetailsEditDialogComponent;
    expect(nextEditor.contactFormModel()).toEqual({
      ...page('Outro contato', 'contact-c').contacts[0],
      contactName: '',
      instagramHandle: '',
      instagramProfileUrl: '',
      whatsappNumber: '',
    });
    const nextClosed = firstValueFrom(dialog.openDialogs[0].afterClosed());
    nextEditor.close();
    await nextClosed;
    await settle();
  });

  it('updates the displayed card only after persistence without reloading and reopens with saved values', async () => {
    await loaded();
    store.page.update((page) => ({
      ...page,
      contacts: page.contacts.map((contact) => ({
        ...contact,
        instagramHandle: '@old',
      })),
    }));
    await settle();
    const original = structuredClone(store.page());
    const pending = deferred<void>();
    repository.updateContact.mockReturnValueOnce(pending.promise);
    (
      host().querySelector('pulso-crm-contact-card mat-card') as HTMLElement
    ).click();
    await settle();
    const ref = TestBed.inject(MatDialog).openDialogs[0];
    const editor = ref.componentInstance as ContactDetailsEditDialogComponent;

    editor.contactForm.organizationName().value.set('Rascunho editado');
    editor.contactForm.instagramHandle().value.set('');
    editor.newActivityText.set('Atividade em rascunho');
    editor.addActivity();
    const closed = firstValueFrom(ref.afterClosed());
    const saving = editor.save();
    await settle();
    expect(store.page()).toEqual(original);
    expect(ref.disableClose).toBe(true);
    document.querySelector<HTMLElement>('.cdk-overlay-backdrop')?.click();
    document.querySelector<HTMLElement>('.cdk-overlay-pane')?.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        code: 'Escape',
        keyCode: 27,
        bubbles: true,
      }),
    );
    editor.close();
    await settle();
    expect(TestBed.inject(MatDialog).openDialogs).toHaveLength(1);
    pending.resolve();
    await saving;
    await closed;
    await settle();

    expect(TestBed.inject(MatDialog).openDialogs).toHaveLength(0);
    expect(store.page().contacts[0].organizationName).toBe('Rascunho editado');
    expect(store.page().first).toEqual(original.first);
    expect(store.page().last).toEqual(original.last);
    expect(host().textContent).not.toContain('Órbita Design');
    expect(host().textContent).toContain('Rascunho editado');
    expect(repository.readPage).toHaveBeenCalledTimes(1);
    expect(repository.summary).toHaveBeenCalledTimes(1);
    expect(repository.count).not.toHaveBeenCalled();
    (
      host().querySelector('pulso-crm-contact-card mat-card') as HTMLElement
    ).click();
    await settle();
    const reopened = TestBed.inject(MatDialog).openDialogs[0];
    expect(
      reopened.componentInstance.contactForm.organizationName().value(),
    ).toBe('Rascunho editado');
    expect(
      reopened.componentInstance.contactForm.activities().value(),
    ).toHaveLength(1);
    const cancelled = firstValueFrom(reopened.afterClosed());
    expect(
      reopened.componentInstance.contactForm.instagramHandle().value(),
    ).toBe('');
    expect(host().textContent).not.toContain('@old');
    reopened.componentInstance.close();
    await cancelled;
  });

  it('replaces a saved contact and adjusts stage metrics while retaining filtered page boundaries', async () => {
    await loaded();
    store.stage('client');
    await settle();
    const selected = { ...page().contacts[0], instagramHandle: '@old' };
    const unrelated = page('Other', 'contact-b').contacts[0];
    store.page.set({ ...page(), contacts: [selected, unrelated] });
    store.pageIndex.set(2);
    const before = store.page();
    const total = store.total();
    const reads = repository.readPage.mock.calls.length;
    const counts = repository.count.mock.calls.length;
    store.applyUpdatedContact({
      ...page().contacts[0],
      organizationName: 'Renamed',
      stage: 'hot-lead',
    });
    expect(store.page().contacts[0]).not.toHaveProperty('instagramHandle');
    expect(store.page().contacts[1]).toBe(unrelated);
    expect(store.page().first).toEqual(before.first);
    expect(store.page().last).toEqual(before.last);
    expect(store.pageIndex()).toBe(2);
    expect(store.pageSize()).toBe(9);
    expect(store.filter().stage).toBe('client');
    expect(store.total()).toBe(total);
    expect(store.summary()).toEqual({ ...SUMMARY, client: 3, 'hot-lead': 5 });
    store.applyUpdatedContact({
      ...store.page().contacts[0],
      stage: 'contact',
    });
    expect(store.summary()).toEqual({ ...SUMMARY, client: 3 });
    store.applyUpdatedContact({ ...store.page().contacts[0], stage: 'client' });
    expect(store.summary()).toEqual(SUMMARY);
    expect(repository.readPage).toHaveBeenCalledTimes(reads);
    expect(repository.count).toHaveBeenCalledTimes(counts);
    expect(repository.summary).toHaveBeenCalledTimes(1);
  });

  it('ignores confirmed updates for absent contacts, during loads, or after sign-out', async () => {
    await loaded();
    const before = store.page();
    store.applyUpdatedContact(page('Absent', 'absent').contacts[0]);
    expect(store.page()).toBe(before);
    const pending = deferred<ContactPage>();
    repository.readPage.mockReturnValueOnce(pending.promise);
    store.changePage(1, 9);
    store.applyUpdatedContact({
      ...before.contacts[0],
      organizationName: 'Stale',
    });
    expect(store.page()).toBe(before);
    user.next(null);
    store.applyUpdatedContact(before.contacts[0]);
    expect(store.page().contacts).toEqual([]);
    expect(store.summary()).toBeNull();
    pending.resolve(page());
    await settle();
    expect(store.page().contacts).toEqual([]);
  });

  it('keeps the list unchanged after a failed save and cancellation without extra reads', async () => {
    await loaded();
    const before = structuredClone(store.page());
    repository.updateContact.mockRejectedValueOnce(new Error('unavailable'));
    (
      host().querySelector('pulso-crm-contact-card mat-card') as HTMLElement
    ).click();
    await settle();
    const ref = TestBed.inject(MatDialog).openDialogs[0];
    const editor = ref.componentInstance as ContactDetailsEditDialogComponent;
    editor.contactForm.organizationName().value.set('Failed edit');
    await editor.save();
    await settle();
    expect(
      document.getElementById(ref.id)?.querySelector('[role="alert"]'),
    ).not.toBeNull();
    expect(store.page()).toEqual(before);
    expect(store.summary()).toEqual(SUMMARY);
    const closed = firstValueFrom(ref.afterClosed());
    editor.close();
    await closed;
    expect(store.page()).toEqual(before);
    expect(repository.readPage).toHaveBeenCalledTimes(1);
    expect(repository.summary).toHaveBeenCalledTimes(1);
    expect(repository.count).not.toHaveBeenCalled();
  });

  it('requests only the partial last page and supports returning directly to the first', async () => {
    await loaded();
    fixture.debugElement
      .query(By.directive(MatPaginator))
      .componentInstance.lastPage();
    await settle();
    expect(repository.readPage).toHaveBeenLastCalledWith(
      expect.objectContaining({ direction: 'last', size: 2 }),
    );
    expect(store.pageIndex()).toBe(3);
    store.changePage(0, 9);
    await settle();
    expect(repository.readPage).toHaveBeenLastCalledWith(
      expect.objectContaining({ direction: 'first', size: 9 }),
    );
  });

  it('resets to the first page after changing page size and keeps the size selector available', async () => {
    await loaded();
    store.changePage(3, 9);
    await settle();
    store.changePage(1, 27);
    await settle();
    expect(repository.readPage).toHaveBeenLastCalledWith(
      expect.objectContaining({ direction: 'first', size: 27 }),
    );
    expect(store.pageIndex()).toBe(0);
    expect(host().querySelector('mat-paginator')).not.toBeNull();
  });

  it('combines stage and status filters and resets pagination', async () => {
    await loaded();
    filters().selectedStage.set('client');
    filters().selectedStatus.set('new');
    await settle();
    expect(repository.count).toHaveBeenLastCalledWith({
      search: '',
      stage: 'client',
      status: 'new',
    });
    expect(store.pageIndex()).toBe(0);
    expect(host().textContent).toContain('1 contato encontrado');
  });

  it('debounces search and invalidates an earlier request immediately', async () => {
    filters().searchContact.set('O');
    filters().searchContact.set('Órbita');
    initial.resolve(page('Old result'));
    await Promise.resolve();
    await Promise.resolve();
    expect(store.state()).toBe('loading');
    expect(store.page().contacts).toEqual([]);
    expect(repository.readPage).toHaveBeenCalledTimes(1);
    await vi.waitFor(() =>
      expect(repository.readPage).toHaveBeenCalledTimes(2),
    );
    expect(repository.readPage).toHaveBeenLastCalledWith(
      expect.objectContaining({
        direction: 'first',
        filter: { search: 'Órbita', stage: null, status: null },
      }),
    );
    await settle();
    expect(host().textContent).not.toContain('Old result');
  });

  it('shows a retryable error and reloads counts on retry', async () => {
    initial.reject(new Error('permission-denied'));
    await settle();
    expect(host().querySelector('[role="alert"]')).not.toBeNull();
    expect(host().textContent).not.toContain('Nenhum contato');
    (
      host().querySelector('[role="alert"] button') as HTMLButtonElement
    ).click();
    await settle();
    expect(host().textContent).toContain('Órbita Design');
    expect(repository.summary).toHaveBeenCalledTimes(2);
  });

  it('shows paginator with is-floating class when not at bottom', async () => {
    await loaded();
    const paginatorEl = host().querySelector('mat-paginator') as HTMLElement;
    expect(paginatorEl.classList.contains('is-floating')).toBeTruthy();
  });

  it('removes is-floating class when scrolled to bottom', async () => {
    await loaded();
    const sentinel = host().querySelector('.contacts-paginator-sentinel');
    expect(sentinel).not.toBeNull();
  });

  it('adds back is-floating class when page size changes', async () => {
    await loaded();
    store.changePage(0, 27);
    await settle();
    const paginatorEl = host().querySelector('mat-paginator') as HTMLElement;
    expect(paginatorEl.classList.contains('is-floating')).toBeTruthy();
  });

  it('shows an actual empty directory without a paginator', async () => {
    repository.summary.mockResolvedValue({ ...SUMMARY, total: 0 });
    repository.readPage.mockResolvedValue({
      contacts: [],
      first: null,
      last: null,
    });
    store.retry();
    await settle();
    expect(host().textContent).toContain('Ainda não há contatos cadastrados');
    expect(host().querySelector('mat-paginator')).toBeNull();
    expect(host().textContent).toContain('0 contatos encontrados');
  });

  it('clears filters from an empty filtered result', async () => {
    await loaded();
    repository.count.mockResolvedValue(0);
    repository.readPage.mockResolvedValueOnce({
      contacts: [],
      first: null,
      last: null,
    });
    store.stage('client');
    await settle();
    expect(host().textContent).toContain('Nenhum contato encontrado');
    (host().querySelector('.empty-state button') as HTMLButtonElement).click();
    await settle();
    expect(store.filter()).toEqual({ search: '', stage: null, status: null });
    expect(host().textContent).toContain('Órbita Design');
  });

  it('discards stale success and failure responses after newer filters', async () => {
    const outdated = deferred<ContactPage>();
    repository.readPage.mockReturnValueOnce(outdated.promise);
    store.stage('client');
    repository.readPage.mockResolvedValueOnce(page('Current result'));
    store.status('new');
    await settle();
    initial.resolve(page('Old initial'));
    outdated.reject(new Error('Old failure'));
    await settle();
    expect(host().textContent).toContain('Current result');
    expect(host().querySelector('[role="alert"]')).toBeNull();
  });

  it('clears contacts, counts and cursors on sign-out and ignores in-flight reads', async () => {
    await loaded();
    const pending = deferred<ContactPage>();
    repository.readPage.mockReturnValueOnce(pending.promise);
    store.changePage(1, 9);
    user.next(null);
    await settle();
    pending.resolve(page('Stale contact'));
    await settle();
    expect(store.page().contacts).toEqual([]);
    expect(store.summary()).toBeNull();
    expect(store.total()).toBe(0);
    expect(host().textContent).toContain('Entre na sua conta');
    expect(host().textContent).not.toContain('Stale contact');
  });

  it('reloads the same shared query on account changes and ignores outdated responses', async () => {
    repository.readPage.mockResolvedValueOnce(page('Shared contact'));
    user.next('user-b');
    await settle();
    initial.resolve(page('Outdated response'));
    await settle();
    expect(repository.readPage).toHaveBeenLastCalledWith(
      expect.objectContaining({ direction: 'first' }),
    );
    expect(host().textContent).toContain('Shared contact');
    expect(host().textContent).not.toContain('Outdated response');
  });

  it('recovers to the first page if external deletion makes a later page empty', async () => {
    await loaded();
    repository.readPage.mockResolvedValueOnce({
      contacts: [],
      first: null,
      last: null,
    });
    store.changePage(1, 9);
    await settle();
    expect(store.pageIndex()).toBe(0);
    expect(repository.readPage).toHaveBeenLastCalledWith(
      expect.objectContaining({ direction: 'first' }),
    );
  });

  it('does not update state after the component is destroyed', async () => {
    fixture.destroy();
    initial.resolve(page('Too late'));
    await Promise.resolve();
    await Promise.resolve();
    expect(store.page().contacts).toEqual([]);
  });
});
