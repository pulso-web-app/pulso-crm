import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactFiltersComponent } from './contact-filters.component';

describe('ContactFiltersComponent', () => {
  let component: ContactFiltersComponent;
  let fixture: ComponentFixture<ContactFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactFiltersComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have empty initial selection states', () => {
    expect(component.selectedStage()).toBeNull();
    expect(component.selectedStatus()).toBeNull();
    expect(component.hasActiveFilters()).toBe(false);
  });

  it('should correctly mark active filters when a stage is selected', () => {
    component.selectedStage.set('novo');
    fixture.detectChanges();
    expect(component.selectedStage()).toBe('novo');
    expect(component.hasActiveFilters()).toBe(true);
  });

  it('should correctly mark active filters when a status is selected', () => {
    component.selectedStatus.set('ativo');
    fixture.detectChanges();
    expect(component.selectedStatus()).toBe('ativo');
    expect(component.hasActiveFilters()).toBe(true);
  });

  it('should clear all filters when clearAllFilters is called', () => {
    component.selectedStage.set('novo');
    component.selectedStatus.set('ativo');
    fixture.detectChanges();
    expect(component.hasActiveFilters()).toBe(true);

    component.clearAllFilters();
    fixture.detectChanges();

    expect(component.selectedStage()).toBeNull();
    expect(component.selectedStatus()).toBeNull();
    expect(component.hasActiveFilters()).toBe(false);
  });
});
