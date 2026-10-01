# Spacing and density audit

Status: **approved and implemented, 30 Sep 2026 (D-033).** The owner approved P1–P10. They were implemented together
with the section bands (D-032) and judged against them. §9 is the final implementation, with its exceptions and
measured results. §0–§8 are kept as the proposal was written; the prototype numbers in §2 predate the bands.
Brand colours, typography (faces, sizes, weight 400), information architecture, page structure, module order,
content, band assignments, breakpoints, header height, touch targets, figure and caption spacing, fact-cell and
table padding, and accessibility behaviour are unchanged.

Goal: **structured editorial density** — tighter section rhythm, stronger grouping, better use of width — without a
redesign and without shrinking everything uniformly.

## 0. Method

- **Measured, not eyeballed.** A Playwright script (not committed) loaded 12 preview pages and 2 production pages at
  1440 px and 360 px, collected every visible text/image box, and summed the vertical gaps larger than 40 px between
  consecutive content (the "empty-gap share" of the page height). It also recorded the largest gaps and what sits on
  either side of them.
- **Prototyped, not guessed.** Each proposal was written as a stylesheet injected into the running pages (with the
  page CSP bypassed for the test browser only), then the same measurements and full-page screenshots were taken again.
  The before/after numbers below come from those runs.
- **Preview pages stand in for real content.** Production currently renders almost nothing (no approved content,
  D-019), so the preview build — every module populated with fixtures and INPUT NEEDED placeholders — shows the
  layout as it will be when content is approved. Placeholders are roughly the size of the content they stand for.
- The prototype applied P4 to every page block; the `wide` exception for card grids and registers came from reviewing
  those screenshots (the leadership cards were too narrow in the 8/12 column) and is not reflected in the numbers.
- Screenshots (current vs proposed, 6 pages × 2 widths) were supplied with this audit for review; they are not
  committed. References below give page, module and position.

## 1. Where the whitespace comes from

| Rank | Pattern | Where | Measured now (1440 / 360) |
| --- | --- | --- | --- |
| 1 | **Stacked section padding.** Every white-ground module pads `--section-padding` top *and* bottom (80 px at 1440), so two modules sit 160 px + a 16 px rule gap apart. | home (all modules), portfolio, project "Related sheets" | 176–202 px / 96–138 px between modules |
| 2 | **Full-width, single-column page blocks.** Content pages stack blocks as: rule → large H2 → small body, all left-aligned in a 68-character measure; the right ~55 % of the 1312 px content width is empty. Each block pads 48 px top and bottom. | company, community, contact, investors, governance, shareholders, sustainability, media, announcement pages | 113–130 px between blocks; right half empty |
| 3 | **Page title → first block.** Title padding-bottom 48 + block padding-top 48 + heading rule gap 16. | every content page | 113 px |
| 4 | **Dossier modules.** 48 px top + 48 px bottom per module; heading→body 32 px. | project pages | 114–125 px between modules |
| 5 | **CTA band and compliance block** each take full section padding. | project pages | 177–185 px around the CTA band |
| 6 | **Module heading → body** 40 px on home modules (vs 32 px elsewhere). | home | 40 px |
| 7 | **Footer rhythm:** nav 48/48 padding, 40 px row gap, 32 px acknowledgement padding. | every page | 81–100 px gaps |
| 8 | **Mobile footer is one long column** of 44 px links (4 groups stacked). | every page at 360 px | ~1,150 px of a 2,450 px page |
| 9 | **Page title on desktop** stacks H1, intro and actions in a 68-character column, leaving the right side empty above the fold. | every content page | ~700 px unused width |
| 10 | **Content page bottom** keeps full section padding before the footer. | content pages | 80 / 48 px |

Empty-gap share of page height, now: content pages **33–46 %** at 1440 px (community and contact 46 %, company 41 %),
home 28 %, project page 31 %; at 360 px 16–31 %.

**Not problems (preview-only artefacts):** the empty 4:5 portrait frames on leadership cards (249 px gaps) and the
preview banner exist only in the preview build; production hides missing portraits entirely.

## 2. Proposed changes

"Global" = a token used everywhere; "component" = one pattern's own CSS. All values are existing spacing-scale steps
(8 px scale); no new colours, sizes or breakpoints.

| # | Change | Type | Current | Proposed | 1440 effect | 360 effect |
| --- | --- | --- | --- | --- | --- | --- |
| **P1** | `--section-padding` | **global token** | clamp 48 → 80 px | clamp **40 → 64 px** | 80 → 64 | 48 → 40 |
| **P2** | Stacked white-ground modules share one section padding: each pads **half** above and below, so the gap between two modules = one section padding. Coloured bands (CTA, footer) keep full padding. | component (home modules, portfolio sections, project "Related") | 160 px + rule between modules | **64 px** + rule | 176–202 → ~106 | 96–138 → ~82 |
| **P3** | Module heading → body (home modules) | component | 40 px | **24 px** | 40 → 24 | 40 → 24 |
| **P4** | **Page blocks: heading in a margin column** at ≥ 64rem — rule across, heading and kicker in the left 4/12, body in the right 8/12 (the "map-sheet margin" pattern already used by the home Sustainability module). Block padding 48/48 → 24/24. Blocks whose body is a **card grid or register** (people, document registers, link cards) stay full width with the heading above. | component (`PageBlock`, with a `wide` option) | 96 px + 16 between blocks; body left-aligned, right half empty | 48 px between blocks; body in the right 8 columns | 113–130 → ~64 between blocks; empty right half filled | 96 → 48 between blocks (stacked, as now) |
| **P5** | **Page title:** padding 32/48 → 24/24 (mobile) and 32/32 (desktop); at ≥ 64rem the intro and actions sit beside the H1 (5/12 + 7/12) instead of under it. | component (`PageTitle`) | 113 px title → first block; intro under H1 | 73 px (measured on company); intro beside H1 | −40 px gap and a shorter title block | −48 px |
| **P6** | **Dossier modules** 48/48 → 32/32; head → body 32 → 24; dossier top 48 → 32. | component (`DossierSection`, dossier page) | 114–125 px between modules | 89–105 px (measured) | part of the −680 px measured on Nicholson | part of −895 px |
| **P7** | **CTA band** padding = section padding → clamp **32 → 48 px**; compliance block after it: section padding → half. | component (`CTABand`, dossier page) | 177–185 px around the band | ~100 px | tighter close to the page | tighter |
| **P8** | **Footer** nav 48/48 → 32/32; row gap 40 → 24; acknowledgement 32 → 24. | component (`Footer`) | 81–100 px gaps | 65–76 px (measured) | 32–48 px less per page (computed) | similar |
| **P9** | **Mobile footer**: the three link groups two-up, contact full width (below 48rem only; 44 px targets unchanged). | component (`Footer`) | 4 stacked groups | 2 × 2 + contact | none | about −250 px per page (measured with P1–P10) |
| **P10** | Home hero text → figure gap when stacked 48 → 32; content page bottom padding → 40 px. | component (`HomeHero`, `ContentLayout`) | 48 / 80 | 32 / 40 | small | −16 / −8 px |

### Before / after (prototype measurements, page height and empty-gap share)

| Page | 1440 px height | empty-gap share | largest gap | 360 px height | empty-gap share |
| --- | --- | --- | --- | --- | --- |
| Home | 5,464 → 4,856 (−11 %) | 28 → 21 % | 202 → 106 px | 8,962 → 8,228 (−8 %) | 17 → 15 % |
| Projects | 5,058 → 4,444 (−12 %) | 27 → 18 % | 202 → 106 | 7,102 → 6,415 (−10 %) | 18 → 15 % |
| Nicholson (project) | 8,390 → 7,710 (−8 %) | 31 → 26 % | 185 → 105 | 13,411 → 12,516 (−7 %) | 23 → 21 % |
| Company | 4,174 → 3,383 (−19 %) | 41 → 29 % | 249* → 160* | 7,356 → 6,605 (−10 %) | 30 → 27 % |
| Investors | 4,051 → 3,527 (−13 %) | 36 → 25 % | 191 → 113 | 6,863 → 6,168 (−10 %) | 27 → 23 % |
| Reports | 2,333 → 1,953 (−16 %) | 33 → 27 % | 161 → 97 | 3,680 → 3,153 (−14 %) | 25 → 22 % |
| Announcement | 2,176 → 1,757 (−19 %) | 37 → 28 % | 130 → 89 | 3,439 → 2,912 (−15 %) | 23 → 20 % |
| Community and Country | 2,584 → 1,895 (−27 %) | 46 → 34 % | 177 → 113 | 4,015 → 3,377 (−16 %) | 30 → 25 % |
| Contact | 2,292 → 1,880 (−18 %) | 46 → 35 % | 161 → 121 | 3,852 → 3,325 (−14 %) | 25 → 23 % |
| Disclaimer | 1,436 → 1,332 (−7 %) | 36 → 29 % | 129 → 89 | 2,681 → 2,266 (−15 %) | 16 → 15 % |

\* the empty preview-only portrait frame; not present in production.

## 3. Why each change improves the composition

- **P1 + P2 (rhythm).** The gap between modules drops from ~200 px to ~106 px (64 px + the ruled heading). The rule
  and mono kicker already mark each section, so the extra padding added distance, not structure. 64 px between
  sections stays inside the approved "section padding 64–80 px" of `DESIGN-DIRECTION.md` (read as the space between
  sections — please confirm this reading).
- **P4 (grouping and width).** Heading and content become one visible unit on one ruled line — like a map-sheet
  margin note — instead of a large heading floating above a small body. The empty right half becomes the body column.
  Prose keeps its 68-character measure (readability unchanged); it simply starts further right.
- **P5 (hero).** The title block becomes a compact masthead: H1 left, purpose and actions right, both above the fold.
- **P6, P7 (project pages).** Modules read as a continuous dossier with ruled divisions rather than separate pages;
  the CTA and compliance close the page without a 180 px void.
- **P8, P9 (footer).** Less scrolling past navigation on every page, especially on phones, with the same links,
  order and touch targets.

## 4. Whitespace that should stay

- **Hero breathing room** around the home H1 and figure (top padding stays the section padding).
- **The 68-character measure** for prose (WCAG-friendly line length) — P4 moves the column, it does not widen it.
- **Figure captions, source lines and fact cells**: their internal padding (16–24 px) keeps small mono text legible.
- **Ruled data cells** (fact strip, registers, tables): row heights and cell padding unchanged.
- **Touch targets** (44 × 44 px), focus-ring offsets, header height (88 / 56 px) and section bar (44 px): unchanged.
- **Dark bands** (CTA band, footer) keep enough padding to read as bands (32–48 px minimum).
- **Mobile gutters** (16–20 px): unchanged.

## 5. Accessibility and readability

- No font sizes, weights, colours, line-heights or measures change; contrast results are unaffected.
- DOM order is unchanged (heading before body); the two-column layouts are visual only, so reading and focus order
  stay the same.
- Two-column layouts apply only at ≥ 64rem (existing breakpoint); at 200 % zoom a 1280 px screen becomes 640 CSS px
  and gets the stacked layout.
- P9 uses the existing `max-width: 47.99rem` query; the breakpoint rule (48/64/80/90rem only) still holds.
- Anchor `scroll-margin` values stay tied to tokens; skip link unchanged.
- axe, no-horizontal-scroll (360–1440 px) and the other e2e checks must pass unchanged; no test is relaxed.

## 6. Global versus component

| Global (token) | Component-specific |
| --- | --- |
| P1 `--section-padding` 48–80 → 40–64 px | P2 module padding (home, portfolio, related) · P3 home heading→body · P4 `PageBlock` margin-heading layout + `wide` option · P5 `PageTitle` · P6 `DossierSection` / dossier page · P7 `CTABand` + compliance · P8, P9 `Footer` · P10 `HomeHero`, `ContentLayout` |

No other token changes; no new tokens are required (P4's `wide` is a component prop).

## 7. Implementation notes (after approval)

- Affected files: `styles/tokens.css` (P1), `PageBlock.astro`, `PeopleGroup.astro`, `LinkCards.astro`,
  `DocumentLibrary.astro` and the governance / announcement / investors pages (`wide` where the body is a grid or
  register), `PageTitle.astro`, `DossierSection.astro`, `pages/projects/[slug].astro`, `CTABand.astro`, `Footer.astro`,
  home modules (`HomePortfolio`, `HomeWhyThisGround`, `HomeRegister`, `HomeNews`, `HomeSustainability`, `HomeHero`),
  portfolio modules, `ProjectRelated.astro`, `ContentLayout.astro`; catalogue specimens for PageBlock and PageTitle.
- Tests: token test for the new `--section-padding` value (it is tagged approved: the approved desktop range is
  64–80 px, so the desktop value stays within it; the mobile value is derived); e2e layout checks unchanged; new e2e
  assertion that page-block headings sit beside their body at 1280 px and above it at 768 px.
- Screenshots before/after for review, as for the brand migration.
- Estimated scope: one reviewed commit for P1–P3 + P6–P10 (spacing values), one for P4–P5 (layout pattern).

## 8. Decisions (resolved 30 Sep 2026)

1. P1–P10 approved, as the goal of "less unused whitespace, stronger rhythm, clear hierarchy, comfortable reading",
   not "as short as possible".
2. Section padding is read as the space **between** sections (P2).
3. P4 full-width blocks: people and leadership cards, document registers, link and card grids, tables, maps, figures
   and other grid-based or dense content (§9.2 lists what was marked).

## 9. Implementation (final)

### 9.1 What was built

| # | Implemented | Where |
| --- | --- | --- |
| P1 | `--section-padding: clamp(40 px, 2rem + 2.2222vw, 64 px)`: 64 at 1440, 40 at 360, linear between (the prototype reached 64 at about 1170 px) | `styles/tokens.css` |
| P2 | `--stack-padding` = half the section padding (32 / 20 px) on stacked white modules: home (portfolio, why this ground, register, news, sustainability), portfolio (map, sheets, register, pipeline, links), related sheets, and the dossier compliance block | the modules' own CSS |
| P3 | Heading → body 40 → 24 px on the home portfolio, register and news, and (follow-up, 1 Oct 2026) on the other two sheet-card grids, "Project sheets" (`/projects`) and "Related sheets" (dossiers) | home modules, `PortfolioSheets`, `ProjectRelated` |
| P4 | `PageBlock` `layout="margin"` (default): from 64rem one rule across, heading and kicker in the left 4/12, body in the right 8/12; `layout="wide"` keeps the heading above a full-width body. Block padding `--block-padding` 24 px on white. `SectionHeading` gains a `margin` variant (no rule of its own, always stacked) | `PageBlock.astro`, `SectionHeading.astro`, `tokens.css` |
| P5 | Page title padding 24 px (phones) / 32 px (from 64rem); from 64rem, when there is an introduction or actions, they sit beside the H1 (5/12 + 7/12) with the breadcrumb across the top | `PageTitle.astro` |
| P6 | Dossier top 48 → 32 px; modules 48/48 → 32/32; heading → body 32 → 24 px | `pages/projects/[slug].astro`, `DossierSection.astro` |
| P7 | CTA band padding: 32 px at 360 → 48 px at 1440 (`clamp`); compliance block after it: `--stack-padding` | `CTABand.astro`, dossier page |
| P8 | Footer nav 48/48 → 32/32, row gap 40 → 24, acknowledgement 32 → 24 | `Footer.astro` |
| P9 | Below 48rem the footer link groups sit two-up and the contact column spans full width; 44 px targets unchanged | `Footer.astro` |
| P10 | Home hero text → figure gap when stacked 48 → 32 px; content-page bottom padding 64–80 → 40 px (a band that ends the page still meets the footer directly, D-032) | `HomeHero.astro`, `ContentLayout.astro` |

DOM order is unchanged everywhere (breadcrumb, H1, introduction; heading before body), so reading and focus order
are unchanged; every two-column arrangement is CSS grid from 64rem only.

### 9.2 Exceptions (after before/after review with the bands)

| Where | Proposed | Implemented | Why |
| --- | --- | --- | --- |
| Modules and blocks **inside a band** (light or dark) | P2 half padding; P4 24 px | **bands keep more room**: stacked modules in a band keep the full section padding (64 / 40 px); light-teal page blocks 48 px (40 at 360); dark-teal page blocks the full section padding | Half padding inside a coloured band put content close to the band edge and read as cramped; a dark feature band at 48 px looked like a stripe rather than a feature (Company, "Relationship with DGR Global"). The saving comes from the white sections between bands. Set once in `tokens.css` via the tone scopes (`--stack-padding`, `--block-padding`), not per page |
| **Fact lists** (`FactList`: At a glance, Contact details, Major shareholders, IPO status, Fact sheet, Investor contact) | margin layout | **wide** | In the 8/12 column the two-column ruled list squeezed each cell to about 420 px, so values wrapped and source lines broke mid-URL ("…COM / .AU WEBSITE"): an unexpected reflow of fact cells. Same kind as other grid-based content |
| People cards, link cards, document registers (libraries, investor register, governance policies, related announcements), latest-document cards, news list | wide | wide | As proposed (§8.3) |
| P3 on other modules | home only | home, then **all three sheet-card grids** (follow-up, 1 Oct 2026) | "Project sheets" and "Related sheets" were the only 40 px heading → body gaps left. They use the same heading, card grid and light band as the home portfolio, so they now take the same 24 px. Band padding is unchanged. Other portfolio modules (map, register, pipeline) keep 32 px |
| Tablet footer (48–64rem) | — | unchanged | P9 is phones only |

No proposal was visually worse than the prototype once these band rules were applied, so none was withdrawn.

### 9.3 Measured results (preview build unless marked; page height in px)

| Page | 1440 before → after | empty-gap share | largest gap | 360 before → after |
| --- | --- | --- | --- | --- |
| Home | 5,464 → 5,048 (−8 %) | 29 → 24 % | 202 → 170 | 8,962 → 8,348 (−7 %) |
| Projects | 5,058 → 4,572 (−10 %) | 27 → 22 % | 202 → 138 | 7,102 → 6,495 (−9 %) |
| Nicholson | 8,390 → 7,774 (−7 %) | 32 → 27 % | 185 → 130 | 13,411 → 12,556 (−6 %) |
| Company | 4,094 → 3,492 (−15 %) | 40 → 36 % | 249* → 241* | 7,308 → 6,661 (−9 %) |
| Leadership | 3,001 → 2,803 (−7 %) | 38 → 35 % | 249* → 241* | 6,145 → 5,658 (−8 %) |
| Investors | 4,051 → 3,644 (−10 %) | 37 → 32 % | 191 → 130 | 6,863 → 6,232 (−9 %) |
| Reports | 2,253 → 2,056 (−9 %) | 31 → 27 % | 114 → 90 | 3,632 → 3,145 (−13 %) |
| Announcement | 2,176 → 1,874 (−14 %) | 37 → 32 % | 130 → 106 | 3,439 → 2,944 (−14 %) |
| Community and Country | 2,504 → 1,955 (−22 %) | 45 → 37 % | 130 → 106 | 3,967 → 3,401 (−14 %) |
| Governance | 3,375 → 2,947 (−13 %) | 32 → 23 % | 130 → 106 | 5,973 → 5,407 (−9 %) |
| Shareholders | 3,256 → 2,715 (−17 %) | 47 → 39 % | 144 → 120 | 4,747 → 4,100 (−14 %) |
| Media | 2,906 → 2,399 (−17 %) | 39 → 32 % | 130 → 106 | 4,594 → 4,027 (−12 %) |
| Sustainability | 2,479 → 2,022 (−18 %) | 46 → 40 % | 177 → 114 | 3,812 → 3,262 (−14 %) |
| News | 1,610 → 1,437 (−11 %) | 37 → 31 % | 161 → 121 | 2,897 → 2,483 (−14 %) |
| Contact | 2,292 → 1,973 (−14 %) | 46 → 41 % | 161 → 121 | 3,852 → 3,357 (−13 %) |
| Disclaimer | 1,436 → 1,332 (−7 %) | 37 → 29 % | 129 → 89 | 2,681 → 2,266 (−15 %) |
| Home (production) | 991 → 927 (−6 %) | 41 → 37 % | 112 → 96 | 1,547 → 1,305 (−16 %) |
| Company (production) | 1,112 → 954 (−14 %) | 28 → 24 % | 160 → 104 | 1,807 → 1,540 (−15 %) |

"Before" is the site with the section bands (commit `cf66bef`); the §2 numbers came from the pre-band site.
The follow-up P3 change removes a further 16 px from Projects and from each project dossier (preview, both widths).
\* the empty preview-only portrait frame; not present in production.

### 9.4 Largest remaining gaps (left on purpose)

- **Band to band** (Home: light portfolio band → dark "why this ground", 170 px; Projects: sheet cards → register,
  138 px): each band keeps its own full padding, so the change of ground is a deliberate section break.
- **Before a CTA or the footer** (Nicholson related sheets → CTA band, 129 px; Contact, News, Sustainability → the
  footer sign-up strip, 113–121 px): the close of the page.
- **Preview-only** empty portrait frames (Company, Leadership, 241 px): not present in production.
- **Community and Country** alternates short white and light-teal blocks; with placeholders the light bands are
  low (about 110 px) and the page reads a little striped. The assignments are D-032's and were not changed; real
  copy will make the blocks taller. Worth a second look once content is approved.

### 9.5 Tests

- `tests/e2e/layout-density.spec.ts` (all four builds): margin blocks put the heading beside the body at 1280 px
  and above it at 768 px, wide blocks always above, heading always before body in the DOM; the page-title
  introduction sits beside the H1 at 1280 px and below it at 768 px; the phone footer is two-up with contact full
  width and 44 px link targets.
- Unchanged and passing: axe (WCAG 2.2 AA), 360 px no horizontal scroll, heading outline, section-band contrast and
  footer checks, catalogue.
