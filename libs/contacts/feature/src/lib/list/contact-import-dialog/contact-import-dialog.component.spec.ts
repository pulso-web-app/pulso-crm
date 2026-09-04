import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ContactsRepository } from '@pulso-crm/contacts-data-access';
import { vi } from 'vitest';
import { ContactImportDialogComponent } from './contact-import-dialog.component';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

describe('ContactImportDialogComponent', () => {
  let fixture: ComponentFixture<ContactImportDialogComponent>;
  let component: ContactImportDialogComponent;
  let dialogRef: { close: ReturnType<typeof vi.fn>; disableClose: boolean };
  let repository: { importContacts: ReturnType<typeof vi.fn> };
  let snackBar: { open: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    dialogRef = { close: vi.fn(), disableClose: false };
    repository = { importContacts: vi.fn() };
    snackBar = { open: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [ContactImportDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: ContactsRepository, useValue: repository },
        { provide: MatSnackBar, useValue: snackBar },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ContactImportDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('keeps Material dialog controls while rendering Phosphor icons', () => {
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('mat-dialog-content')).not.toBeNull();
    expect(host.querySelector('mat-dialog-actions')).not.toBeNull();
    expect(host.querySelector('mat-form-field')).not.toBeNull();
    expect(host.querySelector('ph-file-arrow-up')).not.toBeNull();
    expect(host.querySelector('ph-sparkle')).not.toBeNull();
    expect(host.querySelector('ph-code')).not.toBeNull();
    expect(host.querySelector('mat-icon')).toBeNull();
    expect(host.querySelector<HTMLElement>('ph-sparkle')?.classList).toContain(
      'pulso-icon--button-start',
    );
    expect(
      host.querySelector<HTMLElement>('.import-button-content ph-upload-simple')
        ?.classList,
    ).toContain('pulso-icon--inline');
  });

  it('validates edits automatically and enables only valid non-empty input', () => {
    expect(component.result()).toBeNull();
    component.updateSource('[{"organizationName":"Órbita"}]');
    fixture.detectChanges();
    expect(component.validCount()).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('1 contato válido');
    expect(importButton().disabled).toBe(false);

    component.updateSource('[{"organizationName":"","stage":"bad"}]');
    fixture.detectChanges();
    expect(component.formattedIssues()).toContain(
      'Contato 1 → stage: valor inválido.',
    );
    expect(fixture.nativeElement.textContent).toContain(
      'organizationName: é obrigatório',
    );
    expect(importButton().disabled).toBe(true);
  });

  it('loads JSON into the editable source and rejects an unsupported file', async () => {
    await component.loadFile({
      target: {
        files: [
          {
            name: 'contacts.json',
            text: () => Promise.resolve('[{"organizationName":"Farol"}]'),
          },
        ],
        value: 'selected',
      },
    } as unknown as Event);
    expect(component.fileName()).toBe('contacts.json');
    expect(component.validCount()).toBe(1);
    component.updateSource('[{"organizationName":"Editada"}]');
    expect(component.source()).toContain('Editada');

    await component.loadFile({
      target: {
        files: [{ name: 'contacts.txt' }],
        value: 'selected',
      },
    } as unknown as Event);
    expect(component.fileError()).toContain('.json');
    expect(component.source()).toContain('Editada');
  });

  it('reports unreadable files without replacing source', async () => {
    component.updateSource('[{"organizationName":"Mantida"}]');
    await component.loadFile({
      target: {
        files: [
          {
            name: 'broken.json',
            text: () => Promise.reject(new Error('read failed')),
          },
        ],
        value: 'selected',
      },
    } as unknown as Event);
    expect(component.fileError()).toContain('Não foi possível ler');
    expect(component.source()).toContain('Mantida');
  });

  it('copies both helpers without changing the editor and reports clipboard failure', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    component.updateSource('[{"organizationName":"Mantida"}]');
    await component.copyPrompt();
    await component.copyFormat();
    expect(writeText).toHaveBeenCalledTimes(2);
    expect(writeText.mock.calls[0][0]).toContain('Responda somente');
    expect(writeText.mock.calls[1][0]).toContain('Empresa Exemplo');
    expect(component.source()).toContain('Mantida');
    expect(component.copyFeedback()?.message).toContain('Formato JSON copiado');

    writeText.mockRejectedValueOnce(new Error('denied'));
    await component.copyPrompt();
    expect(component.copyFeedback()?.kind).toBe('error');
    expect(component.source()).toContain('Mantida');
  });

  it('protects a pending atomic import and closes with the committed count', async () => {
    const pending = deferred<readonly { id: string }[]>();
    repository.importContacts.mockReturnValueOnce(pending.promise);
    component.updateSource('[{"organizationName":"Órbita"}]');
    const importing = component.import();
    await Promise.resolve();
    fixture.detectChanges();
    expect(dialogRef.disableClose).toBe(true);
    expect(component.isImporting()).toBe(true);
    component.close();
    await component.import();
    expect(repository.importContacts).toHaveBeenCalledTimes(1);
    expect(dialogRef.close).not.toHaveBeenCalled();
    pending.resolve([{ id: 'generated' }]);
    await importing;
    expect(dialogRef.close).toHaveBeenCalledExactlyOnceWith(1);
    expect(snackBar.open).toHaveBeenCalledWith(
      '1 contato importado com sucesso.',
      'Fechar',
      expect.any(Object),
    );
    expect(dialogRef.disableClose).toBe(false);
  });

  it('retains valid source after a failed commit and permits retry or cancellation', async () => {
    repository.importContacts
      .mockRejectedValueOnce(new Error('unavailable'))
      .mockResolvedValueOnce([{ id: 'generated' }]);
    component.updateSource('[{"organizationName":"Retry"}]');
    await component.import();
    expect(component.importError()).toContain('Nenhum contato foi criado');
    expect(component.source()).toContain('Retry');
    expect(dialogRef.close).not.toHaveBeenCalled();
    await component.import();
    expect(repository.importContacts).toHaveBeenCalledTimes(2);
    expect(dialogRef.close).toHaveBeenCalledWith(1);
  });

  function importButton(): HTMLButtonElement {
    return Array.from<HTMLButtonElement>(
      fixture.nativeElement.querySelectorAll('mat-dialog-actions button'),
    ).find((button) =>
      button.textContent?.includes('Importar'),
    ) as HTMLButtonElement;
  }
});
