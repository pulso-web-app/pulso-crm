import { Component } from '@angular/core';
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
  imports: [ MetricCardComponent],
  templateUrl: './contact-metric-cards.component.html',
  styleUrl: './contact-metric-cards.component.scss',
})
export class ContactMetricCardsComponent {
  protected readonly metrics: readonly ContactMetric[] = [
    {
      title: 'Contatos',
      value: 1234,
      icon: 'groups',
      color: 'primary',
    },
    {
      title: 'Leads Frios',
      value: 567,
      icon: 'ac_unit',
      color: 'info',
    },
    {
      title: 'Leads Mornos',
      value: 123,
      icon: 'device_thermostat',
      color: 'info',
    },
    {
      title: 'Leads Quentes',
      value: 89,
      icon: 'local_fire_department',
      color: 'error',
    },
    {
      title: 'Clientes',
      value: 456,
      icon: 'how_to_reg',
      color: 'success',
    },
    {
      title: 'Sem Resposta',
      value: 789,
      icon: 'schedule',
      color: 'default',
    },
    {
      title: 'Não Interessados',
      value: 64,
      icon: 'do_not_disturb_on',
      color: 'default',
    },
  ];
}
