import { DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { ContactAvatarComponent } from '../contact-avatar/contact-avatar.component';
import { ContactClassificationComponent } from '../contact-classification/contact-classification.component';
import { ContactDetailsEditDialogComponent } from '../contact-details-edit-dialog/contact-details-edit-dialog.component';
import { Contact } from '../contact.models';

@Component({
  selector: 'pulso-crm-contact-card',
  imports: [
    ContactAvatarComponent,
    ContactClassificationComponent,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    RouterLink,
  ],
  providers: [DatePipe],
  templateUrl: './contact-card.component.html',
  styleUrl: './contact-card.component.scss',
})
export class ContactCardComponent {
  private readonly datePipe = inject(DatePipe);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);

  readonly contact = input.required<Contact>();
  readonly contactUpdated = output<Contact>();

  protected lastContactLabel(): string {
    const contactDate = this.startOfDay(new Date(this.contact().lastContactAt));
    const today = this.startOfDay(new Date());
    const differenceInDays = Math.round(
      (today.getTime() - contactDate.getTime()) / 86_400_000,
    );

    if (differenceInDays === 0) {
      return 'Hoje';
    }

    if (differenceInDays === 1) {
      return 'Ontem';
    }

    return this.datePipe.transform(contactDate, 'dd/MM/yyyy') ?? '—';
  }

  private startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  protected openDetailsDialog(): void {
    const dialogRef = this.dialog.open(ContactDetailsEditDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: {
        contact: this.contact(),
      },
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((updated?: Contact) => {
        if (!updated) {
          return;
        }

        this.contactUpdated.emit(updated);
      });
  }
}
