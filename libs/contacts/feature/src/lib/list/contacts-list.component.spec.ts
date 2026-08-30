import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatPaginator } from '@angular/material/paginator';
import { provideRouter } from '@angular/router';
import { ContactsListComponent } from './contacts-list.component';
import { ContactCardComponent } from './contact-card/contact-card.component';
import { ContactFiltersComponent } from './contact-filters/contact-filters.component';

describe('ContactsListComponent', () => {
  let component: ContactsListComponent;
  let fixture: ComponentFixture<ContactsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactsListComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compose metrics, filters, and the first page of contact cards', () => {
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('pulso-crm-contact-metric-cards')).not.toBeNull();
    expect(host.querySelector('pulso-crm-contact-filters')).not.toBeNull();
    expect(host.querySelectorAll('pulso-crm-contact-card')).toHaveLength(9);
    expect(host.querySelector('mat-paginator')).not.toBeNull();
  });

  it('should search contacts without requiring accents', () => {
    const filters = fixture.debugElement.query(
      By.directive(ContactFiltersComponent),
    ).componentInstance as ContactFiltersComponent;

    filters.searchContact.set('orbita');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const cards = host.querySelectorAll('pulso-crm-contact-card');

    expect(cards).toHaveLength(1);
    expect(cards[0].textContent).toContain('Órbita Design');
    expect(host.querySelector('mat-paginator')).toBeNull();
  });

  it('should combine stage and status filters', () => {
    const filters = fixture.debugElement.query(
      By.directive(ContactFiltersComponent),
    ).componentInstance as ContactFiltersComponent;

    filters.selectedStage.set('client');
    filters.selectedStatus.set('contacted');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelectorAll('pulso-crm-contact-card')).toHaveLength(3);
    expect(host.textContent).toContain('Prisma Finanças');
    expect(host.textContent).toContain('Aurora Studio');
    expect(host.textContent).toContain('Viva Saúde');
  });

  it('should show and clear the empty state', () => {
    const filters = fixture.debugElement.query(
      By.directive(ContactFiltersComponent),
    ).componentInstance as ContactFiltersComponent;

    filters.searchContact.set('empresa inexistente');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('Nenhum contato encontrado');
    expect(host.querySelector('mat-paginator')).toBeNull();

    const clearButton = host.querySelector(
      '.empty-state button',
    ) as HTMLButtonElement;
    clearButton.click();
    fixture.detectChanges();

    expect(host.querySelectorAll('pulso-crm-contact-card')).toHaveLength(9);
    expect(filters.searchContact()).toBe('');
  });

  it('should display the next slice when pagination advances', () => {
    const paginator = fixture.debugElement.query(By.directive(MatPaginator))
      .componentInstance as MatPaginator;

    paginator.nextPage();
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const cards = host.querySelectorAll('pulso-crm-contact-card');
    expect(cards).toHaveLength(9);
    expect(cards[0].textContent).toContain('Órbita Design');
    expect(cards[0].textContent).not.toContain('ACME Tecnologia');
  });

  it('replaces a contact when a card emits an update', () => {
    const card = fixture.debugElement.query(By.directive(ContactCardComponent))
      .componentInstance as ContactCardComponent;
    const updated = {
      ...card.contact(),
      organizationName: 'ACME Atualizada',
    };

    card.contactUpdated.emit(updated);
    fixture.detectChanges();

    const firstCard = fixture.nativeElement.querySelector(
      'pulso-crm-contact-card',
    ) as HTMLElement;
    expect(firstCard.textContent).toContain('ACME Atualizada');
    expect(firstCard.textContent).not.toContain('ACME Tecnologia');
  });
});
