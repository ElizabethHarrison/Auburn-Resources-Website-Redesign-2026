/** Shared checks for page tests. */
import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, type TestInfo } from '@playwright/test';

/** Required viewport widths (Phase 3 brief; CLAUDE.md §10). */
export const WIDTHS = [360, 768, 1024, 1280, 1440] as const;

export const isPreview = (testInfo: TestInfo) => testInfo.project.name === 'preview';

/** WCAG 2.2 A/AA rules only; best-practice findings are reviewed by hand. */
export async function expectNoAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const summary = results.violations.map(
    (violation) =>
      `${violation.id} (${violation.impact}): ${violation.nodes.map((node) => node.target.join(' ')).join(', ')}`,
  );
  expect(summary).toEqual([]);
}

/** No horizontal page scroll at the current viewport. */
export async function expectNoHorizontalOverflow(page: Page) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth, 'page scrolls horizontally').toBeLessThanOrEqual(clientWidth);
}

/** One H1 and no skipped heading levels (CLAUDE.md §6). */
export async function expectHeadingOutline(page: Page) {
  const levels = await page.$$eval('h1, h2, h3, h4, h5, h6', (headings) =>
    headings
      .filter((heading) => heading.getClientRects().length > 0)
      .map((heading) => Number(heading.tagName[1])),
  );
  expect(levels.filter((level) => level === 1)).toHaveLength(1);
  levels.reduce((previous, level) => {
    expect(level - previous, `heading jumps from h${previous} to h${level}`).toBeLessThanOrEqual(1);
    return level;
  }, 1);
}

/** Page-level SEO tags (CLAUDE.md §7). */
export async function expectSeoBasics(page: Page, expectedCanonicalPath: string) {
  await expect(page).toHaveTitle(/Auburn Resources/);
  expect(await page.getAttribute('html', 'lang')).toBe('en-AU');
  const description = await page.getAttribute('meta[name="description"]', 'content');
  expect(description?.length ?? 0).toBeGreaterThan(50);
  const canonical = await page.getAttribute('link[rel="canonical"]', 'href');
  expect(new URL(canonical ?? '').pathname).toBe(expectedCanonicalPath);
  expect(await page.getAttribute('meta[property="og:title"]', 'content')).toBeTruthy();
}

/** Production pages must carry no preview-only output (CLAUDE.md §2.1). */
export async function expectNoPreviewOutput(page: Page) {
  await expect(page.locator('[data-preview-only]')).toHaveCount(0);
  const text = await page.locator('body').innerText();
  expect(text).not.toMatch(/input needed|preview build|specimen/i);
}

/**
 * The only client JavaScript is the approved mobile-menu island (D-021): one small inline module. Any
 * other script (or a second copy) fails, so new islands must be added here deliberately.
 */
export async function expectOnlyApprovedScripts(page: Page) {
  const scripts = await page.$$eval('script:not([type="application/ld+json"])', (nodes) =>
    nodes.map((node) => ({
      type: node.getAttribute('type'),
      src: node.getAttribute('src'),
      text: node.textContent ?? '',
    })),
  );
  expect(scripts).toHaveLength(1);
  const [menu] = scripts;
  expect(menu?.type).toBe('module');
  expect(menu?.src).toBeNull();
  expect(menu?.text).toContain('mobile-menu');
  expect(menu?.text.length ?? 0).toBeLessThan(1024);
}
