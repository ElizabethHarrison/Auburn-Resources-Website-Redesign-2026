import { describe, expect, it } from 'vitest';
import { factMetaIssue, heldBackIssue, interpretationIssue, narrativeIssue } from './rules';

const ref = (id: string) => ({ _ref: id });

describe('studio guardrails', () => {
  it('rejects digits in narrative', () => {
    expect(narrativeIssue('Exploring under cover.')).toBe(true);
    expect(narrativeIssue('Ten projects')).toBe(true);
    expect(narrativeIssue('10 projects')).toMatch(/digits/);
    expect(narrativeIssue('abcdef', 3)).toMatch(/At most/);
  });

  it('rejects held-back wording anywhere', () => {
    expect(heldBackIssue('Potential for 40Mt resource')).toMatch(/held-back/);
    expect(heldBackIssue('Planned aircore drilling')).toMatch(/held-back/);
    expect(heldBackIssue('Drill target defined.')).toBe(true);
  });

  it('needs a source to leave draft and full provenance to approve', () => {
    expect(factMetaIssue(undefined, false)).toBe(true);
    expect(factMetaIssue({ status: 'draft' }, true)).toBe(true);
    expect(factMetaIssue({ status: 'toVerify' }, true)).toMatch(/source/);
    expect(factMetaIssue({ status: 'toVerify', sourceDocument: ref('doc') }, true)).toBe(true);
    expect(factMetaIssue({ status: 'approved', sourceDocument: ref('doc') }, true)).toMatch(
      /as-at date, approved by, approval date/,
    );
    expect(
      factMetaIssue(
        {
          status: 'approved',
          sourceDocument: ref('doc'),
          asAt: '2026-09-29',
          approvedBy: ref('p'),
          approvedAt: '2026-09-29T00:00:00Z',
        },
        true,
      ),
    ).toBe(true);
  });

  it('needs sources and a reviewer for interpretation', () => {
    expect(interpretationIssue({ text: 'x', status: 'toVerify' })).toMatch(/source/);
    expect(interpretationIssue({ text: 'x', status: 'approved', sources: [ref('d')] })).toMatch(
      /reviewer/,
    );
    expect(
      interpretationIssue({
        text: 'x',
        status: 'approved',
        sources: [ref('d')],
        asAt: '2026-09-29',
        reviewedBy: ref('p'),
      }),
    ).toBe(true);
  });
});

describe('held-back list', () => {
  it('is the shared list the site build uses (one list, no copy)', async () => {
    const shared = await import('@auburn/content-rules');
    const { HELD_BACK_PATTERNS } = await import('./rules');
    expect(HELD_BACK_PATTERNS).toBe(shared.HELD_BACK_PATTERNS);
  });
});
