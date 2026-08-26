import { CRM_ROUTES, REMOTE_ROUTES } from './remote-entry.routes';

describe('CRM remote routes', () => {
  it('keeps the common remote contract compatible', () => {
    expect(REMOTE_ROUTES).toBe(CRM_ROUTES);
  });

  it('loads contacts through the public feature alias', () => {
    expect(
      CRM_ROUTES.find((route) => route.path === 'contacts')?.loadChildren,
    ).toBeTypeOf('function');
  });
});
