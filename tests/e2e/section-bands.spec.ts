/**
 * Section bands (D-032, docs/SECTION-BANDS-PLAN.md), checked on every built page of all four builds:
 * - every element drawn in the orange accent reaches 3:1 against the ground it actually sits on
 *   (orange never sits directly on a light-teal or dark-teal band; rule 2);
 * - no dark band runs into the dark footer (rule 4);
 * - legal pages and the 404 page carry no bands (rule 5).
 */
import { readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { buildDist } from './helpers';

function htmlPages(dir: string): string[] {
  const walk = (at: string): string[] =>
    readdirSync(at, { withFileTypes: true }).flatMap((entry) =>
      entry.isDirectory()
        ? entry.name === '_catalogue' || entry.name === '_astro'
          ? []
          : walk(join(at, entry.name))
        : entry.name.endsWith('.html')
          ? [join(at, entry.name)]
          : [],
    );
  return walk(dir).map((file) => {
    const path = `/${relative(dir, file).replace(/\.html$/, '')}`;
    return path === '/index' ? '/' : path;
  });
}

/** Orange-drawn elements whose ground gives less than 3:1 (WCAG 1.4.3 large text / 1.4.11). */
async function orangeFailures(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const ORANGE = [212, 90, 28];
    const parse = (value: string): number[] | undefined => {
      const match = /rgba?\(([^)]+)\)/.exec(value);
      if (!match?.[1]) return undefined;
      const parts = match[1]
        .split(/[\s,/]+/)
        .filter(Boolean)
        .map(Number);
      if (parts.length === 4 && parts[3] === 0) return undefined; // transparent
      return parts.slice(0, 3);
    };
    const isOrange = (value: string) => {
      const rgb = parse(value);
      return rgb !== undefined && rgb.every((channel, index) => channel === ORANGE[index]);
    };
    const luminance = (rgb: number[]) => {
      const [r = 0, g = 0, b = 0] = rgb.map((channel) => {
        const c = channel / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const ratio = (a: number[], b: number[]) => {
      const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
      return (light + 0.05) / (dark + 0.05);
    };
    /** The nearest opaque ground, from `start` upwards. An SVG may draw its own ground (`.ground`). */
    const groundOf = (start: Element | null): number[] => {
      for (let at = start; at; at = at.parentElement) {
        if (at instanceof SVGSVGElement) {
          const drawn = at.querySelector('.ground');
          const fill = drawn ? parse(getComputedStyle(drawn).fill) : undefined;
          if (fill) return fill;
        }
        const background = parse(getComputedStyle(at).backgroundColor);
        if (background) return background;
      }
      return [255, 255, 255];
    };
    const describe = (element: Element) =>
      `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}.${[...element.classList].join('.')} "${(element.textContent ?? '').trim().slice(0, 40)}"`;

    const failures: string[] = [];
    for (const element of document.body.querySelectorAll('*')) {
      if (element.getClientRects().length === 0) continue;
      const style = getComputedStyle(element);
      if (style.visibility === 'hidden') continue;
      const checks: { what: string; ground: number[] }[] = [];
      const ownText = [...element.childNodes].some(
        (node) => node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim() !== '',
      );
      if (ownText && isOrange(style.color))
        checks.push({ what: 'text', ground: groundOf(element) });
      if (
        ['Top', 'Right', 'Bottom', 'Left'].some(
          (side) =>
            style.getPropertyValue(`border-${side.toLowerCase()}-style`) !== 'none' &&
            parseFloat(style.getPropertyValue(`border-${side.toLowerCase()}-width`)) > 0 &&
            isOrange(style.getPropertyValue(`border-${side.toLowerCase()}-color`)),
        )
      ) {
        // A border is identifiable when it contrasts with the ground on either side of it (WCAG 1.4.11):
        // an orange-edged white box on a band passes; a hollow orange tag on a band does not.
        const inside = groundOf(element);
        const outside = groundOf(element.parentElement);
        checks.push({
          what: 'border',
          ground: ratio(ORANGE, inside) >= ratio(ORANGE, outside) ? inside : outside,
        });
      }
      if (isOrange(style.backgroundColor)) {
        checks.push({ what: 'fill', ground: groundOf(element.parentElement) });
      }
      if (element instanceof SVGElement && !(element instanceof SVGSVGElement)) {
        if (isOrange(style.fill) || (style.stroke !== 'none' && isOrange(style.stroke))) {
          checks.push({ what: 'svg', ground: groundOf(element.ownerSVGElement) });
        }
      }
      for (const { what, ground } of checks) {
        const value = ratio(ORANGE, ground);
        if (value < 3) {
          failures.push(
            `${what} ${describe(element)} on rgb(${ground.join(',')}): ${value.toFixed(2)}:1`,
          );
        }
      }
    }
    return failures;
  });
}

test.describe('section bands', () => {
  test('orange reaches 3:1 on its ground, and no dark band meets the footer, on every page', async ({
    page,
  }, testInfo) => {
    test.setTimeout(300_000);
    const failures: string[] = [];
    for (const path of htmlPages(buildDist(testInfo))) {
      await page.goto(path);
      for (const failure of await orangeFailures(page)) failures.push(`${path}: ${failure}`);

      const darkAtEnd = await page.evaluate(() => {
        const main = document.querySelector('main');
        if (!main) return [];
        const bottom = main.getBoundingClientRect().bottom;
        return [...main.querySelectorAll('*')]
          .filter((element) => {
            const box = element.getBoundingClientRect();
            return (
              box.width >= document.documentElement.clientWidth * 0.9 &&
              Math.abs(box.bottom - bottom) <= 1 &&
              getComputedStyle(element).backgroundColor === 'rgb(39, 82, 89)'
            );
          })
          .map((element) => element.className);
      });
      if (darkAtEnd.length > 0)
        failures.push(`${path}: dark band meets the footer (${darkAtEnd.join(', ')})`);
    }
    expect(failures).toEqual([]);
  });

  for (const path of ['/disclaimer', '/privacy', '/terms', '/404']) {
    test(`${path} stays all white`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('main .tone-light, main .tone-dark')).toHaveCount(0);
    });
  }
});
