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

/**
 * What each indicative figure stands in for. Production builds — and the CMS export, which never carries indicative
 * graphics (D-024) — use these INPUT NEEDED briefs instead.
 */
export const FIGURE_BRIEFS = {
  'figure-portfolio-map-indicative': 'Fig. 1 portfolio map drawn from tenement GIS (Q-31).',
  'figure-cross-section-indicative':
    'Fig. 2 cross-section approved by the competent person (Q-33).',
  'figure-nicholson-setting-indicative':
    'Fig. 1 Nicholson regional setting map from tenement GIS (Q-31).',
} as const;

/** Fig. 1 — Auburn project portfolio (home hero and the portfolio page). */
export const portfolioMap: FigureSlot =
  indicative?.portfolioMap ?? inputNeeded(FIGURE_BRIEFS['figure-portfolio-map-indicative']);

/** Fig. 2 — schematic cross-section (home "Why this ground"; later the Nicholson dossier). */
export const crossSection: FigureSlot =
  indicative?.crossSection ?? inputNeeded(FIGURE_BRIEFS['figure-cross-section-indicative']);

/** Nicholson regional setting (dossier module 01). */
export const nicholsonSettingMap: FigureSlot =
  indicative?.nicholsonSettingMap ??
  inputNeeded(FIGURE_BRIEFS['figure-nicholson-setting-indicative']);
