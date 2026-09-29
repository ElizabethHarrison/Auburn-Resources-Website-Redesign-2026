/**
 * Static rules for the design system (docs/DESIGN-DIRECTION.md; CLAUDE.md §3, §5, §8). They scan the
 * source so a rule is broken in CI, not discovered in review.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC = new URL('..', import.meta.url).pathname;

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const files = walk(SRC).filter(
  (path) => /\.(astro|css|ts)$/.test(path) && !path.endsWith('.test.ts'),
);
const rel = (path: string) => relative(SRC, path);
const read = (path: string) => readFileSync(path, 'utf8');

/** CSS in a file (whole .css files, or the <style> blocks of .astro files), comments removed. */
function cssOf(path: string): string {
  const raw = path.endsWith('.css')
    ? read(path)
    : path.endsWith('.astro')
      ? [...read(path).matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n')
      : '';
  return raw.replace(/\/\*[\s\S]*?\*\//g, '');
}

/** Files declaring `property` with a value outside `allowed`. */
function badDeclarations(property: string, allowed: readonly string[]) {
  return styled.flatMap((path) =>
    [...cssOf(path).matchAll(new RegExp(`(?<![\\w-])${property}\\s*:\\s*([^;}]+)`, 'g'))]
      .map((m) => (m[1] ?? '').trim())
      .filter((value) => !allowed.includes(value))
      .map((value) => `${rel(path)}: ${property}: ${value}`),
  );
}

const styled = files.filter((path) => cssOf(path).trim().length > 0);
const astroFiles = files.filter((path) => path.endsWith('.astro'));

function violations(
  pattern: RegExp,
  sources: string[],
  text: (path: string) => string,
  allow: (path: string) => boolean = () => false,
) {
  return sources.filter((path) => !allow(path) && pattern.test(text(path))).map(rel);
}

describe('design tokens only', () => {
  it('uses no colour literals outside tokens.css', () => {
    expect(
      violations(/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i, styled, cssOf, (p) =>
        p.endsWith('tokens.css'),
      ),
    ).toEqual([]);
  });

  it('uses no shadows or gradients', () => {
    expect(violations(/box-shadow\s*:(?!\s*none)|text-shadow|gradient\(/i, styled, cssOf)).toEqual(
      [],
    );
  });

  it('keeps corners square (border-radius only via the radius token)', () => {
    expect(badDeclarations('border-radius', ['var(--radius)', '0'])).toEqual([]);
  });

  it('uses weight 400 only, via the token', () => {
    expect(badDeclarations('font-weight', ['var(--font-weight-regular)'])).toEqual([]);
  });

  it('uses !important only in the base layer utilities', () => {
    expect(violations(/!important/, styled, cssOf, (p) => p.endsWith('base.css'))).toEqual([]);
  });
});

describe('breakpoints', () => {
  const ALLOWED = new Set([
    '(min-width: 48rem)',
    '(min-width: 64rem)',
    '(min-width: 80rem)',
    '(min-width: 90rem)',
    '(max-width: 47.99rem)',
    '(prefers-reduced-motion: reduce)',
    '(prefers-reduced-motion: no-preference)',
  ]);

  it('uses only the documented breakpoints (tokens.css)', () => {
    const found = styled.flatMap((path) =>
      [...cssOf(path).matchAll(/@media\s*([^{]+)\{/g)].map((m) => ({
        path: rel(path),
        query: (m[1] ?? '').trim(),
      })),
    );
    expect(found.filter(({ query }) => !ALLOWED.has(query))).toEqual([]);
  });
});

describe('zero JavaScript in the design system', () => {
  it('has no client directives or scripts (except JSON-LD) in Astro components', () => {
    const bad = astroFiles.filter((path) => {
      const source = read(path);
      const scripts = [...source.matchAll(/<script\b[^>]*>/g)].filter(
        (m) => !m[0].includes('application/ld+json'),
      );
      return /\bclient:[a-z]+/.test(source) || scripts.length > 0;
    });
    expect(bad.map(rel)).toEqual([]);
  });

  it('uses inline style attributes only in the preview-only catalogue (CSP-friendly components)', () => {
    const bad = astroFiles.filter(
      (path) => !rel(path).startsWith('catalogue/') && /\sstyle=\{|\sstyle="/.test(read(path)),
    );
    expect(bad.map(rel)).toEqual([]);
  });
});

describe('layering and safeguards', () => {
  it('keeps primitives free of pattern imports', () => {
    const bad = astroFiles.filter(
      (path) =>
        rel(path).startsWith('components/primitives/') && /from '\.\.\/patterns\//.test(read(path)),
    );
    expect(bad.map(rel)).toEqual([]);
  });

  it('imports catalogue specimens only from the catalogue', () => {
    const bad = files.filter(
      (path) => !rel(path).startsWith('catalogue/') && /catalogue\/specimens/.test(read(path)),
    );
    expect(bad.map(rel)).toEqual([]);
  });

  it('marks every preview-only element so CI can detect leaks into production', () => {
    for (const name of ['Placeholder.astro', 'StatusDot.astro']) {
      expect(read(join(SRC, 'components/patterns', name))).toContain('data-preview-only');
    }
  });

  it('gives every component a typed Props interface', () => {
    const components = astroFiles.filter((path) => rel(path).startsWith('components/'));
    const missing = components.filter(
      (path) => /Astro\.props/.test(read(path)) && !/export interface Props/.test(read(path)),
    );
    expect(missing.map(rel)).toEqual([]);
  });
});
