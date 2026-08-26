import { Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

export type MetricCardColor =
  | 'primary'
  | 'info'
  | 'success'
  | 'error'
  | 'default';

@Component({
  selector: 'pulso-crm-metric-card',
  imports: [MatIcon, DecimalPipe],
  templateUrl: './metric-card.component.html',
  styleUrl: './metric-card.component.scss',
  host: {
    '[attr.data-color]': 'color()',
  },
})
export class MetricCardComponent {
  readonly cardTitle = input.required<string>();
  readonly cardValue = input.required<number>();
  readonly icon = input.required<string>();
  readonly color = input<MetricCardColor>('default');
}
