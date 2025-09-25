// tests/ui/login.spec.js
const { test, expect } = require('@playwright/test');

test('UI: login', async ({ page, request }) => {
  const u = 'qa' ;
  const p = 'test123';

  // 1) pripremi nalog preko API-ja (ili ignore ako već postoji)
  const API = process.env.E2E_API_URL || 'http://localhost:8000/api';
  const reg = await request.post(`${API}/register`, {
    data: { username: u, email: `${u}@ex.com`, password: p },
  });
  expect([200, 201, 400, 409]).toContain(reg.status()); // OK i ako "user exists"

  // 2) otvori app i uveri se da si izlogovan
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  // (ako postoji loader) sačekaj da nestane
  await page
    .waitForSelector('text=/Učitavanje|Loading/i', { state: 'detached', timeout: 5000 })
    .catch(() => {});

  // 3) otvori login (može biti button ili link)
  const openLogin = page
    .getByRole('button', { name: /login|prijava/i })
    .or(page.getByRole('link', { name: /login|prijava/i }));
  await openLogin.first().click();

  // 4) popuni username ILI email (šta god je vidljivo)
  const usernameInput = page
    .getByLabel(/username|korisničko ime/i)
    .or(page.locator('.input-group', { has: page.locator('label:has-text("Korisničko ime")') }).locator('input'));

  const emailInput = page
    .getByLabel(/email/i)
    .or(page.locator('.input-group', { has: page.locator('label:has-text("Email")') }).locator('input'));

  if (await usernameInput.first().isVisible().catch(() => false)) {
    await usernameInput.first().fill(u);
  } else {
    await emailInput.first().fill(`${u}@ex.com`);
  }

  const passInput = page
    .getByLabel(/password|lozinka/i)
    .or(
      page
        .locator('.input-group', { has: page.locator('label:has-text("Lozinka")') })
        .locator('input[type="password"]')
    );
  await passInput.first().fill(p);

  // 5) submit i čekaj redirect na /dashboard
  const submit = page.getByRole('button', { name: /login|prijavi se|sign in|uloguj/i });
  await Promise.all([page.waitForURL('**/dashboard'), submit.click()]);

  // 6) verifikacija
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText(/dashboard/i)).toBeVisible();
});