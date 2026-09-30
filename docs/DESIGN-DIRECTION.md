# Design direction — "Survey Sheet" (Century Gothic)

Approved 29 Sep 2026; **colours amended 30 Sep 2026 to the company brand palette (D-031,
`docs/BRAND-MIGRATION-PLAN.md`)** and **section bands added the same day (D-032, `docs/SECTION-BANDS-PLAN.md`)** —
layout, type, components and module order are unchanged. Reference mockups: Claude design canvas *Auburn Resources Homepage Directions*, artboards
**"1b · Survey Sheet — Century Gothic"** (homepage) and **"Project page template — Nicholson (CMS preview)"**.

## Concept

The website is designed like a finely made geological survey sheet: contour lines, coordinate ticks, numbered
figures, legends, margin notes. It should feel authored by geologists — precise, curious, methodical, never hyped.
Dark teal, the company's primary brand colour, is the ink of the sheet. **The orange accent marks Auburn's own
ground and nothing else.**

What makes it distinctive (keep these):
- Every page has a **sheet number** (e.g. `SHEET 02.1 · NICHOLSON`) in the header title block and breadcrumb.
- Figures are numbered and captioned in mono caps: `FIG. 1 — AUBURN PROJECT PORTFOLIO, NORTHERN AUSTRALIA.`
- Project pages are navigated by a **stratigraphic-column** index (stacked bands of varied height, one per section).
- Data sits in ruled cells like a map-sheet margin; prose sits beside figures, never above them in walls.

## Tokens

Colours come only from the company style guide (Nov 2019). The guide gives the palette and nothing else; roles below
are the owner's rulings (D-031: Q-53, Q-54). **No derived colours** are used; any future one must be approved and
labelled as a functional (accessibility) colour, never as a brand colour.

```css
:root {
  /* Brand palette (style guide, BRAND-OFFICIAL) */
  --brand-dark-teal:  #275259; /* primary semantic colour */
  --brand-teal:       #81B8C2; /* no role yet */
  --brand-orange:     #D45A1C; /* the accent */
  --brand-charcoal:   #3B3838; /* body text */
  --brand-white:      #FFFFFF; /* the swatch labelled "R0 G0 B0" is white (Q-54) */
  --brand-mid-teal:   #4899A6; /* no role yet */
  --brand-light-teal: #B1D3D9;
  --brand-peach:      #F0AD8C;
  --brand-grey:       #ADA9A9; /* no role yet */
  --brand-logo-blue:  #1586E2; /* logo only */
  --brand-logo-navy:  #012361; /* logo only */

  /* Inks (roles) */
  --ink-survey:     var(--brand-dark-teal);  /* headings, rules, primary buttons, footer ground */
  --ink-cyanotype:  var(--brand-dark-teal);  /* links (underlined), mono labels, figure lines */
  --ink-contour:    var(--brand-light-teal); /* decorative secondary rules, contours */
  --ink-graphite:   var(--brand-charcoal);   /* body text */
  --ink-muted:      var(--brand-charcoal);   /* source lines, meta — set apart by size and mono */

  /* Grounds */
  --paper:          var(--brand-white);      /* page background */
  --paper-deep:     var(--brand-peach);      /* preview banners, subtle panels (preview only) */
  --water:          var(--brand-light-teal); /* map sea, alternating bands (full strength) */
  --band-grey:      var(--brand-light-teal);

  /* Accent — Auburn ground only */
  --accent:         var(--brand-orange);     /* map fills, tag borders, dots, large type ONLY */
  --accent-text:    var(--brand-charcoal);   /* lettering beside the accent */
  --accent-tint:    var(--brand-peach);

  /* On the dark-teal ground (footer, CTA band) */
  --on-survey:      var(--brand-white);
  --on-survey-muted:var(--brand-light-teal);
}
```

Contrast (checked; `contrast.test.ts`): charcoal (11.61:1) and dark teal (8.62:1) pass WCAG AA for body text on
white. Orange `#D45A1C` is 3.98:1 — **never** small text and never a normal-size button fill with a white label; it is
for fills, borders, status dots and large type. Dark teal on peach is 4.54:1 (passes, narrow margin). Orange does not
sit on dark teal (2.17:1) or on light teal without a dark-teal outline (2.50:1). Light teal on white (1.59:1) is
decorative only. Logo blue and logo navy are for the logo only. Retest any new pairing.

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
- **Rules:** 1 px dark teal for structure; 1 px light teal for secondary divisions (decorative). No shadows, no gradients,
  no rounded cards (radius 0). Hover = underline/line, not colour blocks.
- Mobile: 360 px minimum, 16–20 px gutters; everything stacks; no horizontal page scroll.

## Grounds and section bands (D-032)

- **White** is the page ground. **Light teal** bands break up long runs of white (project cards, news, supporting
  sections); an occasional **dark teal** band (at most one per page) gives a feature section weight. Bands are chosen
  for what a section holds, never by position. Assignments: `docs/SECTION-BANDS-PLAN.md` §3.
- Heroes, page titles and key-facts strips are white. Legal pages and 404 are all white. Project dossier modules are
  white (they sit beside the strat-column index).
- **Orange never sits directly on a band.** On light teal it stays inside white cards, white placeholders and white
  figure panels; nothing orange goes on dark teal (preview status dots there are peach).
- Figures always sit on a white panel (`--figure-ground`), so every map and section displays as drawn.
- A dark section never touches the dark footer or the CTA band; a band that ends a page meets the footer directly.
- Inside a band the role tokens are re-declared (`.tone-light`, `.tone-dark` in `tokens.css`): on dark teal, text,
  headings, links, rules and the focus ring are white, meta is light teal, and the primary button is white with a
  dark-teal label.

## Components (visual spec)

| Component | Spec |
| --- | --- |
| Header / title block | 88 px, bottom rule. Wordmark "Auburn" + "RESOURCES" (mono, letter-spacing 4 px) · sheet ref after a thin rule · nav items prefixed by mono numbers (`01 Company`) · Contact · outlined "Investor updates" button |
| Section bar | 44 px mono row of sibling pages with sheet numbers; current page underlined |
| Breadcrumb | Mono caps: `HOME / 02 PROJECTS / 02.1 NICHOLSON` |
| Buttons | Primary: solid dark teal, white text, 16×22 px padding, square. Secondary: 1 px dark-teal outline. No orange or logo-blue buttons. Min touch target 44 px |
| Tag | Mono 11 px, 1 px border (orange accent with charcoal lettering for commodity; dark teal for state/stage), 3–4 × 7–8 px padding |
| Fact cell | Mono label (dark teal) · value (Century Gothic, dark teal, 20–44 px) · source line (mono 10.5 px, charcoal) with status dot |
| Status dots (CMS preview only) | ● Verified (filled dark teal) · ◐ To verify (half orange) · ○ Input needed (dashed orange) |
| Placeholder (CMS preview only) | Dashed 1.5 px orange border, white fill, charcoal mono label `INPUT NEEDED · …` + one-line brief. Never shown in production |
| Figure | 1 px dark-teal frame; caption below in mono caps with `FIG. n —`; source + date; click → lightbox |
| Map legend | White box, 1 px dark-teal border, mono "LEGEND" header: Auburn project area (orange) · Reference deposit (outline circle) · State border (dashed) · Form lines |
| Project / sheet card | Ruled grid cell: mono `SHEET 02.1` + state · name 34 px · commodity tag · one line · "Read the dossier →" |
| Document register | Mono header row `REF · DATE · TYPE · DOCUMENT · FILE`; rows ruled in light teal; filter chips above |
| Strat-column nav | Stacked bands (heights vary 44–70 px), alternating fills (white / light teal / light teal / peach accent tint for Targets); current band solid dark teal with white text |
| CTA band | Full-width dark teal; mono kicker; one line; light button + outlined button |
| Footer | Dark teal; sign-up strip; four columns with mono headings; acknowledgement of Country; mono legal row |

## Maps and figures

- One cartographic style everywhere: white land, light-teal sea, contour "form lines" in light teal (decorative until
  real data), graticule with mono labels, coastline in dark teal, dashed state borders, north arrow, scale bar.
- **Only Auburn tenements are orange**, always with a dark-teal outline (orange on the light-teal sea is 2.50:1).
  Reference deposits: outline circles, mono labels. Towns: small charcoal squares.
- Mockup map geometry and project positions are **indicative only** — replace with tenement GIS.
- Cross-sections: redrawn vector, standard lithology hatch patterns, leader-line annotations, depth scale in mono.
  The current Fig. 2 is schematic — must be replaced by a competent-person-approved section.
- Every map has a text equivalent (project list with the same facts).

## Photography

Documentary, natural light, specific: core trays, geologist logging core, sample bags, drill rig at a named prospect,
landscape as full-bleed dividers only. Secondary images may take a subtle dark-teal duotone. **No stock imagery.**
Every photo: caption, date, place, photographer, consent. Never photograph cultural sites without permission.

## Motion

Minimal. No scroll-triggered reveals of core content. Map pans/zooms only on user action. Respect
`prefers-reduced-motion`.

## Project page template (module order)

Hero → Key-facts strip → 01 Setting → 02 Geological setting → 03 Exploration history (counters + timeline) →
04 Existing resources → 05 Exploration targets → 06 Key results → 07 Photography → 08 Milestones → 09 Documents →
Related sheets → CTA band → Compliance block → Footer. Left column: sticky strat-column nav.
Modules hide when empty. Max 120 words per module intro. Full spec: `SITEMAP.md` §8.
