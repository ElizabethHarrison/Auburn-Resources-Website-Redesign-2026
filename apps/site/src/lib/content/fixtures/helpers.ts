/**
 * Helpers for fixture data. Every value seeded from docs/CONTENT-SOURCE.md is unverified, so these
 * helpers fix the status to `toVerify` and the source to the website capture. There is deliberately no
 * helper that produces `approved`: approval happens only in the CMS (CLAUDE.md §2.1).
 *
 * `asAt` is the capture date (29 Sep 2026): the date the old site stated the value, not a verified
 * as-at date.
 */
import type { DocumentRef, Fact, Interpretation, IsoDate } from '../../facts';

export const CAPTURE_DATE: IsoDate = '2026-09-29';

export const SOURCE_IDS = {
  website: 'src-website-capture-2026-09-29',
  dgrQuarterly: 'src-dgr-quarterly-2026-03',
} as const;

export const websiteSource: DocumentRef = { documentId: SOURCE_IDS.website };
export const dgrQuarterlySource: DocumentRef = { documentId: SOURCE_IDS.dgrQuarterly };

interface FactOptions {
  readonly unit?: string;
  readonly qualifier?: string;
  readonly note?: string;
  readonly source?: DocumentRef;
}

/** A value as stated on the current website, awaiting verification. */
export function siteFact<T>(value: T, options: FactOptions = {}): Fact<T> {
  const { unit, qualifier, note, source = websiteSource } = options;
  return {
    kind: 'fact',
    value,
    ...(unit === undefined ? {} : { unit }),
    ...(qualifier === undefined ? {} : { qualifier }),
    meta: {
      sourceDocument: source,
      asAt: CAPTURE_DATE,
      status: 'toVerify',
      ...(note === undefined ? {} : { note }),
    },
  };
}

/** A statement from the current website, awaiting review (competent person for technical text). */
export function siteStatement(text: string, note?: string): Interpretation {
  return {
    kind: 'interpretation',
    text,
    sources: [websiteSource],
    status: 'toVerify',
    asAt: CAPTURE_DATE,
    ...(note === undefined ? {} : { note }),
  };
}
