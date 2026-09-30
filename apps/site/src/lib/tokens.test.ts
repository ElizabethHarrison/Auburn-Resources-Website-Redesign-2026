import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseTokens, resolveColour } from './tokens';

const css = readFileSync(new URL('../styles/tokens.css', import.meta.url), 'utf8');
const tokens = parseTokens(css);
const byName = new Map(tokens.map((token) => [token.name, token]));

describe('design tokens', () => {
  it('keeps the brand palette exactly as the company style guide prints it (D-031)', () => {
    const brand: Record<string, string> = {
      '--brand-dark-teal': '#275259', // RGB 39 82 89
      '--brand-teal': '#81b8c2', // RGB 129 184 194
      '--brand-orange': '#d45a1c', // RGB 212 90 28
      '--brand-charcoal': '#3b3838', // RGB 59 56 56
      '--brand-white': '#ffffff', // swatch labelled "R0 G0 B0", drawn white (Q-54)
      '--brand-mid-teal': '#4899a6', // RGB 72 153 166
      '--brand-light-teal': '#b1d3d9', // RGB 177 211 217
      '--brand-peach': '#f0ad8c', // RGB 240 173 140
      '--brand-grey': '#ada9a9', // RGB 173 169 169
      '--brand-logo-blue': '#1586e2', // RGB 21 134 226
      '--brand-logo-navy': '#012361', // RGB 1 35 97
    };
    for (const [name, value] of Object.entries(brand)) {
      expect(resolveColour(tokens, name), name).toBe(value);
      expect(byName.get(name)?.tag, `${name} should be tagged [A]`).toBe('A');
    }
  });

  it('declares no colour literals other than the brand palette (no derived colours)', () => {
    const literals = tokens.filter((token) => /^#/.test(token.value)).map((token) => token.name);
    expect(literals.sort()).toEqual(
      tokens
        .filter((token) => token.name.startsWith('--brand-'))
        .map((token) => token.name)
        .sort(),
    );
    expect(literals).toHaveLength(11);
  });

  it('maps each colour role to the approved brand colour (BRAND-MIGRATION-PLAN §4.2)', () => {
    const roles: Record<string, string> = {
      '--ink-survey': '--brand-dark-teal',
      '--ink-cyanotype': '--brand-dark-teal',
      '--ink-contour': '--brand-light-teal',
      '--ink-graphite': '--brand-charcoal',
      '--ink-muted': '--brand-charcoal',
      '--paper': '--brand-white',
      '--paper-deep': '--brand-peach',
      '--water': '--brand-light-teal',
      '--band-grey': '--brand-light-teal',
      '--accent': '--brand-orange',
      '--accent-text': '--brand-charcoal',
      '--accent-tint': '--brand-peach',
      '--on-survey': '--brand-white',
      '--on-survey-muted': '--brand-light-teal',
      '--placeholder-fill': '--brand-white',
    };
    for (const [role, brand] of Object.entries(roles)) {
      expect(byName.get(role)?.value, role).toBe(`var(${brand})`);
    }
    expect(byName.get('--placeholder-border')?.value).toBe('var(--accent)');
    expect(byName.get('--status-to-verify')?.value).toBe('var(--accent)');
    expect(byName.get('--status-input-needed')?.value).toBe('var(--accent)');
    expect(byName.get('--status-approved')?.value).toBe('var(--ink-survey)');
  });

  it('keeps the logo colours for the logo only: no role token uses them', () => {
    const users = tokens.filter((token) => /--brand-logo-/.test(token.value)).map((t) => t.name);
    expect(users).toEqual([]);
  });

  it('has no copper tokens left', () => {
    expect(tokens.filter((token) => token.name.includes('copper'))).toEqual([]);
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
