import { describe, expect, it } from 'vitest';
import { decide } from './document-filters.ts';

const at = (path: string) => decide(new URL(path, 'https://auburnresources.com.au'));

describe('valid filters map to prebuilt pages', () => {
  it.each([
    ['/investors/announcements?year=2021', '/filtered/announcements/year-2021'],
    ['/investors/presentations?year=2022', '/filtered/presentations/year-2022'],
    ['/investors/reports?year=2022', '/filtered/reports/year-2022'],
    ['/investors/reports?type=half-year', '/filtered/reports/type-half-year'],
    ['/investors/reports?year=2022&type=quarterly', '/filtered/reports/year-2022-type-quarterly'],
    ['/investors/reports?type=quarterly&year=2022', '/filtered/reports/year-2022-type-quarterly'],
    ['/investors/reports?year=2022&type=', '/filtered/reports/year-2022'],
    ['/investors/reports.html?year=2022', '/filtered/reports/year-2022'],
  ])('%s → %s', (path, asset) => {
    expect(at(path)).toEqual({
      kind: 'filter',
      asset,
      fallback: asset.replace(/[^/]+$/, 'unavailable'),
    });
  });
});

describe('everything else', () => {
  it('passes through non-listing paths and plain listing URLs untouched', () => {
    for (const path of [
      '/',
      '/investors',
      '/investors/reports',
      '/investors/governance?year=2022',
      '/x?type=annual',
    ]) {
      expect(at(path), path).toEqual({ kind: 'pass' });
    }
  });

  it('serves the unfiltered page (noindex) for queries with no filter value', () => {
    for (const path of [
      '/investors/reports?year=&type=',
      '/investors/announcements?utm_source=x',
      '/investors/reports?page=2',
    ]) {
      expect(at(path), path).toEqual({ kind: 'unfiltered', asset: path.split('?')[0] });
    }
  });

  it('rejects malformed filters with the unavailable page', () => {
    for (const path of [
      '/investors/announcements?year=21',
      '/investors/announcements?year=2021a',
      '/investors/announcements?year=../../etc',
      '/investors/reports?type=annual-report',
      '/investors/reports?type=../../404',
      '/investors/reports?type=ANNUAL',
      '/investors/reports?year=2021&year=2022',
      '/investors/reports?type=annual&type=notice',
      '/investors/announcements?type=annual',
      '/investors/presentations?type=quarterly',
    ]) {
      const listing = path.split('?')[0]?.split('/').pop();
      expect(at(path), path).toEqual({
        kind: 'invalid',
        asset: `/filtered/${listing}/unavailable`,
      });
    }
  });

  it('hides the internal filter pages', () => {
    for (const path of [
      '/filtered/reports/year-2022',
      '/filtered/',
      '/filtered',
      '/filtered/x?year=2022',
    ]) {
      expect(at(path), path).toEqual({ kind: 'hidden' });
    }
  });

  it('only routes GET and HEAD', () => {
    const url = new URL('https://auburnresources.com.au/investors/reports?year=2022');
    expect(decide(url, 'HEAD').kind).toBe('filter');
    expect(decide(url, 'POST')).toEqual({ kind: 'pass' });
  });

  it('can only ever produce paths under /filtered/<known listing>/', () => {
    const hostile = [
      '%2F..%2F',
      '<script>',
      'https://evil.example',
      '//evil.example',
      '2022/../../x',
      '../',
    ];
    for (const value of hostile) {
      for (const param of ['year', 'type']) {
        for (const listing of ['announcements', 'reports', 'presentations']) {
          const decision = at(`/investors/${listing}?${param}=${encodeURIComponent(value)}`);
          if ('asset' in decision)
            expect(decision.asset).toMatch(
              /^\/(filtered\/(announcements|reports|presentations)\/[a-z0-9-]+|investors\/[a-z]+)$/,
            );
        }
      }
    }
  });
});
