/**
 * Spacing and density layout (D-033, docs/SPACING-DENSITY-AUDIT.md):
 * - P4: a margin-layout page block sets its heading beside the body from 64rem and above it below 64rem;
 *   wide blocks (grids, registers, fact lists, people, link cards) always keep the heading above;
 * - P5: a page title with an introduction sets it beside the H1 from 64rem;
 * - P9: the phone footer shows the link groups two-up and the contact column full width.
 * The DOM order is unchanged in every case (heading before body), so reading and focus order stay the same.
 */
import { expect, test, type Page } from '@playwright/test';
import { isPreview } from './helpers';

const PAGES = [
  '/company',
  '/investors',
  '/investors/shareholders',
  '/sustainability/community',
  '/contact',
];

async function blockLayouts(page: Page) {
  return page.$$eval('.page-block', (blocks) =>
    blocks.map((block) => {
      const heading = block.querySelector('.section-heading');
      const body = block.querySelector('.page-block__body');
      if (!heading || !body) return { kind: 'missing', beside: false, headingFirst: false };
      const h = heading.getBoundingClientRect();
      const b = body.getBoundingClientRect();
      return {
        kind: block.classList.contains('page-block--wide') ? 'wide' : 'margin',
        beside: b.left >= h.right - 1 && b.top < h.bottom,
        headingFirst: Boolean(
          heading.compareDocumentPosition(body) & Node.DOCUMENT_POSITION_FOLLOWING,
        ),
      };
    }),
  );
}

test.describe('spacing and density layout', () => {
  test('page blocks: heading in the margin at 1280 px, above the body at 768 px (P4)', async ({
    page,
  }, testInfo) => {
    let margins = 0;
    for (const width of [1280, 768]) {
      await page.setViewportSize({ width, height: 900 });
      for (const path of PAGES) {
        await page.goto(path);
        for (const block of await blockLayouts(page)) {
          expect(block.kind, path).not.toBe('missing');
          expect(block.headingFirst, `${path}: heading before body in the DOM`).toBe(true);
          const expectBeside = width >= 1024 && block.kind === 'margin';
          expect(block.beside, `${path} ${block.kind} block at ${width}px`).toBe(expectBeside);
          if (block.kind === 'margin') margins += 1;
        }
      }
    }
    if (isPreview(testInfo)) expect(margins, 'preview renders margin blocks').toBeGreaterThan(0);
  });

  test('page title: introduction beside the H1 from 64rem (P5)', async ({ page }, testInfo) => {
    test.skip(!isPreview(testInfo), 'introductions are placeholders until approved');
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/company');
    const [h1, intro] = await Promise.all([
      page.locator('.page-title__heading').boundingBox(),
      page.locator('.page-title__intro').boundingBox(),
    ]);
    expect(intro && h1 && intro.x >= h1.x + h1.width - 1).toBe(true);
    await page.setViewportSize({ width: 768, height: 900 });
    const [h1Narrow, introNarrow] = await Promise.all([
      page.locator('.page-title__heading').boundingBox(),
      page.locator('.page-title__intro').boundingBox(),
    ]);
    expect(introNarrow && h1Narrow && introNarrow.y >= h1Narrow.y + h1Narrow.height - 1).toBe(true);
  });

  test('phone footer: link groups two-up, contact full width, 44 px targets (P9)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/contact');
    const columns = await page.$$eval('.site-footer__column', (nodes) =>
      nodes.map((node) => {
        const box = node.getBoundingClientRect();
        return { left: Math.round(box.left), width: Math.round(box.width) };
      }),
    );
    const nav = await page.locator('.site-footer__nav').boundingBox();
    const contact = columns.at(-1);
    expect(contact && nav && contact.width).toBeGreaterThan((nav?.width ?? 0) - 2);
    expect(new Set(columns.slice(0, -1).map((column) => column.left)).size).toBe(2);
    const heights = await page.$$eval('.site-footer__column li a', (links) =>
      links.map((link) => link.getBoundingClientRect().height),
    );
    for (const height of heights) expect(height).toBeGreaterThanOrEqual(44);
  });
});
