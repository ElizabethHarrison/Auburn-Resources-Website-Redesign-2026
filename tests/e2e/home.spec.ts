/**
 * Sheet 00 · Home — structure, content safeguards, responsive behaviour and accessibility, in both
 * the production and the preview build.
 */
import { expect, test } from '@playwright/test';
import {
  WIDTHS,
  expectHeadingOutline,
  expectNoAxeViolations,
  expectNoHorizontalOverflow,
  expectNoPreviewOutput,
  expectNoScripts,
  expectSeoBasics,
  isPreview,
} from './helpers';

test.describe('home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('has the page frame, one H1 and a sound heading outline', async ({ page }) => {
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expectHeadingOutline(page);
  });

  test('has title, description, canonical and Open Graph tags', async ({ page }) => {
    await expectSeoBasics(page, '/');
  });

  test('ships no client JavaScript', async ({ page }) => {
    await expectNoScripts(page);
  });

  test('links to the portfolio from the hero', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Explore the projects' })).toHaveAttribute(
      'href',
      '/projects',
    );
  });

  test('skip link is the first tab stop and targets main', async ({ page }) => {
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to content' });
    await expect(skip).toBeFocused();
    await expect(skip).toHaveAttribute('href', '#main');
  });

  test('production shows only approved content', async ({ page }, testInfo) => {
    test.skip(isPreview(testInfo), 'production only');
    await expectNoPreviewOutput(page);
    // Nothing in the fixtures is approved, so the working headline must not publish.
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Auburn Resources');
    await expect(page.getByText(/great base-metal deposits/)).toHaveCount(0);
    // Unapproved modules are omitted entirely, headings included.
    await expect(page.getByRole('heading', { name: 'The register' })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'The portfolio, sheet by sheet' })).toHaveCount(
      0,
    );
    await expect(page.getByRole('region', { name: 'Key facts', exact: true })).toHaveCount(0);
    // Q-08 is open: no "latest presentation" link.
    await expect(page.getByText(/latest presentation/i)).toHaveCount(0);
    expect(await page.getAttribute('meta[name="robots"]', 'content')).toBe('index, follow');
  });

  test('preview shows working copy with status, and placeholders for gaps', async ({
    page,
  }, testInfo) => {
    test.skip(!isPreview(testInfo), 'preview only');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'great base-metal deposits',
    );
    await expect(page.getByRole('region', { name: 'Key facts', exact: true })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'The portfolio, sheet by sheet' }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'The register' })).toBeVisible();
    await expect(page.locator('[data-preview-only]').first()).toBeVisible();
    await expect(page.getByText('Fig. 1 — Auburn project portfolio')).toBeVisible();
    expect(await page.getAttribute('meta[name="robots"]', 'content')).toBe('noindex, nofollow');
  });

  for (const width of WIDTHS) {
    test(`no horizontal scroll at ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await expectNoHorizontalOverflow(page);
    });
  }

  for (const width of [360, 1280] as const) {
    test(`no WCAG 2.2 AA violations at ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await expectNoAxeViolations(page);
    });
  }

  test('shows the full navigation from 1280 px and the compact menu below', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 900 });
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Menu' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Main' })).toBeHidden();
    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Menu' })).toBeHidden();
  });
});
