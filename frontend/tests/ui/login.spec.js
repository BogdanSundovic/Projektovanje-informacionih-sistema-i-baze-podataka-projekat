const { test, expect } = require('@playwright/test');

test('UI: login', async ({ page, request }) => {
  const u = 'qa' + Date.now();
  const p = 'ruma123';

  const API = process.env.E2E_API_URL || 'http://127.0.0.1:18088/api';
  const reg = await request.post(`${API}/register`, {
    data: { username: u, email: `${u}@ex.com`, password: p },
  });
  expect([200, 201, 400, 409]).toContain(reg.status()); // OK i ako "user exists"

  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page
    .waitForSelector('text=/Učitavanje/i', { state: 'detached', timeout: 5000 }).catch(() => {});

  const openLogin = page.getByRole('link', { name: /login/i });
  await openLogin.first().click();

  const usernameInput = page.locator('.input-group', { has: page.locator('label:has-text("Korisničko ime")') }).locator('input');

  const emailInput = page.locator('.input-group', { has: page.locator('label:has-text("Email")') }).locator('input');

  if (await usernameInput.first().isVisible().catch(() => false)) {
    await usernameInput.first().fill(u);
  } else {
    await emailInput.first().fill(`${u}@ex.com`);
  }

  const passInput = page.locator('.input-group', { has: page.locator('label:has-text("Lozinka")') }).locator('input[type="password"]');
  await passInput.first().fill(p);

  const submit = page.getByRole('button', { name: /prijavi se/i });
  await Promise.all([page.waitForURL('/dashboard'), submit.click()]);
  
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText(/Dobrodošao na Dashboard/i)).toBeVisible();
});
