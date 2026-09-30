# Brand migration plan

Status: **implemented 30 Sep 2026** (colour tokens, `--copper*` → `--accent*` rename, tests, catalogue, docs), exactly
as mapped in §4 — no derived colours. **Still waiting:** the official vector logo (Q-55; the header keeps the text
wordmark and there is no favicon until it arrives). Error/success colours remain open (§7.1).

Sources: the company style guide (one slide, Nov 2019; transcribed in `docs/STYLE-GUIDE-AUDIT.md` §1), the approved
"Survey Sheet" direction (`docs/DESIGN-DIRECTION.md`), and the repository as it stands. Contrast ratios are WCAG 2.2
values computed from the printed RGB values.

**Labels used throughout**

- **GUIDE** — stated or shown in the style guide. Authoritative.
- **INTERPRETATION** — our reading of something the guide shows but does not state. Needs your confirmation.
- **DECISION** — the guide is silent; a design choice is needed. The proposal is a recommendation, not a brand rule.
- **DERIVED** — a colour not in the guide, made by shading or tinting a guide colour so that it can meet WCAG. Needs
  approval like any token.
- **KEEP** — current implementation, retained because the guide is silent and nothing conflicts.

---

## 0. Decisions recorded (owner, 30 Sep 2026)

| Item | Ruling |
| --- | --- |
| **Q-54** | The final swatch is **white** `#FFFFFF`; "R0 G0 B0" is treated as a typo unless the style guide or brand owner shows otherwise. Black is not a brand colour. |
| **Q-53** | **Dark teal** `#275259` is the primary semantic colour: headings, rules/dividers where appropriate, primary buttons, footer background where appropriate. The two **logo colours stay restricted to the logo/brand mark** unless the brand owner specifies otherwise. **Orange** `#D45A1C` replaces copper as the site accent. No additional colours are presented as brand colours. |
| **Derived colours** | Not approved. They stay marked as *proposed accessibility/functional colours*; the official palette is preferred wherever it meets WCAG. The final mapping (§4) uses **none**. |
| **Q-56 / Q-12** | Regular weight (400) throughout. No Century Gothic web licence now. Browser-synthesised bold is never treated as a brand weight. The Didact Gothic fallback strategy stays. |
| **Q-55** | The 2019 wave-mark lock-up is the current logo **provisionally**. It is not traced or recreated. The owner obtains the official vector files; the header keeps the current text wordmark until they arrive, then uses them as supplied. **No footer logo**; footer structure unchanged. |
| **D-031** | Approved: preserve architecture, page structure, module order, content and URLs; change colour tokens to the brand palette; remove the copper wording from the design direction; document official vs derived colours; no unnecessary component redesign; no invented brand rules. |
| **Error / success colours** | Open. Not part of the migration: no existing component has error or success states (§7.1). |

## 1. Current state

| Area | Today | Where |
| --- | --- | --- |
| Colours | "Survey Sheet" inks: Survey Blue `#1B3A5C`, Cyanotype `#2C5F8F`, Contour `#A9C1D9`, Graphite `#262A2E`, Muted `#5A6B7C`; paper `#F5F2EA`; copper `#B8672E` for Auburn ground. **No style-guide colour is used.** | `apps/site/src/styles/tokens.css` |
| Type | Century Gothic first; Didact Gothic (OFL, self-hosted, **400 only**) as fallback because Century Gothic has no web licence (Q-12); IBM Plex Mono for labels; weight 400 everywhere | `tokens.css`, `layouts/BaseLayout.astro` (`@fontsource/*`) |
| Logo | Text wordmark "Auburn" + mono "RESOURCES"; no wave mark; **no favicon** | `components/patterns/Header.astro` |
| Architecture | Components use tokens only (tests reject raw colours and other weights). Roles live in `tokens.css`; about 30 components reference ink tokens such as `--ink-survey` directly | `lib/design-system.test.ts`, `lib/tokens.test.ts`, `lib/contrast.test.ts` |
| Rules locked by tests | exact approved hex values; the list of colour literals; contrast of every pairing used; weight 400 only | same |

The token layer is the lever: **changing values in `tokens.css` restyles the site without touching layout or
content structure.** That is the core of the plan.

## 2. Official brand requirements (GUIDE only)

| # | Requirement | Evidence |
| --- | --- | --- |
| G-1 | Logo colours: blue `#1586E2` (R21 G134 B226), navy `#012361` (R1 G35 B97) | "Logo Colours" section |
| G-2 | Primary palette: dark teal `#275259`, teal `#81B8C2`, orange `#D45A1C`, charcoal `#3B3838`, "R0 G0 B0" (see Q-54); mid teal `#4899A6`, light teal `#B1D3D9`, peach `#F0AD8C`, grey `#ADA9A9` | "Primary Colour Palette" section |
| G-3 | The logo is the three-wave mark above "AUBURN RESOURCES" (waves in logo blue, lettering in logo navy) | lock-up on the slide |
| G-4 | Century Gothic is the typeface (regular and bold are embedded in the guide) | the PDF's fonts |

That is everything the guide states or shows. It gives **no** colour roles, combinations, type scale, weights rule,
logo clear space, minimum size, reversed logo, UI components, imagery, tone or accessibility rules.

## 3. The four ambiguities (as analysed; rulings in §0)

### Q-54 — the last primary swatch

- **Exact ambiguity:** the swatch is drawn white (with a thin grey outline) but labelled "RGB: R0 G0 B0", which is black.
- **Evidence:** it is the only swatch with an outline, which a designer adds to make a white box visible on a white
  slide; black would need none. Pure black would be close to the palette's charcoal `#3B3838`, which already serves
  as the dark neutral. Nothing else on the slide is black.
- **Proposed interpretation:** **white `#FFFFFF` was intended; the label is a typo.** Consequence: the page ground
  becomes white (replacing warm paper, which is not in the palette).
- **Alternative:** black was intended and the drawn fill is wrong; the page ground stays a neutral you choose.
- **Confirm with:** whoever maintains the brand (the company, or the guide's author).

### Q-56 — heading weight (and case)

- **Exact ambiguity:** the slide's title is Century Gothic **Bold, uppercase**; its section labels ("Logo Colours",
  "Primary Colour Palette") are **regular, title case**. The guide states no rule, so both weights appear, and the
  approved direction says "weight 400 throughout".
- **Technical constraint (from the repository):** the web fallback, Didact Gothic, exists **only at weight 400**.
  Bold headings would be browser-synthesised ("faux bold") for every visitor without Century Gothic — poor quality.
  Real bold needs a **Century Gothic web licence** (Q-12, both weights) or a different fallback family.
- **Options:** (a) keep 400 for all headings (KEEP; closest to the section labels; no licence dependency);
  (b) bold for H1–H2 only, uppercase optional — only with the Century Gothic licence; (c) bold for the page title
  only.
- **Proposed interpretation:** the guide does not require bold; **option (a) until the licence is bought**, then
  revisit (b).

### Q-53 — palette roles

- **Exact ambiguity:** the guide lists colours but assigns no roles, and separates "Logo Colours" from the "Primary
  Colour Palette".
- **Evidence:** row 2 of the palette appears to be a lighter partner of the colour above it (dark teal → mid teal,
  teal → light teal, orange → peach, charcoal → grey); this pairing is **not stated**. The slide's own title and
  rules use dark teal.
- **Proposed interpretation:**
  1. Logo colours are reserved for the logo (INTERPRETATION of the separate heading).
  2. **Dark teal** is the primary structural colour (headings, rules, buttons, footer ground) — the guide uses it for
     its own title (INTERPRETATION).
  3. **Charcoal** is body text.
  4. **Orange** replaces copper as the accent that marks Auburn's own ground (maps, tags) — keeps the existing
     "accent = Auburn ground only" rule (CLAUDE.md §3, which needs your approval to reword).
  5. Light tones (teal, light teal, peach, grey) are fills, tints and rules — never text.
- **Alternative:** navy as the primary structural colour (logo-led), dark teal secondary. Both pass AA (§5).

### Q-55 — logo and vectors

- **Exact ambiguity:** the guide contains the logo only as a **393 × 128 px raster** and gives no usage rules; Q-40
  says the logo may be under review.
- **Proposed interpretation:** the 2019 lock-up is current until you say otherwise; **the raster is not a source
  file and will not be traced, converted or redrawn** without your explicit approval.
- Files required and where to get them: §9.

## 4. Final token mapping (approved and implemented 30 Sep 2026)

Approach (D-031): keep the token architecture. Add the official colours as **brand tokens**; point each existing
**role token** at one of them. Nothing in components changes except the three `--copper*` names, which are renamed to
`--accent*` because D-031 removes the copper wording and the old names would now be false (a mechanical rename in the
files listed in §4.4). All other role names stay.

### 4.1 Brand tokens to add (BRAND-OFFICIAL)

| New token | Hex | Official name in the guide | Used by the site? |
| --- | --- | --- | --- |
| `--brand-dark-teal` | `#275259` | Primary palette | yes |
| `--brand-orange` | `#D45A1C` | Primary palette | yes |
| `--brand-charcoal` | `#3B3838` | Primary palette | yes |
| `--brand-white` | `#FFFFFF` | Primary palette (Q-54: white) | yes |
| `--brand-light-teal` | `#B1D3D9` | Primary palette | yes |
| `--brand-peach` | `#F0AD8C` | Primary palette | yes |
| `--brand-teal` | `#81B8C2` | Primary palette | no role yet (declared for completeness) |
| `--brand-mid-teal` | `#4899A6` | Primary palette | no role yet |
| `--brand-grey` | `#ADA9A9` | Primary palette | no role yet (fails as a band behind labels: §4.3) |
| `--brand-logo-blue` | `#1586E2` | Logo colours | **logo only** (not used by any role) |
| `--brand-logo-navy` | `#012361` | Logo colours | **logo only** (not used by any role) |

### 4.2 Role mapping: OLD TOKEN → NEW TOKEN → HEX → PURPOSE → STATUS

"NEW TOKEN" is the role token after migration (same name unless renamed) and the brand token it points to.

| Old token (value) | New token → points to | Hex | Purpose | Status |
| --- | --- | --- | --- | --- |
| `--ink-survey` (`#1B3A5C`) | `--ink-survey` → `--brand-dark-teal` | `#275259` | headings, structural rules, primary buttons, fact values, footer and CTA ground | BRAND-OFFICIAL |
| `--ink-cyanotype` (`#2C5F8F`) | `--ink-cyanotype` → `--brand-dark-teal` | `#275259` | links (underlined), mono labels, figure lines, focus ring | BRAND-OFFICIAL |
| `--ink-contour` (`#A9C1D9`) | `--ink-contour` → `--brand-light-teal` | `#B1D3D9` | secondary rules (decorative), map contours, text-selection ground | BRAND-OFFICIAL |
| `--ink-graphite` (`#262A2E`) | `--ink-graphite` → `--brand-charcoal` | `#3B3838` | body text | BRAND-OFFICIAL |
| `--ink-muted` (`#5A6B7C`) | `--ink-muted` → `--brand-charcoal` | `#3B3838` | source lines, meta (distinguished by size and mono face, not a lighter ink) | BRAND-OFFICIAL |
| `--paper` (`#F5F2EA`) | `--paper` → `--brand-white` | `#FFFFFF` | page ground, card ground | BRAND-OFFICIAL |
| `--paper-deep` (`#ECE6D8`) | `--paper-deep` → `--brand-peach` | `#F0AD8C` | preview banner and catalogue panels (**preview only**) | BRAND-OFFICIAL |
| `--water` (`#EEF2F4`) | `--water` → `--brand-light-teal` | `#B1D3D9` | map sea, strat-column band, figure placeholder (preview) | BRAND-OFFICIAL |
| `--band-grey` (`#E6ECF1`) | `--band-grey` → `--brand-light-teal` | `#B1D3D9` | strat-column band (brand grey rejected: dark-teal labels on it are 3.70:1) | BRAND-OFFICIAL |
| `--copper` (`#B8672E`) | **`--accent`** → `--brand-orange` | `#D45A1C` | Auburn-ground accent: map fills, commodity-tag borders, status dots, placeholder borders; large type only | BRAND-OFFICIAL |
| `--copper-text` (`#8A4A1E`) | **`--accent-text`** → `--brand-charcoal` | `#3B3838` | text that used to be copper-coloured (commodity-tag lettering; preview notes and labels). The orange stays in the border/dot beside it | BRAND-OFFICIAL |
| `--copper-tint` (`#F3E5D8`) | **`--accent-tint`** → `--brand-peach` | `#F0AD8C` | target-number ground, strat-column Auburn band | BRAND-OFFICIAL |
| `--on-survey` (`#F5F2EA`) | `--on-survey` → `--brand-white` | `#FFFFFF` | text, outlines and focus ring on the dark-teal ground | BRAND-OFFICIAL |
| `--on-survey-muted` (`#D8E2EC`) | `--on-survey-muted` → `--brand-light-teal` | `#B1D3D9` | secondary text and rules on the dark-teal ground | BRAND-OFFICIAL |
| `--placeholder-fill` (`#F8EFE6`) | `--placeholder-fill` → `--brand-white` | `#FFFFFF` | INPUT NEEDED box ground (**preview only**); white keeps the orange dashed border at 3.98:1 | BRAND-OFFICIAL |
| `--placeholder-border` (→ copper) | `--placeholder-border` → `--accent` | `#D45A1C` | dashed placeholder border (preview only) | BRAND-OFFICIAL |
| `--status-approved` (→ survey) | unchanged → `--ink-survey` | `#275259` | status dot: approved (preview only) | BRAND-OFFICIAL |
| `--status-to-verify`, `--status-input-needed` (→ copper) | → `--accent` | `#D45A1C` | status dots (preview only) | BRAND-OFFICIAL |
| `--color-*` semantic aliases | unchanged (they point at the role tokens above) | — | — | — |
| `--color-focus` / `--color-focus-on-dark` | unchanged → cyanotype / on-survey | `#275259` / `#FFFFFF` | focus rings | BRAND-OFFICIAL |

**Result: every colour on the site is an official brand colour. No derived colour is used.**

### 4.3 Where derived colours would be used — none in this mapping

The earlier proposal's derived colours are **not used**. They are listed only as fallbacks, each tied to a specific
trade-off you might reject during the visual review. Each remains *proposed, not approved*.

| Derived colour (proposed, not approved) | Would replace | Only if you decide | Every place it would then be used |
| --- | --- | --- | --- |
| grey text `#686565` | `--ink-muted` = charcoal | source lines and meta must look lighter than body text | via `--color-meta`: `PageSections`, `LegalText`, `PortfolioLinks`, `ProjectResults`, `ProjectTargets`, `ComplianceBlock`, `Breadcrumb`, `MilestoneTrack` (×2), `Figure`, `DocumentRegister`, `PersonCard`, `SourceLine`, `FactStrip`, `MonoLabel` (meta tone), `pages/investors/shareholders`, `pages/news`, `pages/company`, `pages/investors`, catalogue (`Foundations`, `CataloguePage`) |
| orange text `#AA4816` | `--accent-text` = charcoal | commodity-tag lettering and preview notes must be orange | `Tag` (commodity), `MonoLabel` (copper tone; catalogue only), `ProjectGeology` note (preview), `HomeHero` note (preview), `StatusDot` labels (preview), `Placeholder` label (preview), preview banner in `BaseLayout`, `CataloguePage` |
| light-teal tint `#ECF4F6` | `--water`, `--band-grey` = light teal | full-strength light teal looks too heavy for bands | `StratColumn` (water and grey bands), `FigurePlaceholder` (preview), catalogue (`Primitives`, `Patterns`) |
| peach tint `#FCEFE8` | `--accent-tint`, `--paper-deep` = peach | full-strength peach looks too heavy | `ProjectTargets` (target number), `StratColumn` (Auburn band), preview banner in `BaseLayout` |

### 4.4 Files touched by the implementation

| Change | Files |
| --- | --- |
| Values and new brand tokens | `apps/site/src/styles/tokens.css` |
| Rename `--copper` → `--accent` | `MapLegend.astro`, `Tag.astro`, `tokens.css` (placeholder border, status dots) |
| Rename `--copper-text` → `--accent-text` | `ProjectGeology.astro`, `HomeHero.astro`, `StatusDot.astro`, `Placeholder.astro`, `Tag.astro`, `MonoLabel.astro` (tone `copper` → `accent`), `BaseLayout.astro`, `catalogue/CataloguePage.astro` |
| Rename `--copper-tint` → `--accent-tint` | `ProjectTargets.astro`, `StratColumn.astro` |
| Comments that say "copper" / "Survey Blue" | the files above plus `Button.astro`, `Tag.astro` header comment, `tokens.css` |
| Catalogue swatches | `catalogue/sections/Foundations.astro` |
| Tests | `lib/tokens.test.ts`, `lib/contrast.test.ts` |
| Docs | `docs/DESIGN-DIRECTION.md` (colour section), CLAUDE.md §3 and §6 (copper wording), `docs/STYLE-GUIDE-AUDIT.md` |

No layout, module, page, content or URL changes. No new assets or fonts in this step.

## 5. Accessibility

### 5.1 What each brand colour may be used for

Thresholds (WCAG 2.2 AA): body text 4.5:1; large text (≥ 24 px, or ≥ 18.66 px bold) 3:1; borders, focus rings,
icons and UI boundaries 3:1. Ratios below are against white; the dark-ground column shows the best light partner.

| Colour | vs white | Body text | Large text | Backgrounds | Borders / UI | Buttons | Accent |
| --- | --- | --- | --- | --- | --- | --- | --- |
| logo navy `#012361` | 14.85 | yes | yes | yes (with white text 14.85) | yes | yes | logo only (proposal) |
| logo blue `#1586E2` | 3.79 | **no** | yes | no text on it (white 3.79) | yes | **no** (white label fails) | logo only (proposal) |
| dark teal `#275259` | 8.62 | yes | yes | yes (white 8.62, light teal 5.41) | yes | yes (primary) | — |
| charcoal `#3B3838` | 11.61 | yes | yes | yes (white 11.61) | yes | yes | — |
| orange `#D45A1C` | 3.98 | **no** | yes | only with black text (5.28); **not** with white (3.98) | yes (on white) | **no** as a normal-size button fill | **yes: Auburn ground** |
| mid teal `#4899A6` | 3.29 | **no** | yes (on white only) | no text on it (white 3.29) | yes (on white) | **no** | fills |
| teal `#81B8C2` | 2.19 | no | no | yes with navy text (6.77); dark-teal text large only (3.93) | **no** (< 3) | no | decorative fills |
| light teal `#B1D3D9` | 1.59 | no | no | yes, with dark teal (5.41), navy (9.33), charcoal (7.29) text | **no** (decorative rules only) | no | tints |
| peach `#F0AD8C` | 1.90 | no | no | yes, with dark teal (4.54) or charcoal text | no | no | tints |
| grey `#ADA9A9` | 2.33 | no | no | fills only | no | no | disabled fills only (with a text label) |
| *derived orange text `#AA4816` (proposed, not approved; unused)* | 5.76 | yes | yes | — | yes | — | — |
| *derived grey text `#686565` (proposed, not approved; unused)* | 5.77 | yes | yes | — | yes | — | — |

**Never use for text:** teal, light teal, peach, grey; orange, logo blue and mid teal except as large text.
**Orange on dark teal (2.17) and on navy (3.73 — large only):** the Auburn-ground accent never sits on the dark ground.

### 5.2 Every pairing in the final mapping (becomes `contrast.test.ts`)

| Foreground | Background | Ratio | Needed | Use |
| --- | --- | --- | --- | --- |
| charcoal | white | 11.61 | 4.5 | body text, meta, accent text (tags, preview labels) |
| dark teal | white | 8.62 | 4.5 | headings, links, labels, fact values, outline-button text |
| charcoal | light teal | 7.29 | 4.5 | body text on light-teal bands; text selection |
| dark teal | light teal | 5.41 | 4.5 | labels on light-teal bands (strat column) |
| dark teal | peach | 4.54 | 4.5 | target number, Auburn strat band label (**narrow margin**) |
| charcoal | peach | 6.12 | 4.5 | preview banner text |
| white | dark teal | 8.62 | 4.5 | footer text, CTA band, primary-button label |
| light teal | dark teal | 5.41 | 4.5 | secondary text in the footer and CTA band |
| dark teal | white | 8.62 | 3.0 | structural rules, button outlines, focus ring, approved dot |
| dark teal | light teal | 5.41 | 3.0 | focus ring on light-teal bands |
| dark teal | peach | 4.54 | 3.0 | focus ring on peach |
| white | dark teal | 8.62 | 3.0 | focus ring and light outlines on the dark ground |
| orange | white | 3.98 | 3.0 | commodity-tag border, status dots, placeholder border, map fill, large accent type |

Documented failures (asserted in the test so no component relies on them): orange on dark teal (2.17), orange on
light teal (2.50) and on peach (2.10) — **a map fill of orange over a light-teal sea needs a dark-teal outline** —
light teal on white (1.59; decorative rules only, as today's contour), dark teal on brand grey (3.70; why grey is not
used for bands), orange with a white label (3.98; never a normal-size button fill).

## 6. Typography

| Item | Label | Proposal |
| --- | --- | --- |
| Typeface | GUIDE | Century Gothic (unchanged) |
| Web availability | DECIDED (Q-12) | no web licence now; Didact Gothic stays the self-hosted fallback |
| Weights | DECIDED (Q-56) | 400 everywhere; browser-synthesised bold is never used as a brand weight (KEEP; the existing weight test enforces it) |
| Case | DECISION | sentence case for headings (KEEP); uppercase only for mono labels as now; the guide's uppercase title is not treated as a rule |
| Mono face | DECISION (guide silent) | keep IBM Plex Mono for labels, sheet numbers, tables, dates (KEEP) |
| Scale and hierarchy | DECISION (guide silent) | keep the tested fluid scale (KEEP) |
| Heading colour | DECIDED (Q-53) | dark teal (via `--ink-survey`); body charcoal |

## 7. Component-by-component

For each: **Guide** (what the guide requires) · **Decision** (where it is silent) · **Proposal** · **Files**.

| Component | Guide | Decision (guide silent) | Proposal | Files |
| --- | --- | --- | --- | --- |
| **Logo** | wave lock-up; logo blue + navy | size, clear space, reversed version, favicon | **after the official vectors arrive (Q-55):** the supplied SVG in the header linking home, accessible name "Auburn Resources — home"; favicon from the supplied mark. **No footer logo.** Until then: the current text wordmark | `Header.astro`, `BaseLayout.astro` (favicon links); supplied files in `apps/site/src/assets/brand/` |
| **Header / navigation** | — | ground, rule and link colours | white ground, dark-teal bottom rule, dark-teal nav text, underline on hover (KEEP layout, breakpoints, sheet numbers) | `Header.astro` (logo only; colours via tokens) |
| **Mobile menu** | — | as header | same tokens; no structural change | `islands/MobileMenu.astro` (none beyond tokens) |
| **Buttons** | — | fills and states | primary: dark-teal fill, white label; secondary: dark-teal outline; on dark: white outline or white fill with dark-teal label; **no orange or logo-blue buttons** (labels fail AA); square (KEEP) | `primitives/Button.astro` (none beyond tokens) |
| **Links** | — | colour, underline | dark teal, always underlined in body text, hover = thicker/solid underline (KEEP behaviour) | tokens only |
| **Cards** (sheet cards, link cards, person cards) | — | ground, borders | white ground, dark-teal 1 px frame, dark-teal titles, orange only for Auburn-ground tags (KEEP structure) | tokens only |
| **Backgrounds** | white (Q-54) | tints, bands | page white; bands light teal; dark ground dark teal (footer, CTA band); peach for the Auburn band, target numbers and preview panels | tokens only |
| **Borders / dividers** | — | weights and colours | 1 px dark-teal structural rules (pass 3:1); light-teal secondary rules — decorative only, never the sole boundary of a control (KEEP rule) | tokens only |
| **Forms** (filter form now; contact and alerts later) | — | fields, labels, focus, errors | white field, dark-teal 1 px border (8.62), charcoal text, visible labels, dark-teal focus ring; error and success states: §7.1 | `DocumentFilterForm.astro` (none beyond tokens) |
| **Alerts / status states** | — | colours | §7.1 | tokens; later forms |
| **Tables** (document registers, fact lists) | — | header and row styling | dark-teal header rule and mono labels; charcoal cells; no zebra striping (KEEP) (KEEP) | tokens only |
| **Tags** | — | — | orange border + charcoal lettering for Auburn ground; dark-teal tags otherwise (KEEP rule) | token rename only |
| **Maps / figures** | — | cartographic palette | Auburn ground orange fill **with a dark-teal outline** (orange is 3.98 vs white but 2.50 vs a light-teal sea), sea light teal, dark-teal frame and captions; legend and text equivalent unchanged. Other tenure: decide when maps are built | `MapLegend.astro`, `Figure.astro` (tokens only); future SVG/MapLibre styles read the same tokens |
| **Footer** | — | ground | dark-teal ground, white text, light-teal secondary text (5.41), white focus ring; **structure unchanged, no logo** (Q-55) | tokens only |
| **Status dots, placeholders, preview banner** (preview only) | — | — | approved = dark teal; to verify / input needed = orange; placeholder: white ground, orange dashed border, charcoal label; banner: peach with charcoal text | token rename only |
| **Responsive / mobile** | — | — | no change: breakpoints, 44 px targets, 360 px layout stay; logo needs a compact form that fits the 56 px mobile header (ask for a mark-only or stacked version) | `Header.astro` |

### 7.1 Alerts and status states (DECISION — open; not part of this migration)

Orange is proposed as the "Auburn ground" accent, so using it for errors would give it two meanings. Options:

| Option | Error | Success | Info |
| --- | --- | --- | --- |
| A | charcoal text + icon + **2 px dark-teal left border** + the word "Error" | dark teal + icon + "Done" | light-teal panel, dark-teal text |
| B | orange border/icon + charcoal text (orange then means "attention" as well as Auburn ground) | as A | as A |
| C | a new, non-brand red for errors (contrast-tested) | as A | as A |

Whichever option: never colour alone (icon + text), messages linked with `aria-describedby`, focus moved to the error
summary. Not needed until forms are built.

## 8. Mapping to the repository

### 8.1 Tokens

`apps/site/src/styles/tokens.css`: add the §4.1 brand tokens (tagged, e.g. `[B]` brand-official); re-point the §4.2
role tokens; rename `--copper*` → `--accent*`; update comments. No derived token is added. Nothing else in `tokens.css` changes (spacing, type scale, layout,
radius, motion).

### 8.2 Components

| Change | Files | Why |
| --- | --- | --- |
| None beyond token values | all other components (about 30 reference tokens only) | the token architecture already isolates colour |
| Logo instead of the text wordmark | `components/patterns/Header.astro` | GUIDE G-3 (needs §9 files) |
| Favicon and app icons | `layouts/BaseLayout.astro` | no favicon today |
| Swatches | `src/catalogue/sections/Foundations.astro` | shows the new palette (preview only) |
| Heading weight (only if Q-56 = bold) | `styles/base.css`, `tokens.css` (`--font-weight-*`) | Q-56 |

### 8.3 Pages affected

Every page changes colour (global tokens); no page changes layout, order or content. Pages with visible logo or
colour-heavy modules to review by eye: home, portfolio, project dossier, investor centre and registers, footer on all
pages, the catalogue (preview).

### 8.4 Layout or content structure

**No change needed.** Module order, sheet numbers, grids, breakpoints and content rules are unaffected.

### 8.5 Tests

| Test | Change |
| --- | --- |
| `lib/tokens.test.ts` | new approved values; literal list = the eleven brand tokens only; tag checks |
| `lib/contrast.test.ts` | replace pairings with §5.2; update the documented-failures list |
| `lib/design-system.test.ts` | unchanged (no raw colours in components); weight rule changes only if Q-56 = bold |
| e2e axe (all pages, four builds) | unchanged; re-verifies contrast on rendered pages |
| New: logo | header shows the logo image with an accessible name; link to `/`; favicon links present |
| New (optional): visual snapshots | a small Playwright screenshot set (home, project, investors) to review the migration |

These are value updates approved by the owner, not weakened checks.

### 8.6 Optional clean-up (not required; the `--copper*` → `--accent*` rename is already in §4.4)

Rename role tokens to brand-neutral names (`--ink-survey` → `--ink-primary`, `--copper` → `--accent-ground`, …) in a
separate mechanical commit. Recommended only after the migration is approved and stable.

### 8.7 Documentation

`docs/DESIGN-DIRECTION.md` (approved document: colour section rewritten, with your approval); CLAUDE.md §3 (copper
wording → orange / "accent"; §9.3 list); `docs/DECISIONS.md` (D-031); catalogue text; `docs/STYLE-GUIDE-AUDIT.md`
status.

## 9. Asset requirements

**Logo — required files (vector masters; do not trace the raster):**

| File | Why |
| --- | --- |
| Full-colour lock-up, **SVG** (outlined text) | header |
| Same as **EPS or AI, or vector PDF** | master for print and future edits |
| **Reversed** lock-up (white, or white waves + white lettering) | any future use on dark grounds (navy lettering on dark teal is 1.72:1); no footer logo for now |
| **Mark only** (the waves), SVG | favicon, compact mobile header, social image |
| Compact / stacked version, if one exists | 56 px mobile header |
| One-colour (navy) version | documents, embossing |
| Usage notes: clear space, minimum size, colours on dark, don'ts (if they exist) | so we don't invent rules |
| Name of the lettering typeface (if the lettering is set text) | the lettering does not appear to be Century Gothic; knowing the typeface avoids guesswork |

**Where to get them:** (1) the company's brand owner or the designer/agency who produced the Nov 2019 style guide
(the PDF's author metadata may help the company trace them); (2) the old site's logo files are named
"Untitled design - 2024-05-23…", which is the default naming of an online design tool — if the logo was rebuilt
there in 2024, its owner can export SVG/PDF; (3) DGR Global's marketing team, if they manage group branding. Confirm
first that this 2019 lock-up is current (Q-40, Q-55).

**Favicon set (made from the mark once supplied):** `favicon.svg`, `favicon.ico` (32 px), `apple-touch-icon.png`
(180 px). **Fonts:** Century Gothic web licence (Q-12) — optional; nothing is committed without it. **Social image:**
depends on Q-49.

## 10. Accessibility considerations

- Only dark teal and charcoal are used for normal-size text (navy is reserved for the logo).
- Orange, logo blue and mid teal: large text or graphics only; never button labels on those fills.
- Light tones: backgrounds and decoration only; never the only boundary of an input or control.
- Dark ground (footer, CTA band): white or light-teal text only; no orange, no full-colour logo.
- Focus ring: dark teal on light grounds, white on the dark ground (both ≥ 3:1).
- Links stay underlined (colour is not the only cue, WCAG 1.4.1).
- Status: icon + text, never colour alone.
- Everything verified by `contrast.test.ts` (unit) and axe on every page of four builds (e2e).

## 11. Test requirements

- Unit: tokens (values, literals, tags), contrast (every pairing in §5.2 plus documented failures), design-system
  rules unchanged.
- E2E: zero axe violations on every page in all four builds; header logo present with an accessible name, links home,
  sized within the header at 360/768/1280/1440 px; favicon links; no horizontal scroll; mobile menu unchanged.
- Guards unchanged: no raw colours in components, production has no preview-only output, CSP has no new sources (logo
  and favicon are same-origin files).
- Manual: eye review of home, project page, investor centre, footer and catalogue in both modes; screenshots attached
  to the review.

## 12. Implementation order

1. **Done:** decisions recorded (§0, D-031, OPEN-QUESTIONS).
2. **Done (30 Sep 2026), after the owner approved §4:** update `DESIGN-DIRECTION.md` colour section and CLAUDE.md copper wording; tokens (brand
   tokens + role values + `--accent*` rename); `tokens.test.ts` and `contrast.test.ts`; catalogue swatches;
   screenshots for your review. One or two commits, `pnpm check` green.
3. **When the official vectors arrive:** header logo and favicon from the supplied files; tests. One commit.
4. Not planned: bold weights (Q-56), footer logo (Q-55), error/success colours (§7.1).

## 13. Acceptance criteria

- Every colour on the site resolves to an official brand colour (no derived colour unless you later approve one); `tokens.test.ts` lists them.
- Every pairing used passes WCAG 2.2 AA (`contrast.test.ts`); zero axe violations on all pages in four builds.
- (Step 3 only) The header shows the company logo from the supplied vector files (not traced); favicon present.
- No layout, module order, content or URL change; no new runtime dependency; no third-party font or CDN load.
- The "accent marks Auburn ground only" rule still holds, with orange as the accent.
- `pnpm check` green; screenshots reviewed and approved by you.

## 14. Decisions

Recorded: Q-53, Q-54, Q-55 (provisional), Q-56, Q-12 (not now), D-031 — see §0.

Still needed before the token change: **your approval of the §4.2 mapping** (and, after the visual review, whether any
§4.3 trade-off makes you want a derived colour). Still open, not blocking this step: official logo vectors (Q-55),
error/success colours (§7.1).
