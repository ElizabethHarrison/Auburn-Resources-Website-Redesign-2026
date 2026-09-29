/**
 * Site settings fixture (docs/CONTENT-SOURCE.md §1). All values are as stated on the old site and
 * unverified. Conflicting sources are recorded in notes, never resolved by guessing.
 */
import { inputNeeded } from '../../../facts';
import type { SiteSettings } from '../../types';
import { siteFact } from '../helpers';

export const siteSettings: SiteSettings = {
  legalName: siteFact('Auburn Resources Limited'),
  companyType: siteFact('Unlisted mineral resource and exploration company'),
  acn: inputNeeded('ACN for the footer legal row'),
  abn: inputNeeded('ABN'),
  phone: inputNeeded('Company phone number'),
  email: siteFact('info@auburnresources.com.au', {
    note: 'Old site links pointed to a broken placeholder address; confirm this inbox is monitored.',
  }),
  streetAddress: siteFact(
    { lines: ['Suite 9C, London Offices', '30 Florence St', 'Teneriffe QLD 4005'] },
    {
      note: 'Structured data and an orphan page show 111 Eagle Street / 27/111 Eagle St, Brisbane — confirm which is current.',
    },
  ),
  postalAddress: siteFact({ lines: ['PO Box 3078', 'Newstead QLD 4006'] }),
  socialProfiles: siteFact(
    ['https://twitter.com/AuburnResources', 'https://linkedin.com/company/auburn-resources'],
    { note: 'From the old structured data; confirm both accounts are active.' },
  ),
  acknowledgementOfCountry: inputNeeded(
    'Approved acknowledgement of Country wording (docs/OPEN-QUESTIONS.md Q-26)',
  ),
  keyFacts: {
    projectCount: siteFact(10, {
      note: 'Site: "10 prospective projects". Verified project list needed (Q-20).',
    }),
    flagshipCount: siteFact(4, {
      note: 'Site: "4 district-scale flagship projects (including early-stage resources)". DGR Global Jan–Mar 2026 quarterly describes "two district scale flagship projects in QLD". No resource figures exist on the site.',
    }),
    groundHeld: siteFact(9300, {
      unit: 'km²',
      qualifier: 'over',
      note: 'Site: "Covering over 9,300 km²". Recalculate from the tenement schedule.',
    }),
    commodities: siteFact(['zinc', 'copper', 'gold'] as const),
    jurisdictions: siteFact(['QLD', 'NT'] as const),
    companyStatus: siteFact('Unlisted'),
    dgrHolding: siteFact(39, {
      unit: '%',
      note: 'Site: "39% owned by DGR Global Ltd". DGR Mar 2026 quarterly: 39.34%, 19.1 M shares. DGR\'s own Auburn page says 63% (outdated).',
    }),
    ipoStatus: siteFact('Planning for a proposed IPO and ASX listing', {
      note: 'Stated since at least 2021; confirm the current position.',
    }),
  },
};
