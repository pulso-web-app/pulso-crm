import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'pulso-crm-contact-create',
  templateUrl: './contact-create.component.html',
  styleUrl: './contact-create.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactCreateComponent {}
