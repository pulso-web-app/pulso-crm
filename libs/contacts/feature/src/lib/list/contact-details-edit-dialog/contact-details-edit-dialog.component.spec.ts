import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { vi } from 'vitest';
import { Contact } from '../contact.models';
import { ContactDetailsEditDialogComponent } from './contact-details-edit-dialog.component';

const CONTACT: Contact = {
  id: 'acme-tecnologia',
  organizationName: 'ACME Tecnologia',
  contactName: 'Maria Silva',
  instagramHandle: '@acme.tecnologia',
  instagramProfileUrl: 'https://www.instagram.com/acme.tecnologia',
  whatsappNumber: '(11) 91234-5678',
  stage: 'hot-lead',
  status: 'awaiting-response',
  lastContactAt: '2026-08-26T10:30:00-03:00',
  activities: [
    {
      text: 'Enviou proposta de serviço',
      createdAt: '2026-08-26T10:30:00-03:00',
      updatedAt: '2026-08-26T10:30:00-03:00',
    },
  ],
};

describe('ContactDetailsEditDialogComponent', () => {
  let component: ContactDetailsEditDialogComponent;
  let fixture: ComponentFixture<ContactDetailsEditDialogComponent>;
  let dialogRef: { close: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    dialogRef = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ContactDetailsEditDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { contact: CONTACT } },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactDetailsEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders the editable contact details and activity history', () => {
    const host = fixture.nativeElement as HTMLElement;

    expect(host.textContent).toContain('ACME Tecnologia');
    expect(host.textContent).toContain('Maria Silva');
    expect(host.textContent).toContain('Lead Quente');
    expect(host.textContent).toContain('Aguardando resposta');
    expect(host.textContent).toContain('Enviou proposta de serviço');
  });

  it('requires an organization name before saving', async () => {
    component.contactForm.organizationName().value.set('');
    component.contactForm.organizationName().markAsTouched();
    fixture.detectChanges();
    await fixture.whenStable();

    const saveButton = fixture.nativeElement.querySelector(
      '.dialog-footer button:last-child',
    ) as HTMLButtonElement;

    expect(component.contactForm().invalid()).toBe(true);
    expect(saveButton.disabled).toBe(true);
    expect(fixture.nativeElement.textContent).toContain(
      'O nome da organização é obrigatório.',
    );
  });

  it('adds a trimmed activity with consistent timestamps', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-29T15:00:00.000Z'));
    component.newActivityText.set('  Reunião agendada  ');

    component.addActivity();

    expect(component.contactForm.activities().value().slice(-1)[0]).toEqual({
      text: 'Reunião agendada',
      createdAt: '2026-08-29T15:00:00.000Z',
      updatedAt: '2026-08-29T15:00:00.000Z',
    });
    expect(component.newActivityText()).toBe('');
    expect(component.showNewActivityForm()).toBe(false);
  });

  it('renders the empty state when the contact has no activities', () => {
    component.contactForm.activities().value.set([]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Nenhuma atividade registrada.',
    );
  });

  it('clears an unfinished activity when its form is closed', () => {
    component.toggleNewActivityForm();
    component.newActivityText.set('Rascunho');

    component.toggleNewActivityForm();

    expect(component.showNewActivityForm()).toBe(false);
    expect(component.newActivityText()).toBe('');
  });

  it('opens the currently edited social channels', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    component.contactForm.instagramProfileUrl().value.set('');
    component.contactForm.instagramHandle().value.set('@novo.perfil');
    component.contactForm.whatsappNumber().value.set('(21) 99999-0000');

    component.openInstagram();
    component.openWhatsApp();

    expect(open).toHaveBeenNthCalledWith(
      1,
      'https://www.instagram.com/novo.perfil',
      '_blank',
    );
    expect(open).toHaveBeenNthCalledWith(
      2,
      'https://wa.me/5521999990000',
      '_blank',
    );
  });

  it('saves trimmed values without empty optional or UI-only fields', () => {
    component.contactForm.organizationName().value.set('  ACME Atualizada  ');
    component.contactForm.contactName().value.set('   ');
    component.contactForm.instagramHandle().value.set('   ');
    component.newActivityText.set('Rascunho não adicionado');

    component.save();

    const savedContact = dialogRef.close.mock.calls[0][0] as Record<
      string,
      unknown
    >;
    expect(savedContact['organizationName']).toBe('ACME Atualizada');
    expect(savedContact).not.toHaveProperty('contactName');
    expect(savedContact).not.toHaveProperty('instagramHandle');
    expect(savedContact).not.toHaveProperty('newActivityText');
    expect(savedContact['id']).toBe(CONTACT.id);
  });

  it('closes without a value when editing is cancelled', () => {
    component.close();

    expect(dialogRef.close).toHaveBeenCalledWith();
  });
});
