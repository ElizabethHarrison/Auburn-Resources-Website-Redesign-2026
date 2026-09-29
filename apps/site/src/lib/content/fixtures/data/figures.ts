/**
 * Figure records shared across pages. Each figure has one home, whichever page shows it.
 * None has been supplied: every entry is INPUT NEEDED until a real, approved asset exists.
 */
import { inputNeeded } from '../../../facts';
import type { FigureSlot } from '../../types';

/** Fig. 1 — Auburn project portfolio (home hero and the portfolio page). */
export const portfolioMap: FigureSlot = inputNeeded(
  'Fig. 1 portfolio map drawn from tenement GIS (Q-31). Mockup geometry is indicative only and must not ship.',
);
