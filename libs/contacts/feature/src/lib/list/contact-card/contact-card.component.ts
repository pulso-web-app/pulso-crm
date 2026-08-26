import { DatePipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import {
  Contact,
  contactStageLabel,
  contactStatusLabel,
} from '../contact.models';

type AvatarTone = 'violet' | 'blue' | 'green' | 'orange' | 'pink' | 'cyan';

const AVATAR_TONES: readonly AvatarTone[] = [
  'violet',
  'blue',
  'green',
  'orange',
  'pink',
  'cyan',
];

@Component({
  selector: 'pulso-crm-contact-card',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    RouterLink,
  ],
  providers: [DatePipe],
  templateUrl: './contact-card.component.html',
  styleUrl: './contact-card.component.scss',
  host: {
    '[attr.data-stage]': 'contact().stage',
    '[attr.data-status]': 'contact().status',
  },
})
export class ContactCardComponent {
  private readonly datePipe = inject(DatePipe);

  readonly contact = input.required<Contact>();

  protected readonly initials = computed(() =>
    this.contact()
      .organizationName.split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase(),
  );

  protected readonly avatarTone = computed<AvatarTone>(() => {
    const hash = [...this.contact().id].reduce(
      (total, character) => total + character.charCodeAt(0),
      0,
    );

    return AVATAR_TONES[hash % AVATAR_TONES.length];
  });

  protected readonly stageLabel = computed(() =>
    contactStageLabel(this.contact().stage),
  );

  protected readonly statusLabel = computed(() =>
    contactStatusLabel(this.contact().status),
  );

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
}
