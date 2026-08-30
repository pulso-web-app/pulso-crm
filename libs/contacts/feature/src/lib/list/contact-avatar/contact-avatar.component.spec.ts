import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactAvatarComponent } from './contact-avatar.component';

describe('ContactAvatarComponent', () => {
  let fixture: ComponentFixture<ContactAvatarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactAvatarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactAvatarComponent);
    fixture.componentRef.setInput('contactId', 'a');
    fixture.componentRef.setInput(
      'organizationName',
      '  ACME   Tecnologia Brasil  ',
    );
    fixture.detectChanges();
  });

  it('renders up to two initials from the organization name', () => {
    expect(fixture.nativeElement.textContent.trim()).toBe('AT');
  });

  it('selects a stable tone from the contact identifier', () => {
    expect(fixture.nativeElement.getAttribute('data-tone')).toBe('blue');
  });

  it('updates the initials when the organization name changes', () => {
    fixture.componentRef.setInput('organizationName', 'Solo');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent.trim()).toBe('S');
  });
});
