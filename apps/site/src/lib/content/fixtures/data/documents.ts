/**
 * Document fixtures: source records and the investor documents listed on the old site
 * (docs/CONTENT-SOURCE.md §4 and §9).
 *
 * - Old-site dates were shown as DD/MM/YYYY and are read in Australian order.
 * - Files are not re-hosted yet, so every `file` is INPUT NEEDED. Old URLs are kept only as
 *   `legacyPath` for redirects and are never rendered.
 * - Excluded: the 2021 Entitlement Offer (HOLD, Q-23) and the presentation's Squarespace staging URL.
 */
import { inputNeeded } from '../../../facts';
import type { DocumentRecord } from '../../types';
import { CAPTURE_DATE, SOURCE_IDS, siteFact, websiteSource } from '../helpers';

const reHost = inputNeeded('Re-hosted PDF (old site file to be migrated)');

/** Governance documents are named on the old site but no file was ever linked (all IN as files). */
function governanceDocuments(entries: readonly (readonly [string, string])[]): DocumentRecord[] {
  return entries.map(([slug, title]) => ({
    id: `doc-governance-${slug}`,
    slug,
    title,
    docType: 'policy',
    releaseAt: inputNeeded('Adoption or last-review date'),
    status: 'toVerify',
    internal: false,
    file: inputNeeded('Current file: listed on the old site but never linked'),
    projectIds: [],
  }));
}

export const documents: readonly DocumentRecord[] = [
  // ── Internal source records (never listed publicly) ────────────────────────────────────────────
  {
    id: SOURCE_IDS.website,
    slug: 'website-capture-2026-09-29',
    title: 'Capture of the current auburnresources.com.au website',
    docType: 'sourceCapture',
    releaseAt: siteFact(CAPTURE_DATE, { source: websiteSource }),
    status: 'toVerify',
    internal: true,
    file: inputNeeded('Archived copy of the captured pages'),
    projectIds: [],
    note: 'Provenance for all seed data. Interim until docs/OPEN-QUESTIONS.md Q-07 is decided.',
  },
  {
    id: SOURCE_IDS.dgrQuarterly,
    slug: 'dgr-global-quarterly-activities-report-jan-mar-2026',
    title: 'DGR Global Limited, Quarterly Activities Report, 1 January 2026 – March 2026',
    docType: 'thirdParty',
    releaseAt: inputNeeded('Release date of the DGR Global March 2026 quarterly'),
    status: 'toVerify',
    internal: true,
    file: inputNeeded('Not re-hosted: third-party document, linked externally'),
    projectIds: [],
    externalUrl: 'https://wcsecure.weblink.com.au/pdf/DGR/03084957.pdf',
    note: 'External cross-check used in docs/CONTENT-SOURCE.md §9.',
  },

  {
    id: SOURCE_IDS.websiteStrategy,
    slug: 'website-strategy-2026-09-29',
    title: 'Auburn Resources website strategy (approved direction, 29 Sep 2026)',
    docType: 'sourceCapture',
    releaseAt: siteFact(CAPTURE_DATE, { source: websiteSource }),
    status: 'toVerify',
    internal: true,
    file: inputNeeded('Not published: internal planning document (docs/WEBSITE-STRATEGY.md)'),
    projectIds: [],
    note: 'Source of the working positioning line and the under-cover thesis. Company claims in it still need verification.',
  },

  // ── Investor documents from the old Investor Centre ────────────────────────────────────────────
  {
    id: 'doc-2022-12-23-annual-report',
    slug: '2022-12-23-annual-report',
    title: 'Annual Report',
    docType: 'annual',
    releaseAt: siteFact('2022-12-23'),
    status: 'toVerify',
    internal: false,
    file: reHost,
    projectIds: [],
    legacyPath: '/s/Auburn-Resources-Limited-Annual-Report.pdf',
  },
  {
    id: 'doc-2022-12-23-notice-of-agm',
    slug: '2022-12-23-notice-of-agm-and-explanatory-memorandum',
    title: 'Notice of AGM and Explanatory Memorandum',
    docType: 'notice',
    releaseAt: siteFact('2022-12-23'),
    status: 'toVerify',
    internal: false,
    file: reHost,
    projectIds: [],
    legacyPath: '/s/2022-Notice-of-AGM-Auburn-Resources.pdf',
  },
  {
    id: 'doc-2021-10-27-chase-mining-earn-in',
    slug: '2021-10-27-earn-in-and-jv-agreement-with-chase-mining',
    title: 'Earn-in and JV Agreement with Chase Mining Limited',
    docType: 'announcement',
    releaseAt: siteFact('2021-10-27'),
    status: 'toVerify',
    internal: false,
    file: reHost,
    projectIds: [],
    legacyPath: '/s/02442087.pdf',
    note: 'Which project? Current JV status: INPUT NEEDED.',
  },
  {
    id: 'doc-2021-05-10-ripple-completion',
    slug: '2021-05-10-agreement-completion-acquisition-of-ripple-resources',
    title: 'Agreement completion for acquisition of Ripple Resources Pty Ltd',
    docType: 'announcement',
    releaseAt: siteFact('2021-05-10'),
    status: 'toVerify',
    internal: false,
    file: reHost,
    projectIds: [],
    legacyPath: '/s/02373162.pdf',
  },
  {
    id: 'doc-2021-03-12-ripple-agreement',
    slug: '2021-03-12-agreement-for-acquisition-of-ripple-resources',
    title: 'Auburn agreement for acquisition of Ripple Resources',
    docType: 'announcement',
    releaseAt: siteFact('2021-03-12'),
    status: 'toVerify',
    internal: false,
    file: reHost,
    projectIds: [],
    legacyPath: '/s/02352809.pdf',
  },
  {
    id: 'doc-2021-02-01-dgr-quarterly',
    slug: '2021-02-01-dgr-global-quarterly-activities-report',
    title: 'DGR Global Quarterly Activities Report',
    docType: 'quarterly',
    releaseAt: siteFact('2021-02-01'),
    status: 'toVerify',
    internal: false,
    file: reHost,
    projectIds: [],
    legacyPath: '/s/02336212.pdf',
    note: 'A DGR Global document: decide whether it belongs in the Auburn register.',
  },
  {
    id: 'doc-corporate-presentation-feb-2022',
    slug: 'corporate-presentation-feb-2022',
    title: 'Corporate Presentation',
    docType: 'presentation',
    releaseAt: inputNeeded('Exact release date (old site shows Feb 2022)'),
    status: 'toVerify',
    internal: false,
    file: reHost,
    projectIds: [],
    note: 'Old file sits on a Squarespace staging domain; re-host from the original.',
  },

  // ── Governance documents (CONTENT-SOURCE §5): listed on the old site, none linked ──────────────
  ...governanceDocuments([
    [
      'appendix-4g-and-corporate-governance-statement',
      'Appendix 4G and Corporate Governance Statement',
    ],
    ['board-charter', 'Board Charter'],
    ['audit-and-risk-management-committee-charter', 'Audit & Risk Management Committee Charter'],
    ['remuneration-committee-charter', 'Remuneration Committee Charter'],
    ['code-of-conduct', 'Code of Conduct'],
    ['anti-bribery-and-corruption-policy', 'Anti-Bribery and Corruption Policy'],
    ['diversity-policy', 'Diversity Policy'],
    ['privacy-policy', 'Privacy Policy'],
    [
      'assessing-the-independence-of-directors-policy',
      'Assessing the Independence of Directors Policy',
    ],
    ['continuous-disclosure-policy', 'Continuous Disclosure Policy'],
    ['related-party-policy', 'Related Party Policy'],
    ['whistleblower-policy', 'Whistleblower Policy'],
    ['share-trading-policy', 'Share Trading Policy'],
    ['constitution', 'Constitution'],
  ]),
];
