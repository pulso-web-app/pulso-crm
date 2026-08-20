import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingOverlayComponent } from './loading-overlay.component';

describe('LoadingOverlayComponent', () => {
  let fixture: ComponentFixture<LoadingOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingOverlayComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingOverlayComponent);
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the loading status when visible', () => {
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="status"]')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Carregando...');
  });

  it('should not render the loading status when hidden', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="status"]')).toBeNull();
  });
});
