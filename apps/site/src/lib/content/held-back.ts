/**
 * Held-back (HOLD) and banned wording (docs/CONTENT-SOURCE.md; CLAUDE.md §2.3–2.4). Never stored, never rendered, in
 * any mode. Used by the fixture tests and by the Sanity adapter, which refuses any content containing it. The Studio
 * keeps an identical copy for editor validation (apps/studio/validation/rules.ts; a test compares them).
 */
export const HELD_BACK_PATTERNS: readonly RegExp[] = [
  /40\s?Mt/i, // Nicholson exploration-target wording
  /200\s?Mt/i, // Calgoa exploration-target wording
  /25\s?Mt/i, // Calgoa oxide wording
  /smoke/i, // promotional line
  /aircore/i, // Hawkwood outdated work plan
  /entitlement offer/i, // 2021 Entitlement Offer (HOLD)
  /email@email\.com/i,
  /squarespace\.com/i,
  /pexels/i,
  /227\s?Mt/i, // unsourced third-party figures
  /13\.6\s?Mt/i,
  /77\.6\s?Mt/i,
];

export function findHeldBack(text: string): RegExp | undefined {
  return HELD_BACK_PATTERNS.find((pattern) => pattern.test(text));
}
