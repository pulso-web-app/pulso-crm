import { initFederation } from '@angular-architects/native-federation';

initFederation({ 'crm': './remoteEntry.json' })
  .catch(err => console.error(err))
  .then(() => import('./bootstrap'))
  .catch(err => console.error(err));
