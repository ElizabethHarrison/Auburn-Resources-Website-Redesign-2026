/**
 * Page copy for the fixed pages (docs/SITEMAP.md §6). Section headings are the section names from the
 * sitemap (structure, not claims). Copy exists only where docs/CONTENT-SOURCE.md records it — restructured,
 * never reworded in substance — and is `toVerify`. Everything else is INPUT NEEDED: generic ESG, governance,
 * shareholder and media copy is not drafted here.
 *
 * Facts shown on these pages (status, DGR holding, IPO status, addresses…) are not copied in: pages read
 * them from site settings, so each fact keeps one home.
 */
import { inputNeeded } from '../../../facts';
import type { PageContent, PageKey, PageSection } from '../../types';
import { siteStatement } from '../helpers';
import { homePage } from './home-page';

const intro = (brief: string) => inputNeeded(`Introduction: ${brief}; one paragraph, no digits`);

function section(
  id: string,
  heading: string,
  brief: string,
  options: { forwardLooking?: boolean } = {},
): PageSection {
  return { id, heading, paragraphs: [inputNeeded(brief)], ...options };
}

export const pages: Record<PageKey, PageContent> = {
  company: {
    key: 'company',
    intro: intro('who Auburn is, where it works and what it is looking for'),
    sections: [
      {
        id: 'who-we-are',
        heading: 'Who we are',
        paragraphs: [
          siteStatement(
            'Auburn Resources focuses on the discovery and development of Tier 1 zinc, copper and gold targets in Queensland and the Northern Territory.',
            '"Tier 1" is a claim: keep only if the board approves.',
          ),
          siteStatement(
            'Its projects range from early-stage greenfield ground to drill-ready targets.',
          ),
        ],
      },
      section(
        'strategy',
        'Strategy',
        'Strategy and pathway as a sequence of stages, approved by the board',
        { forwardLooking: true },
      ),
      section(
        'dgr-global',
        'Relationship with DGR Global',
        'The relationship with DGR Global Ltd: shareholding, shared services and board links, approved by the company secretary',
      ),
      section('history', 'Milestones', 'Company milestone timeline, verified dates only'),
    ],
  },
  leadership: {
    key: 'leadership',
    intro: intro('how the board and management are organised'),
    sections: [],
  },
  howWeExplore: {
    key: 'howWeExplore',
    intro: intro('the exploration approach across the portfolio'),
    sections: [
      {
        id: 'under-cover',
        heading: 'Why the ground is under-explored',
        paragraphs: [homePage.whyText],
      },
      section(
        'toolkit',
        'Our toolkit',
        'One block per method (geophysics, geochemistry, drilling…) with an Auburn example figure, reviewed by the competent person',
      ),
      section(
        'sequence',
        'From target to drill hole',
        'The sequence from target generation to a drill hole, reviewed by the competent person',
      ),
    ],
  },
  investors: {
    key: 'investors',
    intro: intro("the company's current position for shareholders and brokers"),
    sections: [
      section(
        'calendar',
        'Reporting calendar',
        'Reporting calendar: dates of reports and meetings (Q-22)',
      ),
    ],
  },
  announcements: {
    key: 'announcements',
    intro: intro('what the announcement register holds'),
    sections: [],
  },
  reports: {
    key: 'reports',
    intro: intro('annual, half-yearly and quarterly reports'),
    sections: [],
  },
  presentations: {
    key: 'presentations',
    intro: intro('the current corporate presentation and the archive'),
    sections: [],
  },
  shareholders: {
    key: 'shareholders',
    intro: intro('practical information for holders of unlisted shares'),
    sections: [
      section(
        'capital-structure',
        'Capital structure',
        'Capital structure as an HTML table with an as-at date, from registry data (Q-22); never an image',
      ),
      section(
        'how-to-invest',
        'How to invest in an unlisted company',
        'How to buy or transfer unlisted shares, approved by the company secretary',
      ),
      section('registry', 'Share registry', 'Share registry name and contact details (Q-22)'),
      section(
        'faqs',
        'Frequently asked questions',
        'Shareholder questions and answers, approved by the company secretary',
      ),
    ],
  },
  governance: {
    key: 'governance',
    intro: intro('how the company is governed'),
    sections: [
      section('approach', 'Our approach', 'Approach to governance, approved by the board'),
      section(
        'board-committees',
        'Board and committees',
        'Board committees, their charters and members',
      ),
      section(
        'whistleblower',
        'Whistleblower and governance contact',
        'How to raise a concern, and the governance contact',
      ),
    ],
  },
  alerts: {
    key: 'alerts',
    intro: intro('what subscribers receive: announcements, reports, news'),
    sections: [
      section(
        'privacy-note',
        'Your details',
        'How subscriber details are used, consistent with the Privacy Policy',
      ),
    ],
  },
  sustainability: {
    key: 'sustainability',
    intro: intro('how Auburn works, in specific and verifiable terms'),
    sections: [
      section(
        'approach',
        'Our approach',
        'Three or four specific, verifiable commitments (the old site copy is generic and is not reused)',
      ),
      section(
        'responsibility',
        'Who is responsible',
        'Who is accountable for sustainability, by role',
      ),
    ],
  },
  community: {
    key: 'community',
    intro: intro('working with Traditional Owners, landholders and communities'),
    sections: [
      section(
        'country',
        'Working on Country',
        'How Auburn works on Country; Traditional Owner groups named only with their recorded consent',
      ),
      section(
        'land-access',
        'Landholders and land access',
        'Land access approach and agreements the company chooses to disclose',
      ),
      section(
        'participation',
        'Local participation',
        'Local employment, contracting and community support',
      ),
      section('community-contact', 'Community contact', 'A named community contact'),
    ],
  },
  environmentSafety: {
    key: 'environmentSafety',
    intro: intro('environmental and safety practice'),
    sections: [
      section(
        'environment',
        'Environment and rehabilitation',
        'Environmental management and rehabilitation practice; before/after photographs if available',
      ),
      section('safety', 'Health and safety', 'Safety management system, in specific terms'),
      section('policies', 'Policies', 'Environment and safety policies, as files'),
    ],
  },
  news: {
    key: 'news',
    intro: intro('exploration updates, company news and coverage'),
    sections: [],
  },
  media: {
    key: 'media',
    intro: intro('information for journalists'),
    sections: [
      section('media-contact', 'Media contact', 'Named media contact with email and phone'),
      section(
        'downloads',
        'Downloads',
        'Media kit, logos, images and portraits, each with usage terms',
      ),
      section(
        'coverage',
        'Coverage',
        'Media coverage list (from the old Media Coverage page), each with outlet and date',
      ),
    ],
  },
  contact: {
    key: 'contact',
    intro: intro('how to reach the company'),
    sections: [
      section(
        'enquiries',
        'Enquiries by type',
        'A named inbox for each enquiry type: investors, partnerships, media, landholder or community, general',
      ),
    ],
  },
};
