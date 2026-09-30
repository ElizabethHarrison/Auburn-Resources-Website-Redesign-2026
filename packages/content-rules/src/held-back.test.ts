import { describe, expect, it } from 'vitest';
import { HELD_BACK_PATTERNS, findHeldBack } from './index';

describe('held-back list', () => {
  // The HOLD items and banned strings named in CLAUDE.md §2.3–2.4 and docs/CONTENT-SOURCE.md.
  it.each([
    'Potential for 40Mt resource @ 10% Zn-Pb',
    'Potential for 40 Mt resource',
    '+200Mt sulphide / +25Mt oxide',
    "Where there's smoke, there's fire",
    'Aircore drilling program',
    '2021 Entitlement Offer',
    'mailto:email@email.com',
    'https://static1.squarespace.com/static/x.pdf',
    'Photo: Pexels',
  ])('catches %j', (text) => {
    expect(findHeldBack(text)).toBeDefined();
  });

  it('passes ordinary copy', () => {
    expect(
      findHeldBack('Auburn Resources explores for zinc, copper and gold in Queensland.'),
    ).toBeUndefined();
  });

  it('is frozen in shape: case-insensitive patterns only', () => {
    expect(HELD_BACK_PATTERNS.length).toBeGreaterThan(0);
    for (const pattern of HELD_BACK_PATTERNS) expect(pattern.flags).toContain('i');
  });
});
