/**
 * PREVIEW BUILDS ONLY — imported solely through ./figures.ts behind the compile-time
 * `__PREVIEW_BUILD__` flag, so production bundles never contain these images.
 *
 * The map and cross-section below are the graphics from the approved design mockups ("1b · Survey
 * Sheet — Century Gothic" and "Project page template — Nicholson"), cropped at full resolution. They are
 * INDICATIVE: project outlines, deposit positions and section layers come from the mockup, not from
 * tenement GIS or a competent-person-approved section (CLAUDE.md §3; docs/DESIGN-DIRECTION.md). So their
 * status is `toVerify`: they render in preview, clearly labelled, and never in production until the
 * replacement figures are supplied and approved (Q-31, Q-33, Q-18).
 */
import type { FigureRecord } from '../../types';
import portfolioMapImage from '../../../../assets/figures/indicative/portfolio-map-indicative.webp';
import crossSectionImage from '../../../../assets/figures/indicative/cross-section-indicative.webp';
import nicholsonSettingImage from '../../../../assets/figures/indicative/nicholson-setting-indicative.webp';

const MOCKUP_SOURCE = 'Design mockup, “Survey Sheet” direction (indicative, for design review)';

/** Fig. 1 — Auburn project portfolio (home hero and the portfolio page). */
export const portfolioMap: FigureRecord = {
  kind: 'figure',
  id: 'figure-portfolio-map-indicative',
  figureType: 'map',
  src: portfolioMapImage,
  width: portfolioMapImage.width,
  height: portfolioMapImage.height,
  caption:
    'Auburn project portfolio, northern Australia. Indicative only: project areas and positions are from the design mockup and will be replaced with tenement GIS.',
  alt: 'Indicative map of northern Australia showing Auburn project areas in copper and neighbouring reference deposits in outline, with state border, graticule, legend, scale bar and north arrow.',
  longDescription:
    'Indicative map from the design mockup, not drawn from tenement data. Auburn project areas (copper): Victoria River Downs and Tanumbirini in the Northern Territory; Nicholson near the Northern Territory–Queensland border, south of the Gulf of Carpentaria; Hawkwood and Calgoa in south-east Queensland. Reference deposits (outline circles): McArthur River, Walford Creek, Century and Mt Isa. Towns: Darwin, Cairns, Townsville and Brisbane. Contour form lines are decorative. The project register on the portfolio page lists the same projects.',
  source: MOCKUP_SOURCE,
  date: '2026-09-29',
  status: 'toVerify',
};

/** Fig. 2 — schematic cross-section (home "Why this ground"; later the Nicholson dossier). */
export const crossSection: FigureRecord = {
  kind: 'figure',
  id: 'figure-cross-section-indicative',
  figureType: 'section',
  src: crossSectionImage,
  width: crossSectionImage.width,
  height: crossSectionImage.height,
  caption:
    'Nicholson concept. Schematic, not to scale; layer names are placeholders for the geology team to confirm.',
  alt: 'Schematic cross-section: cover sediments over an upper sequence, a prospective host sequence and basement, cut by a fault. Short historic drillholes stop within the cover; an illustrative deeper test hole reaches the host sequence. Depth scale in metres.',
  longDescription:
    'Schematic section from the design mockup, not a competent-person-approved section. Layers from top: cover sediments; upper sequence; prospective host sequence (hatched in copper); basement. A fault cuts all layers. Historic drillholes (legend: average 27 m) end within the cover sediments; a dashed copper line marks an illustrative deeper test hole into the host sequence. A depth scale runs from 0 to 200 m.',
  source: MOCKUP_SOURCE,
  date: '2026-09-29',
  status: 'toVerify',
};

/** Nicholson regional setting (dossier module 01), from the project page mockup. */
export const nicholsonSettingMap: FigureRecord = {
  kind: 'figure',
  id: 'figure-nicholson-setting-indicative',
  figureType: 'map',
  src: nicholsonSettingImage,
  width: nicholsonSettingImage.width,
  height: nicholsonSettingImage.height,
  caption:
    'Nicholson, regional setting. Indicative only: the outline is from the design mockup and will be replaced with tenement GIS.',
  alt: 'Indicative regional map around Nicholson, shown as a copper outline near the Northern Territory–Queensland border south of the Gulf of Carpentaria, with McArthur River, Walford Creek and Century marked as reference deposits.',
  longDescription:
    'Indicative map from the design mockup, not drawn from tenement data. Nicholson (copper outline, circled) sits beside the dashed Northern Territory–Queensland border, south of the Gulf of Carpentaria. Reference deposits (outline circles): McArthur River to the north-west, Walford Creek to the east and Century to the south-east. Part of the Tanumbirini outline appears at the left edge. Contour form lines are decorative.',
  source: MOCKUP_SOURCE,
  date: '2026-09-29',
  status: 'toVerify',
};
