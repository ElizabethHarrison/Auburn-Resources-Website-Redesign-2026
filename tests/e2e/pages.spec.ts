/**
 * Phase 3 fixed pages: every route in docs/SITEMAP.md §1 outside home, projects and dossiers. Each page
 * resolves in both builds with one H1, a sound outline, SEO tags, its section marked, no client
 * JavaScript, no WCAG 2.2 AA violations and no horizontal scroll at the five review widths. Production
 * pages carry no preview output.
 */
import { expect, test } from '@playwright/test';
import { documents } from '../../apps/site/src/lib/content/fixtures/data/documents';
import {
  WIDTHS,
  expectHeadingOutline,
  expectNoAxeViolations,
  expectNoHorizontalOverflow,
  expectNoPreviewOutput,
  expectOnlyApprovedScripts,
  expectSeoBasics,
  isPreview,
} from './helpers';

interface Route {
  readonly path: string;
  readonly h1: string;
  /** Current label in the section bar; utility and legal pages have none. */
  readonly current?: string;
}

const ROUTES: readonly Route[] = [
  { path: '/company', h1: 'Company overview', current: 'Overview' },
  { path: '/company/leadership', h1: 'Leadership', current: 'Leadership' },
  { path: '/projects/how-we-explore', h1: 'How we explore', current: 'How we explore' },
  { path: '/investors', h1: 'Investor centre', current: 'Investor centre' },
  { path: '/investors/announcements', h1: 'Announcements', current: 'Announcements' },
  { path: '/investors/reports', h1: 'Reports', current: 'Reports' },
  { path: '/investors/presentations', h1: 'Presentations', current: 'Presentations' },
  {
    path: '/investors/shareholders',
    h1: 'Shareholder information',
    current: 'Shareholder information',
  },
  { path: '/investors/governance', h1: 'Governance', current: 'Governance' },
  { path: '/investors/alerts', h1: 'Email alerts', current: 'Email alerts' },
  { path: '/sustainability', h1: 'Sustainability', current: 'Overview' },
  {
    path: '/sustainability/community',
    h1: 'Community and Country',
    current: 'Community and Country',
  },
  {
    path: '/sustainability/environment-safety',
    h1: 'Environment and safety',
    current: 'Environment and safety',
  },
  { path: '/news', h1: 'News', current: 'News' },
  { path: '/news/media', h1: 'Media', current: 'Media' },
  { path: '/contact', h1: 'Contact' },
  { path: '/disclaimer', h1: 'Disclaimer' },
  { path: '/privacy', h1: 'Privacy' },
  { path: '/terms', h1: 'Terms of use' },
];

const announcements = documents.filter(
  (document) => document.docType === 'announcement' && !document.internal,
);

for (const route of ROUTES) {
  test.describe(route.path, () => {
    test('resolves with its H1, outline, SEO tags and only approved scripts', async ({
      page,
    }, testInfo) => {
      const response = await page.goto(route.path);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(route.h1);
      await expectHeadingOutline(page);
      await expectSeoBasics(page, route.path);
      await expectOnlyApprovedScripts(page);
      if (route.current) {
        await expect(page.locator('.section-bar [aria-current="page"]')).toContainText(
          route.current,
        );
      }
      if (!isPreview(testInfo)) await expectNoPreviewOutput(page);
    });

    test('never shows an empty heading or a label without a value', async ({ page }) => {
      await page.goto(route.path);
      const emptyHeadings = await page
        .locator('main h1, main h2, main h3, main h4')
        .evaluateAll(
          (headings) => headings.filter((h) => (h.textContent ?? '').trim() === '').length,
        );
      expect(emptyHeadings).toBe(0);
      // Every section heading is followed by content.
      for (const block of await page.locator('.page-block__body').all()) {
        expect((await block.innerText()).trim().length).toBeGreaterThan(0);
      }
      const orphanLabels = await page
        .locator('main dl')
        .evaluateAll((lists) =>
          lists.filter(
            (list) => list.querySelectorAll('dt').length > list.querySelectorAll('dd').length,
          ),
        );
      expect(orphanLabels).toHaveLength(0);
      // Dates display as DD MMM YYYY, never raw ISO (CLAUDE.md §2.5).
      expect(await page.locator('main').innerText()).not.toMatch(/\b\d{4}-\d{2}-\d{2}\b/);
    });

    for (const width of [360, 1280] as const) {
      test(`no WCAG 2.2 AA violations at ${width} px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(route.path);
        await expectNoAxeViolations(page);
      });
    }

    test('no horizontal scroll at 360–1440 px', async ({ page }) => {
      for (const width of WIDTHS) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(route.path);
        await expectNoHorizontalOverflow(page);
      }
    });
  });
}

test.describe('fixed pages in production', () => {
  test('show no unapproved fixture content', async ({ page }, testInfo) => {
    test.skip(isPreview(testInfo), 'production only');
    for (const route of ROUTES) {
      await page.goto(route.path);
      const text = await page.locator('main').innerText();
      // Fixture values that are all still `toVerify`.
      expect(text, route.path).not.toMatch(
        /info@auburnresources|Florence St|PO Box 3078|39%|Tier 1/,
      );
      expect(text, route.path).not.toMatch(/Nicholas Mather|Board Charter|Annual Report/);
    }
  });

  test('preview shows the fixture content with status markers', async ({ page }, testInfo) => {
    test.skip(!isPreview(testInfo), 'preview only');
    await page.goto('/company');
    await expect(page.getByText('Tier 1', { exact: false })).toBeVisible();
    await expect(page.locator('#at-a-glance').getByText('To verify').first()).toBeAttached();
    await page.goto('/investors/governance');
    await expect(
      page.getByRole('region', { name: /Policies, charters and constitution/ }),
    ).toBeAttached();
    await page.goto('/disclaimer');
    await expect(page.getByText(/not drafted by the web team/)).toBeVisible();
  });
});

test.describe('announcement pages', () => {
  test('preview publishes one page per announcement, linked from the register', async ({
    page,
  }, testInfo) => {
    test.skip(!isPreview(testInfo), 'preview only');
    expect(announcements.length).toBeGreaterThan(0);
    for (const document of announcements) {
      const path = `/investors/announcements/${document.slug}`;
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(200);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(document.title);
      await expect(
        page.getByRole('navigation', { name: 'Breadcrumb' }).locator('[aria-current="page"]'),
      ).toHaveText(document.title);
      await expectHeadingOutline(page);
      await expectSeoBasics(page, path);
      expect(await page.locator('main').innerText()).not.toMatch(/\b\d{4}-\d{2}-\d{2}\b/);
    }
    await page.goto('/investors/announcements');
    const hrefs = await page
      .locator('main a[href^="/investors/announcements/"]')
      .evaluateAll((links) => [...new Set(links.map((link) => link.getAttribute('href')))]);
    expect(hrefs.sort()).toEqual(
      announcements.map((d) => `/investors/announcements/${d.slug}`).sort(),
    );
  });

  for (const width of [360, 1280] as const) {
    test(`announcement page: no WCAG 2.2 AA violations or overflow at ${width} px`, async ({
      page,
    }, testInfo) => {
      test.skip(!isPreview(testInfo), 'preview only: production publishes none yet');
      const first = announcements[0];
      test.skip(first === undefined, 'no announcements');
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/investors/announcements/${first?.slug ?? ''}`);
      await expectNoAxeViolations(page);
      await expectNoHorizontalOverflow(page);
    });
  }

  test('production publishes no unapproved announcement', async ({ page }, testInfo) => {
    test.skip(isPreview(testInfo), 'production only');
    for (const document of announcements) {
      const response = await page.goto(`/investors/announcements/${document.slug}`);
      expect(response?.status(), document.slug).toBe(404);
    }
  });
});

test.describe('404', () => {
  test('answers unknown paths with the unmapped-sheet page', async ({ page }) => {
    const response = await page.goto('/no-such-sheet');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Unmapped sheet');
    expect(await page.getAttribute('meta[name="robots"]', 'content')).toMatch(/noindex/);
    for (const href of ['/', '/company', '/projects', '/investors', '/sustainability', '/news']) {
      await expect(page.locator(`main a[href="${href}"]`).first()).toBeAttached();
    }
    await expectHeadingOutline(page);
    await expectOnlyApprovedScripts(page);
  });

  for (const width of [360, 1280] as const) {
    test(`404: no WCAG 2.2 AA violations or overflow at ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/no-such-sheet');
      await expectNoAxeViolations(page);
      await expectNoHorizontalOverflow(page);
    });
  }
});
