import { Component, computed, input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import {
  ContactStage,
  contactStageLabel,
  ContactStatus,
  contactStatusLabel,
} from '@pulso-crm/contacts-data-access';

@Component({
  selector: 'pulso-crm-contact-classification',
  imports: [MatChipsModule],
  templateUrl: './contact-classification.component.html',
  styleUrl: './contact-classification.component.scss',
  host: {
    '[attr.data-stage]': 'stage()',
    '[attr.data-status]': 'status()',
  },
})
export class ContactClassificationComponent {
  readonly stage = input.required<ContactStage>();
  readonly status = input.required<ContactStatus>();

  protected readonly stageLabel = computed(() =>
    contactStageLabel(this.stage()),
  );

  protected readonly statusLabel = computed(() =>
    contactStatusLabel(this.status()),
  );
}
