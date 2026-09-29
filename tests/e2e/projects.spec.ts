/**
 * Sheet 02 · Projects — the portfolio. Expected slugs come from the project fixtures, never a
 * hard-coded list, because the verified project list is still open (Q-20).
 */
import { expect, test } from '@playwright/test';
import { projects } from '../../apps/site/src/lib/content/fixtures/data/projects';
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

const expectedHrefs = projects.map((project) => `/projects/${project.slug}`).sort();

test.describe('projects portfolio', () => {
  test.beforeEach(async ({ page }) => {
    const response = await page.goto('/projects');
    expect(response?.status()).toBe(200);
  });

  test('has the H1, breadcrumb and sound heading outline', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Project portfolio');
    const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' });
    await expect(breadcrumb.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    await expect(breadcrumb.locator('[aria-current="page"]')).toHaveText('02 Projects');
    await expectHeadingOutline(page);
  });

  test('has SEO tags and breadcrumb structured data', async ({ page }) => {
    await expectSeoBasics(page, '/projects');
    const jsonLd = await page.locator('script[type="application/ld+json"]').first().textContent();
    expect(jsonLd).toContain('BreadcrumbList');
  });

  test('ships only the approved mobile-menu script', async ({ page }) => {
    await expectOnlyApprovedScripts(page);
  });

  test('marks 02 Projects as the current section and the portfolio as the current page', async ({
    page,
  }) => {
    await expect(page.locator('.section-bar [aria-current="page"]')).toContainText('Portfolio');
  });

  test('always links to How we explore and the disclaimer', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'How we explore' }).last()).toHaveAttribute(
      'href',
      '/projects/how-we-explore',
    );
    await expect(page.getByRole('link', { name: /disclaimer/i }).first()).toHaveAttribute(
      'href',
      '/disclaimer',
    );
  });

  test('preview lists every project from content, linked by slug', async ({ page }, testInfo) => {
    test.skip(!isPreview(testInfo), 'preview only');
    const cards = page.locator('.sheet-card');
    await expect(cards).toHaveCount(projects.length);
    const cardHrefs = (
      await page
        .locator('.sheet-card__link')
        .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''))
    ).sort();
    expect(cardHrefs).toEqual(expectedHrefs);
    // The register (the map's text equivalent) links to the same dossiers.
    const registerHrefs = (
      await page
        .getByRole('region', { name: /project register/i })
        .locator('tbody a')
        .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''))
    ).sort();
    expect(registerHrefs).toEqual(expectedHrefs);
    // Long names stay whole: every card name renders on its own words, never split mid-word by CSS.
    for (const project of projects) {
      await expect(page.locator('.sheet-card__link', { hasText: project.name })).toBeVisible();
    }
    await expect(page.locator('[data-preview-only]').first()).toBeVisible();
    await expect(page.getByText('Fig. 1 — Auburn project portfolio')).toBeVisible();
  });

  test('production omits unapproved projects entirely', async ({ page }, testInfo) => {
    test.skip(isPreview(testInfo), 'production only');
    await expectNoPreviewOutput(page);
    // No project is confirmed as held (Q-20), so no cards, register, pipeline or map.
    await expect(page.locator('.sheet-card')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Project sheets' })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Project register' })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Exploration pipeline' })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Portfolio map' })).toHaveCount(0);
    await expect(page.getByRole('region', { name: 'Portfolio summary' })).toHaveCount(0);
    for (const project of projects) {
      await expect(page.getByRole('link', { name: project.name })).toHaveCount(0);
    }
  });

  for (const width of WIDTHS) {
    test(`no horizontal scroll at ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/projects');
      await expectNoHorizontalOverflow(page);
    });
  }

  for (const width of [360, 1280] as const) {
    test(`no WCAG 2.2 AA violations at ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/projects');
      await expectNoAxeViolations(page);
    });
  }
});
