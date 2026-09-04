import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { LastContactEditorComponent } from './last-contact-editor.component';

describe('LastContactEditorComponent', () => {
  const scrollIntoView = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    'scrollIntoView',
  );
  beforeEach(() => {
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: vi.fn(),
    });
  });
  afterEach(() => {
    if (scrollIntoView)
      Object.defineProperty(
        HTMLElement.prototype,
        'scrollIntoView',
        scrollIntoView,
      );
    else Reflect.deleteProperty(HTMLElement.prototype, 'scrollIntoView');
  });
  async function setup(value = '') {
    const fixture = TestBed.createComponent(LastContactEditorComponent);
    fixture.componentRef.setInput('value', value);
    const changed = vi.fn();
    const invalid = vi.fn();
    fixture.componentInstance.valueChange.subscribe(changed);
    fixture.componentInstance.invalidChange.subscribe(invalid);
    fixture.detectChanges();
    await fixture.whenStable();
    const inputs = Array.from(
      fixture.nativeElement.querySelectorAll('input'),
    ) as HTMLInputElement[];
    async function enter(index: number, value: string) {
      inputs[index].value = value;
      inputs[index].dispatchEvent(new Event('input', { bubbles: true }));
      inputs[index].dispatchEvent(new Event('blur'));
      fixture.detectChanges();
      await fixture.whenStable();
    }
    return { fixture, changed, invalid, inputs, enter };
  }

  afterEach(() => vi.useRealTimers());

  it('keeps Material date and time pickers while rendering the Phosphor summary icon', async () => {
    const { fixture } = await setup();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('mat-datepicker-toggle')).not.toBeNull();
    expect(host.querySelector('mat-timepicker-toggle')).not.toBeNull();
    expect(host.querySelectorAll('mat-form-field')).toHaveLength(2);
    expect(host.querySelector('ph-clock')).not.toBeNull();
    expect(host.querySelector('mat-icon')).toBeNull();
  });

  it('masks each typed digit and emits the local instant without blur', async () => {
    const { fixture, inputs, changed, invalid } = await setup();
    const expected = [
      [
        '1',
        '12',
        '12/1',
        '12/12',
        '12/12/2',
        '12/12/20',
        '12/12/201',
        '12/12/2012',
      ],
      ['1', '13', '13:3', '13:30'],
    ];
    for (const [index, digits] of ['12122012', '1330'].entries()) {
      inputs[index].focus();
      for (const [position, digit] of [...digits].entries()) {
        inputs[index].value += digit;
        inputs[index].dispatchEvent(new Event('input', { bubbles: true }));
        fixture.detectChanges();
        await fixture.whenStable();
        expect(inputs[index].value).toBe(expected[index][position]);
        expect(inputs[index].selectionStart).toBe(inputs[index].value.length);
      }
    }
    expect(invalid).toHaveBeenLastCalledWith(false);
    expect(changed).toHaveBeenLastCalledWith(
      new Date(2012, 11, 12, 13, 30).toISOString(),
    );
  });

  it('masks pasted values and preserves formatted input', async () => {
    const { enter, inputs, changed } = await setup();
    await enter(0, '12122012');
    await enter(1, '1330');
    expect(inputs.map((input) => input.value)).toEqual(['12/12/2012', '13:30']);
    await enter(0, '29/02/2024');
    await enter(1, '00:05');
    expect(inputs.map((input) => input.value)).toEqual(['29/02/2024', '00:05']);
    expect(changed).toHaveBeenLastCalledWith(
      new Date(2024, 1, 29, 0, 5).toISOString(),
    );
  });

  it.each([
    ['31022026', '1330'],
    ['12122012', '2460'],
    ['121220123', '1330'],
    ['12122012', '13300'],
  ])('keeps invalid numeric values invalid: %s / %s', async (date, time) => {
    const { enter, changed, invalid } = await setup();
    await enter(0, date);
    await enter(1, time);
    expect(invalid).toHaveBeenLastCalledWith(true);
    expect(changed).not.toHaveBeenCalled();
  });

  it('supports selection replacement and deletion next to both separators', async () => {
    const { fixture, inputs, invalid, changed } = await setup(
      new Date(2012, 11, 12, 13, 30).toISOString(),
    );
    inputs[1].setSelectionRange(0, 2);
    inputs[1].setRangeText('09', 0, 2, 'end');
    inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(inputs[1].value).toBe('09:30');
    expect(inputs[1].selectionStart).toBe(2);
    expect(changed).toHaveBeenLastCalledWith(
      new Date(2012, 11, 12, 9, 30).toISOString(),
    );

    inputs[0].setSelectionRange(3, 3);
    inputs[0].dispatchEvent(
      new InputEvent('beforeinput', {
        inputType: 'deleteContentBackward',
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    await fixture.whenStable();
    expect(inputs[0].value).toBe('11/22/012');
    expect(inputs[0].selectionStart).toBe(1);
    expect(invalid).toHaveBeenLastCalledWith(true);

    inputs[1].focus();
    inputs[1].setSelectionRange(2, 2);
    inputs[1].dispatchEvent(
      new InputEvent('beforeinput', {
        inputType: 'deleteContentForward',
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    await fixture.whenStable();
    expect(inputs[1].value).toBe('09:0');
    expect(inputs[1].selectionStart).toBe(2);
  });

  it('allows clearing both masked fields without inventing an event', async () => {
    const { enter, changed, invalid } = await setup(
      new Date(2012, 11, 12, 13, 30).toISOString(),
    );
    await enter(0, '');
    expect(invalid).toHaveBeenLastCalledWith(true);
    await enter(1, '');
    expect(invalid).toHaveBeenLastCalledWith(false);
    expect(changed).toHaveBeenLastCalledWith('');
  });

  it('recovers from invalid input and opens both Material pickers with localized values', async () => {
    const { fixture, enter, changed, invalid } = await setup();
    await enter(0, '31/02/2026');
    await enter(1, '25:00');
    await enter(0, '04/03/2026');
    await enter(1, '13:45');
    expect(invalid).toHaveBeenLastCalledWith(false);
    expect(changed).toHaveBeenLastCalledWith(
      new Date(2026, 2, 4, 13, 45).toISOString(),
    );
    fixture.nativeElement.querySelector('mat-datepicker-toggle button').click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.body.querySelector('mat-calendar')).not.toBeNull();
    expect(
      document.body.querySelector('button[aria-label="Próximo mês"]'),
    ).not.toBeNull();
    document.body.querySelector<HTMLElement>('.cdk-overlay-backdrop')?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.nativeElement.querySelector('mat-timepicker-toggle button').click();
    fixture.detectChanges();
    await fixture.whenStable();
    const option = Array.from(
      document.body.querySelectorAll('[role="option"]'),
    ).find((option) => option.textContent?.trim() === '18:30') as HTMLElement;
    expect(option).toBeDefined();
    option.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(changed).toHaveBeenLastCalledWith(
      new Date(2026, 2, 4, 18, 30).toISOString(),
    );
  });

  it('displays a persisted local date and 24-hour time without rewriting it', async () => {
    const date = new Date(2026, 8, 2, 0, 5, 27);
    const { inputs, changed } = await setup(date.toISOString());
    expect(inputs.map((input) => input.value)).toEqual(['02/09/2026', '00:05']);
    expect(changed).not.toHaveBeenCalled();
  });

  it('requires both fields and persists an unambiguous local midnight', async () => {
    const { enter, invalid, changed } = await setup();
    await enter(0, '03/04/2026');
    expect(invalid).toHaveBeenLastCalledWith(true);
    expect(changed).not.toHaveBeenCalled();
    await enter(1, '00:00');
    expect(invalid).toHaveBeenLastCalledWith(false);
    expect(changed).toHaveBeenLastCalledWith(
      new Date(2026, 3, 3, 0, 0).toISOString(),
    );
  });

  it.each(['31/02/2026', '02/30/2026', '1/2/2026'])(
    'rejects invalid date %s',
    async (value) => {
      const { enter, invalid, changed, fixture } = await setup();
      await enter(0, value);
      await enter(1, '14:30');
      expect(invalid).toHaveBeenLastCalledWith(true);
      expect(changed).not.toHaveBeenCalled();
      expect(fixture.nativeElement.textContent).toContain(
        'Informe uma data válida',
      );
    },
  );

  it.each(['24:00', '12:60', '2:30 PM'])(
    'rejects invalid time %s',
    async (value) => {
      const { enter, invalid, changed } = await setup();
      await enter(0, '29/02/2024');
      await enter(1, value);
      expect(invalid).toHaveBeenLastCalledWith(true);
      expect(changed).not.toHaveBeenCalled();
    },
  );

  it('sets Agora to the machine instant and clears both fields', async () => {
    const { fixture, changed, inputs } = await setup();
    vi.useFakeTimers({ toFake: ['Date'] });
    const now = new Date(2026, 8, 2, 23, 59, 12, 345);
    vi.setSystemTime(now);
    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    ) as HTMLButtonElement[];
    buttons.find((button) => button.textContent?.trim() === 'Agora')?.click();
    fixture.detectChanges();
    expect(changed).toHaveBeenLastCalledWith(now.toISOString());
    expect(inputs.map((input) => input.value)).toEqual(['02/09/2026', '23:59']);
    buttons.find((button) => button.textContent?.includes('Limpar'))?.click();
    fixture.detectChanges();
    expect(changed).toHaveBeenLastCalledWith('');
    expect(inputs.every((input) => input.value === '')).toBe(true);
  });

  it('disables fields and actions while saving and preserves the draft when enabled again', async () => {
    const { fixture, inputs, changed } = await setup(
      new Date(2026, 8, 2, 14, 30).toISOString(),
    );
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(inputs.every((input) => input.disabled)).toBe(true);
    expect(
      Array.from(fixture.nativeElement.querySelectorAll('button')).every(
        (button) => (button as HTMLButtonElement).disabled,
      ),
    ).toBe(true);
    fixture.componentInstance.setNow();
    fixture.componentInstance.clear();
    expect(changed).not.toHaveBeenCalled();
    fixture.componentRef.setInput('disabled', false);
    fixture.detectChanges();
    expect(inputs.map((input) => input.value)).toEqual(['02/09/2026', '14:30']);
  });
});
