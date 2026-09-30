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

// The approved brand mapping (D-031; docs/BRAND-MIGRATION-PLAN.md §5.2). Every value is a brand colour.
const PAIRINGS: readonly Pairing[] = [
  // Text on white (--paper)
  ['--ink-graphite', '--paper', AA.text, 'body text (charcoal)'],
  ['--ink-muted', '--paper', AA.text, 'source lines, meta (charcoal)'],
  ['--accent-text', '--paper', AA.text, 'commodity-tag lettering, preview notes (charcoal)'],
  ['--ink-survey', '--paper', AA.text, 'headings, fact values, outline-button text (dark teal)'],
  ['--ink-cyanotype', '--paper', AA.text, 'links, mono labels (dark teal)'],
  ['--accent', '--paper', AA.large, 'large accent type only (orange)'],
  // Text on light-teal bands (--water, --band-grey), full strength
  ['--ink-graphite', '--water', AA.text, 'body text on bands'],
  ['--ink-cyanotype', '--water', AA.text, 'labels on bands (strat column)'],
  ['--ink-cyanotype', '--band-grey', AA.text, 'labels on bands (strat column)'],
  ['--ink-graphite', '--ink-contour', AA.text, 'selected text on the light-teal selection'],
  // Text on peach (--accent-tint, --paper-deep)
  [
    '--ink-survey',
    '--accent-tint',
    AA.text,
    'target number, Auburn band label (4.54:1: narrow margin)',
  ],
  ['--ink-cyanotype', '--accent-tint', AA.text, 'Auburn strat band label'],
  ['--accent-text', '--paper-deep', AA.text, 'preview banner'],
  ['--ink-survey', '--paper-deep', AA.text, 'catalogue and preview panels'],
  // Placeholder (preview only)
  ['--accent-text', '--placeholder-fill', AA.text, 'INPUT NEEDED label'],
  ['--ink-graphite', '--placeholder-fill', AA.text, 'INPUT NEEDED brief'],
  // Dark-teal grounds (footer, CTA band, primary button)
  ['--on-survey', '--ink-survey', AA.text, 'text on dark teal'],
  ['--on-survey-muted', '--ink-survey', AA.text, 'secondary text in the footer'],
  // Non-text: borders, dots, focus rings (WCAG 1.4.11)
  ['--ink-survey', '--paper', AA.nonText, 'structural rules, button outlines, approved status dot'],
  ['--accent', '--paper', AA.nonText, 'commodity-tag border, status dots, map fill'],
  ['--accent', '--placeholder-fill', AA.nonText, 'placeholder dashed border'],
  ['--color-focus', '--paper', AA.nonText, 'focus ring on white'],
  ['--color-focus', '--water', AA.nonText, 'focus ring on light-teal bands'],
  ['--color-focus', '--paper-deep', AA.nonText, 'focus ring on peach'],
  ['--color-focus', '--accent-tint', AA.nonText, 'focus ring on the accent tint'],
  ['--color-focus-on-dark', '--ink-survey', AA.nonText, 'focus ring on dark teal'],
  ['--on-survey', '--ink-survey', AA.nonText, 'light button outline on dark teal'],
];

describe('colour contrast (WCAG 2.2 AA)', () => {
  it.each(
    PAIRINGS.map((pairing) => [`${pairing[0]} on ${pairing[1]} (${pairing[3]})`, pairing] as const),
  )('%s', (_, [foreground, background, minimum]) => {
    expect(contrastRatio(colour(foreground), colour(background))).toBeGreaterThanOrEqual(minimum);
  });

  it('records the pairings that fail, so components never use them', () => {
    // docs/BRAND-MIGRATION-PLAN.md §5.2. If a token changes and one of these starts passing, update the
    // plan rather than silently relying on it.
    const fails = (a: string, b: string, below: number) =>
      expect(contrastRatio(colour(a), colour(b)), `${a} on ${b}`).toBeLessThan(below);
    fails('--accent', '--paper', AA.text); // orange is never small text (3.98:1)
    fails('--on-survey', '--accent', AA.text); // no normal-size white label on an orange fill
    fails('--accent', '--ink-survey', AA.nonText); // no accent on the dark-teal ground (2.17:1)
    fails('--accent', '--water', AA.nonText); // orange map fill on the sea needs a dark-teal outline (2.50:1)
    fails('--accent', '--accent-tint', AA.nonText); // orange on peach (2.10:1)
    fails('--ink-contour', '--paper', AA.nonText); // light-teal rules are decorative only (1.59:1)
    fails('--ink-survey', '--brand-grey', AA.text); // why brand grey is not a band behind labels (3.70:1)
    fails('--brand-logo-blue', '--paper', AA.text); // logo blue is not a text colour (3.79:1)
  });

  it('keeps the approved dark-teal-on-peach pairing at 4.54:1 (do not darken the tint or lighten the text)', () => {
    expect(contrastRatio(colour('--ink-survey'), colour('--accent-tint'))).toBeCloseTo(4.54, 2);
  });
});

describe('contrastRatio', () => {
  it('matches known WCAG values', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 5);
  });
});
