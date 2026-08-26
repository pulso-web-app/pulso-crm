import { Component, signal, computed } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'pulso-crm-contact-filters',
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './contact-filters.component.html',
  styleUrl: './contact-filters.component.scss',
})
export class ContactFiltersComponent {
  readonly selectedStage = signal<string | null>(null);
  readonly selectedStatus = signal<string | null>(null);

  readonly stages = [
    { value: 'contact', viewValue: 'Contato' },
    { value: 'cold-lead', viewValue: 'Lead Frio' },
    { value: 'warm-lead', viewValue: 'Lead Morno' },
    { value: 'hot-lead', viewValue: 'Lead Quente' },
    { value: 'client', viewValue: 'Cliente' },
    { value: 'no-response', viewValue: 'Sem Resposta' },
    { value: 'not-interested', viewValue: 'Não Interessado' },
  ];

  readonly statuses = [
    { value: 'ativo', viewValue: 'Contatado' },
    { value: 'inativo', viewValue: 'Inativo' },
    { value: 'arquivado', viewValue: 'Arquivado' },
  ];

  readonly hasActiveFilters = computed(
    () => this.selectedStage() !== null || this.selectedStatus() !== null,
  );

  clearAllFilters(): void {
    this.selectedStage.set(null);
    this.selectedStatus.set(null);
  }
}
