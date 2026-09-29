/**
 * Legal pages (docs/CONTENT-SOURCE.md §8): disclaimer, privacy and terms text must be supplied or
 * approved by the company (Q-24). Nothing is drafted here; every page is INPUT NEEDED.
 */
import { inputNeeded } from '../../../facts';
import type { LegalPageContent, LegalPageKey } from '../../types';

const supplied = (what: string) =>
  inputNeeded(`${what}, supplied by the company (Q-24); not drafted by the web team`);
const lastUpdated = inputNeeded('Last-updated date of the supplied text');

export const legalPages: Record<LegalPageKey, LegalPageContent> = {
  disclaimer: {
    key: 'disclaimer',
    lastUpdated,
    clauses: supplied(
      'Disclaimer: forward-looking statements, JORC 2012 basis, competent persons and no offer of securities',
    ),
  },
  privacy: { key: 'privacy', lastUpdated, clauses: supplied('Privacy policy') },
  terms: { key: 'terms', lastUpdated, clauses: supplied('Terms of use') },
};
