const { test, expect } = require('@playwright/test');

test('UI: registration', async ({ page }) => {
  const u = 'qa' + Date.now();

  await page.goto('/');

  // ako postoji loader "Učitavanje…", sačekaj da nestane (neće baciti grešku ako ga nema)
  await page.waitForSelector('text=/Učitavanje|Loading/i', { state: 'detached', timeout: 5000 }).catch(() => {});

  // 1) otvori login
   await page.getByRole('link', { name: /login|register/i }).click();

  // 2) sa login ekrana idi na registraciju (nekad je link, nekad dugme)
  const toRegisterLink = page.getByRole('link', { name: /registruj se|register|sign up/i });
  if (await toRegisterLink.isVisible().catch(() => false)) {
    await toRegisterLink.click();
  } else {
    await page.getByRole('button', { name: /registruj se|register|sign up/i }).click();
  }

  // 3) popuni polja – hvataj input preko .input-group+label teksta
  await page.locator('.input-group', { has: page.locator('label:has-text("Korisničko ime")') })
            .locator('input').fill(u);
  await page.locator('.input-group', { has: page.locator('label:has-text("Email")') })
            .locator('input').fill(`${u}@ex.com`);
  await page.locator('.input-group', { has: page.locator('label:has-text("Lozinka")') })
            .locator('input').fill('test123');
  await page.locator('.input-group', { has: page.locator('label:has-text("Potvrdi lozinku")') })
            .locator('input').fill('test123');

  // 4) submit + čekaj redirect na /dashboard
  await Promise.all([
    page.waitForURL('**/dashboard'),
    page.getByRole('button', { name: /registruj se|register|sign up/i }).click(),
  ]);

  // 5) kratka verifikacija
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText(/dashboard|forme|forms|welcome|dobrodoš/i)).toBeVisible();
});