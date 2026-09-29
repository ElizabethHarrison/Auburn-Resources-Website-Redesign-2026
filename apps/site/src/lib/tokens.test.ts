import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseTokens, resolveColour } from './tokens';

const css = readFileSync(new URL('../styles/tokens.css', import.meta.url), 'utf8');
const tokens = parseTokens(css);
const byName = new Map(tokens.map((token) => [token.name, token]));

describe('design tokens', () => {
  it('keeps the approved colour values from docs/DESIGN-DIRECTION.md unchanged', () => {
    const approved: Record<string, string> = {
      '--ink-survey': '#1b3a5c',
      '--ink-cyanotype': '#2c5f8f',
      '--ink-contour': '#a9c1d9',
      '--ink-graphite': '#262a2e',
      '--ink-muted': '#5a6b7c',
      '--paper': '#f5f2ea',
      '--paper-deep': '#ece6d8',
      '--water': '#eef2f4',
      '--band-grey': '#e6ecf1',
      '--copper': '#b8672e',
      '--copper-text': '#8a4a1e',
      '--copper-tint': '#f3e5d8',
      '--on-survey': '#f5f2ea',
      '--on-survey-muted': '#d8e2ec',
      '--placeholder-fill': '#f8efe6',
    };
    for (const [name, value] of Object.entries(approved)) {
      expect(resolveColour(tokens, name), name).toBe(value);
      expect(byName.get(name)?.tag, `${name} should be tagged [A]`).toBe('A');
    }
  });

  it('declares no colour literals other than the approved palette', () => {
    const literals = tokens.filter((token) => /^#/.test(token.value)).map((token) => token.name);
    expect(literals.sort()).toEqual(
      [
        '--ink-survey',
        '--ink-cyanotype',
        '--ink-contour',
        '--ink-graphite',
        '--ink-muted',
        '--paper',
        '--paper-deep',
        '--water',
        '--band-grey',
        '--copper',
        '--copper-text',
        '--copper-tint',
        '--on-survey',
        '--on-survey-muted',
        '--placeholder-fill',
      ].sort(),
    );
  });

  it('keeps the shape rules: radius 0, 1 px rules, 400 weight', () => {
    expect(byName.get('--radius')?.value).toBe('0');
    expect(byName.get('--rule-width')?.value).toBe('1px');
    expect(byName.get('--font-weight-regular')?.value).toBe('400');
  });

  it('keeps the approved type faces', () => {
    expect(byName.get('--font-sans')?.value).toMatch(
      /^'Century Gothic', CenturyGothic, 'Didact Gothic'/,
    );
    expect(byName.get('--font-mono')?.value).toMatch(/^'IBM Plex Mono'/);
  });

  it('tags every literal token as approved [A] or derived [D]', () => {
    const untagged = tokens.filter((token) => !token.value.startsWith('var(') && !token.tag);
    // Composite tokens (built from other tokens) may be untagged.
    const allowed = new Set(['--focus-ring', '--focus-ring-on-dark']);
    expect(untagged.map((token) => token.name).filter((name) => !allowed.has(name))).toEqual([]);
  });
});
