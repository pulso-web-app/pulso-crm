import { ContactSummary } from '@pulso-crm/contacts-data-access';
import { Component, computed, input } from '@angular/core';
import {
  MetricCardColor,
  MetricCardComponent,
} from './metric-card/metric-card.component';

interface ContactMetric {
  readonly title: string;
  readonly value: number;
  readonly icon: string;
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
      icon: 'groups',
      color: 'primary',
    },
    {
      title: 'Leads Frios',
      value: this.summary()['cold-lead'],
      icon: 'ac_unit',
      color: 'info',
    },
    {
      title: 'Leads Mornos',
      value: this.summary()['warm-lead'],
      icon: 'device_thermostat',
      color: 'info',
    },
    {
      title: 'Leads Quentes',
      value: this.summary()['hot-lead'],
      icon: 'local_fire_department',
      color: 'error',
    },
    {
      title: 'Clientes',
      value: this.summary()['client'],
      icon: 'how_to_reg',
      color: 'success',
    },
    {
      title: 'Sem Resposta',
      value: this.summary()['no-response'],
      icon: 'schedule',
      color: 'default',
    },
    {
      title: 'Não Interessados',
      value: this.summary()['not-interested'],
      icon: 'do_not_disturb_on',
      color: 'default',
    },
  ]);
}
