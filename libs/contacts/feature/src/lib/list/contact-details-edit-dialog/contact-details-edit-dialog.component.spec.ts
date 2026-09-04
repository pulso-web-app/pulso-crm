import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { vi } from 'vitest';
import { Contact } from '@pulso-crm/contacts-data-access';
import { ContactsRepository } from '@pulso-crm/contacts-data-access';
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
  let dialogRef: { close: ReturnType<typeof vi.fn>; disableClose: boolean };
  let snackBar: { open: ReturnType<typeof vi.fn> };
  let repository: { updateContact: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    dialogRef = { close: vi.fn(), disableClose: false };
    snackBar = { open: vi.fn() };
    repository = { updateContact: vi.fn().mockResolvedValue(undefined) };

    await TestBed.configureTestingModule({
      imports: [ContactDetailsEditDialogComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: { mode: 'edit', contact: CONTACT },
        },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: ContactsRepository, useValue: repository },
        { provide: MatSnackBar, useValue: snackBar },
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

  it('retains Material dialog, form, and date-time controls with Phosphor channel icons', () => {
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('mat-dialog-content')).not.toBeNull();
    expect(host.querySelector('mat-dialog-actions')).not.toBeNull();
    expect(host.querySelectorAll('mat-form-field').length).toBeGreaterThan(0);
    expect(host.querySelector('mat-datepicker-toggle')).not.toBeNull();
    expect(host.querySelector('mat-timepicker-toggle')).not.toBeNull();
    expect(host.querySelector('ph-instagram-logo')).not.toBeNull();
    expect(host.querySelector('ph-whatsapp-logo')).not.toBeNull();
    expect(host.querySelector('ph-clock')).not.toBeNull();
    expect(host.querySelector('mat-icon')).toBeNull();
    expect(
      host.querySelectorAll(
        '.column--channels mat-form-field[floatlabel="always"]',
      ),
    ).toHaveLength(3);
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

  it('blocks a partial last-contact draft and saves the completed local instant', async () => {
    const inputs = fixture.nativeElement.querySelectorAll(
      'pulso-crm-last-contact-editor input',
    ) as NodeListOf<HTMLInputElement>;
    inputs[1].value = '';
    inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    await component.save();
    expect(repository.updateContact).not.toHaveBeenCalled();
    inputs[0].value = '04032026';
    inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
    inputs[1].value = '1845';
    inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    await component.save();
    expect(repository.updateContact).toHaveBeenCalledWith(
      expect.objectContaining({
        lastContactAt: new Date(2026, 2, 4, 18, 45).toISOString(),
      }),
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

  it('saves trimmed values without empty optional or UI-only fields', async () => {
    component.contactForm.organizationName().value.set('  ACME Atualizada  ');
    component.contactForm.contactName().value.set('   ');
    component.contactForm.instagramHandle().value.set('   ');
    component.newActivityText.set('Rascunho não adicionado');

    await component.save();

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
    component.contactForm.contactName().value.set('Rascunho do responsável');
    component.newActivityText.set('Atividade cancelada');
    component.addActivity();
    component.close();

    expect(dialogRef.close).toHaveBeenCalledWith();
    expect(CONTACT.contactName).toBe('Maria Silva');
    expect(CONTACT.activities).toHaveLength(1);
    expect(CONTACT.activities[0].text).toBe('Enviou proposta de serviço');
    expect(repository.updateContact).not.toHaveBeenCalled();
  });

  it('preserves an unknown last-contact date when editing', async () => {
    component.contactForm.lastContactAt().value.set('');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(
      'Sem contato registrado',
    );
    await component.save();
    expect(repository.updateContact).toHaveBeenCalledWith(
      expect.objectContaining({ id: CONTACT.id, lastContactAt: null }),
    );
  });

  it.each(['', '   '])(
    'rejects invalid organization %j without writing',
    async (name) => {
      component.contactForm.organizationName().value.set(name);
      await component.save();
      fixture.detectChanges();
      expect(repository.updateContact).not.toHaveBeenCalled();
      expect(
        fixture.nativeElement.querySelector('.dialog-footer button:last-child')
          .disabled,
      ).toBe(true);
    },
  );

  it('shows pending feedback, freezes editing, and prevents duplicate saves and cancellation', async () => {
    let resolve!: () => void;
    repository.updateContact.mockReturnValueOnce(
      new Promise<void>((yes) => {
        resolve = yes;
      }),
    );
    const saving = component.save();
    fixture.detectChanges();
    expect(component.isSaving()).toBe(true);
    expect(dialogRef.disableClose).toBe(true);
    expect(fixture.nativeElement.querySelector('mat-spinner')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Salvando…');
    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('.dialog-footer button'),
    ) as HTMLButtonElement[];
    expect(buttons.every((button) => button.disabled)).toBe(true);
    expect(component.contactForm.organizationName().disabled()).toBe(true);
    component.newActivityText.set('Not submitted');
    component.addActivity();
    component.close();
    await component.save();
    expect(repository.updateContact).toHaveBeenCalledTimes(1);
    expect(component.contactForm.activities().value()).toHaveLength(1);
    expect(dialogRef.close).not.toHaveBeenCalled();
    expect(snackBar.open).not.toHaveBeenCalled();
    resolve();
    await saving;
    expect(component.isSaving()).toBe(false);
    expect(dialogRef.disableClose).toBe(false);
    expect(dialogRef.close).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ id: CONTACT.id }),
    );
    expect(snackBar.open).toHaveBeenCalledWith(
      'Contato atualizado com sucesso.',
      'Fechar',
      expect.any(Object),
    );
  });

  it('keeps the draft on failure and allows a successful retry', async () => {
    repository.updateContact.mockRejectedValueOnce(
      new Error('permission-denied'),
    );
    component.contactForm.organizationName().value.set('Retry draft');
    await component.save();
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[role="alert"]').textContent,
    ).toContain('Não foi possível salvar o contato');
    expect(fixture.nativeElement.querySelector('mat-spinner')).toBeNull();
    expect(component.contactForm.organizationName().value()).toBe(
      'Retry draft',
    );
    expect(component.contactForm.organizationName().disabled()).toBe(false);
    expect(dialogRef.disableClose).toBe(false);
    expect(dialogRef.close).not.toHaveBeenCalled();
    expect(snackBar.open).not.toHaveBeenCalled();
    await component.save();
    expect(component.saveError()).toBeNull();
    expect(repository.updateContact).toHaveBeenCalledTimes(2);
    expect(dialogRef.close).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ organizationName: 'Retry draft' }),
    );
  });

  it('allows cancellation after a failed save', async () => {
    repository.updateContact.mockRejectedValueOnce(new Error('unavailable'));
    await component.save();
    component.close();
    expect(dialogRef.close).toHaveBeenCalledWith();
  });
});
