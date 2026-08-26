import { registerLocaleData } from '@angular/common';
import localePtBr from '@angular/common/locales/pt';
import { LOCALE_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MetricCardComponent } from './metric-card.component';

registerLocaleData(localePtBr, 'pt-BR');

describe('MetricCardComponent', () => {
  let component: MetricCardComponent;
  let fixture: ComponentFixture<MetricCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetricCardComponent],
      providers: [{ provide: LOCALE_ID, useValue: 'pt-BR' }],
    }).compileComponents();

    fixture = TestBed.createComponent(MetricCardComponent);
    fixture.componentRef.setInput('cardTitle', 'Contatos');
    fixture.componentRef.setInput('cardValue', 1234);
    fixture.componentRef.setInput('icon', 'groups');
    fixture.componentRef.setInput('color', 'primary');
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render its content and semantic color', () => {
    const host = fixture.nativeElement as HTMLElement;

    expect(host.getAttribute('data-color')).toBe('primary');
    expect(host.querySelector('.card-title')?.textContent).toContain(
      'Contatos',
    );
    expect(host.querySelector('.card-value')?.textContent).toContain('1.234');
    expect(host.querySelector('mat-icon')?.textContent).toContain('groups');
  });
});
