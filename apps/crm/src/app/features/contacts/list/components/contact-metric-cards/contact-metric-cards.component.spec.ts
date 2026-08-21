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
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
