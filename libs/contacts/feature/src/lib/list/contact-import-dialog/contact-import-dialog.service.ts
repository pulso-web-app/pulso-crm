import { inject, Injectable, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ContactImportDialogComponent } from './contact-import-dialog.component';

@Injectable({ providedIn: 'root' })
export class ContactImportDialogService {
  private readonly dialog = inject(MatDialog);

  open(viewContainerRef: ViewContainerRef) {
    return this.dialog.open<ContactImportDialogComponent, void, number>(
      ContactImportDialogComponent,
      {
        viewContainerRef,
        width: '900px',
        maxWidth: '95vw',
        maxHeight: '90vh',
      },
    );
  }
}
