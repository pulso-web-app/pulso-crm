import { Injectable } from '@angular/core';
import {
  MAT_NATIVE_DATE_FORMATS,
  MatDateFormats,
  NativeDateAdapter,
} from '@angular/material/core';
import { MatDatepickerIntl } from '@angular/material/datepicker';

export function brazilianDatepickerLabels(): MatDatepickerIntl {
  return Object.assign(new MatDatepickerIntl(), {
    calendarLabel: 'Calendário',
    openCalendarLabel: 'Escolher data',
    closeCalendarLabel: 'Fechar calendário',
    prevMonthLabel: 'Mês anterior',
    nextMonthLabel: 'Próximo mês',
    prevYearLabel: 'Ano anterior',
    nextYearLabel: 'Próximo ano',
    prevMultiYearLabel: 'Anos anteriores',
    nextMultiYearLabel: 'Próximos anos',
    switchToMonthViewLabel: 'Escolher dia',
    switchToMultiYearViewLabel: 'Escolher mês e ano',
  });
}

@Injectable()
export class BrazilianDateAdapter extends NativeDateAdapter {
  override parse(value: unknown): Date | null {
    if (value == null || value === '') return null;
    if (value instanceof Date) return this.clone(value);
    const match =
      typeof value === 'string' &&
      /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
    if (!match) return this.invalid();
    const [, day, month, year] = match.map(Number);
    if (year < 1000 || month < 1 || month > 12 || day < 1 || day > 31)
      return this.invalid();
    const date = new Date(year, month - 1, day);
    return date.getMonth() === month - 1 && date.getDate() === day
      ? date
      : this.invalid();
  }

  override parseTime(value: unknown): Date | null {
    if (value == null || value === '') return null;
    if (value instanceof Date) return this.clone(value);
    const match =
      typeof value === 'string' && /^(\d{2}):(\d{2})$/.exec(value.trim());
    if (!match) return this.invalid();
    const [, hours, minutes] = match.map(Number);
    return hours < 24 && minutes < 60
      ? this.setTime(this.today(), hours, minutes, 0)
      : this.invalid();
  }
}

const timeFormat = { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' };
export const BRAZILIAN_DATE_FORMATS: MatDateFormats = {
  parse: { dateInput: 'dd/MM/yyyy', timeInput: 'HH:mm' },
  display: {
    ...MAT_NATIVE_DATE_FORMATS.display,
    dateInput: { day: '2-digit', month: '2-digit', year: 'numeric' },
    timeInput: timeFormat,
    timeOptionLabel: timeFormat,
  },
};
