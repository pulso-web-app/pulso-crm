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

  it('requests creation from a button without routing and respects its disabled state', () => {
    let requests = 0;
    component.createRequested.subscribe(() => requests++);
    const button = fixture.nativeElement.querySelector(
      '.filters-right button',
    ) as HTMLButtonElement;
    button.click();
    expect(requests).toBe(1);
    fixture.componentRef.setInput('createDisabled', true);
    fixture.detectChanges();
    button.click();
    expect(requests).toBe(1);
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
