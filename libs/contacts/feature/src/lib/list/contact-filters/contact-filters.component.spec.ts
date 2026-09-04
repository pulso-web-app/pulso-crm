import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ContactFiltersComponent } from './contact-filters.component';

describe('ContactFiltersComponent', () => {
  let component: ContactFiltersComponent;
  let fixture: ComponentFixture<ContactFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactFiltersComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('keeps Material fields, selects, and buttons while rendering Phosphor icons', () => {
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelectorAll('mat-form-field')).toHaveLength(3);
    expect(host.querySelectorAll('mat-select')).toHaveLength(2);
    expect(host.querySelector('button[mat-stroked-button]')).not.toBeNull();
    expect(host.querySelector('button[mat-flat-button]')).not.toBeNull();
    expect(host.querySelector('ph-magnifying-glass')).not.toBeNull();
    expect(host.querySelector('ph-upload-simple')).not.toBeNull();
    expect(host.querySelector('ph-plus')).not.toBeNull();
    expect(host.querySelector('mat-icon')).toBeNull();
    expect(
      host.querySelector<HTMLElement>('ph-magnifying-glass')?.classList,
    ).toContain('pulso-icon--field-prefix');
    expect(
      host.querySelector<HTMLElement>('ph-upload-simple')?.classList,
    ).toContain('pulso-icon--button-start');
  });

  it('requests import before creation without routing and respects the shared disabled state', () => {
    let createRequests = 0;
    let importRequests = 0;
    component.createRequested.subscribe(() => createRequests++);
    component.importRequested.subscribe(() => importRequests++);
    const buttons = fixture.nativeElement.querySelectorAll(
      '.filters-right button',
    ) as NodeListOf<HTMLButtonElement>;
    expect(buttons[0].textContent).toContain('Importar contatos');
    expect(buttons[1].textContent).toContain('Novo contato');
    buttons[0].click();
    buttons[1].click();
    expect(importRequests).toBe(1);
    expect(createRequests).toBe(1);
    fixture.componentRef.setInput('createDisabled', true);
    fixture.detectChanges();
    buttons[0].click();
    buttons[1].click();
    expect(importRequests).toBe(1);
    expect(createRequests).toBe(1);
    expect(buttons[0].disabled).toBe(true);
    expect(buttons[1].disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('.filters-right a')).toBeNull();
  });

  it('should start with empty filter state', () => {
    expect(component.selectedStage()).toBeNull();
    expect(component.selectedStatus()).toBeNull();
    expect(component.searchContact()).toBe('');
    expect(component.hasActiveFilters()).toBe(false);
  });

  it('should correctly mark active filters when a stage is selected', () => {
    component.selectedStage.set('cold-lead');
    fixture.detectChanges();
    expect(component.selectedStage()).toBe('cold-lead');
    expect(component.hasActiveFilters()).toBe(true);
  });

  it('should correctly mark active filters when a status is selected', () => {
    component.selectedStatus.set('contacted');
    fixture.detectChanges();
    expect(component.selectedStatus()).toBe('contacted');
    expect(component.hasActiveFilters()).toBe(true);
  });

  it('should mark a non-blank search as an active filter', () => {
    component.searchContact.set('   ');
    expect(component.hasActiveFilters()).toBe(false);

    component.searchContact.set('Maria');
    expect(component.hasActiveFilters()).toBe(true);
  });

  it('should clear the search from its suffix action', () => {
    component.searchContact.set('Maria');
    fixture.detectChanges();

    const clearSearchButton = fixture.nativeElement.querySelector(
      'button[aria-label="Limpar busca"]',
    ) as HTMLButtonElement | null;

    expect(clearSearchButton).not.toBeNull();
    clearSearchButton?.click();

    expect(component.searchContact()).toBe('');
  });

  it('should clear all filters when clearAllFilters is called', () => {
    component.selectedStage.set('contact');
    component.selectedStatus.set('contacted');
    component.searchContact.set('Maria');
    fixture.detectChanges();
    expect(component.hasActiveFilters()).toBe(true);

    component.clearAllFilters();
    fixture.detectChanges();

    expect(component.selectedStage()).toBeNull();
    expect(component.selectedStatus()).toBeNull();
    expect(component.searchContact()).toBe('');
    expect(component.hasActiveFilters()).toBe(false);
  });
});
