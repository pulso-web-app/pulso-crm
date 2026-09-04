import {
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  CONTACT_IMPORT_AI_PROMPT,
  CONTACT_IMPORT_EXAMPLE,
  ContactsRepository,
  formatContactImportIssue,
  parseContactImportJson,
} from '@pulso-crm/contacts-data-access';

import '@phosphor-icons/webcomponents/PhCheckCircle';
import '@phosphor-icons/webcomponents/PhCloudSlash';
import '@phosphor-icons/webcomponents/PhCode';
import '@phosphor-icons/webcomponents/PhFileArrowUp';
import '@phosphor-icons/webcomponents/PhFileText';
import '@phosphor-icons/webcomponents/PhPaperclip';
import '@phosphor-icons/webcomponents/PhSparkle';
import '@phosphor-icons/webcomponents/PhUploadSimple';
import '@phosphor-icons/webcomponents/PhWarningCircle';

@Component({
  selector: 'pulso-crm-contact-import-dialog',
  imports: [
    FormsModule,
    MatButtonModule,
    MatDialogActions,
    MatDialogContent,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './contact-import-dialog.component.html',
  styleUrl: './contact-import-dialog.component.scss',
})
export class ContactImportDialogComponent {
  readonly dialogRef = inject(
    MatDialogRef<ContactImportDialogComponent, number>,
  );
  private readonly repository = inject(ContactsRepository);
  private readonly snackBar = inject(MatSnackBar);

  readonly source = signal('');
  readonly fileName = signal<string | null>(null);
  readonly fileError = signal<string | null>(null);
  readonly copyFeedback = signal<{
    kind: 'success' | 'error';
    message: string;
  } | null>(null);
  readonly importError = signal<string | null>(null);
  readonly isImporting = signal(false);
  readonly result = computed(() => {
    const source = this.source();
    return source.trim() ? parseContactImportJson(source) : null;
  });
  readonly formattedIssues = computed(() => {
    const result = this.result();
    return result && !result.valid
      ? result.issues.map(formatContactImportIssue)
      : [];
  });
  readonly validCount = computed(() => {
    const result = this.result();
    return result?.valid ? result.contacts.length : 0;
  });

  updateSource(value: string): void {
    if (this.isImporting()) return;
    this.source.set(value);
    this.fileError.set(null);
    this.importError.set(null);
  }

  async loadFile(event: Event): Promise<void> {
    if (this.isImporting()) return;
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    this.fileError.set(null);
    this.importError.set(null);
    if (!file.name.toLocaleLowerCase().endsWith('.json')) {
      this.fileName.set(null);
      this.fileError.set('Selecione um arquivo com a extensão .json.');
      return;
    }
    try {
      this.source.set(await file.text());
      this.fileName.set(file.name);
    } catch {
      this.fileName.set(null);
      this.fileError.set('Não foi possível ler o arquivo selecionado.');
    }
  }

  async copyPrompt(): Promise<void> {
    await this.copy(CONTACT_IMPORT_AI_PROMPT, 'Prompt para IA copiado.');
  }

  async copyFormat(): Promise<void> {
    await this.copy(CONTACT_IMPORT_EXAMPLE, 'Formato JSON copiado.');
  }

  async import(): Promise<void> {
    const result = this.result();
    if (this.isImporting() || !result?.valid) return;
    const previousDisableClose = this.dialogRef.disableClose;
    this.importError.set(null);
    this.isImporting.set(true);
    this.dialogRef.disableClose = true;
    try {
      const imported = await this.repository.importContacts(result.contacts);
      const count = imported.length;
      this.dialogRef.close(count);
      this.snackBar.open(
        count === 1
          ? '1 contato importado com sucesso.'
          : `${count} contatos importados com sucesso.`,
        'Fechar',
        { duration: 5000 },
      );
    } catch {
      this.importError.set(
        'Não foi possível importar os contatos. Nenhum contato foi criado. Tente novamente.',
      );
    } finally {
      this.isImporting.set(false);
      this.dialogRef.disableClose = previousDisableClose;
    }
  }

  close(): void {
    if (!this.isImporting()) this.dialogRef.close();
  }

  private async copy(text: string, successMessage: string): Promise<void> {
    if (this.isImporting()) return;
    try {
      await navigator.clipboard.writeText(text);
      this.copyFeedback.set({ kind: 'success', message: successMessage });
    } catch {
      this.copyFeedback.set({
        kind: 'error',
        message: 'Não foi possível copiar. Verifique a permissão do navegador.',
      });
    }
  }
}
