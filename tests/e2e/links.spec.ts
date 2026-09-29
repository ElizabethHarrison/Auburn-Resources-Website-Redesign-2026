/**
 * Link integrity in each build: crawl every page reachable from the home page and check that every
 * internal link resolves (200) and every in-page anchor has a target. Also checks the XML sitemap lists
 * only pages that exist, and that nothing links to an unbuilt page.
 *
 * `/documents/*.pdf` is served by the edge Worker (D-001, Phase 4+), not the static build: those links
 * are collected and must not appear until the Worker exists (no document file is approved yet).
 */
import { expect, test } from '@playwright/test';

test('every internal link resolves and every anchor has a target', async ({ page, request }) => {
  test.setTimeout(180_000);
  const queue = ['/'];
  const visited = new Set<string>();
  const broken: string[] = [];
  const pdfLinks: string[] = [];
  while (queue.length > 0) {
    const path = queue.shift() as string;
    if (visited.has(path)) continue;
    visited.add(path);
    const response = await page.goto(path);
    if (response?.status() !== 200) {
      broken.push(`${path} → ${response?.status()}`);
      continue;
    }
    const { links, missingAnchors } = await page.evaluate(() => {
      const hrefs = [...document.querySelectorAll('a[href]')].map(
        (a) => a.getAttribute('href') ?? '',
      );
      const missing = hrefs
        .filter((href) => href.startsWith('#') && href.length > 1)
        .filter((href) => !document.getElementById(decodeURIComponent(href.slice(1))));
      return { links: hrefs, missingAnchors: missing };
    });
    for (const anchor of missingAnchors) broken.push(`${path}: anchor ${anchor} has no target`);
    for (const href of links) {
      if (!href.startsWith('/') || href.startsWith('//')) continue;
      const target = href.split('#')[0]?.split('?')[0] ?? '';
      if (target.startsWith('/documents/')) {
        pdfLinks.push(`${path} → ${target}`);
        continue;
      }
      if (target !== '' && !visited.has(target)) queue.push(target);
    }
  }
  expect(broken).toEqual([]);
  expect(pdfLinks, 'PDF links need the document Worker').toEqual([]);
  expect(visited.size).toBeGreaterThan(15);

  // The XML sitemap lists only pages that exist (and, in production, only reachable ones).
  const index = await request.get('/sitemap-0.xml');
  if (index.ok()) {
    const xml = await index.text();
    const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (match) => new URL(match[1] ?? '').pathname,
    );
    for (const path of paths) {
      const response = await request.get(path);
      expect(response.status(), path).toBe(200);
      expect(visited.has(path), `${path} is in the sitemap but not linked`).toBe(true);
    }
  }
});
