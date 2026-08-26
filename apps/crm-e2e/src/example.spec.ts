import { expect, test } from '@playwright/test';

test('renders the contacts page', async ({ page }) => {
  await page.goto('/');

  const search = page.getByRole('textbox', { name: 'Buscar Contatos' });

  await expect(search).toBeVisible();
  await expect(
    page.getByText('Contatos', { exact: true }).first(),
  ).toBeVisible();

  await search.fill('Maria');
  await expect(
    page.getByRole('button', { name: 'Limpar filtros', exact: true }),
  ).toBeVisible();

  await page
    .getByRole('button', { name: 'Limpar filtros', exact: true })
    .click();
  await expect(search).toHaveValue('');
  await expect(
    page.getByRole('button', { name: 'Limpar filtros', exact: true }),
  ).toBeHidden();
});
