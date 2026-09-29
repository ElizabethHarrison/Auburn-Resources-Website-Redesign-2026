/** The design-system catalogue exists only in preview builds (D-013). */
import { expect, test } from '@playwright/test';
import { isPreview } from './helpers';

test('catalogue is preview-only and noindex', async ({ page }, testInfo) => {
  const response = await page.goto('/_catalogue');
  if (isPreview(testInfo)) {
    expect(response?.status()).toBe(200);
    expect(await page.getAttribute('meta[name="robots"]', 'content')).toBe('noindex, nofollow');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Design-system catalogue' }),
    ).toBeVisible();
  } else {
    expect(response?.status()).toBe(404);
  }
});
