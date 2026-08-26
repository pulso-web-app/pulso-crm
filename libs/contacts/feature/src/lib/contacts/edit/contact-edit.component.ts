import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'pulso-crm-contact-edit',
  templateUrl: './contact-edit.component.html',
  styleUrl: './contact-edit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactEditComponent {}
