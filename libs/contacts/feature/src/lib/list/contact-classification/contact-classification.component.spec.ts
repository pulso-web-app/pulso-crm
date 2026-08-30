import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactClassificationComponent } from './contact-classification.component';

describe('ContactClassificationComponent', () => {
  let fixture: ComponentFixture<ContactClassificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactClassificationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactClassificationComponent);
    fixture.componentRef.setInput('stage', 'hot-lead');
    fixture.componentRef.setInput('status', 'awaiting-response');
    fixture.detectChanges();
  });

  it('renders the localized stage and status labels', () => {
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Lead Quente');
    expect(text).toContain('Aguardando resposta');
  });

  it('exposes the classification values for tone styling', () => {
    const host = fixture.nativeElement as HTMLElement;

    expect(host.dataset['stage']).toBe('hot-lead');
    expect(host.dataset['status']).toBe('awaiting-response');
  });
});
