import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Contact,
  ContactFilter,
  ContactPage,
  ContactPageRequest,
  ContactsRepository,
  ContactStage,
  ContactStatus,
  ContactSummary,
  normalizeContactSearch,
} from '@pulso-crm/contacts-data-access';

const EMPTY_FILTER: ContactFilter = { search: '', stage: null, status: null };
const EMPTY_PAGE: ContactPage = { contacts: [], first: null, last: null };

@Injectable()
export class ContactsListStore {
  private readonly repository = inject(ContactsRepository);
  private readonly destroyRef = inject(DestroyRef);
  private userId: string | null = null;
  private requestId = 0;
  private searchTimer?: ReturnType<typeof setTimeout>;

  readonly state = signal<'loading' | 'success' | 'error' | 'signed-out'>(
    'loading',
  );
  readonly filter = signal<ContactFilter>(EMPTY_FILTER);
  readonly page = signal<ContactPage>(EMPTY_PAGE);
  readonly total = signal(0);
  readonly summary = signal<ContactSummary | null>(null);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(9);

  constructor() {
    this.repository.userId$.pipe(takeUntilDestroyed()).subscribe({
      next: (userId) => {
        this.invalidate();
        this.userId = userId;
        this.filter.set(EMPTY_FILTER);
        this.page.set(EMPTY_PAGE);
        this.total.set(0);
        this.summary.set(null);
        this.pageIndex.set(0);
        this.pageSize.set(9);
        if (userId) this.refresh();
        else this.state.set('signed-out');
      },
      error: () => {
        this.invalidate();
        this.state.set('error');
      },
    });
    this.destroyRef.onDestroy(() => this.invalidate());
  }

  search(value: string): void {
    const previous = normalizeContactSearch(this.filter().search);
    this.filter.update((filter) => ({ ...filter, search: value }));
    if (previous === normalizeContactSearch(value)) return;
    this.invalidate();
    this.pageIndex.set(0);
    if (!this.userId) return;
    this.state.set('loading');
    this.searchTimer = setTimeout(() => this.refresh(), 300);
  }

  stage(stage: ContactStage | null): void {
    this.filter.update((filter) => ({ ...filter, stage }));
    this.refresh();
  }

  status(status: ContactStatus | null): void {
    this.filter.update((filter) => ({ ...filter, status }));
    this.refresh();
  }

  clearFilters(): void {
    this.filter.set(EMPTY_FILTER);
    this.refresh();
  }

  retry(): void {
    this.summary.set(null);
    this.refresh();
  }

  applyUpdatedContact(updated: Contact): void {
    if (this.state() !== 'success') return;
    const previous = this.page().contacts.find(({ id }) => id === updated.id);
    if (!previous) return;

    this.page.update((page) => ({
      ...page,
      contacts: page.contacts.map((contact) =>
        contact.id === updated.id ? updated : contact,
      ),
    }));
    if (previous.stage === updated.stage) return;
    this.summary.update((summary) => {
      if (!summary) return summary;
      const next = { ...summary };
      if (previous.stage !== 'contact') next[previous.stage]--;
      if (updated.stage !== 'contact') next[updated.stage]++;
      return next;
    });
  }

  applyCreatedContact(created: Contact): void {
    if (this.state() !== 'success' || !this.userId) return;
    this.summary.update((summary) => {
      if (!summary) return summary;
      const next = { ...summary, total: summary.total + 1 };
      if (created.stage !== 'contact') next[created.stage]++;
      return next;
    });
    const filter = this.filter();
    const matches =
      (!filter.stage || filter.stage === created.stage) &&
      (!filter.status || filter.status === created.status) &&
      normalizeContactSearch(created.organizationName).startsWith(
        normalizeContactSearch(filter.search),
      );
    if (matches) this.total.update((total) => total + 1);
    this.pageIndex.set(0);
    void this.load(
      { filter, size: this.pageSize(), direction: 'first' },
      0,
      false,
    );
  }

  changePage(index: number, size: number): void {
    if (this.state() !== 'success' || ![9, 18, 27].includes(size)) return;
    if (size !== this.pageSize()) {
      this.pageSize.set(size);
      this.refresh();
      return;
    }
    const lastIndex = Math.max(0, Math.ceil(this.total() / size) - 1);
    if (
      !Number.isInteger(index) ||
      index < 0 ||
      index > lastIndex ||
      index === this.pageIndex()
    )
      return;
    const base = { filter: this.filter(), size };
    const { first, last } = this.page();
    let request: ContactPageRequest;
    if (index === 0) request = { ...base, direction: 'first' };
    else if (index === lastIndex)
      request = {
        ...base,
        direction: 'last',
        size: this.total() % size || size,
      };
    else if (index === this.pageIndex() + 1 && last)
      request = { ...base, direction: 'next', cursor: last };
    else if (index === this.pageIndex() - 1 && first)
      request = { ...base, direction: 'previous', cursor: first };
    else return;
    void this.load(request, index, false);
  }

  private refresh(): void {
    this.invalidate();
    this.pageIndex.set(0);
    if (!this.userId) {
      this.state.set('signed-out');
      return;
    }
    void this.load(
      { filter: this.filter(), size: this.pageSize(), direction: 'first' },
      0,
      true,
    );
  }

  private async load(
    request: ContactPageRequest,
    index: number,
    recount: boolean,
  ): Promise<void> {
    const userId = this.userId;
    if (!userId) return;
    const id = ++this.requestId;
    this.state.set('loading');
    try {
      const cachedSummary = this.summary();
      const summary = cachedSummary
        ? Promise.resolve(cachedSummary)
        : this.repository.summary();
      const filter = request.filter;
      const count = !recount
        ? Promise.resolve(this.total())
        : !normalizeContactSearch(filter.search) &&
            !filter.stage &&
            !filter.status
          ? summary.then((value) => value.total)
          : this.repository.count(filter);
      const [page, total, metrics] = await Promise.all([
        this.repository.readPage(request),
        count,
        summary,
      ]);
      if (id !== this.requestId) return;
      if (!page.contacts.length && index > 0) {
        this.retry();
        return;
      }
      this.page.set(page);
      this.total.set(total);
      this.summary.set(metrics);
      this.pageIndex.set(index);
      this.state.set('success');
    } catch {
      if (id === this.requestId) this.state.set('error');
    }
  }

  private invalidate(): void {
    this.requestId++;
    clearTimeout(this.searchTimer);
  }
}
