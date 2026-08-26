import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'pulso-crm-contact-detail',
  templateUrl: './contact-detail.component.html',
  styleUrl: './contact-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactDetailComponent {}
