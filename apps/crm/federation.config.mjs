import {
  shareAll,
  shareAngularLocales,
  withNativeFederation,
} from '@angular-architects/native-federation/config';

const ptLocale = shareAngularLocales(['pt'])['@angular/common/locales/pt'];

export default withNativeFederation({
  name: 'crm',

  exposes: {
    './Routes': './apps/crm/src/app/remote-entry/remote-entry.routes.ts',
  },

  shared: {
    ...shareAll(
      {
        singleton: true,
        strictVersion: true,
        requiredVersion: 'auto',
        build: 'package',
      },
      {
        overrides: {
          // Firebase services can come from different remotes. Keep their
          // component registry shared instead of embedding it in each bundle.
          '@firebase/app': {
            singleton: true,
            strictVersion: true,
            requiredVersion: 'auto',
            build: 'package',
            includeSecondaries: { keepAll: true },
          },
          '@angular/core': {
            singleton: true,
            strictVersion: true,
            requiredVersion: 'auto',
            build: 'package',
            includeSecondaries: { keepAll: true },
          },
          '@angular/common': {
            singleton: true,
            strictVersion: true,
            requiredVersion: 'auto',
            build: 'package',
            includeSecondaries: { keepAll: true },
          },
          // Usage inside Nx path-mapped libraries is not visible to the
          // default dependency pruner. Share Material and CDK explicitly.
          '@angular/material': {
            singleton: true,
            strictVersion: true,
            requiredVersion: 'auto',
            build: 'package',
            includeSecondaries: {
              keepAll: true,
              skip: [
                '@angular/material/*/testing',
                '@angular/material/form-field/testing/control',
              ],
            },
          },
          '@angular/cdk': {
            singleton: true,
            strictVersion: true,
            requiredVersion: 'auto',
            build: 'package',
            includeSecondaries: {
              keepAll: true,
              skip: [
                '@angular/cdk/schematics',
                '@angular/cdk/testing',
                '@angular/cdk/testing/*',
              ],
            },
          },
        },
      },
    ),
    '@angular/common/locales/pt': {
      ...ptLocale,
      includeSecondaries: { keepAll: true },
    },
  },

  skip: [
    // These package roots are consumed by Sass. Their runtime secondary
    // entry points remain shared explicitly above.
    '@angular/material',
    '@angular/cdk',
    'rxjs/ajax',
    'rxjs/fetch',
    'rxjs/testing',
    'rxjs/webSocket',
  ],

  features: {
    denseChunking: true,
  },
});
