import { ContactSummary } from '@pulso-crm/contacts-data-access';
import { Component, computed, input } from '@angular/core';
import {
  MetricCardColor,
  MetricCardComponent,
  MetricCardIcon,
} from './metric-card/metric-card.component';

interface ContactMetric {
  readonly title: string;
  readonly value: number;
  readonly icon: MetricCardIcon;
  readonly color: MetricCardColor;
}

@Component({
  selector: 'pulso-crm-contact-metric-cards',
  imports: [MetricCardComponent],
  templateUrl: './contact-metric-cards.component.html',
  styleUrl: './contact-metric-cards.component.scss',
})
export class ContactMetricCardsComponent {
  readonly summary = input.required<ContactSummary>();
  protected readonly metrics = computed<readonly ContactMetric[]>(() => [
    {
      title: 'Contatos',
      value: this.summary()['total'],
      icon: 'contacts',
      color: 'primary',
    },
    {
      title: 'Leads Frios',
      value: this.summary()['cold-lead'],
      icon: 'cold-lead',
      color: 'info',
    },
    {
      title: 'Leads Mornos',
      value: this.summary()['warm-lead'],
      icon: 'warm-lead',
      color: 'info',
    },
    {
      title: 'Leads Quentes',
      value: this.summary()['hot-lead'],
      icon: 'hot-lead',
      color: 'error',
    },
    {
      title: 'Clientes',
      value: this.summary()['client'],
      icon: 'client',
      color: 'success',
    },
    {
      title: 'Sem Resposta',
      value: this.summary()['no-response'],
      icon: 'no-response',
      color: 'default',
    },
    {
      title: 'Não Interessados',
      value: this.summary()['not-interested'],
      icon: 'not-interested',
      color: 'default',
    },
  ]);
}
