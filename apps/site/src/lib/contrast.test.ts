/**
 * Every colour pairing that components use must meet WCAG 2.2 AA. Add a row here whenever a component
 * introduces a new pairing (CLAUDE.md §6: "retest any new colour pairing").
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { AA, contrastRatio } from './contrast';
import { parseTokens, resolveColour } from './tokens';

const tokens = parseTokens(readFileSync(new URL('../styles/tokens.css', import.meta.url), 'utf8'));
const colour = (name: string): string => {
  const value = resolveColour(tokens, name);
  if (!value) throw new Error(`${name} is not a colour token`);
  return value;
};

type Pairing = readonly [foreground: string, background: string, minimum: number, usage: string];

const PAIRINGS: readonly Pairing[] = [
  // Text on paper
  ['--ink-graphite', '--paper', AA.text, 'body text'],
  ['--ink-survey', '--paper', AA.text, 'headings, fact values, button text on light'],
  ['--ink-cyanotype', '--paper', AA.text, 'links, mono labels'],
  ['--ink-muted', '--paper', AA.text, 'source lines, meta'],
  ['--copper-text', '--paper', AA.text, 'commodity tag text, copper small text'],
  ['--copper', '--paper', AA.large, 'large copper type only'],
  // Text on tinted grounds
  ['--ink-cyanotype', '--water', AA.text, 'labels on water bands'],
  ['--ink-graphite', '--water', AA.text, 'body text on water bands'],
  ['--ink-survey', '--band-grey', AA.text, 'text on grey bands'],
  ['--ink-survey', '--paper-deep', AA.text, 'catalogue and preview panels'],
  ['--copper-text', '--paper-deep', AA.text, 'preview banner'],
  ['--copper-text', '--placeholder-fill', AA.text, 'INPUT NEEDED label'],
  ['--ink-graphite', '--placeholder-fill', AA.text, 'INPUT NEEDED brief'],
  ['--copper-text', '--copper-tint', AA.text, 'text on copper tint'],
  // Survey Blue grounds (footer, CTA band, primary button)
  ['--on-survey', '--ink-survey', AA.text, 'text on Survey Blue'],
  ['--on-survey-muted', '--ink-survey', AA.text, 'secondary text in the footer'],
  // Non-text: borders, dots, focus rings (WCAG 1.4.11)
  ['--ink-survey', '--paper', AA.nonText, 'structural rules, button outlines, status dot'],
  ['--copper', '--paper', AA.nonText, 'commodity tag border, status dots'],
  ['--copper', '--placeholder-fill', AA.nonText, 'placeholder dashed border'],
  ['--color-focus', '--paper', AA.nonText, 'focus ring on light grounds'],
  ['--color-focus', '--water', AA.nonText, 'focus ring on water'],
  ['--color-focus', '--paper-deep', AA.nonText, 'focus ring on paper-deep'],
  ['--color-focus-on-dark', '--ink-survey', AA.nonText, 'focus ring on Survey Blue'],
  ['--on-survey', '--ink-survey', AA.nonText, 'light button outline on Survey Blue'],
];

describe('colour contrast (WCAG 2.2 AA)', () => {
  it.each(
    PAIRINGS.map((pairing) => [`${pairing[0]} on ${pairing[1]} (${pairing[3]})`, pairing] as const),
  )('%s', (_, [foreground, background, minimum]) => {
    expect(contrastRatio(colour(foreground), colour(background))).toBeGreaterThanOrEqual(minimum);
  });

  it('records the pairings that fail, so components never use them', () => {
    // Documented in the Phase 2 design review. If a token changes and one of these starts passing, update
    // the review rather than silently relying on it.
    expect(contrastRatio(colour('--ink-muted'), colour('--paper-deep'))).toBeLessThan(AA.text);
    expect(contrastRatio(colour('--ink-cyanotype'), colour('--ink-survey'))).toBeLessThan(
      AA.nonText,
    );
    expect(contrastRatio(colour('--copper'), colour('--ink-survey'))).toBeLessThan(AA.nonText);
    expect(contrastRatio(colour('--ink-contour'), colour('--paper'))).toBeLessThan(AA.nonText);
  });
});

describe('contrastRatio', () => {
  it('matches known WCAG values', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 5);
  });
});
