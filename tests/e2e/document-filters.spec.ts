/**
 * Investor document filters (D-023; docs/WORKER.md), end to end through the local server, which runs
 * the real edge Worker. Expected filter states are derived from the fixture documents with the same
 * visibility rules as each build — never a hand-written list — so every currently valid combination is
 * tested in both builds.
 */
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { documents } from '../../apps/site/src/lib/content/fixtures/data/documents';
import {
  LISTINGS,
  TYPE_SLUGS,
  applyFilter,
  filterOptions,
  filterStates,
  type FilterState,
} from '../../apps/site/src/lib/document-filters';
import {
  WIDTHS,
  expectNoAxeViolations,
  expectNoHorizontalOverflow,
  expectNoPreviewOutput,
  expectOnlyApprovedScripts,
  isPreview,
} from './helpers';

const modeOf = (testInfo: TestInfo) => (isPreview(testInfo) ? 'preview' : 'production');
const query = (state: FilterState) => {
  const params = new URLSearchParams();
  if (state.year) params.set('year', state.year);
  if (state.type) params.set('type', TYPE_SLUGS[state.type] ?? '');
  return `?${params.toString()}`;
};
const ISO_DATE = /\b\d{4}-\d{2}-\d{2}\b/;

async function expectFilteredSeo(page: Page, canonicalPath: string) {
  expect(await page.getAttribute('meta[name="robots"]', 'content')).toMatch(/noindex/);
  const canonical = await page.getAttribute('link[rel="canonical"]', 'href');
  expect(new URL(canonical ?? '').pathname).toBe(canonicalPath);
  expect(new URL(canonical ?? '').search).toBe('');
}

for (const listing of Object.values(LISTINGS)) {
  test.describe(listing.path, () => {
    test('unfiltered page is canonical and indexable (production)', async ({ page }, testInfo) => {
      const response = await page.goto(listing.path);
      expect(response?.status()).toBe(200);
      // Production: no noindex header on the canonical listing. Preview: every response is noindex (D-030 _headers).
      expect(response?.headers()['x-robots-tag']).toBe(isPreview(testInfo) ? 'noindex' : undefined);
      const canonical = await page.getAttribute('link[rel="canonical"]', 'href');
      expect(new URL(canonical ?? '').pathname).toBe(listing.path);
      expect(await page.getAttribute('meta[name="robots"]', 'content')).toBe(
        isPreview(testInfo) ? 'noindex, nofollow' : 'index, follow',
      );
      const options = filterOptions(documents, listing, modeOf(testInfo));
      const hasControls = options.years.length > 0 || options.types.length > 0;
      await expect(page.getByRole('form', { name: `Filter ${listing.noun}` })).toHaveCount(
        hasControls ? 1 : 0,
      );
      expect(await page.locator('main').innerText()).not.toMatch(ISO_DATE);
    });

    test('every valid filter state returns its documents, noindex, canonical to the listing', async ({
      page,
      request,
    }, testInfo) => {
      const mode = modeOf(testInfo);
      const states = filterStates(filterOptions(documents, listing, mode));
      for (const state of states) {
        const url = `${listing.path}${query(state)}`;
        const response = await page.goto(url);
        expect(response?.status(), url).toBe(200);
        expect(response?.headers()['x-robots-tag'], url).toBe('noindex');
        await expectFilteredSeo(page, listing.path);
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(listing.heading);

        // Selected state: in the controls and in words.
        if (state.year) await expect(page.getByLabel('Year')).toHaveValue(state.year);
        if (listing.typeFilter) {
          await expect(page.getByLabel('Report type')).toHaveValue(
            state.type ? (TYPE_SLUGS[state.type] ?? '') : '',
          );
        }
        const expected = applyFilter(documents, listing, state, mode);
        const status = page.locator(`#filters-${listing.key}-status`);
        await expect(status).toContainText('Filtered');
        await expect(status).toContainText(
          expected.length === 0 ? `No ${listing.noun} match` : `Showing ${expected.length}`,
        );
        await expect(page.getByRole('link', { name: 'Clear filters' })).toHaveAttribute(
          'href',
          listing.path,
        );

        // Exactly the expected documents, and nothing else.
        const main = page.locator('main');
        // Registers render a table and cards (one hidden by a container query): check the visible one.
        for (const document of expected) {
          await expect(
            main.getByText(document.title).filter({ visible: true }).first(),
          ).toBeVisible();
        }
        const others = documents.filter(
          (document) => !expected.includes(document) && listing.docTypes.includes(document.docType),
        );
        for (const document of others)
          await expect(main.getByText(document.title, { exact: true })).toHaveCount(0);
        expect(await main.innerText()).not.toMatch(ISO_DATE);

        // Every document link resolves; no PDF links before the document Worker exists.
        const hrefs = await main
          .locator('a[href]')
          .evaluateAll((links) => links.map((l) => l.getAttribute('href') ?? ''));
        expect(hrefs.filter((href) => href.startsWith('/documents/'))).toEqual([]);
        for (const href of hrefs.filter((h) => h.startsWith('/') && !h.startsWith('//'))) {
          expect((await request.get(href)).status(), href).toBe(200);
        }
        await expectOnlyApprovedScripts(page);
        if (!isPreview(testInfo)) await expectNoPreviewOutput(page);
      }
    });

    test('malformed, unsupported and duplicate filters get the unavailable page (400)', async ({
      page,
    }) => {
      const bad = [
        '?year=21',
        '?year=twenty',
        '?year=2021&year=2022',
        '?year=..%2F..%2Findex',
        listing.typeFilter ? '?type=unknown' : '?type=annual',
        listing.typeFilter ? '?type=annual&type=notice' : '?type=quarterly&year=2021',
      ];
      for (const suffix of bad) {
        const response = await page.goto(`${listing.path}${suffix}`);
        expect(response?.status(), suffix).toBe(400);
        expect(response?.headers()['x-robots-tag']).toBe('noindex');
        await expectFilteredSeo(page, listing.path);
        await expect(page.locator('main')).toContainText(
          `That filter is not available for ${listing.noun}`,
        );
        await expect(page.locator('main table, main .register')).toHaveCount(0);
      }
    });

    test('a well-formed filter outside the data gets the unavailable page (404)', async ({
      page,
    }) => {
      const response = await page.goto(`${listing.path}?year=1999`);
      expect(response?.status()).toBe(404);
      expect(response?.headers()['x-robots-tag']).toBe('noindex');
      await expectFilteredSeo(page, listing.path);
      await expect(page.locator('main')).toContainText('That filter is not available');
    });

    test('empty or unrelated parameters show the unfiltered page, noindex', async ({ page }) => {
      for (const suffix of ['?year=', '?year=&type=', '?utm_source=newsletter']) {
        const response = await page.goto(`${listing.path}${suffix}`);
        expect(response?.status(), suffix).toBe(200);
        expect(response?.headers()['x-robots-tag'], suffix).toBe('noindex');
        const canonical = await page.getAttribute('link[rel="canonical"]', 'href');
        expect(new URL(canonical ?? '').pathname).toBe(listing.path);
      }
    });
  });
}

test.describe('filter mechanics', () => {
  test('internal filter pages are not reachable directly', async ({ page }) => {
    for (const path of [
      '/filtered/reports/unavailable',
      '/filtered/announcements/year-2021',
      '/filtered/',
    ]) {
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(404);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Unmapped sheet');
    }
  });

  test('filtered URLs are absent from the sitemap and disallowed in robots.txt', async ({
    request,
  }, testInfo) => {
    test.skip(isPreview(testInfo), 'preview has no sitemap and disallows everything');
    const sitemap = await (await request.get('/sitemap-0.xml')).text();
    expect(sitemap).not.toContain('/filtered/');
    expect(sitemap).not.toMatch(/<loc>[^<]*\?/);
    expect(await (await request.get('/robots.txt')).text()).toContain('Disallow: /filtered/');
  });

  test('production offers no filters and shows no documents while none is approved', async ({
    page,
  }, testInfo) => {
    test.skip(isPreview(testInfo), 'production only');
    for (const listing of Object.values(LISTINGS)) {
      await page.goto(listing.path);
      await expect(page.getByRole('form', { name: `Filter ${listing.noun}` })).toHaveCount(0);
      // A year that exists in the unapproved fixtures is not a filter in production.
      const response = await page.goto(`${listing.path}?year=2021`);
      expect(response?.status()).toBe(404);
      await expectNoPreviewOutput(page);
      for (const document of documents) {
        await expect(page.locator('main').getByText(document.title, { exact: true })).toHaveCount(
          0,
        );
      }
    }
  });

  test('keyboard: choose filters, submit, see the result, clear', async ({ page }, testInfo) => {
    test.skip(!isPreview(testInfo), 'production has no documents to filter yet');
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/investors/reports');
    const year = page.getByLabel('Year');
    await year.focus();
    await page.keyboard.press('ArrowDown'); // All years → 2022
    await expect(year).toHaveValue('2022');
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Report type')).toBeFocused();
    await page.keyboard.press('Tab');
    const apply = page.getByRole('button', { name: 'Apply filters' });
    await expect(apply).toBeFocused();
    const outline = await apply.evaluate((el) => getComputedStyle(el).outlineStyle);
    expect(outline).not.toBe('none');
    await page.keyboard.press('Enter');
    await page.waitForURL(/\/investors\/reports\?year=2022&type=$/);
    await expect(page.locator('#filters-reports-status')).toContainText('2022');
    const clear = page.getByRole('link', { name: 'Clear filters' });
    await clear.focus();
    await page.keyboard.press('Enter');
    await page.waitForURL(/\/investors\/reports$/);
    await expect(page.locator('#filters-reports-status')).toContainText('Showing all');
  });

  test('combined year and type, including a combination with no documents', async ({
    page,
  }, testInfo) => {
    test.skip(!isPreview(testInfo), 'production has no documents to filter yet');
    await page.goto('/investors/reports?year=2022&type=annual');
    await expect(page.locator('#filters-reports-status')).toContainText(
      'Showing 1 report for 2022 · Annual report',
    );
    const empty = await page.goto('/investors/reports?year=2021&type=annual');
    expect(empty?.status()).toBe(200);
    await expect(page.locator('#filters-reports-status')).toContainText(
      'No reports match 2021 · Annual report',
    );
    await expect(page.locator('main table')).toHaveCount(0);
  });

  for (const width of [360, 1280] as const) {
    test(`no WCAG 2.2 AA violations at ${width} px (unfiltered, filtered, empty, unavailable)`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const url of [
        '/investors/reports',
        '/investors/reports?year=2022',
        '/investors/reports?year=2021&type=annual',
        '/investors/announcements?year=2021',
        '/investors/reports?year=abc',
      ]) {
        await page.goto(url);
        await expectNoAxeViolations(page);
      }
    });
  }

  test('no horizontal scroll at 360–1440 px', async ({ page }) => {
    for (const width of [360, 375, ...WIDTHS.slice(1)]) {
      await page.setViewportSize({ width, height: 900 });
      for (const url of [
        '/investors/reports?year=2022&type=notice',
        '/investors/announcements?year=2021',
        '/investors/reports?year=abc',
      ]) {
        await page.goto(url);
        await expectNoHorizontalOverflow(page);
      }
    }
  });
});
