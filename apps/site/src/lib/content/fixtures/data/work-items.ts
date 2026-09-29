/**
 * Exploration work fixtures (docs/CONTENT-SOURCE.md §3, "Work:" lines). Quantities are as stated on
 * the old site; years and operators are INPUT NEEDED unless the site says so.
 */
import { inputNeeded } from '../../../facts';
import type { WorkItem } from '../../types';
import { siteFact } from '../helpers';

const year = inputNeeded('Year(s) of the work');
const operator = inputNeeded('Operator: Auburn or historic');

function work(
  id: string,
  projectId: string,
  method: string,
  quantity: number,
  unit?: string,
  note?: string,
): WorkItem {
  return {
    id,
    projectId,
    method,
    quantity: siteFact(quantity, {
      ...(unit === undefined ? {} : { unit }),
      ...(note === undefined ? {} : { note }),
    }),
    year,
    operator,
  };
}

export const workItems: readonly WorkItem[] = [
  // Nicholson
  work('work-nicholson-vtem', 'project-nicholson', 'VTEM', 1200, 'line km'),
  work('work-nicholson-mmi', 'project-nicholson', 'MMI soils', 3500),
  work('work-nicholson-em-ip-res', 'project-nicholson', 'EM/IP/RES', 40, 'line km'),
  work('work-nicholson-drilling', 'project-nicholson', 'Drilling', 5000, 'm'),

  // Victoria River Downs
  work('work-vrd-mmi', 'project-victoria-river-downs', 'MMI soils', 2100),
  work('work-vrd-ip-res', 'project-victoria-river-downs', 'IP/RES', 60, 'line km'),
  work('work-vrd-gravity', 'project-victoria-river-downs', 'Ground gravity', 200, 'line km'),
  work('work-vrd-drilling', 'project-victoria-river-downs', 'Drilling', 4000, 'm'),
  {
    ...work(
      'work-vrd-historic-drilling',
      'project-victoria-river-downs',
      'Historic drilling',
      500,
      'm',
      'Site: "Historic drilling 500 m (4 holes)".',
    ),
    operator: siteFact('historic' as const),
  },

  // Calgoa
  work(
    'work-calgoa-drilling',
    'project-calgoa',
    'Drill holes',
    28,
    'holes',
    'Site: "28 × 250 m holes".',
  ),
  work('work-calgoa-airmag', 'project-calgoa', 'Airmag survey', 70, 'km²'),

  // Tanumbirini
  work('work-tanumbirini-stream', 'project-tanumbirini', 'Stream', 900),
  work('work-tanumbirini-soil', 'project-tanumbirini', 'Soil', 5800),
  work('work-tanumbirini-vtem', 'project-tanumbirini', 'VTEM Max', 1400, 'line km'),
  work('work-tanumbirini-gravity', 'project-tanumbirini', 'Ground gravity', 250, 'line km'),
  work('work-tanumbirini-drilling', 'project-tanumbirini', 'Drilling', 1800, 'm'),
];
