const { test, expect } = require('@playwright/test');

test('UI: registration', async ({ page }) => {
  const u = 'qa' + Date.now();

  await page.goto('/');

  await page.waitForSelector('text=/Učitavanje|Loading/i', { state: 'detached', timeout: 5000 }).catch(() => {});

  await page.getByRole('link', { name: /login/i }).click();

  const toRegisterLink = page.getByRole('link', { name: /registruj se/i });
  if (await toRegisterLink.isVisible().catch(() => false)) {
    await toRegisterLink.click();
  } else {
    await page.getByRole('button', { name: /registruj se/i }).click();
  }

  await page.locator('.input-group', { has: page.locator('label:has-text("Korisničko ime")') })
           .locator('input').fill(u);
  await page.locator('.input-group', { has: page.locator('label:has-text("Email")') })
           .locator('input').fill(`${u}@ex.com`);
  await page.locator('.input-group', { has: page.locator('label:has-text("Lozinka")') })
           .locator('input').fill('ruma123');
  await page.locator('.input-group', { has: page.locator('label:has-text("Potvrdi lozinku")') })
           .locator('input').fill('ruma123');

  await Promise.all([
    page.waitForURL('/dashboard'),
    page.getByRole('button', { name: /registruj se/i }).click(),
  ]);

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText(/Dobrodošao na Dashboard/i)).toBeVisible();
});
