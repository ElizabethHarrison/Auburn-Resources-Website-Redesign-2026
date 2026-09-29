# Design direction — "Survey Sheet" (Century Gothic)

Approved 29 Sep 2026. Reference mockups: Claude design canvas *Auburn Resources Homepage Directions*, artboards
**"1b · Survey Sheet — Century Gothic"** (homepage) and **"Project page template — Nicholson (CMS preview)"**.

## Concept

The website is designed like a finely made geological survey sheet: contour lines, coordinate ticks, numbered
figures, legends, margin notes. It should feel authored by geologists — precise, curious, methodical, never hyped.
Blue is the ink of cyanotypes and survey maps. **Copper marks Auburn's own ground and nothing else.**

What makes it distinctive (keep these):
- Every page has a **sheet number** (e.g. `SHEET 02.1 · NICHOLSON`) in the header title block and breadcrumb.
- Figures are numbered and captioned in mono caps: `FIG. 1 — AUBURN PROJECT PORTFOLIO, NORTHERN AUSTRALIA.`
- Project pages are navigated by a **stratigraphic-column** index (stacked bands of varied height, one per section).
- Data sits in ruled cells like a map-sheet margin; prose sits beside figures, never above them in walls.

## Tokens

```css
:root {
  /* Inks */
  --ink-survey:     #1B3A5C; /* primary: headings, rules, buttons, footer */
  --ink-cyanotype:  #2C5F8F; /* links, mono labels, figure lines */
  --ink-contour:    #A9C1D9; /* contours, secondary rules, tints */
  --ink-graphite:   #262A2E; /* body text */
  --ink-muted:      #5A6B7C; /* source lines, meta */

  /* Grounds */
  --paper:          #F5F2EA; /* page background */
  --paper-deep:     #ECE6D8; /* preview banners, subtle panels */
  --water:          #EEF2F4; /* map sea, alternating bands */
  --band-grey:      #E6ECF1;

  /* Accent — Auburn ground only */
  --copper:         #B8672E; /* map fills, tags, large type ONLY (3.7:1 on paper) */
  --copper-text:    #8A4A1E; /* copper-coloured small text (passes AA on paper) */
  --copper-tint:    #F3E5D8;

  /* Footer */
  --on-survey:      #F5F2EA;
  --on-survey-muted:#D8E2EC;
}
```

Contrast (checked): Graphite, Survey Blue and Cyanotype pass WCAG AA for body text on Paper. Copper `#B8672E` is
3.7:1 — **never** for body text. Retest any new pairing.

## Typography

| Role | Face | Size / notes |
| --- | --- | --- |
| Display, headings, body, UI | **Century Gothic** | H1 hero 48 px (desktop) / 36 px (mobile), line-height 1.12, letter-spacing −0.5 px; project H1 84 px; H2 40–48 px; body 16–18 px, line-height 1.6; weight regular (400) throughout — hierarchy by size and ink, not weight |
| Labels, sheet numbers, figure captions, tables, dates, tenement IDs | **IBM Plex Mono** | 10.5–13 px, uppercase for labels, letter-spacing 1–1.5 px |

Font stack until the web licence is confirmed:

```css
--font-sans: 'Century Gothic', CenturyGothic, 'Didact Gothic', AppleGothic, sans-serif;
--font-mono: 'IBM Plex Mono', ui-monospace, Menlo, monospace;
```

Century Gothic is commercial: self-host WOFF2 only after a web licence is bought. Didact Gothic (OFL) is the
fallback. Century Gothic is wide — check headline wrapping in narrow columns.

## Layout and grid

- Desktop artboard width 1440; content gutters 64 px; 12-column grid, 24 px gutter.
- Spacing on an 8 px scale. Section padding 64–80 px vertical.
- **Rules:** 1 px Survey Blue for structure; 1 px Contour Blue for secondary divisions. No shadows, no gradients,
  no rounded cards (radius 0). Hover = underline/line, not colour blocks.
- Mobile: 360 px minimum, 16–20 px gutters; everything stacks; no horizontal page scroll.

## Components (visual spec)

| Component | Spec |
| --- | --- |
| Header / title block | 88 px, bottom rule. Wordmark "Auburn" + "RESOURCES" (mono, letter-spacing 4 px) · sheet ref after a thin rule · nav items prefixed by mono numbers (`01 Company`) · Contact · outlined "Investor updates" button |
| Section bar | 44 px mono row of sibling pages with sheet numbers; current page underlined |
| Breadcrumb | Mono caps: `HOME / 02 PROJECTS / 02.1 NICHOLSON` |
| Buttons | Primary: solid Survey Blue, Paper text, 16×22 px padding, square. Secondary: 1 px Survey Blue outline. Min touch target 44 px |
| Tag | Mono 11 px, 1 px border (copper for commodity, survey for state/stage), 3–4 × 7–8 px padding |
| Fact cell | Mono label (Cyanotype) · value (Century Gothic, Survey Blue, 20–44 px) · source line (mono 10.5 px, muted) with status dot |
| Status dots (CMS preview only) | ● Verified (filled Survey Blue) · ◐ To verify (half copper) · ○ Input needed (dashed copper) |
| Placeholder (CMS preview only) | Dashed 1.5 px copper border, `#F8EFE6` fill, mono label `INPUT NEEDED · …` + one-line brief. Never shown in production |
| Figure | 1 px Survey Blue frame; caption below in mono caps with `FIG. n —`; source + date; click → lightbox |
| Map legend | Paper box, 1 px Survey Blue border, mono "LEGEND" header: Auburn project area (copper) · Reference deposit (outline circle) · State border (dashed) · Form lines |
| Project / sheet card | Ruled grid cell: mono `SHEET 02.1` + state · name 34 px · commodity tag · one line · "Read the dossier →" |
| Document register | Mono header row `REF · DATE · TYPE · DOCUMENT · FILE`; rows ruled in Contour Blue; filter chips above |
| Strat-column nav | Stacked bands (heights vary 44–70 px), alternating fills (paper / water / band-grey / copper-tint for Targets); current band solid Survey Blue with Paper text |
| CTA band | Full-width Survey Blue; mono kicker; one line; light button + outlined button |
| Footer | Survey Blue; sign-up strip; four columns with mono headings; acknowledgement of Country; mono legal row |

## Maps and figures

- One cartographic style everywhere: paper land, water sea, contour "form lines" in Contour Blue (decorative until real
  data), graticule with mono labels, coastline in Survey Blue, dashed state borders, north arrow, scale bar.
- **Only Auburn tenements are copper.** Reference deposits: outline circles, mono labels. Towns: small black squares.
- Mockup map geometry and project positions are **indicative only** — replace with tenement GIS.
- Cross-sections: redrawn vector, standard lithology hatch patterns, leader-line annotations, depth scale in mono.
  The current Fig. 2 is schematic — must be replaced by a competent-person-approved section.
- Every map has a text equivalent (project list with the same facts).

## Photography

Documentary, natural light, specific: core trays, geologist logging core, sample bags, drill rig at a named prospect,
landscape as full-bleed dividers only. Secondary images may take a subtle cyanotype duotone. **No stock imagery.**
Every photo: caption, date, place, photographer, consent. Never photograph cultural sites without permission.

## Motion

Minimal. No scroll-triggered reveals of core content. Map pans/zooms only on user action. Respect
`prefers-reduced-motion`.

## Project page template (module order)

Hero → Key-facts strip → 01 Setting → 02 Geological setting → 03 Exploration history (counters + timeline) →
04 Existing resources → 05 Exploration targets → 06 Key results → 07 Photography → 08 Milestones → 09 Documents →
Related sheets → CTA band → Compliance block → Footer. Left column: sticky strat-column nav.
Modules hide when empty. Max 120 words per module intro. Full spec: `SITEMAP.md` §8.
