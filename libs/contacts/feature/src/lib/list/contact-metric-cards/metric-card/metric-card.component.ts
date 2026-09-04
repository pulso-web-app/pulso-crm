import { Component, CUSTOM_ELEMENTS_SCHEMA, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import '@phosphor-icons/webcomponents/PhClock';
import '@phosphor-icons/webcomponents/PhFire';
import '@phosphor-icons/webcomponents/PhProhibit';
import '@phosphor-icons/webcomponents/PhSnowflake';
import '@phosphor-icons/webcomponents/PhThermometerHot';
import '@phosphor-icons/webcomponents/PhUserCheck';
import '@phosphor-icons/webcomponents/PhUsersThree';

export type MetricCardIcon =
  | 'contacts'
  | 'cold-lead'
  | 'warm-lead'
  | 'hot-lead'
  | 'client'
  | 'no-response'
  | 'not-interested';

export type MetricCardColor =
  | 'primary'
  | 'info'
  | 'success'
  | 'error'
  | 'default';

@Component({
  selector: 'pulso-crm-metric-card',
  imports: [DecimalPipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './metric-card.component.html',
  styleUrl: './metric-card.component.scss',
  host: {
    '[attr.data-color]': 'color()',
  },
})
export class MetricCardComponent {
  readonly cardTitle = input.required<string>();
  readonly cardValue = input.required<number>();
  readonly icon = input.required<MetricCardIcon>();
  readonly color = input<MetricCardColor>('default');
}
