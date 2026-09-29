/**
 * Date formatting (CLAUDE.md §2.5): display `DD MMM YYYY` (rendered in mono), store ISO 8601,
 * announcements in Australia/Brisbane time.
 *
 * Month abbreviations are fixed here rather than taken from `Intl`, because `en-AU` abbreviates
 * September as "Sept", which breaks the fixed-width mono format.
 */
import type { IsoDate } from './facts';

export const SITE_TIME_ZONE = 'Australia/Brisbane';

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isIsoDate(value: string): value is IsoDate {
  const match = ISO_DATE.exec(value);
  if (!match) return false;
  const [, y, m, d] = match.map(Number) as [number, number, number, number];
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

/** `2026-09-29` → `29 Sep 2026`. Throws on an invalid date so bad data fails the build. */
export function formatDate(iso: IsoDate): string {
  if (!isIsoDate(iso)) throw new Error(`Invalid ISO date: ${iso}`);
  const [year, month, day] = iso.split('-') as [string, string, string];
  return `${day} ${MONTHS[Number(month) - 1]} ${year}`;
}

/** Calendar date in Brisbane for an instant (e.g. an announcement's release timestamp). */
export function toBrisbaneDate(instant: Date): IsoDate {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: SITE_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(instant);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}` as IsoDate;
}

/** `29 Sep 2026` for an instant, in Brisbane time. */
export function formatInstant(instant: Date): string {
  return formatDate(toBrisbaneDate(instant));
}
