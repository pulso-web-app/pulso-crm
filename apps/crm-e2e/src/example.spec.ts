import { expect, test } from '@playwright/test';

test('renders the contacts page', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('textbox', { name: 'Buscar Contatos' }),
  ).toBeVisible();
  await expect(
    page.getByText('Contatos', { exact: true }).first(),
  ).toBeVisible();
});
