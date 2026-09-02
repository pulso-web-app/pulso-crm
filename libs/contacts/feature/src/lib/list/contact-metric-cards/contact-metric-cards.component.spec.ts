import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactMetricCardsComponent } from './contact-metric-cards.component';

describe('ContactMetricCardsComponent', () => {
  let component: ContactMetricCardsComponent;
  let fixture: ComponentFixture<ContactMetricCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactMetricCardsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactMetricCardsComponent);
    fixture.componentRef.setInput('summary', {
      total: 36,
      'cold-lead': 5,
      'warm-lead': 5,
      'hot-lead': 5,
      client: 5,
      'no-response': 5,
      'not-interested': 5,
    });
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('36');
    expect(fixture.nativeElement.textContent).not.toContain('1234');
  });
});
