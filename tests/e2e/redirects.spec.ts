/**
 * Redirects from the old site (docs/SITEMAP.md §9, redirects.csv, docs/REDIRECTS.md), served by the local edge server
 * from the `_redirects` file the build emits, as Cloudflare static assets will.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { buildDist, isPreview } from './helpers';

const rows = readFileSync(new URL('../../redirects.csv', import.meta.url), 'utf8')
  .trim()
  .split('\n')
  .slice(1)
  .map((line) => {
    const [from = '', to = '', status = ''] = line.split(',');
    return { from, to, status: Number(status) };
  });

const pageFile = (dist: string, route: string) =>
  join(dist, route === '/' ? 'index.html' : `${route.slice(1)}.html`);

test.describe('old-site redirects', () => {
  test('every redirects.csv row is emitted into the build', () => {
    const testInfo = test.info();
    const emitted = readFileSync(join(buildDist(testInfo), '_redirects'), 'utf8')
      .split('\n')
      .filter((line) => line && !line.startsWith('#'));
    expect(emitted).toEqual(rows.map((r) => `${r.from} ${r.to} ${r.status}`));
  });

  for (const { from, to } of rows) {
    test(`${from} → ${to} (301, one hop)`, async ({ request }, testInfo) => {
      const response = await request.get(from, { maxRedirects: 0 });
      expect(response.status()).toBe(301);
      expect(response.headers()['location']).toBe(to);

      const target = await request.get(to, { maxRedirects: 0 });
      // One hop: the target is a page, never another redirect. Preview has every sitemap route; production withholds
      // pages without approved content (D-019), listed in the readiness report.
      const published = existsSync(pageFile(buildDist(testInfo), to));
      if (isPreview(testInfo)) expect(published, `${to} missing from the preview build`).toBe(true);
      expect(target.status()).toBe(published ? 200 : 404);
    });
  }

  test('pages that exist on both sites are served, not redirected', async ({ request }) => {
    for (const path of ['/projects', '/investors']) {
      const response = await request.get(path, { maxRedirects: 0 });
      expect(response.status(), path).toBe(200);
    }
  });

  test('pending rows are not redirected yet (Q-23, re-hosted PDFs)', async ({ request }) => {
    const response = await request.get('/2021-entitlement-offer', { maxRedirects: 0 });
    expect(response.status()).toBe(404);
  });

  test('the configuration files themselves are never served', async ({ request }) => {
    for (const path of ['/_redirects', '/_headers']) {
      expect((await request.get(path, { maxRedirects: 0 })).status(), path).toBe(404);
    }
  });
});
