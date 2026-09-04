import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
import { vi } from 'vitest';
import { Contact } from '@pulso-crm/contacts-data-access';
import { ContactDetailsEditDialogComponent } from '../contact-details-edit-dialog/contact-details-edit-dialog.component';
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
  activities: [],
};

describe('ContactCardComponent', () => {
  let fixture: ComponentFixture<ContactCardComponent>;
  let afterClosed: Subject<Contact | undefined>;
  let dialog: { open: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    afterClosed = new Subject<Contact | undefined>();
    dialog = {
      open: vi.fn(() => ({ afterClosed: () => afterClosed.asObservable() })),
    };

    await TestBed.configureTestingModule({
      imports: [ContactCardComponent],
      providers: [provideRouter([]), { provide: MatDialog, useValue: dialog }],
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
    expect(host.querySelector('mat-card')).not.toBeNull();
    expect(host.querySelector('ph-instagram-logo')).not.toBeNull();
    expect(host.querySelector('ph-whatsapp-logo')).not.toBeNull();
    expect(host.querySelector('ph-dots-three-vertical')).not.toBeNull();
    expect(host.querySelector('mat-icon')).toBeNull();
  });

  it('should expose an accessible actions menu trigger', () => {
    const host = fixture.nativeElement as HTMLElement;
    const actionButton = host.querySelector(
      'button[aria-label="Ações para ACME Tecnologia"]',
    );

    expect(actionButton).not.toBeNull();
  });

  it('renders an unknown last-contact date without inventing a date', () => {
    fixture.componentRef.setInput('contact', {
      ...CONTACT,
      lastContactAt: null,
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(
      'Sem contato registrado',
    );
  });

  it('opens the details dialog with the selected contact', () => {
    const card = fixture.nativeElement.querySelector('mat-card') as HTMLElement;

    card.click();

    expect(dialog.open).toHaveBeenCalledWith(
      ContactDetailsEditDialogComponent,
      expect.objectContaining({
        width: '900px',
        data: { mode: 'edit', contact: CONTACT },
      }),
    );
  });

  it('emits the contact returned by the details dialog', () => {
    const updated = { ...CONTACT, organizationName: 'ACME Atualizada' };
    const emitted: Contact[] = [];
    fixture.componentInstance.contactUpdated.subscribe((contact) =>
      emitted.push(contact),
    );

    fixture.nativeElement.querySelector('mat-card').click();
    afterClosed.next(updated);

    expect(emitted).toEqual([updated]);
  });

  it('does not emit when the details dialog is cancelled', () => {
    const emitted: Contact[] = [];
    fixture.componentInstance.contactUpdated.subscribe((contact) =>
      emitted.push(contact),
    );

    fixture.nativeElement.querySelector('mat-card').click();
    afterClosed.next(undefined);

    expect(emitted).toEqual([]);
  });

  it('does not open the details dialog when the actions menu is clicked', () => {
    const actionButton = fixture.nativeElement.querySelector(
      '.contact-menu',
    ) as HTMLButtonElement;

    actionButton.click();

    expect(dialog.open).not.toHaveBeenCalled();
  });
});
