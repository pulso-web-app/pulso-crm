import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  signal,
} from '@angular/core';
import { LastContactEditorComponent } from './last-contact-editor.component';
import {
  BrazilianPhoneMaskDirective,
  formatBrazilianPhone,
} from './brazilian-phone-mask.directive';
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
  ContactInput,
  CONTACT_STAGE_OPTIONS,
  CONTACT_STATUS_OPTIONS,
} from '@pulso-crm/contacts-data-access';

import '@phosphor-icons/webcomponents/PhCheck';
import '@phosphor-icons/webcomponents/PhInfo';
import '@phosphor-icons/webcomponents/PhInstagramLogo';
import '@phosphor-icons/webcomponents/PhLink';
import '@phosphor-icons/webcomponents/PhPlus';
import '@phosphor-icons/webcomponents/PhWhatsappLogo';
import '@phosphor-icons/webcomponents/PhX';

export type ContactDetailsEditDialogData =
  | { readonly mode: 'create'; readonly contact?: never }
  | { readonly mode: 'edit'; readonly contact: Contact };

type ContactEditForm = {
  -readonly [Key in keyof Contact]-?: NonNullable<Contact[Key]>;
};

function createFormModel(contact?: Contact): ContactEditForm {
  return {
    id: contact?.id ?? '',
    organizationName: contact?.organizationName ?? '',
    contactName: contact?.contactName ?? '',
    stage: contact?.stage ?? 'contact',
    status: contact?.status ?? 'new',
    instagramHandle: contact?.instagramHandle ?? '',
    instagramProfileUrl: contact?.instagramProfileUrl ?? '',
    whatsappNumber: contact?.whatsappNumber ?? '',
    lastContactAt: contact?.lastContactAt ?? '',
    activities: contact?.activities.map((activity) => ({ ...activity })) ?? [],
  };
}

@Component({
  selector: 'pulso-crm-contact-details-edit-dialog',
  imports: [
    LastContactEditorComponent,
    BrazilianPhoneMaskDirective,
    ContactAvatarComponent,
    ContactClassificationComponent,
    FormsModule,
    FormField,
    MatButtonModule,
    MatDialogActions,
    MatDialogContent,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './contact-details-edit-dialog.component.html',
  styleUrl: './contact-details-edit-dialog.component.scss',
})
export class ContactDetailsEditDialogComponent {
  readonly dialogRef = inject(
    MatDialogRef<ContactDetailsEditDialogComponent, Contact>,
  );
  readonly data = inject<ContactDetailsEditDialogData>(MAT_DIALOG_DATA);
  readonly isCreating = this.data.mode === 'create';
  readonly repository = inject(ContactsRepository);
  private readonly snackBar = inject(MatSnackBar);

  readonly stageOptions = CONTACT_STAGE_OPTIONS;
  readonly statusOptions = CONTACT_STATUS_OPTIONS;

  readonly isSaving = signal(false);
  readonly saveError = signal<string | null>(null);
  readonly lastContactInvalid = signal(false);
  readonly formatPhone = formatBrazilianPhone;

  readonly contactFormModel = signal(createFormModel(this.data.contact));

  readonly contactForm = form(this.contactFormModel, (schemaPath) => {
    disabled(schemaPath, () => this.isSaving());
    validate(schemaPath.lastContactAt, () =>
      this.lastContactInvalid()
        ? {
            kind: 'dateTime',
            message: 'Confira a data e a hora do último contato.',
          }
        : null,
    );
    validate(schemaPath.organizationName, ({ value }) =>
      value().trim()
        ? null
        : { kind: 'required', message: 'O nome da organização é obrigatório.' },
    );
  });

  readonly showNewActivityForm = signal(false);
  readonly newActivityText = signal('');

  openInstagram(): void {
    const url =
      this.contactForm.instagramProfileUrl().value() ||
      `https://www.instagram.com/${this.contactForm.instagramHandle().value().replace('@', '')}`;
    window.open(url, '_blank');
  }

  openWhatsApp(): void {
    const number = formatBrazilianPhone(
      this.contactForm.whatsappNumber().value(),
    ).replace(/\D/g, '');
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
    if (!value) return 'Sem contato registrado';
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
    const input = this.buildContactInput();
    let savedContact: Contact;
    const previousDisableClose = this.dialogRef.disableClose;
    this.saveError.set(null);
    this.isSaving.set(true);
    this.dialogRef.disableClose = true;
    try {
      if (this.data.mode === 'create') {
        savedContact = await this.repository.createContact(input);
      } else {
        savedContact = { ...input, id: this.data.contact.id };
        await this.repository.updateContact(savedContact);
      }
    } catch {
      this.saveError.set('Não foi possível salvar o contato. Tente novamente.');
      return;
    } finally {
      this.isSaving.set(false);
      this.dialogRef.disableClose = previousDisableClose;
    }
    this.dialogRef.close(savedContact);
    this.snackBar.open(
      this.isCreating
        ? 'Contato criado com sucesso.'
        : 'Contato atualizado com sucesso.',
      'Fechar',
      {
        duration: 5000,
      },
    );
  }

  close(): void {
    if (this.isSaving()) return;
    this.dialogRef.close();
  }

  private buildContactInput(): ContactInput {
    const model = this.contactFormModel();
    return omitEmptyFields({
      organizationName: model.organizationName,
      contactName: model.contactName,
      stage: model.stage,
      status: model.status,
      instagramHandle: model.instagramHandle,
      instagramProfileUrl: model.instagramProfileUrl,
      whatsappNumber: model.whatsappNumber,
      lastContactAt: model.lastContactAt || null,
      activities: model.activities,
    });
  }
}
