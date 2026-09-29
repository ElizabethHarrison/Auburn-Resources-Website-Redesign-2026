import { describe, expect, it } from 'vitest';
import type { Fact } from './facts';
import type { DocumentRecord } from './content/types';
import { documents } from './content/fixtures/data/documents';
import {
  LISTINGS,
  applyFilter,
  describeState,
  filterOptions,
  filterStates,
  stateSlug,
} from './document-filters';

const approved = <T>(value: T): Fact<T> => ({
  kind: 'fact',
  value,
  meta: { sourceDocument: { documentId: 'doc' }, asAt: '2026-09-29', status: 'approved' },
});
const doc = (id: string, docType: DocumentRecord['docType'], date: string): DocumentRecord => ({
  id,
  slug: id,
  title: id,
  docType,
  releaseAt: approved(date as `${number}-${number}-${number}`),
  status: 'approved',
  internal: false,
  file: approved(`${id}.pdf`),
  projectIds: [],
});

describe('filter options come only from visible documents', () => {
  it('offers nothing in production while no document is approved', () => {
    for (const listing of Object.values(LISTINGS)) {
      expect(filterOptions(documents, listing, 'production')).toEqual({ years: [], types: [] });
    }
  });

  it('offers the fixture years and types in preview, newest first', () => {
    expect(filterOptions(documents, LISTINGS.announcements, 'preview')).toEqual({
      years: ['2021'],
      types: [],
    });
    expect(filterOptions(documents, LISTINGS.reports, 'preview')).toEqual({
      years: ['2022', '2021'],
      types: ['annual', 'quarterly', 'notice'],
    });
    // The only presentation is undated: no year can be offered for it.
    expect(filterOptions(documents, LISTINGS.presentations, 'preview')).toEqual({
      years: [],
      types: [],
    });
  });

  it('never offers a year from an unapproved document in production', () => {
    const list = [
      doc('a', 'announcement', '2020-01-02'),
      { ...doc('b', 'announcement', '2019-05-06'), status: 'toVerify' as const },
    ];
    expect(filterOptions(list, LISTINGS.announcements, 'production').years).toEqual(['2020']);
  });
});

describe('filter states', () => {
  it('covers each year, each type and every pair', () => {
    const states = filterStates({ years: ['2022', '2021'], types: ['annual', 'quarterly'] });
    expect(states.map(stateSlug)).toEqual([
      'year-2022',
      'year-2021',
      'type-annual',
      'type-quarterly',
      'year-2022-type-annual',
      'year-2022-type-quarterly',
      'year-2021-type-annual',
      'year-2021-type-quarterly',
    ]);
  });

  it('writes half-year reports as a URL slug', () => {
    expect(stateSlug({ type: 'halfYear' })).toBe('type-half-year');
    expect(describeState({ year: '2022', type: 'halfYear' })).toBe('2022 · Half-year report');
  });
});

describe('applyFilter', () => {
  const list = [
    doc('a', 'annual', '2022-12-23'),
    doc('q', 'quarterly', '2021-02-01'),
    doc('n', 'notice', '2022-12-23'),
    doc('x', 'announcement', '2022-01-01'),
  ];

  it('filters by year, type and both, within the listing only', () => {
    const ids = (state: Parameters<typeof applyFilter>[2]) =>
      applyFilter(list, LISTINGS.reports, state, 'production').map((d) => d.id);
    expect(ids({})).toEqual(['a', 'q', 'n']);
    expect(ids({ year: '2022' })).toEqual(['a', 'n']);
    expect(ids({ type: 'quarterly' })).toEqual(['q']);
    expect(ids({ year: '2021', type: 'annual' })).toEqual([]);
  });
});
