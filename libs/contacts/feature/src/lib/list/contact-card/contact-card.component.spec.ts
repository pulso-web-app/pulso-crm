import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Contact } from '../contact.models';
import { ContactCardComponent } from './contact-card.component';

const CONTACT: Contact = {
  id: 'acme-tecnologia',
  organizationName: 'ACME Tecnologia',
  contactName: 'Maria Silva',
  instagramHandle: '@acme.tecnologia',
  whatsappNumber: '(11) 91234-5678',
  stage: 'hot-lead',
  status: 'awaiting-response',
  lastContactAt: '2026-08-26T10:30:00-03:00',
};

describe('ContactCardComponent', () => {
  let fixture: ComponentFixture<ContactCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactCardComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactCardComponent);
    fixture.componentRef.setInput('contact', CONTACT);
    fixture.detectChanges();
  });

  it('should render the contact identity, classification, and channels', () => {
    const host = fixture.nativeElement as HTMLElement;

    expect(host.textContent).toContain('ACME Tecnologia');
    expect(host.textContent).toContain('Maria Silva');
    expect(host.textContent).toContain('Lead Quente');
    expect(host.textContent).toContain('Aguardando resposta');
    expect(host.textContent).toContain('@acme.tecnologia');
    expect(host.textContent).toContain('(11) 91234-5678');
  });

  it('should expose an accessible actions menu trigger', () => {
    const host = fixture.nativeElement as HTMLElement;
    const actionButton = host.querySelector(
      'button[aria-label="Ações para ACME Tecnologia"]',
    );

    expect(actionButton).not.toBeNull();
  });
});
