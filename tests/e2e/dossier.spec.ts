/**
 * Sheet 02.n · Project dossier — one template for every project. Slugs come from the project fixtures,
 * never a hard-coded list (the verified project list is open, Q-20).
 *
 * Preview builds every dossier with placeholders; production builds none until a project's holding,
 * area and ownership are approved, so every dossier route is a 404 there.
 */
import { expect, test, type Page } from '@playwright/test';
import { projects } from '../../apps/site/src/lib/content/fixtures/data/projects';
import {
  WIDTHS,
  expectHeadingOutline,
  expectNoAxeViolations,
  expectNoHorizontalOverflow,
  expectOnlyApprovedScripts,
  expectSeoBasics,
  isPreview,
  isSanity,
} from './helpers';

const MODULE_IDS = [
  'setting',
  'geology',
  'history',
  'resources',
  'targets',
  'results',
  'photography',
  'milestones',
  'documents',
];
// Two projects with different data shapes: Nicholson (maps, section, prospects) and Victoria River
// Downs (the longest name; no figures).
const SAMPLE = ['nicholson', 'victoria-river-downs'];

async function gotoDossier(page: Page, slug: string) {
  const response = await page.goto(`/projects/${slug}`);
  expect(response?.status()).toBe(200);
}

test.describe('project dossier (preview)', () => {
  // Playwright requires an object pattern for the fixtures argument, even when none is used.
  // eslint-disable-next-line no-empty-pattern
  test.beforeEach(({}, testInfo) => {
    test.skip(!isPreview(testInfo), 'preview only: production publishes no dossier yet');
  });

  for (const project of projects) {
    test(`${project.slug}: resolves with its H1, breadcrumb and sound outline`, async ({
      page,
    }) => {
      await gotoDossier(page, project.slug);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(project.name);
      await expect(page.locator('h1')).toHaveCount(1);
      const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' });
      await expect(breadcrumb.locator('[aria-current="page"]')).toHaveText(
        `${project.sheetNumber} ${project.name}`,
      );
      await expectHeadingOutline(page);
      await expectSeoBasics(page, `/projects/${project.slug}`);
      await expectOnlyApprovedScripts(page);
      await expect(page.locator('.section-bar [aria-current="page"]')).toContainText(project.name);
    });
  }

  test('renders modules 01–09 in the approved order, indexed by the strat column', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoDossier(page, 'nicholson');
    const ids = await page
      .locator('.dossier__modules > section')
      .evaluateAll((sections) => sections.map((section) => section.id));
    expect(ids).toEqual(MODULE_IDS);
    const bands = page.getByRole('navigation', { name: 'On this sheet' }).getByRole('link');
    await expect(bands).toHaveCount(MODULE_IDS.length);
    for (const href of await bands.evaluateAll((links) =>
      links.map((l) => l.getAttribute('href')),
    )) {
      await expect(page.locator(href ?? '#missing')).toHaveCount(1);
    }
  });

  test('never renders an empty heading or a label without a value', async ({ page }) => {
    for (const slug of SAMPLE) {
      await gotoDossier(page, slug);
      // Every module heading is followed by content.
      for (const section of await page.locator('.dossier-section').all()) {
        await expect(section.locator('.dossier-section__body > *').first()).toBeVisible();
      }
      // Every fact label has a value (or its placeholder) beside it.
      const orphanLabels = await page
        .locator('dl')
        .evaluateAll((lists) =>
          lists.filter(
            (list) => list.querySelectorAll('dt').length > list.querySelectorAll('dd').length,
          ),
        );
      expect(orphanLabels).toHaveLength(0);
      const emptyHeadings = await page
        .locator('h1, h2, h3, h4')
        .evaluateAll(
          (headings) => headings.filter((h) => (h.textContent ?? '').trim() === '').length,
        );
      expect(emptyHeadings).toBe(0);
    }
  });

  test('figures have alt text, numbered captions and a source line', async ({ page }, testInfo) => {
    await gotoDossier(page, 'nicholson');
    const images = page.locator('main img');
    if (isSanity(testInfo)) {
      // Indicative mockup graphics never enter the CMS (D-024 §12): the Sanity build shows their INPUT NEEDED frames.
      await expect(images).toHaveCount(0);
      await expect(page.locator('main')).not.toContainText(/indicative/i);
      await expect(page.getByText('Fig. 1 — Nicholson regional setting.')).toBeVisible();
      return;
    }
    expect(await images.count()).toBeGreaterThan(0);
    for (const image of await images.all()) {
      expect((await image.getAttribute('alt'))?.trim()).toBeTruthy();
    }
    for (const figure of await page.locator('.dossier__modules figure').all()) {
      await expect(figure.locator('figcaption')).toContainText(/^\s*Fig\. \d+ — /);
      await expect(figure.locator('figcaption')).toContainText(/Source/i);
    }
    // Mockup-derived figures are labelled indicative and to verify in preview.
    await expect(page.getByText(/indicative/i).first()).toBeVisible();
  });

  test('facts and statements carry source lines', async ({ page }) => {
    await gotoDossier(page, 'nicholson');
    await expect(
      page
        .locator('#setting')
        .getByText(/Source —/i)
        .first(),
    ).toBeVisible();
    await expect(
      page
        .locator('#geology')
        .getByText(/Source —/i)
        .first(),
    ).toBeVisible();
    await expect(
      page
        .locator('#history')
        .getByText(/Source —/i)
        .first(),
    ).toBeVisible();
  });

  test('held-back wording is noted, never quoted; forward-looking modules link to the disclaimer', async ({
    page,
  }) => {
    await gotoDossier(page, 'nicholson');
    const targets = page.locator('#targets');
    await expect(targets.getByText('Held back (not published)')).toBeVisible();
    await expect(page.locator('main')).not.toContainText(/40\s?Mt|200\s?Mt|25\s?Mt/);
    await expect(targets.getByRole('link', { name: 'Read the disclaimer' })).toHaveAttribute(
      'href',
      '/disclaimer',
    );
    await expect(
      page.getByRole('complementary', { name: 'Competent person statement' }),
    ).toBeVisible();
  });

  test('related sheets and previous / next link only to existing dossiers', async ({ page }) => {
    const slugs = new Set(projects.map((project) => `/projects/${project.slug}`));
    await gotoDossier(page, 'calgoa');
    const related = page.locator('.related');
    const hrefs = await related
      .locator('a[href^="/projects/"]')
      .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) expect(slugs.has(href)).toBe(true);
    expect(hrefs).not.toContain('/projects/calgoa');
    await expect(page.locator('a[rel="prev"]')).toHaveAttribute('href', '/projects/nicholson');
    await expect(page.locator('a[rel="next"]')).toHaveAttribute(
      'href',
      '/projects/victoria-river-downs',
    );
  });

  test('is keyboard navigable with a visible focus indicator', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoDossier(page, 'nicholson');
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveText(/skip/i);
    let reachedStrat = false;
    for (let step = 0; step < 60 && !reachedStrat; step++) {
      await page.keyboard.press('Tab');
      const focused = page.locator(':focus');
      const outline = await focused.evaluate((el) => {
        const style = getComputedStyle(el);
        return style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0;
      });
      const insideVisibleOutlineContainer = await focused.evaluate(
        (el) => el.closest('.sheet-card') !== null,
      );
      expect(outline || insideVisibleOutlineContainer).toBe(true);
      reachedStrat = await focused.evaluate((el) => el.closest('.strat') !== null);
    }
    expect(reachedStrat).toBe(true);
    // Activating a strat band moves to its module.
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#setting$/);
  });

  for (const slug of SAMPLE) {
    for (const width of [360, 1280] as const) {
      test(`${slug}: no WCAG 2.2 AA violations at ${width} px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await gotoDossier(page, slug);
        await expectNoAxeViolations(page);
      });
    }
  }

  for (const project of projects) {
    for (const width of WIDTHS) {
      test(`${project.slug}: no horizontal scroll at ${width} px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await gotoDossier(page, project.slug);
        await expectNoHorizontalOverflow(page);
      });
    }
  }
});

test.describe('project dossier (production)', () => {
  test('publishes no dossier while project facts are unapproved', async ({ page }, testInfo) => {
    test.skip(isPreview(testInfo), 'production only');
    for (const project of projects) {
      const response = await page.goto(`/projects/${project.slug}`);
      expect(response?.status(), project.slug).toBe(404);
    }
  });
});
