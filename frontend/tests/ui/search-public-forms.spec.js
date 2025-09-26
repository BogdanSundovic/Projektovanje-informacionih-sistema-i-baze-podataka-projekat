const { test, expect } = require('@playwright/test');

test('UI: login -> Javne forme -> search radi', async ({ page, request }) => {
  const u = 'ui' + Date.now();
  const p = 'ruma123';
  const formName = `Public PW ${Date.now()}`;

  const API  = process.env.E2E_API_URL || 'http://127.0.0.1:18088/api';
  const ROOT = API.replace(/\/api\/?$/i, '');
  const UI   = process.env.E2E_UI_URL || 'http://127.0.0.1:13008';

  const reg = await request.post(`${API}/register`, {
    data: { username: u, email: `${u}@ex.com`, password: p },
  });
  expect([200, 201, 400, 409]).toContain(reg.status());

  let tokenRes = await request.post(`${ROOT}/token`, { form: { username: u, password: p } });
  if (!tokenRes.ok()) tokenRes = await request.post(`${API}/token`, { form: { username: u, password: p } });
  expect(tokenRes.ok()).toBeTruthy();
  const { access_token } = await tokenRes.json();

  const create = await request.post(`${API}/forms`, {
    data: { name: formName, description: null, is_public: true },
    headers: { Authorization: `Bearer ${access_token}` },
  });
  expect(create.ok()).toBeTruthy();

  await page.goto(`${UI}/`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector('text=/Učitavanje|Loading/i', { state: 'detached', timeout: 5000 }).catch(() => {});

  const openLogin = page.getByRole('link', { name: /login|prijava/i });
  await openLogin.first().click();

  const userOrEmail = page.locator('.input-group', { has: page.locator('label:has-text("Email ili korisničko ime")') })
    .locator('input');
  await userOrEmail.first().fill(u);

  const passInput = page.getByLabel(/password|lozinka/i).or(page.locator('input[type="password"]'));
  await passInput.first().fill(p);

  const submit = page.getByRole('button', { name: /prijavi se|login|sign in|uloguj/i });
  await Promise.all([page.waitForURL('**/dashboard'), submit.click()]);

  await expect(page.getByText(/dashboard|moje forme|dobrodoš/i).first()).toBeVisible({ timeout: 8000 });

  const navPublic = page.getByRole('link', { name: /Javne forme/i });
  await Promise.all([page.waitForLoadState('domcontentloaded'), navPublic.first().click()]);

  const heading = page.locator('h2.forms-title').first();
  await expect(heading).toBeVisible({ timeout: 8000 });

  const searchBox = page.getByPlaceholder(/Pretraži po nazivu/i).first();
  await searchBox.fill(formName);
  await page.keyboard.press('Enter').catch(() => {});

  await expect(page.getByText(new RegExp(formName, 'i')).first()).toBeVisible({ timeout: 10000 });
});
