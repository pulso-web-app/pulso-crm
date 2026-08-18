import {
  getApp,
  getApps,
  initializeApp,
  type FirebaseApp,
} from 'firebase/app';

import { firebaseConfig } from './firebase.config';

export function getFirebaseApp(): FirebaseApp {
  return getApps().length
    ? getApp()
    : initializeApp(firebaseConfig);
}
