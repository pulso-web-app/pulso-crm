import { inject, InjectionToken, Provider, Service } from '@angular/core';
import { FirebaseApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteField,
  doc,
  documentId,
  endBefore,
  getCountFromServer,
  getDocsFromServer,
  getFirestore,
  limit,
  limitToLast,
  orderBy,
  query,
  QueryConstraint,
  startAfter,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { distinctUntilChanged, Observable, shareReplay } from 'rxjs';
import {
  Contact,
  ContactFilter,
  ContactInput,
  ContactStage,
} from './contact.models';
import { decodeContact, normalizeContactSearch } from './contact-document';
import { validateContactImport } from './contact-import';

const CONTACTS_FIREBASE_APP = new InjectionToken<() => FirebaseApp>(
  'Contacts Firebase app',
);

export function provideContactsDataAccess(app: () => FirebaseApp): Provider[] {
  return [
    { provide: CONTACTS_FIREBASE_APP, useValue: app },
    ContactsRepository,
  ];
}

export interface ContactCursor {
  readonly name: string;
  readonly id: string;
}

export interface ContactPage {
  readonly contacts: readonly Contact[];
  readonly first: ContactCursor | null;
  readonly last: ContactCursor | null;
}

export type ContactPageRequest = {
  readonly filter: ContactFilter;
  readonly size: number;
} & (
  | { readonly direction: 'first' | 'last' }
  | { readonly direction: 'next' | 'previous'; readonly cursor: ContactCursor }
);

export type ContactSummary = { readonly total: number } & Readonly<
  Record<Exclude<ContactStage, 'contact'>, number>
>;

@Service()
export class ContactsRepository {
  private readonly app = inject(CONTACTS_FIREBASE_APP)();
  private readonly firestore = getFirestore(this.app);

  readonly userId$ = new Observable<string | null>((subscriber) =>
    onAuthStateChanged(
      getAuth(this.app),
      (user) => subscriber.next(user?.uid ?? null),
      (error) => subscriber.error(error),
    ),
  ).pipe(
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  async readPage(request: ContactPageRequest): Promise<ContactPage> {
    if (
      !Number.isInteger(request.size) ||
      request.size < 1 ||
      request.size > 27
    ) {
      throw new Error('Invalid contact page size.');
    }
    const constraints: QueryConstraint[] = [];
    if (request.direction === 'next')
      constraints.push(startAfter(request.cursor.name, request.cursor.id));
    if (request.direction === 'previous')
      constraints.push(endBefore(request.cursor.name, request.cursor.id));
    constraints.push(
      request.direction === 'last' || request.direction === 'previous'
        ? limitToLast(request.size)
        : limit(request.size),
    );
    const result = await getDocsFromServer(
      query(this.directoryQuery(request.filter), ...constraints),
    );
    const contacts = result.docs.map((document) =>
      decodeContact(document.id, document.data()),
    );
    const cursor = (contact: Contact | undefined): ContactCursor | null =>
      contact
        ? {
            name: normalizeContactSearch(contact.organizationName),
            id: contact.id,
          }
        : null;
    return {
      contacts,
      first: cursor(contacts[0]),
      last: cursor(contacts[contacts.length - 1]),
    };
  }

  async count(filter: ContactFilter): Promise<number> {
    return (await getCountFromServer(this.directoryQuery(filter))).data().count;
  }

  async summary(): Promise<ContactSummary> {
    const [total, cold, warm, hot, client, noResponse, notInterested] =
      await Promise.all(
        (
          [
            null,
            'cold-lead',
            'warm-lead',
            'hot-lead',
            'client',
            'no-response',
            'not-interested',
          ] as const
        ).map((stage) => this.count({ search: '', stage, status: null })),
      );
    return {
      total,
      'cold-lead': cold,
      'warm-lead': warm,
      'hot-lead': hot,
      client,
      'no-response': noResponse,
      'not-interested': notInterested,
    };
  }

  async createContact(input: ContactInput): Promise<Contact> {
    const document = prepareContactDocument(input);
    // Validate the stored contract before issuing a write.
    decodeContact('new-contact', document);
    const reference = await addDoc(
      collection(this.firestore, 'contacts'),
      document,
    );
    return decodeContact(reference.id, document);
  }

  async importContacts(
    inputs: readonly ContactInput[],
  ): Promise<readonly Contact[]> {
    const validated = validateContactImport(inputs);
    if (!validated.valid) throw new Error('Invalid contact import.');
    const batch = writeBatch(this.firestore);
    const pending = validated.contacts.map((input) => {
      const reference = doc(collection(this.firestore, 'contacts'));
      const document = prepareContactDocument(input);
      batch.set(reference, document);
      return { id: reference.id, document };
    });
    await batch.commit();
    return pending.map(({ id, document }) => decodeContact(id, document));
  }

  async updateContact(contact: Contact): Promise<void> {
    const contactRef = doc(this.firestore, 'contacts', contact.id);
    const organizationNameSearch = normalizeContactSearch(
      contact.organizationName,
    );
    await updateDoc(contactRef, {
      organizationName: contact.organizationName,
      organizationNameSearch,
      stage: contact.stage,
      status: contact.status,
      lastContactAt: contact.lastContactAt,
      contactName: contact.contactName?.trim() || deleteField(),
      instagramHandle: contact.instagramHandle?.trim() || deleteField(),
      instagramProfileUrl: contact.instagramProfileUrl?.trim() || deleteField(),
      whatsappNumber: contact.whatsappNumber?.trim() || deleteField(),
      activities: contact.activities.map((a) => ({
        text: a.text,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      })),
    });
  }

  private directoryQuery(filter: ContactFilter) {
    const constraints: QueryConstraint[] = [];
    if (filter.stage) constraints.push(where('stage', '==', filter.stage));
    if (filter.status) constraints.push(where('status', '==', filter.status));
    const search = normalizeContactSearch(filter.search);
    if (search) {
      constraints.push(
        where('organizationNameSearch', '>=', search),
        where('organizationNameSearch', '<=', `${search}\uf8ff`),
      );
    }
    return query(
      collection(this.firestore, 'contacts'),
      ...constraints,
      orderBy('organizationNameSearch'),
      orderBy(documentId()),
    );
  }
}

function prepareContactDocument(input: ContactInput) {
  const organizationName = input.organizationName.trim();
  if (!organizationName) throw new Error('Organization name is required.');
  const optionalFields = Object.fromEntries(
    Object.entries({
      contactName: input.contactName,
      instagramHandle: input.instagramHandle,
      instagramProfileUrl: input.instagramProfileUrl,
      whatsappNumber: input.whatsappNumber,
    })
      .map(([key, value]) => [key, value?.trim()])
      .filter(([, value]) => Boolean(value)),
  );
  const document = {
    organizationName,
    organizationNameSearch: normalizeContactSearch(organizationName),
    stage: input.stage,
    status: input.status,
    lastContactAt: input.lastContactAt,
    activities: input.activities.map(({ text, createdAt, updatedAt }) => ({
      text,
      createdAt,
      updatedAt,
    })),
    ...optionalFields,
  };
  decodeContact('new-contact', document);
  return document;
}
