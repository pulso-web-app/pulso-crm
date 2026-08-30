import { Component, computed, input } from '@angular/core';

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
  selector: 'pulso-crm-contact-avatar',
  templateUrl: './contact-avatar.component.html',
  styleUrl: './contact-avatar.component.scss',
  host: {
    'aria-hidden': 'true',
    '[attr.data-tone]': 'tone()',
  },
})
export class ContactAvatarComponent {
  readonly contactId = input.required<string>();
  readonly organizationName = input.required<string>();

  protected readonly initials = computed(() =>
    this.organizationName()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase(),
  );

  protected readonly tone = computed<AvatarTone>(() => {
    const hash = [...this.contactId()].reduce(
      (total, character) => total + character.charCodeAt(0),
      0,
    );

    return AVATAR_TONES[hash % AVATAR_TONES.length];
  });
}
