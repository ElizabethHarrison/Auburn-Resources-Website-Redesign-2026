/**
 * End-to-end and accessibility tests (CLAUDE.md §6, §10). Runs against the two static builds:
 *   production → apps/site/dist         (what the public sees)
 *   preview    → apps/site/dist-preview (what editors see: placeholders, status, catalogue)
 * Build both first: `pnpm build && pnpm build:preview`, then `pnpm test:e2e`.
 */
import { defineConfig, devices } from '@playwright/test';

// Specs import fixture records for expected slugs and names. The fixtures read the compile-time
// `__PREVIEW_BUILD__` flag (a Vite define); outside Vite it must exist, and indicative figures are
// never needed by the tests. Workers load this file before any spec.
(globalThis as { __PREVIEW_BUILD__?: boolean }).__PREVIEW_BUILD__ = false;

const PRODUCTION_PORT = 4600;
const PREVIEW_PORT = 4601;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    ...devices['Desktop Chrome'],
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'production', use: { baseURL: `http://localhost:${PRODUCTION_PORT}` } },
    { name: 'preview', use: { baseURL: `http://localhost:${PREVIEW_PORT}` } },
  ],
  webServer: [
    {
      command: `node tests/static-server.mjs apps/site/dist ${PRODUCTION_PORT}`,
      port: PRODUCTION_PORT,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: `node tests/static-server.mjs apps/site/dist-preview ${PREVIEW_PORT}`,
      port: PREVIEW_PORT,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
