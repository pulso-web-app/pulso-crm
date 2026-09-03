import { inject, Injectable, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Contact } from '@pulso-crm/contacts-data-access';
import {
  ContactDetailsEditDialogComponent,
  ContactDetailsEditDialogData,
} from './contact-details-edit-dialog.component';

@Injectable({ providedIn: 'root' })
export class ContactDialogService {
  private readonly dialog = inject(MatDialog);

  open(data: ContactDetailsEditDialogData, viewContainerRef: ViewContainerRef) {
    return this.dialog.open<
      ContactDetailsEditDialogComponent,
      ContactDetailsEditDialogData,
      Contact
    >(ContactDetailsEditDialogComponent, {
      data,
      viewContainerRef,
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
    });
  }
}
