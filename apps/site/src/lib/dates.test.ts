import { describe, expect, it } from 'vitest';
import { formatDate, formatInstant, isIsoDate, toBrisbaneDate } from './dates';

describe('formatDate', () => {
  it('formats ISO dates as DD MMM YYYY with fixed three-letter months', () => {
    expect(formatDate('2026-09-29')).toBe('29 Sep 2026');
    expect(formatDate('2021-02-01')).toBe('01 Feb 2021');
    expect(formatDate('2022-12-23')).toBe('23 Dec 2022');
  });

  it('throws on invalid dates so bad data fails the build', () => {
    expect(() => formatDate('2026-02-30')).toThrow();
    expect(() => formatDate('2026-13-01')).toThrow();
  });
});

describe('isIsoDate', () => {
  it('accepts real calendar dates only', () => {
    expect(isIsoDate('2028-02-29')).toBe(true);
    expect(isIsoDate('2026-02-29')).toBe(false);
    expect(isIsoDate('29/09/2026')).toBe(false);
  });
});

describe('Brisbane time', () => {
  it('uses Australia/Brisbane (UTC+10, no daylight saving) for instants', () => {
    // 20:00 UTC on 28 Sep is 06:00 on 29 Sep in Brisbane.
    expect(toBrisbaneDate(new Date('2026-09-28T20:00:00Z'))).toBe('2026-09-29');
    expect(toBrisbaneDate(new Date('2026-09-28T13:59:59Z'))).toBe('2026-09-28');
    // Mid-summer: still UTC+10.
    expect(formatInstant(new Date('2027-01-15T14:00:00Z'))).toBe('16 Jan 2027');
  });
});
