const { test, expect } = require('@playwright/test');

test('UI: registration', async ({ page }) => {
  const u = 'qa' + Date.now();
  await page.goto('/');
  // prilagodi link/route ako je drugacije
  await page.getByRole('link', { name: /sign up|register/i }).click();
  await page.getByLabel(/username/i).fill(u);
  await page.getByLabel(/email/i).fill(`${u}@ex.com`);
  await page.getByLabel(/password/i).fill('p');
  await page.getByRole('button', { name: /register|sign up/i }).click();
  await expect(page.getByText(/forms|dashboard|welcome/i)).toBeVisible();
});
