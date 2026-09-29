import { describe, expect, it } from 'vitest';
import {
  type Fact,
  type FactMeta,
  type Interpretation,
  type Narrative,
  CONTENT_STATUSES,
  hasDigits,
  inputNeeded,
  inputNeededLabel,
  isModuleVisible,
  isRenderable,
  isReviewOverdue,
  resolve,
  reviewByDate,
  validateNarrative,
} from './facts';

const meta = (status: FactMeta['status'], extra: Partial<FactMeta> = {}): FactMeta => ({
  sourceDocument: { documentId: 'doc-test' },
  asAt: '2026-09-29',
  status,
  ...extra,
});

const fact = (status: FactMeta['status']): Fact<number> => ({
  kind: 'fact',
  value: 1,
  meta: meta(status),
});

const interpretation = (status: Interpretation['status']): Interpretation => ({
  kind: 'interpretation',
  text: 'Test',
  sources: [{ documentId: 'doc-test' }],
  status,
  asAt: '2026-09-29',
});

const narrative = (status: Narrative['status']): Narrative => ({
  kind: 'narrative',
  text: 'Test',
  status,
});

describe('isRenderable', () => {
  it('renders only approved facts in production', () => {
    const rendered = CONTENT_STATUSES.filter((status) => isRenderable(fact(status), 'production'));
    expect(rendered).toEqual(['approved']);
  });

  it('renders draft, toVerify and approved facts in preview, never superseded', () => {
    const rendered = CONTENT_STATUSES.filter((status) => isRenderable(fact(status), 'preview'));
    expect(rendered).toEqual(['draft', 'toVerify', 'approved']);
  });

  it('applies the same rules to interpretations and narratives', () => {
    for (const status of CONTENT_STATUSES) {
      for (const mode of ['production', 'preview'] as const) {
        expect(isRenderable(interpretation(status), mode)).toBe(isRenderable(fact(status), mode));
        expect(isRenderable(narrative(status), mode)).toBe(isRenderable(fact(status), mode));
      }
    }
  });

  it('shows INPUT NEEDED only in preview', () => {
    expect(isRenderable(inputNeeded('ACN'), 'preview')).toBe(true);
    expect(isRenderable(inputNeeded('ACN'), 'production')).toBe(false);
  });

  it('never renders an absent slot', () => {
    expect(isRenderable(undefined, 'preview')).toBe(false);
    expect(isRenderable(undefined, 'production')).toBe(false);
  });
});

describe('resolve', () => {
  it('returns the value and its status when renderable', () => {
    expect(resolve(fact('toVerify'), 'preview')).toMatchObject({
      kind: 'value',
      status: 'toVerify',
    });
    expect(resolve(fact('approved'), 'production')).toMatchObject({
      kind: 'value',
      status: 'approved',
    });
  });

  it('hides unapproved values in production', () => {
    expect(resolve(fact('toVerify'), 'production')).toEqual({ kind: 'hidden' });
    expect(resolve(fact('draft'), 'production')).toEqual({ kind: 'hidden' });
  });

  it('turns INPUT NEEDED into a placeholder in preview and hides it in production', () => {
    expect(resolve(inputNeeded('ACN'), 'preview')).toEqual({ kind: 'placeholder', brief: 'ACN' });
    expect(resolve(inputNeeded('ACN'), 'production')).toEqual({ kind: 'hidden' });
  });
});

describe('isModuleVisible', () => {
  it('hides a module in production unless every required slot is approved (never half-shown)', () => {
    expect(isModuleVisible([fact('approved'), fact('approved')], 'production')).toBe(true);
    expect(isModuleVisible([fact('approved'), fact('toVerify')], 'production')).toBe(false);
    expect(isModuleVisible([fact('approved'), inputNeeded('Area')], 'production')).toBe(false);
  });

  it('shows a module in preview when it has any slot, so gaps are visible', () => {
    expect(isModuleVisible([inputNeeded('Area')], 'preview')).toBe(true);
    expect(isModuleVisible([undefined], 'preview')).toBe(false);
  });

  it('renders nothing for an empty module', () => {
    expect(isModuleVisible([], 'preview')).toBe(false);
    expect(isModuleVisible([], 'production')).toBe(false);
  });
});

describe('placeholders', () => {
  it('formats the text placeholder', () => {
    expect(inputNeededLabel('ACN for footer')).toBe('[INPUT NEEDED: ACN for footer]');
  });
});

describe('review dates', () => {
  it('defaults reviewBy to asAt plus twelve months', () => {
    expect(reviewByDate(meta('approved'))).toBe('2027-09-29');
  });

  it('clamps 29 February to 28 February', () => {
    expect(reviewByDate(meta('approved', { asAt: '2028-02-29' }))).toBe('2029-02-28');
  });

  it('respects an explicit reviewBy', () => {
    expect(reviewByDate(meta('approved', { reviewBy: '2027-01-01' }))).toBe('2027-01-01');
  });

  it('flags overdue reviews', () => {
    expect(isReviewOverdue(meta('approved'), '2027-09-29')).toBe(false);
    expect(isReviewOverdue(meta('approved'), '2027-09-30')).toBe(true);
  });
});

describe('narrative validation', () => {
  it('detects digits, including non-ASCII digits', () => {
    expect(hasDigits('Exploring under cover')).toBe(false);
    expect(hasDigits('Over 9,300 km²')).toBe(true);
    expect(hasDigits('Arabic-Indic ٣')).toBe(true);
  });

  it('rejects digits, empty text and overlong text', () => {
    expect(validateNarrative('The best rocks are under cover.', 120)).toEqual([]);
    expect(validateNarrative('Ten projects', 5).map((issue) => issue.code)).toEqual(['tooLong']);
    expect(validateNarrative('Tier 1 potential', 120).map((issue) => issue.code)).toEqual([
      'digits',
    ]);
    expect(validateNarrative('  ', 120).map((issue) => issue.code)).toEqual(['empty']);
  });
});
