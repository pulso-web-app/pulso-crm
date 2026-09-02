import { inject, Injectable, InjectionToken, Provider } from '@angular/core';
import { FirebaseApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  collection,
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
  where,
} from 'firebase/firestore';
import { distinctUntilChanged, Observable, shareReplay } from 'rxjs';
import { Contact, ContactFilter, ContactStage } from './contact.models';
import { decodeContact, normalizeContactSearch } from './contact-document';

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

@Injectable()
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
