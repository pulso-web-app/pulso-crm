import { Component, computed, model } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import {
  CONTACT_STAGE_OPTIONS,
  CONTACT_STATUS_OPTIONS,
  ContactStage,
  ContactStatus,
} from '@pulso-crm/contacts-data-access';

@Component({
  selector: 'pulso-crm-contact-filters',
  imports: [
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    RouterLink,
  ],
  templateUrl: './contact-filters.component.html',
  styleUrl: './contact-filters.component.scss',
})
export class ContactFiltersComponent {
  readonly selectedStage = model<ContactStage | null>(null);
  readonly selectedStatus = model<ContactStatus | null>(null);
  readonly searchContact = model('');

  readonly stages = CONTACT_STAGE_OPTIONS;
  readonly statuses = CONTACT_STATUS_OPTIONS;

  readonly hasActiveFilters = computed(
    () =>
      this.selectedStage() !== null ||
      this.selectedStatus() !== null ||
      this.searchContact().trim() !== '',
  );

  clearAllFilters(): void {
    this.selectedStage.set(null);
    this.selectedStatus.set(null);
    this.searchContact.set('');
  }
}
