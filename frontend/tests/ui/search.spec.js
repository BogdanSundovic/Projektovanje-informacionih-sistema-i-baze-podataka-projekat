const { test, expect } = require('@playwright/test');

test('UI: search forms by name', async ({ page, request }) => {
  const api = process.env.API_BASE_URL;
  const u = 'owner' + Date.now();

  // owner i token preko API-ja
  await request.post(`${api}/api/register`, { data: { username: u, email: `${u}@ex.com`, password: 'test123' } });
  const tok = await request.post(`${api}/token`, { form: { username: u, password: 'test123' } });
  const access = (await tok.json()).access_token;
  const headers = { Authorization: `Bearer ${access}` };

  // kreiraj PUBLIC formu
  const name = `QA Form ${Date.now()}`;
  await request.post(`${api}/api/forms`, {
    headers,
    data: { name, description: null, is_public: true }
  });

  // UI: otvori listu i pretraži
  await page.goto('/');
  // Ako imaš placeholder npr. "Search forms", koristi getByPlaceholder:
  // await page.getByPlaceholder(/search/i).fill(name)
  // Ako nemaš, dodaj data-testid="search-input" u kod, pa:
  // await page.getByTestId('search-input').fill(name)
  await page.getByText(/search|pretraga/i).click(); // fallback: fokusiraj polje ako je labela
  await page.keyboard.type(name);
  await expect(page.getByText(name)).toBeVisible();
});
