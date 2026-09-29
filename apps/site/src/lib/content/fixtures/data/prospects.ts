/**
 * Prospect fixtures (project module 05). Nicholson's drill targets from the current website
 * (docs/CONTENT-SOURCE.md §3), restructured from the old statements without changing the claims. All
 * await competent-person review; target types, evidence and depths are INPUT NEEDED.
 */
import { inputNeeded } from '../../../facts';
import type { Prospect } from '../../types';
import { siteStatement } from '../helpers';

export const prospects: readonly Prospect[] = [
  {
    id: 'prospect-nicholson-border',
    projectId: 'project-nicholson',
    name: 'Border',
    summary: siteStatement(
      'Drill target defined; VTEM anomaly along the Nicholson Fault: Nicholson West core.',
    ),
    targetType: inputNeeded('Target type and depth'),
  },
  {
    id: 'prospect-nicholson-hells-gate',
    projectId: 'project-nicholson',
    name: "Hell's Gate",
    summary: siteStatement('Drill target defined.'),
    targetType: inputNeeded('Evidence and target type'),
  },
  {
    id: 'prospect-nicholson-elizabeth-creek',
    projectId: 'project-nicholson',
    name: 'Elizabeth Creek',
    summary: siteStatement('Drill target defined.'),
    targetType: inputNeeded('Evidence and target type'),
  },
  {
    id: 'prospect-nicholson-shadforth',
    projectId: 'project-nicholson',
    name: 'Shadforth Structure',
    summary: siteStatement('15 km of anomalous base metals.'),
    targetType: inputNeeded('Status and target type'),
  },
];
