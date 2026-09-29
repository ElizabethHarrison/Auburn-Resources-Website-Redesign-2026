/**
 * Figure records shared across pages. Each figure has one home, whichever page shows it.
 *
 * The indicative mockup graphics live in ./indicative-figures.ts and are loaded only in preview builds.
 * `__PREVIEW_BUILD__` is a compile-time constant (astro.config.ts), so in a production build this
 * branch — and the image files it imports — is removed entirely: the artwork cannot reach production
 * even by accident. Production sees INPUT NEEDED, which renders nothing.
 */
import { inputNeeded } from '../../../facts';
import type { FigureSlot } from '../../types';

const indicative = __PREVIEW_BUILD__ ? await import('./indicative-figures') : undefined;

/** Fig. 1 — Auburn project portfolio (home hero and the portfolio page). */
export const portfolioMap: FigureSlot =
  indicative?.portfolioMap ?? inputNeeded('Fig. 1 portfolio map drawn from tenement GIS (Q-31).');

/** Fig. 2 — schematic cross-section (home "Why this ground"; later the Nicholson dossier). */
export const crossSection: FigureSlot =
  indicative?.crossSection ??
  inputNeeded('Fig. 2 cross-section approved by the competent person (Q-33).');
