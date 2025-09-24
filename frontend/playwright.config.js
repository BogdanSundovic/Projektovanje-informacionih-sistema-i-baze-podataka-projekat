
const { defineConfig, devices } = require('@playwright/test');
require('dotenv').config({ path: '.env.e2e' });

module.exports = defineConfig({
  testDir: 'tests/ui',
  testMatch: ['**/*.spec.{js,ts}'],
  testIgnore: ['**/src/**'], // ignorisi CRA/Jest testove (npr. App.test.js)
  timeout: 30_000,
  retries: 1,
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
