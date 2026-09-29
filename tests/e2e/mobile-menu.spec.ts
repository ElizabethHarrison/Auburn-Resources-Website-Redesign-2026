/**
 * Mobile menu island (D-021; docs/SITEMAP.md §5; CLAUDE.md §6). Runs against both builds.
 * Below 80rem: "Menu" button → full-screen modal dialog; Escape / Close return focus to the button.
 * From 80rem: the desktop navigation, unchanged, and no menu.
 */
import { expect, test, type Page } from '@playwright/test';
import { SECTIONS } from '../../apps/site/src/lib/navigation';
import { expectNoAxeViolations, expectNoHorizontalOverflow, isPreview } from './helpers';

const MOBILE = [360, 375, 768, 1024] as const;
const DESKTOP = [1280, 1440] as const;
const ALL = [...MOBILE, ...DESKTOP] as const;

const menuButton = (page: Page) => page.locator('button[data-menu-open]');
const dialog = (page: Page) => page.locator('#mobile-menu');

async function openMenu(page: Page) {
  await menuButton(page).click();
  await expect(dialog(page)).toBeVisible();
}

async function hasVisibleFocus(page: Page) {
  return page.evaluate(() => {
    const element = document.activeElement;
    if (!element || element === document.body) return false;
    const style = getComputedStyle(element);
    return style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0;
  });
}

test.describe('below 80rem', () => {
  for (const width of MOBILE) {
    test(`${width} px: shows the Menu button, not the desktop navigation`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/');
      await expect(menuButton(page)).toBeVisible();
      await expect(menuButton(page)).toHaveText('Menu');
      await expect(page.locator('a.menu-trigger--link')).toBeHidden();
      await expect(page.locator('.site-nav')).toBeHidden();
      await expect(dialog(page)).toBeHidden();
    });
  }

  test('button carries the dialog relationship and collapsed state', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/');
    const button = menuButton(page);
    await expect(button).toHaveAttribute('aria-controls', 'mobile-menu');
    await expect(button).toHaveAttribute('aria-haspopup', 'dialog');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(dialog(page)).toHaveCount(1);
    expect(await dialog(page).evaluate((node) => node.tagName)).toBe('DIALOG');
  });

  test('opens, moves focus in, and closes with Close, restoring focus', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/');
    await openMenu(page);
    await expect(menuButton(page)).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('dialog', { name: 'Menu' })).toBeVisible();
    await expect(page.locator('.mobile-menu__close')).toBeFocused();
    await page.locator('.mobile-menu__close').click();
    await expect(dialog(page)).toBeHidden();
    await expect(menuButton(page)).toHaveAttribute('aria-expanded', 'false');
    await expect(menuButton(page)).toBeFocused();
  });

  test('Escape closes it and returns focus to Menu', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/');
    await openMenu(page);
    await page.keyboard.press('Escape');
    await expect(dialog(page)).toBeHidden();
    await expect(menuButton(page)).toHaveAttribute('aria-expanded', 'false');
    await expect(menuButton(page)).toBeFocused();
  });

  test('works from the keyboard, with visible focus, and focus never leaves the open menu', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 768, height: 900 });
    await page.goto('/');
    await menuButton(page).focus();
    await page.keyboard.press('Enter');
    await expect(dialog(page)).toBeVisible();
    await page.keyboard.press('Tab');
    const seen = new Set<string>();
    // The page behind a modal dialog is inert: Tab cycles through the menu and, natively, out to the
    // browser's own controls (activeElement = body) — never to page content behind the menu.
    for (let step = 0; step < 40; step++) {
      const where = await page.evaluate(() => {
        const active = document.activeElement;
        if (!active || active === document.body) return 'browser';
        return document.getElementById('mobile-menu')?.contains(active) ? 'menu' : 'page';
      });
      expect(where, `focus reached the page behind the menu at step ${step}`).not.toBe('page');
      if (where === 'menu') {
        expect(await hasVisibleFocus(page), `no visible focus at step ${step}`).toBe(true);
        seen.add(await page.evaluate(() => document.activeElement?.textContent?.trim() ?? ''));
      }
      await page.keyboard.press('Tab');
    }
    // Every section row is reachable.
    for (const section of SECTIONS)
      expect([...seen].some((text) => text.includes(section.label))).toBe(true);
    // A row opens and closes from the keyboard.
    const row = page.locator('.mobile-menu__summary', { hasText: 'Sustainability' });
    await row.focus();
    const details = row.locator('..');
    const before = await details.evaluate((node) => (node as HTMLDetailsElement).open);
    await page.keyboard.press('Enter');
    expect(await details.evaluate((node) => (node as HTMLDetailsElement).open)).toBe(!before);
    await page.keyboard.press('Space');
    expect(await details.evaluate((node) => (node as HTMLDetailsElement).open)).toBe(before);
    await page.keyboard.press('Escape');
    await expect(menuButton(page)).toBeFocused();
    expect(await hasVisibleFocus(page)).toBe(true);
  });

  test('opens the current section and marks the current page', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/investors/governance');
    await openMenu(page);
    const open = dialog(page).locator('details[open] .mobile-menu__summary');
    await expect(open).toHaveCount(1);
    await expect(open).toContainText('Investors');
    await expect(dialog(page).locator('[aria-current="page"]')).toHaveText(/Governance/);
  });

  test('every menu link resolves', async ({ page, request }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/');
    const hrefs = await dialog(page)
      .locator('a[href]')
      .evaluateAll((links) => [...new Set(links.map((link) => link.getAttribute('href') ?? ''))]);
    const internal = hrefs.filter((href) => href.startsWith('/'));
    const sectionPages = SECTIONS.flatMap((section) => section.pages);
    expect(internal.length).toBeGreaterThanOrEqual(sectionPages.length);
    for (const href of internal) {
      const response = await request.get(href);
      expect(response.status(), href).toBe(200);
    }
    for (const section of SECTIONS) {
      for (const link of section.pages) expect(internal).toContain(link.href);
    }
  });

  test('shows only approved contact details', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/');
    await openMenu(page);
    await expect(dialog(page).getByRole('link', { name: 'Get investor updates' })).toBeVisible();
    await expect(dialog(page).getByRole('link', { name: 'Contact', exact: true })).toBeVisible();
    // The company email is still `toVerify`: preview only.
    await expect(dialog(page).locator('a[href^="mailto:"]')).toHaveCount(
      isPreview(testInfo) ? 1 : 0,
    );
  });

  test('opening causes no layout shift and respects reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/');
    await page.evaluate(() => {
      (window as unknown as { shifts: number }).shifts = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          (window as unknown as { shifts: number }).shifts += (
            entry as unknown as { value: number }
          ).value;
        }
      }).observe({ type: 'layout-shift', buffered: false });
    });
    const before = await page.locator('main').boundingBox();
    await openMenu(page);
    const after = await page.locator('main').boundingBox();
    expect(after).toEqual(before);
    const motion = await dialog(page).evaluate((node) => {
      const style = getComputedStyle(node);
      return { animation: style.animationName, transition: style.transitionDuration };
    });
    expect(motion.animation).toBe('none');
    // No motion of its own; under reduced motion the base stylesheet clamps durations to ~0.
    expect(parseFloat(motion.transition)).toBeLessThan(0.001);
    await page.keyboard.press('Escape');
    expect(await page.evaluate(() => (window as unknown as { shifts: number }).shifts)).toBe(0);
  });

  test('widening the window to desktop closes it', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 800 });
    await page.goto('/');
    await openMenu(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(dialog(page)).toBeHidden();
    await expect(menuButton(page)).toHaveAttribute('aria-expanded', 'false');
  });

  for (const width of [360, 768] as const) {
    test(`no WCAG 2.2 AA violations at ${width} px, closed and open`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/investors');
      await expectNoAxeViolations(page);
      await openMenu(page);
      await expectNoAxeViolations(page);
    });
  }
});

test.describe('from 80rem (desktop)', () => {
  for (const width of DESKTOP) {
    test(`${width} px: desktop navigation unchanged, no menu`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await expect(menuButton(page)).toBeHidden();
      await expect(page.locator('a.menu-trigger--link')).toBeHidden();
      const nav = page.getByRole('navigation', { name: 'Main' });
      await expect(nav).toHaveCount(1);
      const links = nav.getByRole('link');
      await expect(links).toHaveCount(SECTIONS.length);
      for (const [index, section] of SECTIONS.entries()) {
        await expect(links.nth(index)).toHaveAttribute('href', section.href);
        await expect(links.nth(index)).toHaveText(
          new RegExp(`^\\s*${section.id}\\s*${section.label}\\s*$`),
        );
      }
      await expect(page.locator('.site-header__contact')).toHaveAttribute('href', '/contact');
      await expect(page.locator('.site-header__actions a[href="/investors/alerts"]')).toBeVisible();
    });
  }
});

test.describe('all widths', () => {
  for (const width of ALL) {
    test(`${width} px: no horizontal scroll, menu closed and (below 80rem) open`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/projects');
      await expectNoHorizontalOverflow(page);
      if (width < 1280) {
        await openMenu(page);
        const overflow = await dialog(page).evaluate((node) => node.scrollWidth - node.clientWidth);
        expect(overflow).toBeLessThanOrEqual(0);
        await expectNoHorizontalOverflow(page);
      }
    });
  }
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('"Menu" is a link to the footer navigation', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/');
    const link = page.locator('a.menu-trigger--link');
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', '#site-navigation');
    await expect(menuButton(page)).toBeHidden();
    await expect(page.locator('#site-navigation')).toHaveCount(1);
  });
});
