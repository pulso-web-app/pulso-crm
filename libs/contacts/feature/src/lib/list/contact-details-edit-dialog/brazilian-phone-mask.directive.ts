import { Directive, ElementRef, inject, output } from '@angular/core';

export function formatBrazilianPhone(value: string): string {
  let digits = value.replace(/\D/g, '');
  if (
    digits.startsWith('55') &&
    (digits.length > 11 || value.trim().startsWith('+55'))
  )
    digits = digits.slice(2);
  digits = digits.slice(0, 11);
  if (!digits) return '';
  if (digits.length <= 2) return `(${digits}`;
  const subscriber = digits.slice(2);
  const split = subscriber.length > 8 ? 5 : 4;
  return `(${digits.slice(0, 2)}) ${subscriber.slice(0, split)}${subscriber.length > split ? `-${subscriber.slice(split)}` : ''}`;
}

@Directive({
  selector: 'input[pulsoCrmBrazilianPhoneMask]',
  host: { '(input)': 'format()', '(beforeinput)': 'beforeInput($event)' },
})
export class BrazilianPhoneMaskDirective {
  private readonly input =
    inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;
  readonly phoneChange = output<string>();

  format(): void {
    const raw = this.input.value;
    const caret = this.input.selectionStart ?? raw.length;
    let digitsBefore = raw.slice(0, caret).replace(/\D/g, '').length;
    if (
      raw.replace(/\D/g, '').startsWith('55') &&
      (raw.replace(/\D/g, '').length > 11 || raw.trim().startsWith('+55'))
    )
      digitsBefore = Math.max(0, digitsBefore - 2);
    const formatted = formatBrazilianPhone(raw);
    this.input.value = formatted;
    let position = 0;
    let digits = 0;
    while (position < formatted.length && digits < digitsBefore) {
      if (/\d/.test(formatted[position])) digits++;
      position++;
    }
    this.input.setSelectionRange(position, position);
    this.phoneChange.emit(formatted);
  }

  beforeInput(event: InputEvent): void {
    const { selectionStart: start, selectionEnd: end, value } = this.input;
    if (
      start == null ||
      start !== end ||
      !event.inputType.startsWith('deleteContent')
    )
      return;
    const backward = event.inputType === 'deleteContentBackward';
    let index = backward ? start - 1 : start;
    if (index < 0 || index >= value.length || /\d/.test(value[index])) return;
    while (index >= 0 && index < value.length && !/\d/.test(value[index]))
      index += backward ? -1 : 1;
    if (index < 0 || index >= value.length) return;
    event.preventDefault();
    this.input.value = value.slice(0, index) + value.slice(index + 1);
    const nextCaret = backward ? index : start;
    this.input.setSelectionRange(nextCaret, nextCaret);
    this.format();
  }
}
