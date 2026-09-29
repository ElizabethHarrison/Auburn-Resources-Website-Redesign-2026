/**
 * Site navigation structure from docs/SITEMAP.md §1, §2 and §4. Labels, order and URLs are approved;
 * do not change them without approval (CLAUDE.md §9). Project entries are added from content at build
 * time, because the verified project list is still pending (docs/OPEN-QUESTIONS.md Q-20).
 */
import type { SheetNumber } from './content/types';

export interface NavLink {
  readonly label: string;
  readonly href: string;
  /** Sheet number, shown in mono before the label. Utility pages have none (D-010). */
  readonly sheet?: SheetNumber;
}

export type SectionId = '01' | '02' | '03' | '04' | '05';

export interface Section extends NavLink {
  readonly id: SectionId;
  readonly sheet: SheetNumber;
  /** Sibling pages shown in the section bar, landing page first. */
  readonly pages: readonly NavLink[];
}

export const SECTIONS: readonly Section[] = [
  {
    id: '01',
    sheet: '01',
    label: 'Company',
    href: '/company',
    pages: [
      { sheet: '01', label: 'Overview', href: '/company' },
      { sheet: '01.1', label: 'Leadership', href: '/company/leadership' },
    ],
  },
  {
    id: '02',
    sheet: '02',
    label: 'Projects',
    href: '/projects',
    pages: [
      { sheet: '02', label: 'Portfolio', href: '/projects' },
      // Project dossiers (02.1–02.n) are inserted here from content.
      { sheet: '02.9', label: 'How we explore', href: '/projects/how-we-explore' },
    ],
  },
  {
    id: '03',
    sheet: '03',
    label: 'Investors',
    href: '/investors',
    pages: [
      { sheet: '03', label: 'Investor centre', href: '/investors' },
      { sheet: '03.1', label: 'Announcements', href: '/investors/announcements' },
      { sheet: '03.2', label: 'Reports', href: '/investors/reports' },
      { sheet: '03.3', label: 'Presentations', href: '/investors/presentations' },
      { sheet: '03.4', label: 'Shareholder information', href: '/investors/shareholders' },
      { sheet: '03.5', label: 'Governance', href: '/investors/governance' },
      { sheet: '03.6', label: 'Email alerts', href: '/investors/alerts' },
    ],
  },
  {
    id: '04',
    sheet: '04',
    label: 'Sustainability',
    href: '/sustainability',
    pages: [
      { sheet: '04', label: 'Overview', href: '/sustainability' },
      { sheet: '04.1', label: 'Community and Country', href: '/sustainability/community' },
      {
        sheet: '04.2',
        label: 'Environment and safety',
        href: '/sustainability/environment-safety',
      },
    ],
  },
  {
    id: '05',
    sheet: '05',
    label: 'News',
    href: '/news',
    pages: [
      { sheet: '05', label: 'News', href: '/news' },
      { sheet: '05.1', label: 'Media', href: '/news/media' },
    ],
  },
];

export const CONTACT_LINK: NavLink = { label: 'Contact', href: '/contact' };
export const INVESTOR_UPDATES_LINK: NavLink = {
  label: 'Investor updates',
  href: '/investors/alerts',
};
export const HOME_LINK: NavLink = { label: 'Home', href: '/', sheet: '00' };

export const LEGAL_LINKS: readonly NavLink[] = [
  { label: 'Disclaimer', href: '/disclaimer' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
];

export function sectionById(id: SectionId): Section {
  const section = SECTIONS.find((candidate) => candidate.id === id);
  if (!section) throw new Error(`Unknown section ${id}`);
  return section;
}

/** Section bar pages for section 02, with project dossiers inserted after the portfolio. */
export function projectSectionPages(projects: readonly NavLink[]): readonly NavLink[] {
  const [portfolio, ...rest] = sectionById('02').pages;
  return portfolio ? [portfolio, ...projects, ...rest] : [...projects, ...rest];
}

/** Footer link columns (docs/SITEMAP.md §4). The Contact column is built from site settings. */
export function footerColumns(projects: readonly NavLink[]): readonly {
  readonly heading: string;
  readonly sheet?: SheetNumber;
  readonly links: readonly NavLink[];
}[] {
  return [
    {
      heading: 'Company',
      sheet: '01',
      links: [
        { label: 'Overview', href: '/company' },
        { label: 'Leadership', href: '/company/leadership' },
        { label: 'Sustainability', href: '/sustainability', sheet: '04' },
        { label: 'News', href: '/news', sheet: '05' },
        { label: 'Media', href: '/news/media' },
      ],
    },
    {
      heading: 'Projects',
      sheet: '02',
      links: [
        { label: 'Portfolio map', href: '/projects' },
        ...projects,
        { label: 'How we explore', href: '/projects/how-we-explore' },
      ],
    },
    {
      heading: 'Investors',
      sheet: '03',
      links: [
        { label: 'Investor centre', href: '/investors' },
        { label: 'Announcements', href: '/investors/announcements' },
        { label: 'Reports', href: '/investors/reports' },
        { label: 'Presentations', href: '/investors/presentations' },
        { label: 'Shareholder information', href: '/investors/shareholders' },
        { label: 'Governance', href: '/investors/governance' },
      ],
    },
  ];
}
