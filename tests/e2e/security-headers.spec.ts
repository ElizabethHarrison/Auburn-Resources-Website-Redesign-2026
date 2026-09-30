/**
 * Security headers and Content Security Policy (D-030, docs/SECURITY-HEADERS.md), against all four builds on the local
 * edge server: `_headers` applied to static files as Cloudflare static assets will, and the Worker's own headers.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { SECURITY_HEADERS } from '@auburn/security-headers';
import { buildDist, isPreview } from './helpers';

/** Every page in the build, as a route (`company.html` → `/company`), including filter views and 404. */
function htmlFiles(dist: string) {
  return (readdirSync(dist, { recursive: true }) as string[]).filter((file) =>
    file.endsWith('.html'),
  );
}
const routeOf = (file: string) => {
  const route = `/${file.replace(/\\/g, '/').slice(0, -'.html'.length)}`;
  return route === '/index' ? '/' : route;
};
/** The public URLs of a build: every page except internal filter views (served only through the Worker). */
const publicRoutes = (dist: string) =>
  htmlFiles(dist)
    .map(routeOf)
    .filter((route) => !route.startsWith('/filtered/') && route !== '/404');

function cspOf(html: string): string | undefined {
  return /<meta http-equiv="content-security-policy" content="([^"]*)"/i.exec(html)?.[1];
}

test.describe('security headers', () => {
  test('every kind of response carries the security headers', async ({ request }) => {
    for (const path of [
      '/',
      '/company',
      '/investors/reports',
      '/investors/reports?year=2021',
      '/investors/reports?year=bad',
      '/filtered/reports/unavailable',
      '/no-such-page',
      '/about-us',
    ]) {
      const response = await request.get(path, { maxRedirects: 0 });
      for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
        expect(response.headers()[name.toLowerCase()], `${path}: ${name}`).toBe(value);
      }
    }
  });

  test('the build ships a _headers file with every security header', () => {
    const text = readFileSync(join(buildDist(test.info()), '_headers'), 'utf8');
    for (const [name, value] of Object.entries(SECURITY_HEADERS))
      expect(text).toContain(`  ${name}: ${value}\n`);
  });

  test('preview is noindex on every static response; production canonical pages are not', async ({
    request,
  }, testInfo) => {
    const response = await request.get('/company');
    expect(response.headers()['x-robots-tag']).toBe(isPreview(testInfo) ? 'noindex' : undefined);
  });

  test('fingerprinted build assets are cached as immutable', async ({ request }, testInfo) => {
    const asset = readdirSync(join(buildDist(testInfo), '_astro')).find((file) =>
      file.endsWith('.css'),
    );
    expect(asset).toBeDefined();
    const response = await request.get(`/_astro/${asset}`);
    expect(response.status()).toBe(200);
    expect(response.headers()['cache-control']).toBe('public, max-age=31536000, immutable');
  });
});

test.describe('content security policy', () => {
  test('every page has a strict CSP: hashes only, no unsafe-inline or unsafe-eval for scripts or elements', () => {
    const testInfo = test.info();
    const dist = buildDist(testInfo);
    for (const file of htmlFiles(dist)) {
      const html = readFileSync(join(dist, file), 'utf8');
      const csp = cspOf(html);
      expect(csp, `${file} has no CSP meta`).toBeDefined();
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("object-src 'none'");
      expect(csp).toContain("base-uri 'none'");
      expect(csp).toMatch(/script-src 'self'( 'sha256-[A-Za-z0-9+/=]+')+;/);
      expect(csp).not.toContain('unsafe-eval');
      expect(csp).not.toMatch(/script-src[^;]*unsafe-inline/);
      // The CSP must come before anything it governs: no executable script or style precedes it.
      const head = html.slice(0, html.search(/<meta http-equiv="content-security-policy"/i));
      expect(head.replace(/<script type="application\/ld\+json">.*?<\/script>/gs, '')).not.toMatch(
        /<script|<style/,
      );
    }
  });

  test('production pages need no inline style attributes or event handlers', () => {
    const testInfo = test.info();
    test.skip(
      isPreview(testInfo),
      'preview allows style attributes for the catalogue swatches only',
    );
    const dist = buildDist(testInfo);
    for (const file of htmlFiles(dist)) {
      const html = readFileSync(join(dist, file), 'utf8');
      expect(html, file).not.toMatch(/\sstyle="/);
      expect(html, file).not.toMatch(/\son[a-z]+="/);
      expect(cspOf(html), file).not.toContain('unsafe-inline');
    }
  });

  test('no page reports a CSP violation', async ({ page }, testInfo) => {
    test.setTimeout(120_000);
    const violations: string[] = [];
    page.on('console', (message) => {
      if (/content security policy/i.test(message.text()))
        violations.push(`${page.url()}: ${message.text()}`);
    });
    await page.addInitScript(() => {
      document.addEventListener('securitypolicyviolation', (event) => {
        console.error(
          `Content Security Policy violation: ${event.violatedDirective} ${event.blockedURI}`,
        );
      });
    });
    for (const route of publicRoutes(buildDist(testInfo))) {
      await page.goto(route);
      await page.waitForLoadState('load');
    }
    expect(violations).toEqual([]);
  });

  test('the mobile menu still opens and closes under the CSP', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/company');
    await page.locator('button[data-menu-open]').click();
    await expect(page.locator('#mobile-menu')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#mobile-menu')).toBeHidden();
  });
});
