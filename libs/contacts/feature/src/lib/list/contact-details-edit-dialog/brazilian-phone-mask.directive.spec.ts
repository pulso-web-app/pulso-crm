import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrazilianPhoneMaskDirective } from './brazilian-phone-mask.directive';

@Component({
  imports: [BrazilianPhoneMaskDirective],
  template:
    '<input type="tel" pulsoCrmBrazilianPhoneMask (phoneChange)="value = $event" />',
})
class PhoneHost {
  value = '';
}

describe('Brazilian WhatsApp mask', () => {
  it('formats each typed digit, accepts country-code paste and allows clearing', () => {
    const fixture = TestBed.createComponent(PhoneHost);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    for (const digit of '11912345678') {
      input.value += digit;
      input.dispatchEvent(new Event('input'));
      expect(input.selectionStart).toBe(input.value.length);
    }
    expect(input.value).toBe('(11) 91234-5678');
    input.value = '+55 (21) 2345-6789';
    input.dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.value).toBe('(21) 2345-6789');
    input.value = '';
    input.dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.value).toBe('');
  });

  it('preserves the caret for middle replacement and deletes across separators', () => {
    const fixture = TestBed.createComponent(PhoneHost);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    input.value = '(11) 98234-5678';
    input.setSelectionRange(7, 7);
    input.dispatchEvent(new Event('input'));
    expect(input.selectionStart).toBe(7);
    input.setSelectionRange(11, 11);
    input.dispatchEvent(
      new InputEvent('beforeinput', {
        inputType: 'deleteContentBackward',
        cancelable: true,
      }),
    );
    expect(input.value).toBe('(11) 9823-5678');
    expect(input.selectionStart).toBe(9);
  });
});
