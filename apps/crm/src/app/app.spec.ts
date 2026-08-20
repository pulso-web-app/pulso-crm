import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the router outlet', () => {
    const fixture = TestBed.createComponent(App);

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

  it('should render the loading overlay component', () => {
    const fixture = TestBed.createComponent(App);

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('pulso-crm-loading-overlay')).toBeTruthy();
  });
});
