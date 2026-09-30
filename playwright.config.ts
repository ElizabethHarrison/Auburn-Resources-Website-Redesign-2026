/**
 * End-to-end and accessibility tests (CLAUDE.md §6, §10). Runs against four static builds:
 *   production        → apps/site/dist                (fixtures; what the public sees)
 *   preview           → apps/site/dist-preview        (fixtures; placeholders, status, catalogue)
 *   sanity-production → apps/site/dist-sanity         (the Sanity adapter over the NDJSON snapshot, D-024)
 *   sanity-preview    → apps/site/dist-sanity-preview
 * Build them first (`pnpm build && pnpm build:preview && pnpm build:sanity-export`), then `pnpm test:e2e`.
 */
import { defineConfig, devices } from '@playwright/test';

// Specs import fixture records for expected slugs and names. The fixtures read the compile-time
// `__PREVIEW_BUILD__` flag (a Vite define); outside Vite it must exist, and indicative figures are
// never needed by the tests. Workers load this file before any spec.
(globalThis as { __PREVIEW_BUILD__?: boolean }).__PREVIEW_BUILD__ = false;

const PRODUCTION_PORT = 4600;
const PREVIEW_PORT = 4601;
const SANITY_PRODUCTION_PORT = 4602;
const SANITY_PREVIEW_PORT = 4603;

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
    { name: 'sanity-production', use: { baseURL: `http://localhost:${SANITY_PRODUCTION_PORT}` } },
    { name: 'sanity-preview', use: { baseURL: `http://localhost:${SANITY_PREVIEW_PORT}` } },
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
    {
      command: `node tests/static-server.mjs apps/site/dist-sanity ${SANITY_PRODUCTION_PORT}`,
      port: SANITY_PRODUCTION_PORT,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: `node tests/static-server.mjs apps/site/dist-sanity-preview ${SANITY_PREVIEW_PORT}`,
      port: SANITY_PREVIEW_PORT,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
