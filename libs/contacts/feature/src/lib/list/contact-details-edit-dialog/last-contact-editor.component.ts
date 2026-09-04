import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import {
  MatDatepickerIntl,
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { DateTimeMaskDirective } from './date-time-mask.directive';
import {
  BRAZILIAN_DATE_FORMATS,
  BrazilianDateAdapter,
  brazilianDatepickerLabels,
} from './brazilian-date-adapter';

import '@phosphor-icons/webcomponents/PhClock';

@Component({
  selector: 'pulso-crm-last-contact-editor',
  imports: [
    DateTimeMaskDirective,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatTimepickerModule,
    MatInputModule,
    MatButtonModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    { provide: MatDatepickerIntl, useFactory: brazilianDatepickerLabels },
    { provide: DateAdapter, useClass: BrazilianDateAdapter },
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    { provide: MAT_DATE_FORMATS, useValue: BRAZILIAN_DATE_FORMATS },
  ],
  template: `
    <div class="last-contact-summary">
      <span class="info-badge"
        ><ph-clock
          class="pulso-icon pulso-icon--inline"
          size="18"
          aria-hidden="true"
        />Último contato: <strong>{{ label() }}</strong></span
      >
      <button
        mat-button
        type="button"
        [disabled]="disabled()"
        (click)="setNow()"
      >
        Agora
      </button>
    </div>
    <div class="date-time-fields">
      <mat-form-field appearance="outline">
        <mat-label>Data do último contato</mat-label>
        <input
          matInput
          [matDatepicker]="calendar"
          pulsoCrmDateTimeMask="date"
          inputmode="numeric"
          [formControl]="fields.controls.date"
          placeholder="DD/MM/AAAA"
          aria-describedby="last-contact-feedback"
        />
        <mat-datepicker-toggle
          matIconSuffix
          [for]="calendar"
          aria-label="Escolher data"
        />
        <mat-datepicker #calendar />
        <mat-hint>DD/MM/AAAA</mat-hint>
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Hora</mat-label>
        <input
          matInput
          [matTimepicker]="clock"
          pulsoCrmDateTimeMask="time"
          inputmode="numeric"
          [formControl]="fields.controls.time"
          placeholder="HH:mm"
          aria-describedby="last-contact-feedback"
        />
        <mat-timepicker-toggle
          matIconSuffix
          [for]="clock"
          aria-label="Escolher hora"
        />
        <mat-timepicker
          #clock
          interval="15m"
          aria-label="Horário do último contato"
        />
        <mat-hint>24 horas</mat-hint>
      </mat-form-field>
      <button
        mat-button
        class="clear-date-time"
        type="button"
        [disabled]="disabled()"
        (click)="clear()"
      >
        Limpar data e hora
      </button>
    </div>
    @if (error(); as message) {
      <p id="last-contact-feedback" class="date-error" role="alert">
        {{ message }}
      </p>
    }
  `,
  styles: `
    :host {
      display: block;
      container-type: inline-size;
    }
    .last-contact-summary {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      align-items: center;
      gap: 1.5rem;
    }
    .last-contact-summary > button {
      justify-self: end;
    }
    .info-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .info-badge {
      font-size: 0.8rem;
      padding: 0.6rem 0.8rem;
      border-radius: 10px;
      background: var(--pulso-color-primary-container, #f8f6fb);
      border: 1px solid rgba(103, 80, 164, 0.1);
    }
    .date-time-fields {
      display: grid;
      grid-template-columns: minmax(15rem, 1fr) minmax(8rem, 0.6fr) max-content;
      gap: 0.75rem;
      margin-top: 0.75rem;
    }
    mat-form-field {
      min-width: 0;
    }
    .clear-date-time {
      align-self: start;
      width: max-content;
      height: 48px;
      margin-top: 4px;
      padding-inline: 1rem;
      white-space: nowrap;
    }
    .date-error {
      color: var(--mat-sys-error);
      font-size: 0.8rem;
    }
    @container (max-width: 36rem) {
      .last-contact-summary {
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 0.5rem;
      }
      .date-time-fields {
        grid-template-columns: minmax(15rem, 1fr) minmax(8rem, 0.6fr);
      }
      .clear-date-time {
        grid-column: 1 / -1;
        justify-self: end;
        margin-top: 0;
      }
    }
    @container (max-width: 26rem) {
      .date-time-fields {
        grid-template-columns: minmax(0, 1fr);
      }
      .clear-date-time {
        justify-self: start;
      }
    }
  `,
})
export class LastContactEditorComponent {
  readonly value = input('');
  readonly disabled = input(false);
  readonly valueChange = output<string>();
  readonly invalidChange = output<boolean>();
  readonly error = signal<string | null>(null);
  readonly label = signal('Sem contato registrado');
  readonly fields = new FormGroup({
    date: new FormControl<Date | null>(null),
    time: new FormControl<Date | null>(null),
  });
  private emittedValue: string | undefined;

  constructor() {
    effect(() => {
      const value = this.value();
      if (value === this.emittedValue) return;
      const date = value ? new Date(value) : null;
      this.fields.setValue({ date, time: date }, { emitEvent: false });
      this.updateLabel(date);
      this.error.set(null);
      this.invalidChange.emit(false);
    });
    effect(() => {
      if (this.disabled()) this.fields.disable({ emitEvent: false });
      else this.fields.enable({ emitEvent: false });
    });
    this.fields.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateValue());
  }

  setNow(): void {
    if (this.disabled()) return;
    const now = new Date();
    this.fields.setValue({ date: now, time: now }, { emitEvent: false });
    this.publish(now);
  }

  clear(): void {
    if (this.disabled()) return;
    this.fields.reset({ date: null, time: null }, { emitEvent: false });
    this.publish(null);
  }

  private updateValue(): void {
    const { date, time } = this.fields.getRawValue();
    const message =
      this.fields.invalid ||
      [date, time].some((value) => value && Number.isNaN(value.getTime()))
        ? 'Informe uma data válida (DD/MM/AAAA) e uma hora válida (HH:mm).'
        : !!date !== !!time
          ? 'Preencha a data e a hora, ou limpe ambas.'
          : null;
    this.error.set(message);
    this.invalidChange.emit(!!message);
    if (message) return;
    if (!date || !time) {
      this.publish(null);
      return;
    }
    const combined = new Date(date);
    combined.setHours(time.getHours(), time.getMinutes(), 0, 0);
    this.publish(combined);
  }

  private publish(date: Date | null): void {
    this.error.set(null);
    this.invalidChange.emit(false);
    this.emittedValue = date?.toISOString() ?? '';
    this.updateLabel(date);
    this.valueChange.emit(this.emittedValue);
  }

  private updateLabel(date: Date | null): void {
    this.label.set(
      date
        ? new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hourCycle: 'h23',
          }).format(date)
        : 'Sem contato registrado',
    );
  }
}
