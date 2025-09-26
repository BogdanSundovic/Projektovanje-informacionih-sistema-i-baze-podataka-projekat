// frontend/playwright.config.js
// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/ui',                     // samo naši e2e testovi
  testMatch: ['**/*.spec.{js,ts}'],          // npr. login.spec.js
  testIgnore: ['**/*.test.*', 'src/**'],     // IGNORIŠI React unit testove i ceo src
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:13008', // gde ti Nginx/React radi
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  // Ako frontend već startuješ preko Dockera, nemoj webServer sekciju.
  // Ako želiš da Playwright sam digne dev server, otkomentariši ispod i prilagodi:
  /*
  webServer: {
    command: 'npm start',
    url: process.env.E2E_BASE_URL || 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000,
  },
  */
});
