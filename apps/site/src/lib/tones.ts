/**
 * Section tones (D-032, docs/SECTION-BANDS-PLAN.md): the ground a full-width section sits on. White is the page
 * ground; light teal and dark teal bands are assigned per section by the page, for visual rhythm. The colours and
 * role re-declarations live in styles/tokens.css (`.tone-light`, `.tone-dark`).
 */
export type Tone = 'white' | 'light' | 'dark';

/** The class a section wrapper carries for its tone (none for white). */
export function toneClass(tone: Tone | undefined): string | undefined {
  return tone === 'light' || tone === 'dark' ? `tone-${tone}` : undefined;
}
