import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { firstValueFrom } from 'rxjs';
import { vi } from 'vitest';
import { Contact, ContactsRepository } from '@pulso-crm/contacts-data-access';
import { ContactDetailsEditDialogComponent } from '../contact-details-edit-dialog/contact-details-edit-dialog.component';
import { ContactCardComponent } from './contact-card.component';

@Component({
  imports: [ContactCardComponent],
  template: '<pulso-crm-contact-card [contact]="contact" />',
})
class RoutedContactCardComponent {
  readonly contact: Contact = {
    id: 'contact-a',
    organizationName: 'ACME',
    stage: 'client',
    status: 'new',
    lastContactAt: '2026-09-02T12:00:00Z',
    activities: [],
  };
}

describe('Contact card dialog route injection', () => {
  it('opens and saves using the repository provided by the contacts route', async () => {
    const repository = {
      updateContact: vi.fn().mockResolvedValue(undefined),
    };
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'contacts',
            providers: [{ provide: ContactsRepository, useValue: repository }],
            component: RoutedContactCardComponent,
          },
        ]),
      ],
    }).compileComponents();
    const harness = await RouterTestingHarness.create('/contacts');
    const card = harness.routeNativeElement?.querySelector('mat-card');
    if (!card) throw new Error('The contact card was not rendered.');

    const dialog = TestBed.inject(MatDialog);
    (card as HTMLElement).click();
    await harness.fixture.whenStable();
    const ref = dialog.openDialogs[0];
    expect(ref).toBeDefined();
    const editor = ref.componentInstance as ContactDetailsEditDialogComponent;
    editor.contactForm.organizationName().value.set('Updated ACME');
    const closed = firstValueFrom(ref.afterClosed());
    editor.save();

    expect(await closed).toEqual(
      expect.objectContaining({ id: 'contact-a', organizationName: 'Updated ACME' }),
    );
    expect(repository.updateContact).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ id: 'contact-a', organizationName: 'Updated ACME' }),
    );
  });
});
