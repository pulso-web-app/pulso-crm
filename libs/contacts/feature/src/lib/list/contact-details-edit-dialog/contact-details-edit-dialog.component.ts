import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { disabled, form, FormField, validate } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { omitEmptyFields } from '@pulso-crm/shared-util';
import { ContactAvatarComponent } from '../contact-avatar/contact-avatar.component';
import { ContactClassificationComponent } from '../contact-classification/contact-classification.component';
import { ContactsRepository } from '@pulso-crm/contacts-data-access';
import {
  Contact,
  CONTACT_STAGE_OPTIONS,
  CONTACT_STATUS_OPTIONS,
  normalizeContactSearch,
} from '@pulso-crm/contacts-data-access';

export interface ContactDetailsEditDialogData {
  readonly contact: Contact;
}

type ContactEditForm = {
  -readonly [Key in keyof Contact]-?: NonNullable<Contact[Key]>;
};

@Component({
  selector: 'pulso-crm-contact-details-edit-dialog',
  imports: [
    ContactAvatarComponent,
    ContactClassificationComponent,
    FormsModule,
    FormField,
    MatButtonModule,
    MatDialogActions,
    MatDialogContent,
    MatDividerModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './contact-details-edit-dialog.component.html',
  styleUrl: './contact-details-edit-dialog.component.scss',
})
export class ContactDetailsEditDialogComponent {
  readonly dialogRef = inject(
    MatDialogRef<ContactDetailsEditDialogComponent, Contact>,
  );
  readonly data = inject<ContactDetailsEditDialogData>(MAT_DIALOG_DATA);
  readonly repository = inject(ContactsRepository);
  private readonly snackBar = inject(MatSnackBar);

  readonly stageOptions = CONTACT_STAGE_OPTIONS;
  readonly statusOptions = CONTACT_STATUS_OPTIONS;

  readonly isSaving = signal(false);
  readonly saveError = signal<string | null>(null);

  readonly contactFormModel = signal<ContactEditForm>({
    id: this.data.contact.id,
    organizationName: this.data.contact.organizationName,
    contactName: this.data.contact.contactName ?? '',
    stage: this.data.contact.stage,
    status: this.data.contact.status,
    instagramHandle: this.data.contact.instagramHandle ?? '',
    instagramProfileUrl: this.data.contact.instagramProfileUrl ?? '',
    whatsappNumber: this.data.contact.whatsappNumber ?? '',
    lastContactAt: this.data.contact.lastContactAt,
    activities: this.data.contact.activities.map((activity) => ({
      ...activity,
    })),
  });

  readonly contactForm = form(this.contactFormModel, (schemaPath) => {
    disabled(schemaPath, () => this.isSaving());
    validate(schemaPath.organizationName, ({ value }) =>
      value().trim()
        ? null
        : { kind: 'required', message: 'O nome da organização é obrigatório.' },
    );
  });

  readonly showNewActivityForm = signal(false);
  readonly newActivityText = signal('');

  protected readonly lastContactLabel = computed(() =>
    this.formatDateTime(this.contactForm.lastContactAt().value()),
  );

  openInstagram(): void {
    const url =
      this.contactForm.instagramProfileUrl().value() ||
      `https://www.instagram.com/${this.contactForm.instagramHandle().value().replace('@', '')}`;
    window.open(url, '_blank');
  }

  openWhatsApp(): void {
    const number = this.contactForm.whatsappNumber().value().replace(/\D/g, '');
    window.open(`https://wa.me/55${number}`, '_blank');
  }

  toggleNewActivityForm(): void {
    if (this.isSaving()) return;
    this.showNewActivityForm.update((isVisible) => !isVisible);
    if (!this.showNewActivityForm()) {
      this.newActivityText.set('');
    }
  }

  addActivity(): void {
    if (this.isSaving()) return;
    const text = this.newActivityText().trim();
    if (!text) {
      return;
    }

    const now = new Date().toISOString();
    this.contactForm
      .activities()
      .value.update((list) => [
        ...list,
        { text, createdAt: now, updatedAt: now },
      ]);
    this.newActivityText.set('');
    this.showNewActivityForm.set(false);
  }

  protected formatDateTime(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  }

  async save(): Promise<void> {
    if (this.isSaving() || this.contactForm().invalid()) return;
    const updatedContact = this.buildUpdatedContact();
    const previousDisableClose = this.dialogRef.disableClose;
    this.saveError.set(null);
    this.isSaving.set(true);
    this.dialogRef.disableClose = true;
    try {
      await this.repository.updateContact(updatedContact);
    } catch {
      this.saveError.set('Não foi possível salvar o contato. Tente novamente.');
      return;
    } finally {
      this.isSaving.set(false);
      this.dialogRef.disableClose = previousDisableClose;
    }
    this.dialogRef.close(updatedContact);
    this.snackBar.open('Contato atualizado com sucesso.', 'Fechar', {
      duration: 5000,
    });
  }

  close(): void {
    if (this.isSaving()) return;
    this.dialogRef.close();
  }

  private buildUpdatedContact(): Contact {
    const organizationName = this.contactForm.organizationName().value();
    return omitEmptyFields({
      ...this.data.contact,
      ...this.contactFormModel(),
      organizationNameSearch: normalizeContactSearch(organizationName),
    }) as Contact;
  }
}
