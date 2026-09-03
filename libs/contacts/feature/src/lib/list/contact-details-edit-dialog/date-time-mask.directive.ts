import {
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
} from '@angular/core';

@Directive({ selector: 'input[pulsoCrmDateTimeMask]' })
export class DateTimeMaskDirective {
  readonly mode = input.required<'date' | 'time'>({
    alias: 'pulsoCrmDateTimeMask',
  });
  private readonly element =
    inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;

  constructor() {
    this.element.addEventListener('input', this.format, true);
    this.element.addEventListener('beforeinput', this.deleteAtSeparator);
    inject(DestroyRef).onDestroy(() => {
      this.element.removeEventListener('input', this.format, true);
      this.element.removeEventListener('beforeinput', this.deleteAtSeparator);
    });
  }

  private readonly format = (): void => {
    if (this.element.disabled || this.element.readOnly) return;
    const raw = this.element.value;
    const allowed = this.mode() === 'date' ? /^[\d/]*$/ : /^[\d:]*$/;
    if (!allowed.test(raw)) return;
    const digits = raw.replace(/\D/g, '');
    const separator = this.mode() === 'date' ? '/' : ':';
    const groups = [
      digits.slice(0, 2),
      digits.slice(2, this.mode() === 'date' ? 4 : undefined),
    ];
    if (this.mode() === 'date') groups.push(digits.slice(4));
    const formatted = groups.filter(Boolean).join(separator);
    if (formatted === raw) return;
    const start = this.caretPosition(
      raw,
      formatted,
      this.element.selectionStart ?? raw.length,
    );
    const end = this.caretPosition(
      raw,
      formatted,
      this.element.selectionEnd ?? raw.length,
    );
    this.element.value = formatted;
    this.element.setSelectionRange(start, end);
  };

  private caretPosition(
    raw: string,
    formatted: string,
    position: number,
  ): number {
    const count = raw.slice(0, position).replace(/\D/g, '').length;
    let index = 0;
    let digits = 0;
    while (index < formatted.length && digits < count) {
      if (/\d/.test(formatted[index])) digits++;
      index++;
    }
    return index;
  }

  private readonly deleteAtSeparator = (event: InputEvent): void => {
    if (this.element.disabled || this.element.readOnly || !event.cancelable)
      return;
    const { selectionStart: start, selectionEnd: end, value } = this.element;
    if (start == null || start !== end) return;
    const backward = event.inputType === 'deleteContentBackward';
    if (!backward && event.inputType !== 'deleteContentForward') return;
    const index = backward ? start - 1 : start;
    const separator = this.mode() === 'date' ? '/' : ':';
    if (value[index] !== separator) return;
    const digitIndex = backward ? index - 1 : index + 1;
    if (!/\d/.test(value[digitIndex] ?? '')) return;
    event.preventDefault();
    this.element.value =
      value.slice(0, digitIndex) + value.slice(digitIndex + 1);
    const caret = backward ? digitIndex : start;
    this.element.setSelectionRange(caret, caret);
    this.element.dispatchEvent(new Event('input', { bubbles: true }));
  };
}
