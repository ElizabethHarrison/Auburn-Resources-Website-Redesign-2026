/**
 * People fixtures (docs/CONTENT-SOURCE.md §2). Bios are the old site's summaries, unverified;
 * directorships and experience figures are time-sensitive. Portraits and competent-person details
 * are INPUT NEEDED.
 */
import { inputNeeded } from '../../../facts';
import type { Person } from '../../types';
import { siteFact, siteStatement } from '../helpers';

const newPortrait = inputNeeded('New portrait in the consistent house style');

export const people: readonly Person[] = [
  {
    id: 'person-nicholas-mather',
    name: 'Nicholas Mather',
    group: 'board',
    role: siteFact('Non-Executive Chair'),
    bio: siteStatement(
      '35+ years in junior resources. Instrumental in the generation of projects that have laid the foundation of $5.7Bn returns to shareholders via corporate take overs.',
      '$5.7Bn needs a source and as-at date.',
    ),
    qualifications: inputNeeded('Qualifications'),
    portrait: newPortrait,
  },
  {
    id: 'person-brian-moller',
    name: 'Brian Moller',
    group: 'board',
    role: siteFact('Non-Executive Director'),
    bio: siteStatement(
      'Acts for many listed resource and industrial companies, with corporate regulatory and governance expertise. Non-Executive Director of DGR Global Ltd, Platina Resources Ltd and New Peak Metals Ltd; Chair of Clara Resources Australia Ltd.',
      'Directorships are time-sensitive.',
    ),
    qualifications: inputNeeded('Qualifications'),
    portrait: newPortrait,
  },
  {
    id: 'person-peter-wright',
    name: 'Peter Wright',
    group: 'board',
    role: siteFact('Non-Executive Director'),
    bio: siteStatement(
      "Portfolio Manager Partner, Bizzell Capital Partners, with 22 years' experience. Joined DGR Global as a Non-Executive Director in January 2021. Executive Director of Greenwing Resources; Non-Executive Director of Laneway Resources.",
      'Roles are time-sensitive.',
    ),
    qualifications: inputNeeded('Qualifications'),
    portrait: newPortrait,
  },
  {
    id: 'person-john-bierling',
    name: 'John Bierling',
    group: 'management',
    role: siteFact('Chief Executive Officer'),
    bio: siteStatement(
      'Background in operations and diversified resources management. DGR Global General Manager and DGR Group Site Senior Executive.',
    ),
    qualifications: siteFact(
      'Graduate qualifications in project management, WHS, engineering, business and finance',
    ),
    portrait: newPortrait,
  },
  {
    id: 'person-geoff-walker',
    name: 'Geoff Walker',
    group: 'management',
    role: siteFact('Company Secretary & CFO'),
    bio: siteStatement(
      '30+ years of experience. Former CFO of Eagers Automotive (APE), Range International (RAN) and Kina Petroleum (KPE).',
    ),
    qualifications: siteFact('Chartered accountant, MAICD'),
    portrait: newPortrait,
  },
];
